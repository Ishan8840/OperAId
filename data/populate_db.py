import os
import uuid
import csv
from datetime import datetime
from supabase import create_client

# -----------------------------
# CONFIGURATION
# -----------------------------
SUPABASE_URL = "https://avqekanfqbqeoetnncri.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF2cWVrYW5mcWJxZW9ldG5uY3JpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1ODk4NTQ5NCwiZXhwIjoyMDc0NTYxNDk0fQ.s_KbEeFizjHCfmS7YA7uoN4FIOhQkj9qAXP6S4QCBz0"
BUCKET_NAME = "mri_scans"

# Initialize Supabase client
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

# -----------------------------``
# FUNCTION: Upload MRI Scan
# -----------------------------
def upload_scan(file_path, file_name):
    """
    Uploads MRI scan to Supabase Storage bucket and returns public URL
    """
    try:
        with open(file_path, "rb") as f:
            file_data = f.read()
            supabase.storage.from_(BUCKET_NAME).upload(file_name, file_data)
        return supabase.storage.from_(BUCKET_NAME).get_public_url(file_name)
    except Exception as e:
        print(f"Error uploading {file_name}: {e}")
        return None

# -----------------------------
# FUNCTION: Insert Patient + Scan + Annotation
# -----------------------------
def insert_patient_with_scan(name, dob, record, scan_file_path, annotation_note):
    """
    Inserts a patient record, uploads scan, inserts scan record,
    and inserts annotation.
    """
    try:
        patient_id = str(uuid.uuid4())
        scan_id = str(uuid.uuid4())

        # Insert patient
        supabase.table("patients").insert({
            "id": patient_id,
            "name": name,
            "dob": dob,
            "record": record,
            "created_at": datetime.utcnow().isoformat()
        }).execute()

        # Upload scan to storage
        file_name = f"{patient_id}_{os.path.basename(scan_file_path)}"
        image_url = upload_scan(scan_file_path, file_name)
        if image_url is None:
            raise Exception(f"Failed to upload scan for patient {name}")

        # Insert scan
        supabase.table("scans").insert({
            "id": scan_id,
            "patient_id": patient_id,
            "scan_type": "MRI",
            "scan_date": datetime.utcnow().date().isoformat(),
            "image_url": image_url
        }).execute()

        # Insert annotation
        supabase.table("annotations").insert({
            "id": str(uuid.uuid4()),
            "patient_id": patient_id,
            "scan_id": scan_id,
            "note": annotation_note,
            "created_at": datetime.utcnow().isoformat()
        }).execute()

        print(f"Inserted patient '{name}' with MRI scan and annotation.")
    except Exception as e:
        print(f"Error inserting patient {name}: {e}")

# -----------------------------
# MAIN SCRIPT
# -----------------------------
def main():
    # Read patient data from CSV file
    import csv
    
    csv_file = "patients.csv"
    if not os.path.exists(csv_file):
        print(f"Error: {csv_file} not found")
        return
        
    try:
        with open(csv_file, 'r') as f:
            patients_data = list(csv.DictReader(f))
    except Exception as e:
        print(f"Error reading {csv_file}: {e}")
        return

    for patient in patients_data:
        if os.path.exists(patient["scan_file"]):
            insert_patient_with_scan(
                patient["name"],
                patient["dob"],
                patient["record"],
                patient["scan_file"],
                patient["annotation"]
            )
        else:
            print(f"Scan file not found: {patient['scan_file']}")

if __name__ == "__main__":
    main()
