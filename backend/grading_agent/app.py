from dotenv import load_dotenv
import os
import redis
import logging
import json
import re

from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import StreamingResponse

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

from pydantic import BaseModel, field_validator
from groq import Groq

# Setup logging
logging.basicConfig(level=logging.DEBUG)
load_dotenv()

#external
redis_client = redis.Redis(
    host='redis-16449.c334.asia-southeast2-1.gce.cloud.redislabs.com',
    port=16449,
    decode_responses=True,
    username="default",
    password=os.getenv("redis_password")
)
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

#initialisation
app = FastAPI()
# lambda request: request.state.user_id
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
def build_messages(system_prompt, summary, recent, user_input):
    messages = [{"role": "system", "content": system_prompt}]

    if summary:
        messages.append({
            "role": "system",
            "content": f"Conversation so far: {summary}"
        })

    messages.extend(recent)
    messages.append({"role": "user", "content": user_input})

    return messages

def summarize_messages(summary, recent):
    prompt = [
        {"role": "system", "content": "Summarize this conversation briefly."},
        {"role": "user", "content": f"""
        Previous summary:
        {summary}

        New messages:
        {recent}
        """}
        ]

    completion = client.chat.completions.create(
        model="qwen/qwen3-32b",
        messages=prompt,
        temperature=0.3,
        max_tokens=200
    )

    return completion.choices[0].message.content

#chat history management
def save_recent(session_id, recent):
    safe_redis_set(
        f"chat:{session_id}:recent",
        json.dumps(recent),
        ex=86400
    )

def load_memory(session_id):
    try:
        recent_key = f"chat:{session_id}:recent"
        summary_key = f"chat:{session_id}:summary"

        recent_json = redis_client.get(recent_key)
        summary = redis_client.get(summary_key)

        recent = json.loads(recent_json) if recent_json else []
        summary = summary if summary else ""

    except redis.RedisError:
        logging.warning("Redis unavailable, running without memory")
        return "", []

    return summary, recent

def update_memory(session_id, summary, recent, new_user_msg, new_assistant_msg):
    # Summarize BEFORE appending if already at limit
    if len(recent) >= MAX_RECENT - 1:
        new_summary = summarize_messages(summary, recent)
        safe_redis_set(
            f"chat:{session_id}:summary",
            new_summary,
            ex=86400
        )
        recent = []  # clear after summarizing
    
    recent.append({"role": "user", "content": new_user_msg})
    recent.append({"role": "assistant", "content": new_assistant_msg})

    save_recent(session_id, recent)

def strip_markdown(text: str) -> str:
    text = re.sub(r"```.*?```", "", text, flags=re.DOTALL)
    text = re.sub(r"`([^`]*)`", r"\1", text)
    text = re.sub(r"[*_#>-]", "", text)

    return text

def prep_message(text: str) -> str:
    try:
        cleaned = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL)
        cleaned = strip_markdown(cleaned)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()

        return cleaned

    except Exception as e:
        logging.warning(f"TTS prep failed: {e}")
        return ""


@app.post("/chat")
@limiter.limit("20/minute")
# session_id: str = Depends(get_session_id)
def chat(request: Request, req: ChatRequest):
    # request.state.user_id = session_id
    summary, recent = load_memory(req.session_id)
    messages = build_messages(SYSTEM_PROMPT, summary, recent, req.message)

    stream = client.chat.completions.create(
        model="qwen/qwen3-32b",
        messages=messages,
        temperature=0.7,
        max_tokens=500,
        stream=True
    )
    
    def generate():
        full_response = ""

        for chunk in stream:
            content = chunk.choices[0].delta.content or ""
            full_response += content
            yield content
        
        update_memory(req.session_id, summary, recent, req.message, full_response)

        voice_msg = prep_message(full_response)
        safe_redis_set(
            f"chat:{req.session_id}:voice",
            voice_msg,
            ex=86400
        )
    
    return StreamingResponse(generate(), media_type="text/plain")

#tts side
class TTSRequest(BaseModel):
    session_id: str

def load_voice_message(session_id):
    try:
        voice_msg = redis_client.get(f"chat:{session_id}:voice")
        return voice_msg or ""
    except redis.RedisError:
        logging.warning("Redis unavailable for voice")
        return ""

@app.post("/tts")
def tts(request: Request, req: TTSRequest):
    voice_msg = load_voice_message(req.session_id)
    logging.debug(f"TTS input: '{voice_msg}'")

    if not voice_msg:
        raise HTTPException(status_code=404, detail="No voice message found")

    audio = client.audio.speech.create(
        model="canopylabs/orpheus-v1-english",
        voice="autumn",
        response_format="wav",
        input=voice_msg
    )

    return StreamingResponse(iter([audio.read()]),  media_type="audio/wav")