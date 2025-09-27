import os
import json
import psycopg2
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
USER = os.getenv("USER")
PASSWORD = os.getenv("PASSWORD")
HOST = os.getenv("HOST")
PORT = os.getenv("PORT")
DBNAME = os.getenv("DBNAME")

print(USER)
print(PASSWORD)
print(HOST)
print(PORT)
print(DBNAME)

client = OpenAI(api_key=OPENAI_API_KEY)

text_input = "Get Bonnie Cooper record, the MRI scan from 2nd September 2025"

response = client.chat.completions.create(
    model="gpt-4o-mini", 
    messages=[
        {"role": "system", "content": """
        You are an assistant that converts natural language queries into Supabase SQL queries. 

        - Always return a JSON object with exactly two fields:
        1. "query": the SQL query to run against Supabase (Postgres syntax).
        2. "action": a short description of the intent (e.g., "lookup", "update", "insert").

        - For patients, the table is "patients" with fields: id, name, dob, record.
        - For scans, the table is "scans" with fields: id, patient_id, scan_type, scan_date, image_url.
        - For annotations, the table is "annotations" with fields: id, patient_id, scan_id, note, created_at.

        - If some information is missing, generate a query that reflects what can be known (e.g., WHERE name='John' if only the name is given).
        - If no valid query can be generated, return query="".
        """}
        ,
        {"role": "user", "content": text_input}
    ],
    response_format={"type": "json_object"}
)

command = response.choices[0].message.content
command_dict = json.loads(command)

action = command_dict["action"]
query = command_dict["query"]

try:
    connection = psycopg2.connect(
        user=USER,
        password=PASSWORD,
        host=HOST,
        port=PORT,
        dbname=DBNAME
    )
    print("Connection successful!")
    
    cur = connection.cursor()

    cur.execute(query)
    rows = cur.fetchall()
    for row in rows:
        print(row)

    cur.close()
    connection.close()
    print("Connection closed.")

except Exception as e:
    print(f"Failed to connect: {e}")