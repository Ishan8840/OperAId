from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from transcribe import transcribe_audio
from analyse_audio import openai_client, functions, handle_function_call, format_response
import json

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Hello"}

@app.post("/get_data")
async def transcribe(audio: UploadFile = File(...)):
    file_bytes = await audio.read()
    transcription = transcribe_audio(file_bytes)

    try:
        # Query OpenAI with transcription
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a medical records assistant. Respond with structured JSON. Include patient_name, scan_type, scan_date, image_url, scan_id for any scans."
                },
                {"role": "user", "content": transcription}
            ],
            tools=functions,
            tool_choice="auto"
        )

        message = response.choices[0].message
        results = []

        if message.tool_calls:
            for tool_call in message.tool_calls:
                function_name = tool_call.function.name
                arguments = json.loads(tool_call.function.arguments)
                result = handle_function_call(function_name, arguments)

                # If result is a list of scans, ensure proper JSON keys
                if isinstance(result, list):
                    formatted_result = []
                    for scan in result:
                        if isinstance(scan, dict) and "image_url" in scan:
                            formatted_result.append({
                                "patient_name": scan.get("patient_name", "Unknown"),
                                "scan_type": scan.get("scan_type", "Unknown"),
                                "scan_date": scan.get("scan_date", "Unknown"),
                                "image_url": scan.get("image_url", ""),
                                "scan_id": scan.get("scan_id", "")
                            })
                else:
                    formatted_result = format_response(result, function_name)

                results.append({
                    "function": function_name,
                    "arguments": arguments,
                    "result": formatted_result
                })
        else:
            results.append({
                "function": None,
                "arguments": None,
                "result": message.content
            })

        return {
            "transcription": transcription,
            "results": results
        }

    except Exception as e:
        return {
            "transcription": transcription,
            "error": str(e)
        }
