import google.generativeai as genai
from flask import Flask, request, jsonify
import os
from dotenv import load_dotenv
from flask_cors import CORS
import requests
import datetime
import re
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
import jwt
import random
from flask_mail import Mail, Message
import time

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Get API key from environment
API_KEY = os.environ.get('GEMINI_API_KEY')
if not API_KEY:
    raise ValueError("No API key found. Please set GEMINI_API_KEY in your .env file")

# Configure the Gemini API
genai.configure(api_key=API_KEY)

# Create the model instance for Gemini 2.0 Flash
model = genai.GenerativeModel(model_name="gemini-2.0-flash")

# Generate JWT token
def generate_token(user_id):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
        'iat': datetime.datetime.utcnow(),
        'sub': user_id
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

# Existing ask function
@app.route('/api/ask', methods=['POST'])
def ask():
    try:
        data = request.get_json()
        print(f"Received data: {data}")  # Debug log
        
        query = data.get('query')
        avatar = data.get('avatar')

        if not query or not avatar:
            return jsonify({'error': 'Query and avatar are required'}), 400

        # Check if the query is asking for the current time
        time_patterns = [
            r'what\s+(?:is|\'s)\s+the\s+(?:current\s+)?time',
            r'what\s+time\s+is\s+it',
            r'tell\s+me\s+the\s+(?:current\s+)?time',
            r'current\s+time',
            r'time\s+now'
        ]
        
        is_time_query = any(re.search(pattern, query.lower()) for pattern in time_patterns)
        
        if is_time_query:
            current_time = datetime.datetime.now().strftime("%I:%M %p")
            current_date = datetime.datetime.now().strftime("%A, %B %d, %Y")
            
            # Customize time responses based on avatar
            if avatar == "friend":
                response_text = f"Hey buddy! It's {current_time} on {current_date}. Time flies when you're having fun, right?"
            elif avatar == "educator":
                response_text = f"The current time is {current_time} on {current_date}. Did you know that time management is considered one of the most valuable skills in both academic and professional settings?"
            elif avatar == "comedian":
                response_text = f"It's {current_time}! Time is like a TV show, always running and we can't find the remote to pause it!"
            else:
                response_text = f"The current time is {current_time} on {current_date}."
                
            return jsonify({'response': response_text})

        # Customize the prompt based on the avatar
        prompt_prefix = ""
        if avatar == "friend":
            prompt_prefix = "Respond like a supportive and caring friend who uses casual language and emojis: "
        elif avatar == "educator":
            prompt_prefix = "Respond like a knowledgeable and helpful educator who explains concepts clearly but in a consise and easy to learn method(if asked for code generation ,provide the code with minimal explanation): "
        elif avatar == "comedian":
            prompt_prefix = "Respond with humor and wit, including jokes and funny observations: "
        elif avatar == "meanGuy":
            prompt_prefix = "Respond like meanest guy possible with darkest humor: "
        else:
            prompt_prefix = "Respond as a helpful AI assistant: "

        full_prompt = prompt_prefix + query
        print(f"Sending prompt to Gemini: {full_prompt}")  # Debug log
        
        # Use the Python library instead of direct API calls
        max_retries = 3
        retry_delay = 5
        
        for retry_count in range(max_retries):
            try:
                # Set generation config
                generation_config = genai.types.GenerationConfig(
                    temperature=0.9,
                    top_p=1,
                    top_k=1,
                    max_output_tokens=2048,
                )
                
                # Set safety settings
                safety_settings = [
                    {
                        "category": "HARM_CATEGORY_HARASSMENT",
                        "threshold": "BLOCK_NONE"
                    },
                    {
                        "category": "HARM_CATEGORY_HATE_SPEECH",
                        "threshold": "BLOCK_NONE"
                    },
                    {
                        "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                        "threshold": "BLOCK_NONE"
                    },
                    {
                        "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                        "threshold": "BLOCK_NONE"
                    }
                ]
                
                # Generate content
                response = model.generate_content(
                    full_prompt,
                    generation_config=generation_config,
                    safety_settings=safety_settings
                )
                
                # Extract response text
                response_text = response.text
                return jsonify({'response': response_text})
                
            except Exception as api_err:
                print(f"API error (attempt {retry_count + 1}/{max_retries}): {str(api_err)}")
                
                # Check if it's a rate limit error
                if "429" in str(api_err) or "quota" in str(api_err).lower() or "rate limit" in str(api_err).lower():
                    if retry_count < max_retries - 1:
                        retry_seconds = retry_delay * (2 ** retry_count)
                        print(f"Rate limit exceeded. Retrying in {retry_seconds} seconds...")
                        time.sleep(retry_seconds)
                        continue
                    else:
                        return jsonify({
                            'response': "I'm currently experiencing high demand. Please try again in a moment or ask a different question."
                        }), 200
                else:
                    # For other errors, don't retry
                    raise
        
        # If we get here, all retries failed
        return jsonify({'error': 'Failed to get response after multiple retries'}), 500
        
    except Exception as e:
        print(f"Error in /ask endpoint: {str(e)}")  # Debug log
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)
