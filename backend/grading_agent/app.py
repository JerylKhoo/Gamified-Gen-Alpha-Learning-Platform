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
from pydantic import BaseModel, field_validator
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

#chat history management
def save_recent(session_id, recent) -> None:
    #redis data: "chat:session_id"
    safe_redis_set(
        f"chat:{session_id}:recent",
        json.dumps(recent),
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

#TODO: switch frfr/iirc/fr/gng/gg etc into like WORDS
def reconstruct(text: str) -> str:
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
    text = re.sub(r"`([^`]*)`", r"\1", text)
    text = re.sub(r"[*_#>-]", "", text)

    return text

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

#TODO: change the input --> prereq: grading agent
def save_conversation_to_supabase(session_id, user_message, full_response, score):
    #1: resolve chat_id
    #2: resolve to user_id (ui side)
    #3: get score from grading json ["score"]
        #score is out of 40, convert it into percentage
    #4: chat history from recent

    data = {
        "session_id": session_id,
        "chat_hitory": full_response,
        "created_at": datetime.utcnow().isoformat(),  # store UTC timestamp
        "score": score
    }

    #5: update persistent data
    response = supabase.table("conversations").insert(data).execute()

    if response.status_code == 201:  # inserted successfully
        print("Conversation saved successfully!")
    else:
        print("Failed to save conversation:", response.data)

import time
import threading

@app.post("/chat")
@limiter.limit("20/minute")
def chat(request: Request, req: ChatRequest):
    recent = load_memory(req.session_id)
    messages = build_messages(SYSTEM_PROMPT, recent, req.message)

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

                print(full_response)
                safe_redis_set(f"chat:{session_id}:score", full_response, ex=86400)
            except Exception as e:
                print(f"[grading_agent] error for {session_id}:", e)

    #daemon checking if convo has ended
    def checking_for_is_ended(session_id):
        is_ended = redis_client.get(f"chat:{session_id}:active") is None

        while not is_ended:
            time.sleep(5)
            is_ended = redis_client.get(f"chat:{session_id}:active") is None
        
        grading_agent(session_id)

    stream = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.7,
        max_tokens=500,
        stream=True
    )
    
    def generate():
        safe_redis_set(
            f"chat:{req.session_id}:active",
            "active",
            ex=180
        )

        t = threading.Thread(
            target=checking_for_is_ended,
            args=(req.session_id,),
            daemon=True
        )
        t.start()
        
        full_response = ""

        for chunk in stream:
            content = chunk.choices[0].delta.content or ""
            full_response += content
            yield content
        
        update_memory(req.session_id, recent, req.message, full_response)

        voice_msg = reconstruct(full_response)
        safe_redis_set(
            f"chat:{req.session_id}:voice",
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