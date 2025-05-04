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

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///d:/Humor_Bot-main/users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'default-secret-key-change-in-production')

# Configure Flask-Mail
app.config['MAIL_SERVER'] = 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587
app.config['MAIL_USE_TLS'] = True
app.config['MAIL_USERNAME'] = os.environ.get('EMAIL_USER', 'your-email@gmail.com')
app.config['MAIL_PASSWORD'] = os.environ.get('EMAIL_PASSWORD', 'your-app-password')
app.config['MAIL_DEFAULT_SENDER'] = os.environ.get('EMAIL_USER', 'your-email@gmail.com')

# Initialize extensions
db = SQLAlchemy(app)
mail = Mail(app)

# Get API key from environment
API_KEY = os.environ.get('GEMINI_API_KEY')
if not API_KEY:
    raise ValueError("No API key found. Please set GEMINI_API_KEY in your .env file")

# Gemini API endpoint
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent"

# User model
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f'<User {self.email}>'

# OTP storage (in-memory for simplicity, use database in production)
otps = {}

# Create all database tables
with app.app_context():
    db.create_all()

# Generate JWT token
def generate_token(user_id):
    payload = {
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=1),
        'iat': datetime.datetime.utcnow(),
        'sub': user_id
    }
    return jwt.encode(payload, app.config['SECRET_KEY'], algorithm='HS256')

# Generate OTP
def generate_otp():
    return str(random.randint(100000, 999999))

# Send OTP via email
def send_otp_email(email, otp, is_signup=False):
    subject = "Your OTP for Giggles AI Signup" if is_signup else "Your OTP for Giggles AI Login"
    body = f"Your OTP for {'signup' if is_signup else 'login'} is: {otp}. This code will expire in 10 minutes."
    
    msg = Message(subject=subject, recipients=[email], body=body)
    mail.send(msg)

# Signup Step 1: Request OTP
@app.route('/api/signup/request-otp', methods=['POST'])
def signup_request_otp():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    if not all([name, email, password]):
        return jsonify({'error': 'Missing required fields'}), 400
    
    # Check if user already exists
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({'error': 'Email already registered'}), 409
    
    # Generate and store OTP
    otp = generate_otp()
    expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    otps[email] = {
        'otp': otp,
        'expiry': expiry,
        'name': name,
        'password': password,
        'type': 'signup'
    }
    
    # Send OTP via email
    try:
        send_otp_email(email, otp, is_signup=True)
        return jsonify({'message': 'OTP sent to your email'}), 200
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return jsonify({'error': 'Failed to send OTP email'}), 500

# Signup Step 2: Verify OTP and create account
@app.route('/api/signup/verify-otp', methods=['POST'])
def signup_verify_otp():
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    
    if not email or not otp:
        return jsonify({'error': 'Email and OTP are required'}), 400
    
    # Check if OTP exists and is valid
    if email not in otps or otps[email]['type'] != 'signup':
        return jsonify({'error': 'Invalid request'}), 400
    
    stored_otp = otps[email]
    if stored_otp['otp'] != otp:
        return jsonify({'error': 'Invalid OTP'}), 400
    
    if datetime.datetime.utcnow() > stored_otp['expiry']:
        del otps[email]
        return jsonify({'error': 'OTP expired'}), 400
    
    # Create new user
    hashed_password = generate_password_hash(stored_otp['password'])
    new_user = User(
        name=stored_otp['name'],
        email=email,
        password=hashed_password
    )
    
    try:
        db.session.add(new_user)
        db.session.commit()
        
        # Generate token
        token = generate_token(new_user.id)
        
        # Clean up OTP
        del otps[email]
        
        return jsonify({
            'message': 'Signup successful',
            'token': token,
            'user': {
                'id': new_user.id,
                'name': new_user.name,
                'email': new_user.email
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        print(f"Error creating user: {str(e)}")
        return jsonify({'error': 'Failed to create user'}), 500

# Login Step 1: Request OTP
@app.route('/api/login/request-otp', methods=['POST'])
def login_request_otp():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400
    
    # Check if user exists
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Verify password
    if not check_password_hash(user.password, password):
        return jsonify({'error': 'Invalid password'}), 401
    
    # Generate and store OTP
    otp = generate_otp()
    expiry = datetime.datetime.utcnow() + datetime.timedelta(minutes=10)
    otps[email] = {
        'otp': otp,
        'expiry': expiry,
        'user_id': user.id,
        'type': 'login'
    }
    
    # Send OTP via email
    try:
        send_otp_email(email, otp, is_signup=False)
        return jsonify({'message': 'OTP sent to your email'}), 200
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return jsonify({'error': 'Failed to send OTP email'}), 500

# Login Step 2: Verify OTP
@app.route('/api/login/verify-otp', methods=['POST'])
def login_verify_otp():
    data = request.get_json()
    email = data.get('email')
    otp = data.get('otp')
    
    if not email or not otp:
        return jsonify({'error': 'Email and OTP are required'}), 400
    
    # Check if OTP exists and is valid
    if email not in otps or otps[email]['type'] != 'login':
        return jsonify({'error': 'Invalid request'}), 400
    
    stored_otp = otps[email]
    if stored_otp['otp'] != otp:
        return jsonify({'error': 'Invalid OTP'}), 400
    
    if datetime.datetime.utcnow() > stored_otp['expiry']:
        del otps[email]
        return jsonify({'error': 'OTP expired'}), 400
    
    # Get user
    user = User.query.get(stored_otp['user_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Generate token
    token = generate_token(user.id)
    
    # Clean up OTP
    del otps[email]
    
    return jsonify({
        'message': 'Login successful',
        'token': token,
        'user': {
            'id': user.id,
            'name': user.name,
            'email': user.email
        }
    }), 200

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
        
        # Make direct API call to Gemini
        headers = {
            "Content-Type": "application/json",
            "x-goog-api-key": API_KEY
        }
        
        payload = {
            "contents": [
                {
                    "parts": [
                        {
                            "text": full_prompt
                        }
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.9,
                "topP": 1,
                "topK": 1,
                "maxOutputTokens": 2048
            },
            "safetySettings": [
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
        }
        
        response = requests.post(
            GEMINI_API_URL, 
            headers=headers,
            json=payload
        )
        
        if response.status_code != 200:
            print(f"Error from Gemini API: {response.status_code} - {response.text}")
            return jsonify({'error': f"API Error: {response.status_code}"}), 500
            
        response_data = response.json()
        
        # Extract the text from the response
        if 'candidates' in response_data and len(response_data['candidates']) > 0:
            candidate = response_data['candidates'][0]
            if 'content' in candidate and 'parts' in candidate['content']:
                parts = candidate['content']['parts']
                if len(parts) > 0 and 'text' in parts[0]:
                    response_text = parts[0]['text']
                    return jsonify({'response': response_text})
        
        return jsonify({'error': 'Failed to get response from Gemini API'}), 500
        
    except Exception as e:
        print(f"Error in /ask endpoint: {str(e)}")  # Debug log
        return jsonify({'error': str(e)}), 500

if __name__ == "__main__":
    app.run(port=5000, debug=True)