from googletrans import Translator
import logging

logger = logging.getLogger(__name__)

def translate_text(text: str, target_lang: str) -> str:
    if not text.strip():
        return ""
        
    logger.info(f"Translating text to {target_lang}...")
    translator = Translator()
    
    # Target lang is given as word ('telugu', 'english'), googletrans can map string names.
    result = translator.translate(text, dest=target_lang)
    return result.text
