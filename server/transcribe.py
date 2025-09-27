from io import BytesIO
from elevenlabs.client import ElevenLabs
import os
from dotenv import load_dotenv

load_dotenv()
API_KEY = os.getenv("ELEVENLABS_API_KEY")
if not API_KEY:
    raise ValueError("ELEVENLABS_API_KEY not found")

elevenlabs = ElevenLabs(api_key=API_KEY)

def transcribe_audio(file_bytes):
    audio_data = BytesIO(file_bytes)
    transcription = elevenlabs.speech_to_text.convert(
        file=audio_data,
        model_id="scribe_v1",
        tag_audio_events=True,
        language_code="eng",
        diarize=True
    )
    data = transcription.model_dump()
    return data["text"]
