import os
import json
import psycopg2
from openai import OpenAI
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
DB_USER = os.getenv("DB_USER")
PASSWORD = os.getenv("PASSWORD")
HOST = os.getenv("HOST")
PORT = os.getenv("PORT")
DBNAME = os.getenv("DBNAME")

client = OpenAI(api_key=OPENAI_API_KEY)

text_input = "Get Steven Moss record"

response = client.chat.completions.create(
    model="gpt-4o-mini", 
    messages=[
        {"role": "system", "content": """
        You are an assistant that extracts structured patient query data.

        Output must always be a JSON object with the following structure:

        {
        "name": "",
        "action": "",
        "scope": "",
        "table": "",

        - "table" should describe the table we are looking up (e.g., patients, annotation, scan)
        - "scope" should describe the data being used if the table is patients we have: dob, record, if the table is scan we have: patient_id, scan_type, scan_date, if the table is annotation we have: patient_id, scan_id, note, created_at. Depends on the table, the scope should only reflect one of the group.
        - "action" should describe the user’s intent (e.g., lookup, update, add).
        - If a field cannot be extracted, leave it as an empty string "".
        """}
        ,
        {"role": "user", "content": text_input}
    ],
    response_format={"type": "json_object"}
)

command = response.choices[0].message.content
command_dict = json.loads(command)
table = command_dict["table"]
action = command_dict["action"]
scope = command_dict["scope"]
patient = command_dict["name"]

print("table", table)
print("action", action)
print("scope", scope)
print("patient", patient)

if table == "patients":
    if action == "lookup":
        data = supabase.table(table).select(scope).eq("name", patient).execute()
else: 
    patient_info = supabase.table("patients").select("*").eq("name", patient).execute()

print("Results:", data.data)