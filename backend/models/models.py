from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

# Model User untuk Frontend
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relasi
    riwayat_konsultasi = db.relationship('RiwayatUser', backref='user', lazy=True)
    contact_messages = db.relationship('ContactMessage', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Admin(UserMixin, db.Model):
    __tablename__ = 'admin'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    nama_admin = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relasi
    riwayat_login = db.relationship('RiwayatLogin', backref='admin', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Gejala(db.Model):
    __tablename__ = 'gejala'
    id = db.Column(db.Integer, primary_key=True)
    kode_gejala = db.Column(db.String(10), unique=True, nullable=False)
    nama_gejala = db.Column(db.Text, nullable=False)
    pertanyaan = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relasi
    aturan = db.relationship('Aturan', backref='gejala', lazy=True, cascade='all, delete-orphan')

class Penyakit(db.Model):
    __tablename__ = 'penyakit'
    id = db.Column(db.Integer, primary_key=True)
    kode_penyakit = db.Column(db.String(10), unique=True, nullable=False)
    nama_penyakit = db.Column(db.String(100), nullable=False)
    solusi = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relasi
    aturan = db.relationship('Aturan', backref='penyakit', lazy=True, cascade='all, delete-orphan')
    riwayat_user = db.relationship('RiwayatUser', backref='penyakit', lazy=True, cascade='all, delete-orphan')

class Aturan(db.Model):
    __tablename__ = 'aturan'
    id = db.Column(db.Integer, primary_key=True)
    kode_penyakit = db.Column(db.String(10), db.ForeignKey('penyakit.kode_penyakit'), nullable=False)
    kode_gejala = db.Column(db.String(10), db.ForeignKey('gejala.kode_gejala'), nullable=False)
    mb = db.Column(db.Float, nullable=False)
    md = db.Column(db.Float, nullable=False)
    cf = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class RiwayatUser(db.Model):
    __tablename__ = 'riwayat_user'
    id = db.Column(db.Integer, primary_key=True)
    nama_user = db.Column(db.String(100), nullable=False)
    usia = db.Column(db.Integer, nullable=False)
    jenis_kelamin = db.Column(db.String(20), nullable=False)
    email = db.Column(db.String(120), db.ForeignKey('users.email'), nullable=True)
    kode_penyakit = db.Column(db.String(10), db.ForeignKey('penyakit.kode_penyakit'), nullable=False)
    nilai_cf = db.Column(db.Float, nullable=False)
    gejala_dipilih = db.Column(db.Text, nullable=False)
    tanggal_konsultasi = db.Column(db.DateTime, default=datetime.utcnow)
    
    # ============================================================
    # ✅ TAMBAHAN BARU: Kolom untuk menyimpan alternatif diagnosis
    # ============================================================
    alternatif_diagnosis = db.Column(db.Text, nullable=True)  # JSON string untuk penyakit lain yang menyertai

class RiwayatLogin(db.Model):
    __tablename__ = 'riwayat_login'
    id = db.Column(db.Integer, primary_key=True)
    admin_id = db.Column(db.Integer, db.ForeignKey('admin.id'), nullable=False)
    waktu_login = db.Column(db.DateTime, default=datetime.utcnow)
    ip_address = db.Column(db.String(50))
    user_agent = db.Column(db.String(255))

class ContactMessage(db.Model):
    __tablename__ = 'contact_messages'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    email = db.Column(db.String(120), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    subject = db.Column(db.String(200), nullable=False)
    message = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<ContactMessage {self.subject} from {self.email}>'