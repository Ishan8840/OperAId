from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from transcribe import transcribe_audio


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
    return {"message": "hello"}


@app.post("/get_data")
async def transcribe(audio: UploadFile = File(...)):
    file_bytes = await audio.read()
    text = transcribe_audio(file_bytes)
    return {"transcription": text}

