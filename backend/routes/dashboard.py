from flask import Blueprint, render_template
from flask_login import login_required
from models.models import db, Gejala, Penyakit, Aturan, RiwayatUser, RiwayatLogin, ContactMessage
from sqlalchemy import func
import json

dashboard_bp = Blueprint('dashboard', __name__, url_prefix='/dashboard')

@dashboard_bp.route('/')
@login_required
def index():
    # Hitung total data
    total_gejala = Gejala.query.count()
    total_penyakit = Penyakit.query.count()
    total_aturan = Aturan.query.count()
    total_konsultasi = RiwayatUser.query.count()
    
    # Ambil konsultasi terbaru (5 terakhir)
    konsultasi_terbaru = RiwayatUser.query.order_by(
        RiwayatUser.tanggal_konsultasi.desc()
    ).limit(5).all()
    
    # Ambil riwayat login (5 terakhir)
    riwayat_login = RiwayatLogin.query.order_by(
        RiwayatLogin.waktu_login.desc()
    ).limit(5).all()
    
    # Data untuk chart - Distribusi penyakit berdasarkan konsultasi
    penyakit_stats = db.session.query(
        Penyakit.nama_penyakit,
        func.count(RiwayatUser.id).label('jumlah')
    ).join(
        RiwayatUser, Penyakit.kode_penyakit == RiwayatUser.kode_penyakit
    ).group_by(
        Penyakit.nama_penyakit
    ).all()
    
    # Prepare data untuk Chart.js
    penyakit_labels = [stat[0] for stat in penyakit_stats]
    penyakit_values = [stat[1] for stat in penyakit_stats]
    
    return render_template('dashboard/index.html',
                         total_gejala=total_gejala,
                         total_penyakit=total_penyakit,
                         total_aturan=total_aturan,
                         total_konsultasi=total_konsultasi,
                         konsultasi_terbaru=konsultasi_terbaru,
                         riwayat_login=riwayat_login,
                         penyakit_labels=json.dumps(penyakit_labels),
                         penyakit_values=json.dumps(penyakit_values))