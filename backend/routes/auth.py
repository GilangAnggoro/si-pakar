from flask import Blueprint, render_template, request, redirect, url_for, flash, session
from flask_login import login_user, logout_user, login_required, current_user
from models.models import db, Admin, RiwayatLogin

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/')
def index():
    if current_user.is_authenticated:
        admin_exists = Admin.query.get(current_user.id)
        if not admin_exists:
            logout_user()
            session.clear()  # Clear session
            return redirect(url_for('auth.login'))
        return redirect(url_for('dashboard.index'))
    
    return redirect(url_for('auth.login'))

@auth_bp.route('/login', methods=['GET', 'POST'])
def login():
    # Clear old invalid sessions
    if current_user.is_authenticated:
        admin_exists = Admin.query.get(current_user.id)
        if not admin_exists:
            logout_user()
            session.clear()
        else:
            return redirect(url_for('dashboard.index'))
    
    # Check if any admin exists
    admin_count = Admin.query.count()
    if admin_count == 0:
        flash('Tidak ada admin di sistem! Hubungi developer.', 'danger')
        return render_template('auth/login.html')
    
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if not username or not password:
            flash('Username dan password harus diisi!', 'danger')
            return render_template('auth/login.html')
        
        admin = Admin.query.filter_by(username=username).first()
        
        if admin and admin.check_password(password):
            login_user(admin)
            
            # Save login history
            try:
                riwayat = RiwayatLogin(
                    admin_id=admin.id,
                    ip_address=request.remote_addr,
                    user_agent=request.headers.get('User-Agent')
                )
                db.session.add(riwayat)
                db.session.commit()
            except Exception as e:
                db.session.rollback()
                print(f"Error saving login history: {str(e)}")
            
            flash('Login berhasil! Selamat datang.', 'success')
            
            next_page = request.args.get('next')
            if next_page:
                return redirect(next_page)
            return redirect(url_for('dashboard.index'))
        else:
            flash('Username atau password salah!', 'danger')
    
    return render_template('auth/login.html')

@auth_bp.route('/logout')
@login_required
def logout():
    # Get admin info before logout (untuk cek apakah masih ada di DB)
    admin_id = current_user.id
    admin_exists = Admin.query.get(admin_id)
    
    logout_user()
    session.clear()
    
    # Hanya tampilkan pesan logout jika admin masih ada di database
    if admin_exists:
        flash('Logout berhasil! Sampai jumpa lagi.', 'success')
    # Jika admin sudah tidak ada (dihapus), tidak perlu tampilkan pesan apapun
    
    return redirect(url_for('auth.login'))

@auth_bp.route('/clear-session')
def clear_session():
    """Route untuk membersihkan session"""
    logout_user()
    session.clear()
    
    admin_count = Admin.query.count()
    if admin_count == 0:
        flash('Session dibersihkan. Tidak ada admin di sistem!', 'warning')
    else:
        flash('Session berhasil dibersihkan!', 'info')
    
    return redirect(url_for('auth.login'))