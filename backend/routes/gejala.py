from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required
from models.models import db, Gejala

gejala_bp = Blueprint('gejala', __name__, url_prefix='/gejala')

@gejala_bp.route('/')
@login_required
def index():
    page = request.args.get('page', 1, type=int)
    per_page = 10
    
    gejala_list = Gejala.query.order_by(Gejala.kode_gejala).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return render_template('gejala/index.html', gejala_list=gejala_list)

@gejala_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    if request.method == 'POST':
        kode_gejala = request.form.get('kode_gejala')
        nama_gejala = request.form.get('nama_gejala')
        pertanyaan = request.form.get('pertanyaan')
        
        if Gejala.query.filter_by(kode_gejala=kode_gejala).first():
            flash('Kode gejala sudah ada!', 'danger')
            return redirect(url_for('gejala.create'))
        
        gejala = Gejala(
            kode_gejala=kode_gejala,
            nama_gejala=nama_gejala,
            pertanyaan=pertanyaan
        )
        db.session.add(gejala)
        db.session.commit()
        
        flash('Gejala berhasil ditambahkan!', 'success')
        return redirect(url_for('gejala.index'))
    
    return render_template('gejala/create.html')

@gejala_bp.route('/edit/<int:id>', methods=['GET', 'POST'])
@login_required
def edit(id):
    gejala = Gejala.query.get_or_404(id)
    
    if request.method == 'POST':
        kode_gejala = request.form.get('kode_gejala')
        nama_gejala = request.form.get('nama_gejala')
        pertanyaan = request.form.get('pertanyaan')
        
        existing = Gejala.query.filter(Gejala.kode_gejala == kode_gejala, Gejala.id != id).first()
        if existing:
            flash('Kode gejala sudah ada!', 'danger')
            return redirect(url_for('gejala.edit', id=id))
        
        gejala.kode_gejala = kode_gejala
        gejala.nama_gejala = nama_gejala
        gejala.pertanyaan = pertanyaan
        db.session.commit()
        
        flash('Gejala berhasil diupdate!', 'success')
        return redirect(url_for('gejala.index'))
    
    return render_template('gejala/edit.html', gejala=gejala)

@gejala_bp.route('/delete/<int:id>', methods=['POST'])
@login_required
def delete(id):
    gejala = Gejala.query.get_or_404(id)
    db.session.delete(gejala)
    db.session.commit()
    
    flash('Gejala berhasil dihapus!', 'success')
    return redirect(url_for('gejala.index'))