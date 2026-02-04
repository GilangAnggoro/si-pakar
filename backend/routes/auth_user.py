from flask import Blueprint, request, jsonify
from models.models import db
from werkzeug.security import generate_password_hash, check_password_hash
import re

auth_user_bp = Blueprint('auth_user', __name__, url_prefix='/api/auth')

# Model User (Tambahkan di models.py)
"""
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
"""

@auth_user_bp.route('/register', methods=['POST'])
def register():
    """Register user baru"""
    try:
        data = request.get_json()
        
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')
        
        # Validasi
        if not email or not username or not password:
            return jsonify({
                'success': False,
                'message': 'Semua field harus diisi'
            }), 400
        
        # Validasi email format
        if not re.match(r'^[\w\.-]+@[\w\.-]+\.\w+$', email):
            return jsonify({
                'success': False,
                'message': 'Format email tidak valid'
            }), 400
        
        # Import model User
        from models.models import User
        
        # Cek email sudah terdaftar
        if User.query.filter_by(email=email).first():
            return jsonify({
                'success': False,
                'message': 'Email sudah terdaftar'
            }), 400
        
        # Cek username sudah terdaftar
        if User.query.filter_by(username=username).first():
            return jsonify({
                'success': False,
                'message': 'Username sudah digunakan'
            }), 400
        
        # Buat user baru
        user = User(email=email, username=username)
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Registrasi berhasil'
        }), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@auth_user_bp.route('/login', methods=['POST'])
def login():
    """Login user"""
    try:
        data = request.get_json()
        
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({
                'success': False,
                'message': 'Email dan password harus diisi'
            }), 400
        
        from models.models import User
        
        # Cari user
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return jsonify({
                'success': False,
                'message': 'Email atau password salah'
            }), 401
        
        # Return user data (tanpa password)
        return jsonify({
            'success': True,
            'message': 'Login berhasil',
            'user': {
                'id': user.id,
                'email': user.email,
                'username': user.username
            },
            'token': 'dummy_token_' + str(user.id)  # Bisa diganti dengan JWT
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@auth_user_bp.route('/forgot-password', methods=['POST'])
def forgot_password():
    """Reset password user"""
    try:
        data = request.get_json()
        
        username = data.get('username')
        password = data.get('password')
        confirm_password = data.get('confirm_password')
        
        if not username or not password or not confirm_password:
            return jsonify({
                'success': False,
                'message': 'Semua field harus diisi'
            }), 400
        
        if password != confirm_password:
            return jsonify({
                'success': False,
                'message': 'Password tidak cocok'
            }), 400
        
        from models.models import User
        
        # Cari user
        user = User.query.filter_by(username=username).first()
        
        if not user:
            return jsonify({
                'success': False,
                'message': 'Username tidak ditemukan'
            }), 404
        
        # Update password
        user.set_password(password)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Password berhasil diubah'
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500