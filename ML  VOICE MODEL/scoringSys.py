from flask import Flask, request, jsonify
import google.generativeai as genai
import json

app = Flask(__name__)

# 👉 Replace this with your real Gemini API key
genai.configure(api_key="AIzaSyBh9bPDLfE8gBQ_DzcALT_BN06hRJq-8t0")

model = genai.GenerativeModel("gemini-1.5-pro-latest")

@app.route('/evaluate', methods=['POST'])
def evaluate():
    data = request.get_json()
    question = data.get('question')
    user_answer = data.get('user_answer')

    if not question or not user_answer:
        return jsonify({"error": "Missing question or answer"}), 400

    prompt = f"""
You are an intelligent AI interview evaluator.

Given:
Question: "{question}"
User's Answer: "{user_answer}"

Evaluate the answer with:
- Correctness (0-5)
- Communication (0-5)
- Confidence (0-5)
- Skill tag (DSA, System Design, Behavioral)

Return in this JSON format:
{{
  "correctness": <int>,
  "communication": <int>,
  "confidence": <int>,
  "skill_tag": "<string>"
}}
"""

    try:
        response = model.generate_content(prompt)
        result = response.text.strip()

        # Safety: Try parsing only if it's proper JSON
        parsed = json.loads(result)
        return jsonify(parsed)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000)
