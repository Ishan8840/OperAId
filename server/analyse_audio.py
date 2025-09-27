import os
import json
from openai import OpenAI
from dotenv import load_dotenv
from supabase import create_client, Client
from datetime import datetime

# Load environment variables
load_dotenv()

# Initialize OpenAI client
openai_client = OpenAI(api_key=os.getenv('OPENAI_KEY'))

# Initialize Supabase client
supabase: Client = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

# ---------------- Supabase Helper Functions ---------------- #

def get_patient_records(name):
    try:
        result = supabase.table('patients').select('*').ilike('name', f'%{name}%').execute()
        return {"success": True, "data": result.data}
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_patient_dob(name):
    try:
        result = supabase.table('patients').select('name, dob').ilike('name', f'%{name}%').execute()
        if not result.data:
            return {"success": False, "error": f"Patient '{name}' not found"}
        return {"success": True, "data": result.data[0]}
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_mri_scans(name):
    try:
        patient_result = supabase.table('patients').select('id, name').ilike('name', f'%{name}%').execute()
        if not patient_result.data:
            return {"success": False, "error": f"Patient '{name}' not found"}
        patient_id = patient_result.data[0]['id']
        result = supabase.table('scans').select('*').eq('patient_id', patient_id).ilike('scan_type', '%MRI%').execute()
        return {"success": True, "data": result.data, "patient_name": patient_result.data[0]['name']}
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_patient_scans(name, scan_type=None):
    try:
        patient_result = supabase.table('patients').select('id, name').ilike('name', f'%{name}%').execute()
        if not patient_result.data:
            return {"success": False, "error": f"Patient '{name}' not found"}
        patient_id = patient_result.data[0]['id']

        query = supabase.table('scans').select('*').eq('patient_id', patient_id)
        if scan_type:
            query = query.ilike('scan_type', f'%{scan_type}%')
        result = query.execute()
        return {"success": True, "data": result.data, "patient_name": patient_result.data[0]['name']}
    except Exception as e:
        return {"success": False, "error": str(e)}

def add_annotation(patient_name, note, scan_id=None):
    try:
        patient_result = supabase.table('patients').select('id').ilike('name', f'%{patient_name}%').execute()
        if not patient_result.data:
            return {"success": False, "error": f"Patient '{patient_name}' not found"}
        patient_id = patient_result.data[0]['id']

        annotation_data = {
            'patient_id': patient_id,
            'note': note,
            'created_at': datetime.now().isoformat()
        }
        if scan_id:
            annotation_data['scan_id'] = scan_id

        result = supabase.table('annotations').insert(annotation_data).execute()
        return {"success": True, "data": result.data}
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_patient_annotations(name):
    try:
        patient_result = supabase.table('patients').select('id, name').ilike('name', f'%{name}%').execute()
        if not patient_result.data:
            return {"success": False, "error": f"Patient '{name}' not found"}
        patient_id = patient_result.data[0]['id']

        result = supabase.table('annotations').select('*').eq('patient_id', patient_id).execute()
        return {"success": True, "data": result.data, "patient_name": patient_result.data[0]['name']}
    except Exception as e:
        return {"success": False, "error": str(e)}

# ---------------- OpenAI Function Definitions ---------------- #

functions = [
    {
        "type": "function",
        "function": {
            "name": "get_patient_records",
            "description": "Get complete patient records by name",
            "parameters": {"type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_patient_dob",
            "description": "Get patient's date of birth",
            "parameters": {"type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_mri_scans",
            "description": "Get MRI scans for a patient",
            "parameters": {"type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_patient_scans",
            "description": "Get all scans for a patient optionally filtered by type",
            "parameters": {"type": "object", "properties": {"name": {"type": "string"}, "scan_type": {"type": "string"}}, "required": ["name"]}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "add_annotation",
            "description": "Add a note for a patient",
            "parameters": {"type": "object", "properties": {"patient_name": {"type": "string"}, "note": {"type": "string"}, "scan_id": {"type": "string"}}, "required": ["patient_name", "note"]}
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_patient_annotations",
            "description": "Get all annotations for a patient",
            "parameters": {"type": "object", "properties": {"name": {"type": "string"}},"required": ["name"]}
        }
    }
]

# ---------------- Function Call Handler ---------------- #

def handle_function_call(function_name, arguments):
    if function_name == "get_patient_records":
        return get_patient_records(arguments["name"])
    elif function_name == "get_patient_dob":
        return get_patient_dob(arguments["name"])
    elif function_name == "get_mri_scans":
        return get_mri_scans(arguments["name"])
    elif function_name == "get_patient_scans":
        return get_patient_scans(arguments["name"], arguments.get("scan_type"))
    elif function_name == "add_annotation":
        return add_annotation(arguments["patient_name"], arguments["note"], arguments.get("scan_id"))
    elif function_name == "get_patient_annotations":
        return get_patient_annotations(arguments["name"])
    else:
        return {"success": False, "error": f"Unknown function: {function_name}"}

# ---------------- Response Formatter ---------------- #

def format_response(result, function_name):
    if not result["success"]:
        return f"Error: {result['error']}"

    data = result["data"]

    if function_name in ["get_patient_records"]:
        response = "Patient Records:\n"
        for patient in data:
            response += f"- Name: {patient['name']}\n"
            response += f"  DOB: {patient['dob']}\n"
            response += f"  Record: {patient.get('record', 'N/A')}\n"
            response += f"  ID: {patient['id']}\n\n"
        return response

    elif function_name == "get_patient_dob":
        return f"Patient: {data['name']}\nDOB: {data['dob']}"

    elif function_name in ["get_mri_scans", "get_patient_scans"]:
        response = f"Scans for {result.get('patient_name', 'patient')}:\n"
        for scan in data:
            response += f"- Type: {scan['scan_type']}\n"
            response += f"  Date: {scan['scan_date']}\n"
            response += f"  Image URL: {scan.get('image_url', 'N/A')}\n"
            response += f"  Scan ID: {scan['id']}\n\n"
        return response

    elif function_name == "add_annotation":
        return f"Annotation added successfully! ID: {data[0]['id']}"

    elif function_name == "get_patient_annotations":
        response = f"Annotations for {result.get('patient_name', 'patient')}:\n"
        for annotation in data:
            response += f"- Note: {annotation['note']}\n"
            response += f"  Created: {annotation['created_at']}\n"
            response += f"  ID: {annotation['id']}\n\n"
        return response

    return str(data)
