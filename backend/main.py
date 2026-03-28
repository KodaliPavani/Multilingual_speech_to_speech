import os
import uuid
import logging
import uvicorn
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from dotenv import load_dotenv

from services.youtube_service import download_audio
from services.gemini_service import process_audio_with_gemini
from services.tts_service import text_to_speech

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()
app = FastAPI(title="Professional Video Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

AUDIO_DIR = "output_audio"
TEMP_DIR = "temp_processing"
for d in [AUDIO_DIR, TEMP_DIR]:
    if not os.path.exists(d):
        os.makedirs(d)

app.mount("/audio", StaticFiles(directory=AUDIO_DIR), name="audio")

class TranslateRequest(BaseModel):
    url: str
    target_language: str
    
@app.get("/")
def root():
    return {"status": "active", "theme": "love", "version": "4.1.0"}

def cleanup_file(path: str):
    try:
        if path and os.path.exists(path):
            os.remove(path)
            logger.info(f"Cleaned up file: {path}")
    except Exception as e:
        logger.error(f"Error during cleanup: {e}")

@app.post("/analyze")
def analyze_video(request: TranslateRequest, background_tasks: BackgroundTasks):
    """
    Main Logic Flow: Download -> Gemini 2.5 Flash (Transcript, Translation, Summary) -> gTTS
    """
    logger.info(f"Starting request for {request.url} to {request.target_language}")
    try:
        # Step 1: Download Audio
        logger.info("[Step 1/3] Downloading audio...")
        audio_path, title, duration = download_audio(request.url, TEMP_DIR)
        
        # Step 2: Gemini Processing
        logger.info("[Step 2/3] Processing audio with Gemini AI...")
        gemini_result = process_audio_with_gemini(audio_path, request.target_language)
        
        transcript = gemini_result.get("transcript", "Transcription not available.")
        translated_text = gemini_result.get("translation", "Translation not available.")
        notes = gemini_result.get("summary", "Summary not available.")
        
        # Step 3: Text to Speech with gTTS
        logger.info("[Step 3/3] Synthesizing speech...")
        audio_filename = f"{uuid.uuid4()}.mp3"
        audio_output_path = os.path.join(AUDIO_DIR, audio_filename)
        try:
            text_to_speech(translated_text, request.target_language, audio_output_path)
        except Exception as e:
            logger.error(f"TTS pipeline critical failure: {e}")
            audio_filename = "" # Empty URL if totally failed
        
        # Schedule cleanup
        background_tasks.add_task(cleanup_file, audio_path)
        
        result_payload = {
            "title": title,
            "duration": duration,
            "transcript": transcript,
            "translation": translated_text,
            "summary": notes,
            "audio_url": f"http://localhost:8000/audio/{audio_filename}"
        }
        
        logger.info(f"Successfully processed video: {title}")
        return result_payload

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
