from gtts import gTTS
import os
import logging

logger = logging.getLogger(__name__)

# Map general language names from frontend to ISO codes used by gTTS
LANG_MAP = {
    "english": "en",
    "telugu": "te",
    "hindi": "hi",
    "spanish": "es",
    "french": "fr"
}

def text_to_speech(text: str, language: str, output_path: str) -> str:
    lang_code = LANG_MAP.get(language.lower(), "en")
    
    if not text.strip():
        text = "Audio translation unavailable."
        
    # Limit to first 1000 characters to avoid getting blocked by Google TTS
    if len(text) > 1000:
        logger.info("Truncating text for TTS to 1000 characters to prevent network timeout...")
        text = text[:1000] + "..."
        
    logger.info(f"Synthesizing {lang_code} speech to {output_path}...")
    try:
        tts = gTTS(text=text, lang=lang_code)
        tts.save(output_path)
    except Exception as e:
        logger.error(f"Failed to synthesize speech due to network/gTTS error: {e}")
        # Create a fallback simple audio if it fails, or it'll just be handled gracefully
        try:
            fallback = gTTS(text="Speech synthesis unavailable due to server constraints.", lang="en")
            fallback.save(output_path)
        except Exception as internal_e:
            logger.error(f"Fallback synthesis also failed: {internal_e}")
            pass # The file just won't be created
    
    return output_path
