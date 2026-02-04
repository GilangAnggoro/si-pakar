from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required, current_user
from models.models import db, RiwayatUser, RiwayatLogin, ContactMessage
import json

riwayat_bp = Blueprint('riwayat', __name__, url_prefix='/riwayat')

@riwayat_bp.route('/konsultasi')
@login_required
def konsultasi():
    page = request.args.get('page', 1, type=int)
    per_page = 10
    
    riwayat = RiwayatUser.query.order_by(RiwayatUser.tanggal_konsultasi.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return render_template('riwayat/index.html', riwayat=riwayat)

@riwayat_bp.route('/konsultasi/<int:id>')
@login_required
def detail(id):
    riwayat = RiwayatUser.query.get_or_404(id)
    gejala_list = json.loads(riwayat.gejala_dipilih)
    
    return render_template('riwayat/detail.html', riwayat=riwayat, gejala_list=gejala_list)

@riwayat_bp.route('/konsultasi/hapus/<int:id>', methods=['POST'])
@login_required
def hapus(id):
    riwayat = RiwayatUser.query.get_or_404(id)
    
    try:
        db.session.delete(riwayat)
        db.session.commit()
        flash('Data konsultasi berhasil dihapus!', 'success')
    except Exception as e:
        db.session.rollback()
        flash('Gagal menghapus data konsultasi!', 'danger')
    
    return redirect(url_for('riwayat.konsultasi'))

@riwayat_bp.route('/konsultasi/hapus-semua', methods=['POST'])
@login_required
def hapus_semua():
    try:
        RiwayatUser.query.delete()
        db.session.commit()
        flash('Semua data konsultasi berhasil dihapus!', 'success')
    except Exception as e:
        db.session.rollback()
        flash('Gagal menghapus semua data konsultasi!', 'danger')
    
    return redirect(url_for('riwayat.konsultasi'))

@riwayat_bp.route('/login-admin')
@login_required
def login_admin():
    page = request.args.get('page', 1, type=int)
    per_page = 10
    
    riwayat = RiwayatLogin.query.filter_by(admin_id=current_user.id).order_by(
        RiwayatLogin.waktu_login.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)
    
    return render_template('riwayat/login_admin.html', riwayat=riwayat)

@riwayat_bp.route('/login-admin/delete/<int:id>')
@login_required
def delete_login(id):
    riwayat = RiwayatLogin.query.get_or_404(id)
    
    # Check if this login history belongs to current user
    if riwayat.admin_id != current_user.id:
        flash('Anda tidak memiliki akses untuk menghapus riwayat ini!', 'danger')
        return redirect(url_for('riwayat.login_admin'))
    
    db.session.delete(riwayat)
    db.session.commit()
    
    flash('Riwayat login berhasil dihapus!', 'success')
    return redirect(url_for('riwayat.login_admin'))

@riwayat_bp.route('/login-admin/delete-all')
@login_required
def delete_all_login():
    # Delete all login history for current user
    RiwayatLogin.query.filter_by(admin_id=current_user.id).delete()
    db.session.commit()
    
    flash('Semua riwayat login berhasil dihapus!', 'success')
    return redirect(url_for('riwayat.login_admin'))


# ROUTE BARU - Riwayat Pesan User
@riwayat_bp.route('/pesan')
@login_required
def pesan_user():
    page = request.args.get('page', 1, type=int)
    filter_status = request.args.get('status', 'all')
    per_page = 20
    
    query = ContactMessage.query
    
    # Filter berdasarkan status
    if filter_status == 'read':
        query = query.filter_by(is_read=True)
    elif filter_status == 'unread':
        query = query.filter_by(is_read=False)
    
    pesan_list = query.order_by(ContactMessage.created_at.desc()).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    # Hitung jumlah pesan belum dibaca
    unread_count = ContactMessage.query.filter_by(is_read=False).count()
    
    return render_template('riwayat/pesan.html', 
                         pesan=pesan_list, 
                         filter_status=filter_status,
                         unread_count=unread_count)

@riwayat_bp.route('/pesan/<int:id>/detail')
@login_required
def detail_pesan(id):
    pesan = ContactMessage.query.get_or_404(id)
    
    # Tandai sebagai sudah dibaca
    if not pesan.is_read:
        pesan.is_read = True
        db.session.commit()
    
    return render_template('riwayat/detail_pesan.html', pesan=pesan)

@riwayat_bp.route('/pesan/<int:id>/mark-read', methods=['POST'])
@login_required
def mark_read(id):
    pesan = ContactMessage.query.get_or_404(id)
    pesan.is_read = True
    db.session.commit()
    
    flash('Pesan ditandai sebagai sudah dibaca!', 'success')
    return redirect(url_for('riwayat.pesan_user'))

@riwayat_bp.route('/pesan/<int:id>/delete', methods=['POST'])
@login_required
def delete_pesan(id):
    pesan = ContactMessage.query.get_or_404(id)
    
    try:
        db.session.delete(pesan)
        db.session.commit()
        flash('Pesan berhasil dihapus!', 'success')
    except Exception as e:
        db.session.rollback()
        flash(f'Gagal menghapus pesan: {str(e)}', 'danger')
    
    return redirect(url_for('riwayat.pesan_user'))