import os
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-sistem-pakar-2024'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///database.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Tambahkan ini (opsional jika mau pakai untuk debugging)
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
