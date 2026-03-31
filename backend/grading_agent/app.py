from dotenv import load_dotenv
import os
import redis
import logging
import json
import re
import io
import wave

from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from pydantic import BaseModel, Field, field_validator
from uuid import uuid4
from groq import Groq
from google import genai
from google.genai import types

# Setup logging
logging.basicConfig(level=logging.DEBUG)
load_dotenv()

#external
redis_client = redis.Redis(
    host=os.getenv("redis_host"),
    port=os.getenv("redis_port"),
    decode_responses=True,
    username="default",
    password=os.getenv("redis_password")
)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))
google_client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))

#initialisation
app = FastAPI()
limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


class ChatRequest(BaseModel):
    user_id: str
    session_id: str
    message: str

    @field_validator("message")
    def validate_message(cls, v):
        if not v.strip():
            raise ValueError("Message cannot be empty")
        if len(v) > 2000:
            raise ValueError("Message too long")
        return v

#system prompt
def load_prompt():
    try:
        with open("./agent_rules.md", "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        logging.warning("File not found")
        return """You are a conversational AI that speaks like a Gen Z native—casual, witty, and expressive. Use modern slang naturally (not forced), keep responses short and punchy, and match the user’s vibe. Be playful, a little sarcastic when appropriate, and emotionally aware. Use lowercase styling, occasional emojis, and internet shorthand, but don’t overdo it. Stay clear, relevant, and helpful while sounding like you’re texting a friend, not writing an essay"""

#globals
SYSTEM_PROMPT = load_prompt()
MAX_RECENT = 20

def safe_redis_set(key, value, ex=None):
    try:
        redis_client.set(key, value, ex=ex)
    except redis.RedisError:
        logging.warning("Redis write failed")

#message building
def build_messages(system_prompt, recent, user_input):
    messages = [{"role": "system", "content": system_prompt}]

    messages.extend(recent)
    messages.append({"role": "user", "content": user_input})

    return messages

from datetime import datetime, timedelta

def endtime() -> str:
    now = datetime.now()
    end = now + timedelta(minutes=3)
    return end.strftime("%Y-%m-%d %H:%M:%S")

#chat history management
def save_recent(session_id, recent) -> None:
    #redis data: "chat:session_id"
    safe_redis_set(
        f"chat:{session_id}:recent",
        json.dumps(recent),
        ex=86400
    )

    if redis_client.get(f"chat:{session_id}:endtime") is None:
        safe_redis_set(
            f"chat:{session_id}:endtime",
            json.dumps(endtime()),
            ex=86400
        )

def load_memory(session_id):
    try:
        recent_key = f"chat:{session_id}:recent"
        recent_json = redis_client.get(recent_key)

        recent = json.loads(recent_json) if recent_json else []

    except redis.RedisError:
        logging.warning("Redis unavailable, running without memory")
        return "", []

    return recent

def update_memory(session_id, recent, new_user_msg, new_assistant_msg):    
    recent.append({"role": "user", "content": new_user_msg})
    recent.append({"role": "assistant", "content": new_assistant_msg})

    save_recent(session_id, recent)

SLANG_MAP = {
    # Affirmations / Agreement
    "fr": "for real",
    "frfr": "for real for real",
    "ong": "on god",
    "ngl": "not gonna lie",
    "istg": "i swear to god",
    "ight": "alright",
    "fasho": "for sure",
    "fs": "for sure",

    # People / Social
    "gng": "gang",
    "bff": "best friend forever",
    "bffl": "best friend for life",

    # Reactions / Emotions
    "ded": "dead",
    "💀": "skull emoji",

    # Hype / Positive
    "iykyk": "if you know you know",

    # Internet / Meta
    "imo": "in my opinion",
    "imho": "in my honest opinion",
    "tbh": "to be honest",
    "afaik": "as far as i know",
    "gtg": "got to go",
    "ttyl": "talk to you later",
    "hmu": "hit me up",
    "dm": "direct message",
    "fyp": "for you page",
    "smth" : "something",

    # Filler / Emphasis
    "periodt": "period",
    "srs": "serious",
    "nbs": "no bull shit",
    "rn": "right now",
    "atm": "at the moment",
    "imo": "in my opinion",
    "tbf": "to be fair",
}

def expand_slang(text: str) -> str:
    """Replace Gen Z/Alpha acronyms with their full forms for TTS readability."""
    def replace_match(match):
        word = match.group(0)
        return SLANG_MAP.get(word.lower(), word)

    # Build pattern from all keys, longest first to avoid partial matches
    sorted_keys = sorted(SLANG_MAP.keys(), key=len, reverse=True)
    escaped = [re.escape(k) for k in sorted_keys]
    pattern = r"\b(?:" + "|".join(escaped) + r")\b"

    return re.sub(pattern, replace_match, text, flags=re.IGNORECASE)

def reconstruct(text: str) -> str:
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
    text = re.sub(r"`([^`]*)`", r"\1", text)
    text = re.sub(r"[*_#>-]", "", text)
    text = expand_slang(text)

    return text

#role sanitation: deletes assistant and system messages
def role_sanitation(messages_data)-> list: 
    messages = []
    if messages_data:
        try:
            messages = json.loads(messages_data)
            messages = [msg for msg in messages if msg.get("role") != "system" and msg.get("role") != "assistant"]
        except Exception as e:
            print("No conversation recorded:", e)

    return messages

#grading helper
def grading_conversation(session_id):
    with open("./grading_agent.md") as f:
        system_prompt = f.read()
    
    messages = [{"role": "system", "content": system_prompt}]
    conversation = redis_client.get(f"chat:{session_id}:recent")
    messages.append({"role": "user", "content": conversation})

    return messages

#supabase client
from supabase import create_client
import datetime

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_KEY")
supabase = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
from datetime import datetime

def save_conversation_to_supabase(session_id, user_id, chat_history):
    # 1. Get score from Redis
    score_data = redis_client.get(f"chat:{session_id}:score")

    score_percentage = None

    if score_data:
        try:
            score_json = json.loads(score_data)
            raw_score = score_json.get("score", 0)
            score_percentage = (raw_score / 40) * 100
        except Exception as e:
            print("Error parsing score:", e)
    
    data = {
        "session_id": session_id,
        "user_id": user_id,
        "chat_history": chat_history,
        "created_at": datetime.utcnow().isoformat(),
        "score": score_percentage
    }

    #making retires possible
    response = supabase.table("conversations").upsert(data, on_conflict="session_id").execute()

    # 5. Logging
    if response.data:
        print("Conversation saved successfully!")
    else:
        print("Failed to save:", response)

import time
import threading
from datetime import datetime

@app.post("/chat")
@limiter.limit("20/minute")
def chat(request: Request, req: ChatRequest):
    recent = load_memory(req.session_id)
    messages = build_messages(SYSTEM_PROMPT, recent, req.message)
    session_id = req.session_id

    def grading_agent(session_id):
        try:
            conversation = grading_conversation(session_id)
            response = client.chat.completions.create(
                        model="llama-3.3-70b-versatile",
                        messages=conversation,
                        temperature=0.7,
                        max_tokens=500,
                        stream=True
                    )

            full_response = ""

            for chunk in response:
                    content = chunk.choices[0].delta.content or ""
                    full_response += content

            safe_redis_set(f"chat:{session_id}:score", full_response, ex=86400)
            print("Saving score to supabase!")

            #getting messages
            chat_messages = f"chat:{session_id}:recent"
            messages_data = redis_client.get(chat_messages)

            messages = role_sanitation(messages_data=messages_data)
            
            #saving to supabase
            print("Saving to Supabase...[supposedly]")
            print("timing of scoring: "+ datetime.now().strftime("%Y-%m-%d %H:%M:%S"))

            print("data checking: messages thats being saved: ")
            for msg in messages:   
                print(msg)

            # save_conversation_to_supabase(
            #     session_id=req.session_id,
            #     user_id=req.user_id,
            #     chat_history=messages
            # )

        except Exception as e:
            print(f"[grading_agent] error for {session_id}:", e)

    #daemon checking if convo has ended
    def checking_for_is_ended(session_id):
        is_ended = redis_client.get(f"chat:{session_id}:active") is None

        while not is_ended:
            time.sleep(5)
            is_ended = redis_client.get(f"chat:{session_id}:active") is None
        
        grading_agent(session_id)

    #TODO: fix this part so it doesnt run with every call 
    t = threading.Thread(
            target=checking_for_is_ended,
            args=(session_id,),
            daemon=True
        )
    t.start()

    #main LLM loop
    stream = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.7,
        max_tokens=500,
        stream=True
    )
    
    def generate():
        safe_redis_set(
            f"chat:{session_id}:active",
            "active",
            ex=180
        )
        
        full_response = ""

        for chunk in stream:
            content = chunk.choices[0].delta.content or ""
            full_response += content
            yield content
        
        update_memory(session_id, recent, req.message, full_response)

        voice_msg = reconstruct(full_response)
        safe_redis_set(
            f"chat:{session_id}:voice",
            voice_msg,
            ex=86400
        )

    return StreamingResponse(generate(), media_type="text/plain")

#tts helpers
class TTSRequest(BaseModel):
    session_id: str

def load_voice_message(session_id):
    try:
        voice_msg = redis_client.get(f"chat:{session_id}:voice")
        return voice_msg
    except redis.RedisError:
        logging.warning("Redis unavailable for voice")
        return ""

def pcm_to_wav(pcm_data: bytes, sample_rate: int = 24000, channels: int = 1, sample_width: int = 2) -> bytes:
    buffer = io.BytesIO()
    with wave.open(buffer, 'wb') as wav_file:
        wav_file.setnchannels(channels)
        wav_file.setsampwidth(sample_width)
        wav_file.setframerate(sample_rate)
        wav_file.writeframes(pcm_data)
    return buffer.getvalue()

@app.post("/tts")
@limiter.limit("10/minute")
def tts(request: Request, req: TTSRequest):
    voice_msg = load_voice_message(req.session_id)

    
    response = google_client.models.generate_content(
        model="gemini-2.5-flash-preview-tts",
        contents=voice_msg,
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(
                    prebuilt_voice_config=types.PrebuiltVoiceConfig(
                        voice_name="Leda"
                    )
                )
            )
        )
    )

    pcm_data = response.candidates[0].content.parts[0].inline_data.data
    wav_data = pcm_to_wav(pcm_data)

    return StreamingResponse(io.BytesIO(wav_data), media_type="audio/wav")