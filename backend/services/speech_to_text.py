import whisper
import os
import logging
from static_ffmpeg import add_paths

add_paths()
logger = logging.getLogger(__name__)

def speech_to_text(audio_path: str):
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")
    
    logger.info("Loading Whisper base model (may take a moment on first run)...")
    model = whisper.load_model("base")
    
    logger.info(f"Transcribing audio: {audio_path}")
    result = model.transcribe(audio_path)
    
    return result["text"]
