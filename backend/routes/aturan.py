from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required
from models.models import db, Aturan, Penyakit, Gejala

aturan_bp = Blueprint('aturan', __name__, url_prefix='/aturan')

@aturan_bp.route('/')
@login_required
def index():
    # Join dengan tabel Gejala untuk mendapatkan nama gejala
    aturan_list = db.session.query(
        Aturan,
        Gejala.nama_gejala
    ).join(
        Gejala, Aturan.kode_gejala == Gejala.kode_gejala
    ).order_by(Aturan.kode_penyakit, Aturan.kode_gejala).all()
    
    return render_template('aturan/index.html', aturan_list=aturan_list)

@aturan_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    if request.method == 'POST':
        kode_penyakit = request.form.get('kode_penyakit')
        kode_gejala = request.form.get('kode_gejala')
        mb = float(request.form.get('mb'))
        md = float(request.form.get('md'))
        cf = mb - md
        
        # Check if rule already exists
        existing = Aturan.query.filter_by(kode_penyakit=kode_penyakit, kode_gejala=kode_gejala).first()
        if existing:
            flash('Aturan untuk kombinasi penyakit dan gejala ini sudah ada!', 'danger')
            return redirect(url_for('aturan.create'))
        
        aturan = Aturan(
            kode_penyakit=kode_penyakit,
            kode_gejala=kode_gejala,
            mb=mb,
            md=md,
            cf=cf
        )
        db.session.add(aturan)
        db.session.commit()
        
        flash('Aturan berhasil ditambahkan!', 'success')
        return redirect(url_for('aturan.index'))
    
    penyakit_list = Penyakit.query.order_by(Penyakit.kode_penyakit).all()
    gejala_list = Gejala.query.order_by(Gejala.kode_gejala).all()
    return render_template('aturan/create.html', penyakit_list=penyakit_list, gejala_list=gejala_list)

@aturan_bp.route('/edit/<int:id>', methods=['GET', 'POST'])
@login_required
def edit(id):
    aturan = Aturan.query.get_or_404(id)
    
    if request.method == 'POST':
        kode_penyakit = request.form.get('kode_penyakit')
        kode_gejala = request.form.get('kode_gejala')
        mb = float(request.form.get('mb'))
        md = float(request.form.get('md'))
        cf = mb - md
        
        # Check if new combination already exists (excluding current)
        existing = Aturan.query.filter(
            Aturan.kode_penyakit == kode_penyakit,
            Aturan.kode_gejala == kode_gejala,
            Aturan.id != id
        ).first()
        if existing:
            flash('Aturan untuk kombinasi penyakit dan gejala ini sudah ada!', 'danger')
            return redirect(url_for('aturan.edit', id=id))
        
        aturan.kode_penyakit = kode_penyakit
        aturan.kode_gejala = kode_gejala
        aturan.mb = mb
        aturan.md = md
        aturan.cf = cf
        db.session.commit()
        
        flash('Aturan berhasil diupdate!', 'success')
        return redirect(url_for('aturan.index'))
    
    penyakit_list = Penyakit.query.order_by(Penyakit.kode_penyakit).all()
    gejala_list = Gejala.query.order_by(Gejala.kode_gejala).all()
    return render_template('aturan/edit.html', aturan=aturan, penyakit_list=penyakit_list, gejala_list=gejala_list)

@aturan_bp.route('/delete/<int:id>')
@login_required
def delete(id):
    aturan = Aturan.query.get_or_404(id)
    db.session.delete(aturan)
    db.session.commit()
    
    flash('Aturan berhasil dihapus!', 'success')
    return redirect(url_for('aturan.index'))