from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PyPDF2 import PdfReader
import google.generativeai as genai
import io
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # for dev only
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set your Gemini API key as an environment variable or paste it here
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyDLolTBc7qX4m9S3N30G2zs2RG4E9Xs2d8")
genai.configure(api_key=GEMINI_API_KEY)

def extract_text(file_bytes):
    reader = PdfReader(io.BytesIO(file_bytes))
    return "\n".join([page.extract_text() for page in reader.pages if page.extract_text()])

@app.post("/generate-questions/")
async def generate_questions(file: UploadFile = File(...)):
    content = await file.read()
    resume_text = extract_text(content)
    if not resume_text:
        return {"error": "No text found in PDF."}
    prompt = f"Generate 5 technical interview questions based on this resume:\n\n{resume_text}"

    try:
        model = genai.GenerativeModel("gemini-2.5-flash")
        response = model.generate_content(prompt)
        questions = response.text
        return {"questions": questions}
    except Exception as e:
        return {"error": str(e)}