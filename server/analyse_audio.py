#!/usr/bin/env python3

import os
import json
from openai import OpenAI
from dotenv import load_dotenv
load_dotenv()

from supabase import create_client, Client
from datetime import datetime, date

# Initialize clients
openai_client = OpenAI(api_key=os.getenv('OPENAI_KEY'))
supabase: Client = create_client(
    os.getenv('SUPABASE_URL'),
    os.getenv('SUPABASE_KEY')
)

def get_patient_records(name):
    """Get all records for a patient by name"""
    try:
        result = supabase.table('patients').select('*').ilike('name', f'%{name}%').execute()
        return {"success": True, "data": result.data}
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_patient_scans(name, scan_type=None):
    """Get scans for a patient, optionally filtered by scan type"""
    try:
        # First get patient ID
        patient_result = supabase.table('patients').select('id, name').ilike('name', f'%{name}%').execute()
        if not patient_result.data:
            return {"success": False, "error": f"Patient '{name}' not found"}
        
        patient_id = patient_result.data[0]['id']
        
        # Get scans
        query = supabase.table('scans').select('*').eq('patient_id', patient_id)
        if scan_type:
            query = query.ilike('scan_type', f'%{scan_type}%')
        
        result = query.execute()
        return {"success": True, "data": result.data, "patient_name": patient_result.data[0]['name']}
    except Exception as e:
        return {"success": False, "error": str(e)}

def add_annotation(patient_name, note, scan_id=None):
    """Add an annotation for a patient"""
    try:
        # Get patient ID
        patient_result = supabase.table('patients').select('id, name').ilike('name', f'%{patient_name}%').execute()
        if not patient_result.data:
            return {"success": False, "error": f"Patient '{patient_name}' not found"}
        
        patient_id = patient_result.data[0]['id']
        
        # Create annotation
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
    """Get all annotations for a patient"""
    try:
        # Get patient ID
        patient_result = supabase.table('patients').select('id, name').ilike('name', f'%{name}%').execute()
        if not patient_result.data:
            return {"success": False, "error": f"Patient '{name}' not found"}
        
        patient_id = patient_result.data[0]['id']
        
        # Get annotations
        result = supabase.table('annotations').select('*').eq('patient_id', patient_id).execute()
        return {"success": True, "data": result.data, "patient_name": patient_result.data[0]['name']}
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_patient_dob(name):
    """Get patient's date of birth by name"""
    try:
        result = supabase.table('patients').select('name, dob').ilike('name', f'%{name}%').execute()
        if not result.data:
            return {"success": False, "error": f"Patient '{name}' not found"}
        return {"success": True, "data": result.data[0]}
    except Exception as e:
        return {"success": False, "error": str(e)}

def get_mri_scans(name):
    """Get specifically MRI scans for a patient"""
    try:
        # Get patient ID
        patient_result = supabase.table('patients').select('id, name').ilike('name', f'%{name}%').execute()
        if not patient_result.data:
            return {"success": False, "error": f"Patient '{name}' not found"}
        
        patient_id = patient_result.data[0]['id']
        
        # Get MRI scans specifically
        result = supabase.table('scans').select('*').eq('patient_id', patient_id).ilike('scan_type', '%MRI%').execute()
        return {"success": True, "data": result.data, "patient_name": patient_result.data[0]['name']}
    except Exception as e:
        return {"success": False, "error": str(e)}

# Define the functions for OpenAI
functions = [
    {
        "type": "function",
        "function": {
            "name": "get_patient_records",
            "description": "Get complete patient records by name",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Patient name to search for"
                    }
                },
                "required": ["name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_patient_dob",
            "description": "Get patient's date of birth by name",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Patient name to search for"
                    }
                },
                "required": ["name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_mri_scans",
            "description": "Get MRI scans specifically for a patient",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Patient name to search for"
                    }
                },
                "required": ["name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_patient_scans",
            "description": "Get all scans for a patient, optionally filtered by scan type",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Patient name to search for"
                    },
                    "scan_type": {
                        "type": "string",
                        "description": "Type of scan to filter by (optional)"
                    }
                },
                "required": ["name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "add_annotation",
            "description": "Add an annotation/note for a patient",
            "parameters": {
                "type": "object",
                "properties": {
                    "patient_name": {
                        "type": "string",
                        "description": "Patient name"
                    },
                    "note": {
                        "type": "string",
                        "description": "The annotation/note text"
                    },
                    "scan_id": {
                        "type": "string",
                        "description": "Optional scan ID to associate with the annotation"
                    }
                },
                "required": ["patient_name", "note"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_patient_annotations",
            "description": "Get all annotations for a patient",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Patient name to search for"
                    }
                },
                "required": ["name"]
            }
        }
    }
]

def handle_function_call(function_name, arguments):
    """Execute the appropriate function based on the function call"""
    if function_name == "get_patient_records":
        return get_patient_records(arguments["name"])
    elif function_name == "get_patient_dob":
        return get_patient_dob(arguments["name"])
    elif function_name == "get_mri_scans":
        return get_mri_scans(arguments["name"])
    elif function_name == "get_patient_scans":
        scan_type = arguments.get("scan_type")
        return get_patient_scans(arguments["name"], scan_type)
    elif function_name == "add_annotation":
        scan_id = arguments.get("scan_id")
        return add_annotation(arguments["patient_name"], arguments["note"], scan_id)
    elif function_name == "get_patient_annotations":
        return get_patient_annotations(arguments["name"])
    else:
        return {"success": False, "error": f"Unknown function: {function_name}"}

def format_response(result, function_name):
    """Format the response for better readability"""
    if not result["success"]:
        return f"Error: {result['error']}"
    
    data = result["data"]
    
    if function_name == "get_patient_records":
        if not data:
            return "No patients found."
        response = "Patient Records:\n"
        for patient in data:
            response += f"- Name: {patient['name']}\n"
            response += f"  DOB: {patient['dob']}\n"
            response += f"  Record: {patient.get('record', 'N/A')}\n"
            response += f"  ID: {patient['id']}\n\n"
        return response
    
    elif function_name == "get_patient_dob":
        return f"Patient: {data['name']}\nDate of Birth: {data['dob']}"
    
    elif function_name == "get_mri_scans":
        if not data:
            return f"No MRI scans found for {result.get('patient_name', 'patient')}."
        response = f"MRI Scans for {result.get('patient_name', 'patient')}:\n"
        for scan in data:
            response += f"- Type: {scan['scan_type']}\n"
            response += f"  Date: {scan['scan_date']}\n"
            response += f"  Image URL: {scan.get('image_url', 'N/A')}\n"
            response += f"  Scan ID: {scan['id']}\n\n"
        return response
    
    elif function_name == "get_patient_scans":
        if not data:
            return f"No scans found for {result.get('patient_name', 'patient')}."
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
        if not data:
            return f"No annotations found for {result.get('patient_name', 'patient')}."
        response = f"Annotations for {result.get('patient_name', 'patient')}:\n"
        for annotation in data:
            response += f"- Note: {annotation['note']}\n"
            response += f"  Created: {annotation['created_at']}\n"
            response += f"  ID: {annotation['id']}\n\n"
        return response
    
    return str(data)

def main():
    print("Medical Records Query System")
    print("Enter your queries in natural language (or 'quit' to exit)")
    print("Supported queries:")
    print("- 'Get Steven Moss's records'")
    print("- 'Get Steven Moss's date of birth' / 'Get Steven Moss's DOB'")
    print("- 'Get MRI scans for Steven Moss'")
    print("- 'Get annotations for Steven Moss'")
    print("- 'Add annotation for Steven Moss: Patient shows improvement'")
    print()
    
    while True:
        query = input("Query: ").strip()
        
        if query.lower() in ['quit', 'exit', 'q']:
            break
        
        if not query:
            continue
        
        try:
            # Send query to OpenAI
            response = openai_client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a medical records assistant. Use the provided functions to help users query patient records, scans, and annotations."},
                    {"role": "user", "content": query}
                ],
                tools=functions,
                tool_choice="auto"
            )
            
            message = response.choices[0].message
            
            if message.tool_calls:
                # Execute function calls
                for tool_call in message.tool_calls:
                    function_name = tool_call.function.name
                    arguments = json.loads(tool_call.function.arguments)
                    
                    print(f"\nExecuting: {function_name} with {arguments}")
                    result = handle_function_call(function_name, arguments)
                    formatted_result = format_response(result, function_name)
                    print(f"\nResult:\n{formatted_result}")
            else:
                print(f"\nResponse: {message.content}")
        
        except Exception as e:
            print(f"Error: {str(e)}")
        
        print("-" * 50)

if __name__ == "__main__":
    # Check for required environment variables
    required_vars = ['OPENAI_API_KEY', 'SUPABASE_URL', 'SUPABASE_KEY']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"Error: Missing required environment variables: {', '.join(missing_vars)}")
        print("\nPlease set the following environment variables:")
        print("export OPENAI_API_KEY='your-openai-api-key'")
        print("export SUPABASE_URL='your-supabase-url'")
        print("export SUPABASE_KEY='your-supabase-anon-key'")
    else:
        main()