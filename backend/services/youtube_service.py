import yt_dlp
import os
import uuid
import logging
import subprocess
from static_ffmpeg import add_paths

# Ensure ffmpeg paths are added
add_paths()

logger = logging.getLogger(__name__)

def download_audio(youtube_url: str, output_dir: str):
    """
    Downloads audio and converts it to a standard .mp3 for AI compatibility.
    Uses browser cookies to bypass YouTube's bot detection.
    """
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        
    job_id = str(uuid.uuid4())
    temp_template = f"{output_dir}/{job_id}_temp.%(ext)s"
    
    # Try browsers in order of priority for cookie extraction
    browsers_to_try = ['chrome', 'edge', 'firefox']
    
    base_ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': temp_template,
        'quiet': True,
        'no_warnings': True,
        # Anti-bot: spoof a real browser user agent
        'http_headers': {
            'User-Agent': (
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
                'AppleWebKit/537.36 (KHTML, like Gecko) '
                'Chrome/124.0.0.0 Safari/537.36'
            ),
        },
        # YouTube-specific extractor args to bypass throttling
        'extractor_args': {
            'youtube': {
                'player_client': ['web', 'android'],
            }
        },
    }

    last_error = None

    # First, try with cookies from each installed browser
    for browser in browsers_to_try:
        try:
            ydl_opts = {**base_ydl_opts, 'cookiesfrombrowser': (browser,)}
            logger.info(f"Attempting download using {browser} cookies...")
            return _do_download(youtube_url, output_dir, ydl_opts)
        except Exception as e:
            logger.warning(f"Browser '{browser}' cookies failed: {e}")
            last_error = e
            continue

    # Fallback: try without cookies (works for less restricted videos)
    try:
        logger.warning("All browser cookie attempts failed, trying without cookies...")
        return _do_download(youtube_url, output_dir, base_ydl_opts)
    except Exception as e:
        last_error = e

    raise RuntimeError(
        f"YouTube download failed. YouTube may be blocking the request.\n"
        f"Try opening the video in Chrome first, then retry.\n"
        f"Details: {last_error}"
    )


def _do_download(youtube_url: str, output_dir: str, ydl_opts: dict):
    """Inner download + ffmpeg conversion logic."""
    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        logger.info(f"Extracting audio from {youtube_url}")
        info = ydl.extract_info(youtube_url, download=True)
        temp_filename = ydl.prepare_filename(info)
        
        final_filename = os.path.join(output_dir, f"{info['id']}.mp3")
        
        try:
            logger.info(f"Converting {temp_filename} to standard MP3...")
            cmd = [
                'ffmpeg', '-y', '-i', temp_filename,
                '-vn', '-ar', '44100', '-ac', '2', '-b:a', '192k',
                final_filename
            ]
            subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
            logger.info(f"Conversion complete: {final_filename}")
            
            if os.path.exists(temp_filename):
                os.remove(temp_filename)
                
            return final_filename, info.get('title', 'Unknown Title'), info.get('duration', 0)
        except Exception as e:
            logger.error(f"FFmpeg conversion failed: {e}")
            return temp_filename, info.get('title', 'Unknown Title'), info.get('duration', 0)
