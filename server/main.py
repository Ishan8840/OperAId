from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from transcribe import transcribe_audio
from analyse_audio import openai_client, functions, handle_function_call, format_response
import json



app = FastAPI()

# import os
# from supabase import create_client, Client
# url: str = os.environ.get("SUPABASE_URL")
# key: str = os.environ.get("SUPABASE_KEY")
# supabase: Client = create_client(url, key)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message" : "Hello"}


@app.post("/get_data")
async def transcribe(audio: UploadFile = File(...)):
        # 1. Transcribe audio
    file_bytes = await audio.read()
    transcription = transcribe_audio(file_bytes)
    
    try:
        # 2. Send transcription as query to OpenAI
        response = openai_client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a medical records assistant. Use the provided functions to help users query patient records, scans, and annotations."
                },
                {"role": "user", "content": transcription}
            ],
            tools=functions,
            tool_choice="auto"
        )
        
        message = response.choices[0].message
        
        # 3. Handle any function/tool calls
        results = []
        if message.tool_calls:
            for tool_call in message.tool_calls:
                function_name = tool_call.function.name
                arguments = json.loads(tool_call.function.arguments)
                result = handle_function_call(function_name, arguments)
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
        print(message)
        
        # 4. Return transcription + results
        print(results)
        return {
            "transcription": transcription,
            "results": results
        }
    
    except Exception as e:
        return {
            "transcription": transcription,
            "error": str(e)
        }