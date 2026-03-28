import google.generativeai as genai
import os
import logging
import json
import time
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    genai.configure(api_key=api_key)
else:
    logger.warning("No GEMINI_API_KEY found in .env. Processing will fail.")

def process_audio_with_gemini(audio_path: str, target_language: str) -> dict:
    if not os.path.exists(audio_path):
        raise FileNotFoundError(f"Audio file not found: {audio_path}")
        
    logger.info(f"Uploading audio file {audio_path} to Gemini...")
    audio_file = genai.upload_file(path=audio_path)
    
    # Wait for the file to be processed
    while audio_file.state.name == "PROCESSING":
        logger.info("Waiting for file processing...")
        time.sleep(2)
        audio_file = genai.get_file(audio_file.name)
        
    if audio_file.state.name == "FAILED":
        raise ValueError("Audio file processing failed!")

    logger.info(f"File uploaded. Processing with Gemini 2.5 Flash for {target_language}...")
    model = genai.GenerativeModel("gemini-2.5-flash") 
    
    prompt = f"""
    You are a professional video intelligence translator. 
    Analyze the uploaded audio file and provide the following in a strict JSON format:
    1. "transcript": The exact transcript of the original audio in its original language.
    2. "translation": A highly accurate translation of the transcript into {target_language}.
    3. "summary": A short, clear, and professional summary (in bullet points) of the content in {target_language}. Focus on retaining the key essence and important facts.

    Return ONLY a valid JSON object matching the keys above. Do not wrap in markdown tags like ```json.
    """
    
    response = model.generate_content([audio_file, prompt])
    
    try:
        # Cleanup the file from Gemini storage
        genai.delete_file(audio_file.name)
        logger.info("Cleaned up file from Gemini storage.")
    except Exception as e:
        logger.error(f"Failed to delete file from Gemini storage: {e}")
        
    response_text = response.text.strip()
    # In case Gemini adds markdown fences anyway
    if response_text.startswith("```json"):
        response_text = response_text[7:]
    if response_text.startswith("```"):
        response_text = response_text[3:]
    if response_text.endswith("```"):
        response_text = response_text[:-3]
        
    try:
        result_content = json.loads(response_text)
        return result_content
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Gemini response as JSON: {response_text}")
        raise ValueError("Gemini returned an invalid format. Please try again.")
