from flask import Blueprint, render_template, request, redirect, url_for, flash
from flask_login import login_required
from models.models import db, Penyakit

penyakit_bp = Blueprint('penyakit', __name__, url_prefix='/penyakit')

@penyakit_bp.route('/')
@login_required
def index():
    page = request.args.get('page', 1, type=int)
    per_page = 10
    
    penyakit_list = Penyakit.query.order_by(Penyakit.kode_penyakit).paginate(
        page=page, per_page=per_page, error_out=False
    )
    
    return render_template('penyakit/index.html', penyakit_list=penyakit_list)

@penyakit_bp.route('/create', methods=['GET', 'POST'])
@login_required
def create():
    if request.method == 'POST':
        kode_penyakit = request.form.get('kode_penyakit')
        nama_penyakit = request.form.get('nama_penyakit')
        solusi = request.form.get('solusi')
        
        if Penyakit.query.filter_by(kode_penyakit=kode_penyakit).first():
            flash('Kode penyakit sudah ada!', 'danger')
            return redirect(url_for('penyakit.create'))
        
        penyakit = Penyakit(
            kode_penyakit=kode_penyakit,
            nama_penyakit=nama_penyakit,
            solusi=solusi
        )
        db.session.add(penyakit)
        db.session.commit()
        
        flash('Penyakit berhasil ditambahkan!', 'success')
        return redirect(url_for('penyakit.index'))
    
    return render_template('penyakit/create.html')

@penyakit_bp.route('/edit/<int:id>', methods=['GET', 'POST'])
@login_required
def edit(id):
    penyakit = Penyakit.query.get_or_404(id)
    
    if request.method == 'POST':
        kode_penyakit = request.form.get('kode_penyakit')
        nama_penyakit = request.form.get('nama_penyakit')
        solusi = request.form.get('solusi')
        
        existing = Penyakit.query.filter(Penyakit.kode_penyakit == kode_penyakit, Penyakit.id != id).first()
        if existing:
            flash('Kode penyakit sudah ada!', 'danger')
            return redirect(url_for('penyakit.edit', id=id))
        
        penyakit.kode_penyakit = kode_penyakit
        penyakit.nama_penyakit = nama_penyakit
        penyakit.solusi = solusi
        db.session.commit()
        
        flash('Penyakit berhasil diupdate!', 'success')
        return redirect(url_for('penyakit.index'))
    
    return render_template('penyakit/edit.html', penyakit=penyakit)

@penyakit_bp.route('/delete/<int:id>', methods=['POST'])
@login_required
def delete(id):
    penyakit = Penyakit.query.get_or_404(id)
    db.session.delete(penyakit)
    db.session.commit()
    
    flash('Penyakit berhasil dihapus!', 'success')
    return redirect(url_for('penyakit.index'))