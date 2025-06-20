import speech_recognition as sr
import requests
import librosa
import numpy as np
import json

# ----------- STEP 1: Transcribe Audio to Text -----------
def transcribe_audio(audio_file_path):
    recognizer = sr.Recognizer()
    with sr.AudioFile(audio_file_path) as source:
        audio_data = recognizer.record(source)
        try:
            text = recognizer.recognize_google(audio_data)
            return text
        except sr.UnknownValueError:
            return "Could not understand audio"
        except sr.RequestError as e:
            return f"Speech recognition error: {e}"

# ----------- STEP 2: Send to Scoring API (Flask) -----------
def send_to_scoring_api(question, answer_text):
    url = "http://127.0.0.1:5000/evaluate"  # Make sure your Flask app is running
    data = {
        "question": question,
        "user_answer": answer_text
    }
    try:
        response = requests.post(url, json=data)
        return response.json()
    except requests.exceptions.RequestException as e:
        return {"error": str(e)}

# ----------- STEP 3: Analyze Confidence from Audio -----------
def analyze_confidence(audio_file_path):
    try:
        y, sr_val = librosa.load(audio_file_path)
        energy = np.sum(y**2) / len(y)  # average energy
        pitch, _ = librosa.piptrack(y=y, sr=sr_val)
        avg_pitch = np.mean(pitch[pitch > 0]) if np.any(pitch > 0) else 0

        # Normalize into 1–5 score range
        energy_score = min(5, max(1, int(energy * 1000)))
        pitch_score = min(5, max(1, int(avg_pitch / 50)))

        confidence = round((energy_score + pitch_score) / 2, 2)
        return confidence
    except Exception as e:
        return f"Confidence analysis error: {e}"

# ----------- MAIN FUNCTION -----------
if __name__ == "__main__":
    audio_path = "user_answer.wav"  # Replace with your .wav file
    question = "Explain the concept of binary search."

    print("🎤 Transcribing audio...")
    answer_text = transcribe_audio(audio_path)
    print("📝 Transcription:", answer_text)

    print("\n📡 Sending to evaluation API...")
    llm_scores = send_to_scoring_api(question, answer_text)
    print("✅ LLM Score:", json.dumps(llm_scores, indent=2))

    print("\n📊 Analyzing confidence from voice...")
    confidence_score = analyze_confidence(audio_path)
    print("🔊 Voice Confidence Score:", confidence_score)
