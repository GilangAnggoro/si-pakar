from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from models.models import db

profile_bp = Blueprint('profile', __name__, url_prefix='/profile')

@profile_bp.route('/')
@login_required
def index():
    return render_template('profile/index.html')

@profile_bp.route('/update', methods=['POST'])
@login_required
def update():
    nama_admin = request.form.get('nama_admin')
    password_lama = request.form.get('password_lama')
    password_baru = request.form.get('password_baru')
    
    # Update nama admin
    if nama_admin:
        current_user.nama_admin = nama_admin
    
    # Update password jika diisi
    if password_lama and password_baru:
        if current_user.check_password(password_lama):
            current_user.set_password(password_baru)
            flash('Profil dan password berhasil diupdate!', 'success')
        else:
            flash('Password lama tidak sesuai!', 'danger')
            return redirect(url_for('profile.index'))
    else:
        flash('Profil berhasil diupdate!', 'success')
    
    db.session.commit()
    return redirect(url_for('profile.index'))