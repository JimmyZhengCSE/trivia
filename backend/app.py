from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import random
import os

app = Flask(__name__)
CORS(app, origins=[os.getenv('FRONTEND_URL')], supports_credentials=True)

@app.route("/api/quiz", methods=['POST', 'GET'])
def quiz():
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'OK'})
        response = jsonify({'message': 'OK'})
        response.headers.add('Access-Control-Allow-Origin', os.getenv('FRONTEND_URL'))
        response.headers.add('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response
    try:
        params = {}
        if request.method == 'POST':
            paramsData = request.get_json()

            limit = paramsData.get('limit')
            difficulties = paramsData.get('difficulties')
            difficulties = ",".join(d.lower() for d in difficulties)
            params['limit'] = limit
            params['difficulties'] = difficulties
        
        url = "https://the-trivia-api.com/v2/questions"
        res = requests.get(url, params=params)
        data = res.json()
        result = []

        for q in data:
            choices = q['incorrectAnswers'] + [q['correctAnswer']]
            random.shuffle(choices)
            result.append({
                "question": q['question']['text'],
                "correct_answer": q['correctAnswer'],
                "choices": choices
            })

        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    port = os.getenv('PORT', 8000)
    app.run(host='0.0.0.0', port=int(8000))
