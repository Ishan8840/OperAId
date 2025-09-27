import csv
import random
from datetime import datetime, timedelta

# Sample data pools
first_names = ['John', 'Sarah', 'Michael', 'Emily', 'Robert', 'Jennifer', 'David', 'Lisa', 
               'Christopher', 'Amanda', 'James', 'Jessica', 'Daniel', 'Michelle', 'William',
               'Ashley', 'Matthew', 'Kimberly', 'Joshua', 'Stephanie']

last_names = ['Smith', 'Johnson', 'Chen', 'Davis', 'Wilson', 'Brown', 'Miller', 'Martinez',
              'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson',
              'Garcia', 'Martinez', 'Robinson', 'Clark']

conditions = [
    'History of hypertension', 'Diabetes mellitus type 2', 'Post-operative evaluation',
    'Migraine headaches', 'Cardiac arrhythmia', 'Back pain with radiculopathy',
    'Sports injury', 'Pregnancy related', 'Chronic obstructive pulmonary disease',
    'Thyroid disorder', 'Rheumatoid arthritis', 'Gastroesophageal reflux',
    'Asthma', 'Osteoarthritis', 'Anxiety disorder', 'Depression', 'Hyperlipidemia',
    'Coronary artery disease', 'Chronic kidney disease', 'Liver cirrhosis'
]

symptoms = [
    'chest pain', 'shortness of breath', 'headache', 'joint pain', 'abdominal discomfort',
    'dizziness', 'fatigue', 'fever', 'cough', 'nausea', 'vision changes', 'weight loss',
    'palpitations', 'swelling', 'numbness', 'weakness', 'rash', 'bleeding', 'infection'
]

annotations = [
    'Possible lesion detected', 'No significant abnormalities', 'Mild edema noted',
    'Normal morphology', 'Small artifact observed', 'Disc bulge detected',
    'Tear suspected', 'Position normal', 'Minor thickening', 'Small nodule found',
    'Inflammation present', 'Calcification noted', 'Mass identified', 'Fluid collection',
    'Enhancement pattern typical', 'Degenerative changes', 'Metastasis suspected'
]

locations = [
    'lower left quadrant', 'upper right quadrant', 'anterior region', 'posterior region',
    'medial aspect', 'lateral aspect', 'superior portion', 'inferior portion',
    'central area', 'peripheral zone'
]

def generate_dob():
    # Generate DOB between 1940 and 2000
    start_date = datetime(1940, 1, 1)
    end_date = datetime(2000, 12, 31)
    random_date = start_date + timedelta(days=random.randint(0, (end_date - start_date).days))
    return random_date.strftime('%Y-%m-%d')

def generate_record():
    condition = random.choice(conditions)
    symptom = random.choice(symptoms)
    return f"{condition}. Complains of {symptom}."

def generate_annotation():
    annotation = random.choice(annotations)
    location = random.choice(locations)
    return f"{annotation} in {location}."

def generate_entry(i):
    first_name = random.choice(first_names)
    last_name = random.choice(last_names)
    return {
        'name': f"{first_name} {last_name}",
        'dob': generate_dob(),
        'record': generate_record(),
        'scan_file': f"mri_scans/Tr-no_{i:04d}.jpg",
        'annotation': generate_annotation()
    }

# Generate 1000 entries starting from file number 0010
start_file_number = 10
entries = [generate_entry(i) for i in range(start_file_number, start_file_number + 1000)]

# Write to CSV
with open('patients.csv', 'w', newline='') as csvfile:
    fieldnames = ['name', 'dob', 'record', 'scan_file', 'annotation']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    
    writer.writeheader()
    for entry in entries:
        writer.writerow(entry)

print("CSV file 'patients.csv' with 1000 entries has been created!")
print(f"Scan files range from mri_scans/Tr-no_0010.jpg to mri_scans/Tr-no_{1009:04d}.jpg")