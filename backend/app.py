import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from config import DB_CONFIG, GEMINI_API_KEY

app = Flask(__name__)
CORS(app)

# Configure Gemini AI
genai.configure(api_key=GEMINI_API_KEY)

# Database connection
db = mysql.connector.connect(**DB_CONFIG)
cursor = db.cursor()

@app.route("/chat", methods=["POST"])
def chat():
    user_input = request.json.get("message")

    if not user_input:
        return jsonify({"response": "No input provided!"}), 400

    try:
        # Store user input in database
        cursor.execute("INSERT INTO chat_history (user_message) VALUES (%s)", (user_input,))
        db.commit()

        # Get AI response
        model = genai.GenerativeModel("gemini-1.5-pro")
        response = model.generate_content(user_input).text

        # Store AI response in database
        cursor.execute("UPDATE chat_history SET bot_response=%s WHERE user_message=%s", (response, user_input))
        db.commit()

        return jsonify({"response": response})

    except Exception as e:
        return jsonify({"response": f"Error: {str(e)}"}), 500

if __name__ == "__main__":
    app.run(debug=True)
