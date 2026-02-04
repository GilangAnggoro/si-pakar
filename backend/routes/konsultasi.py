from flask import Blueprint, request, jsonify
from models.models import db, RiwayatUser, Gejala, Penyakit, Aturan
from datetime import datetime
import json

konsultasi_bp = Blueprint('konsultasi', __name__, url_prefix='/api/konsultasi')

# Fungsi CF
def hitung_cf(cf_pakar, cf_user):
    """Hitung CF = CF Pakar × CF User"""
    return cf_pakar * cf_user

def kombinasi_cf(cf1, cf2):
    """Kombinasi CF = CF1 + CF2 × (1 - CF1)"""
    return cf1 + cf2 * (1 - cf1)

# Mapping kepastian user ke nilai CF
KEPASTIAN_MAP = {
    'tidak_pernah': 0.0,
    'jarang': 0.4,
    'sering': 0.8,
    'sangat_sering': 1.0
}

@konsultasi_bp.route('/gejala', methods=['GET'])
def get_gejala():
    """Get semua gejala untuk konsultasi"""
    try:
        gejala_list = Gejala.query.all()
        result = []
        
        for gejala in gejala_list:
            result.append({
                'id': gejala.id,
                'kode': gejala.kode_gejala,
                'pertanyaan': gejala.pertanyaan
            })
        
        return jsonify({
            'success': True,
            'data': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@konsultasi_bp.route('/diagnosa', methods=['POST'])
def diagnosa():
    """Proses diagnosa menggunakan Forward Chaining + Certainty Factor"""
    try:
        data = request.get_json()
        
        # Ambil data dari request (TANPA semester, prodi, fakultas)
        nama_user = data.get('nama_user')
        usia = data.get('usia')
        jenis_kelamin = data.get('jenis_kelamin')
        email = data.get('email')
        gejala_input = data.get('gejala', [])
        
        # Validasi
        if not gejala_input:
            return jsonify({
                'success': False,
                'message': 'Gejala tidak boleh kosong'
            }), 400
        
        # Cek apakah semua jawaban "tidak_pernah"
        all_tidak_pernah = all(g['kepastian'] == 'tidak_pernah' for g in gejala_input)
        
        if all_tidak_pernah:
            return jsonify({
                'success': False,
                'no_diagnosis': True,
                'message': 'Tidak ada diagnosis',
                'detail': 'Berdasarkan gejala yang Anda alami, tidak ditemukan indikasi gangguan kecemasan yang signifikan.'
            })
        
        # Filter gejala yang bukan "tidak_pernah"
        gejala_aktif = [g for g in gejala_input if g['kepastian'] != 'tidak_pernah']
        
        # Get kode gejala yang dipilih
        kode_gejala_dipilih = [g['kode'] for g in gejala_aktif]
        
        # Query aturan yang cocok dengan gejala
        aturan_list = Aturan.query.filter(
            Aturan.kode_gejala.in_(kode_gejala_dipilih)
        ).all()
        
        if not aturan_list:
            return jsonify({
                'success': False,
                'no_diagnosis': True,
                'message': 'Tidak ada diagnosis yang cocok',
                'detail': 'Gejala yang Anda pilih tidak mengarah ke diagnosis tertentu.'
            })
        
        # Hitung CF per penyakit
        penyakit_cf = {}
        detail_perhitungan = []
        
        for aturan in aturan_list:
            kode_penyakit = aturan.kode_penyakit
            kode_gejala = aturan.kode_gejala
            cf_pakar = aturan.cf
            
            # Cari CF user dari input
            cf_user = 0
            kepastian = 'tidak_pernah'
            for g in gejala_aktif:
                if g['kode'] == kode_gejala:
                    kepastian = g['kepastian']
                    cf_user = KEPASTIAN_MAP.get(kepastian, 0)
                    break
            
            # Hitung CF gejala
            cf_gejala = hitung_cf(cf_pakar, cf_user)
            
            # Simpan detail
            gejala_obj = Gejala.query.filter_by(kode_gejala=kode_gejala).first()
            detail_perhitungan.append({
                'kode_gejala': kode_gejala,
                'nama_gejala': gejala_obj.pertanyaan if gejala_obj else kode_gejala,
                'kepastian': kepastian,
                'cf_pakar': cf_pakar,
                'cf_user': cf_user,
                'cf_gejala': cf_gejala
            })
            
            # Kombinasi CF untuk penyakit
            if kode_penyakit not in penyakit_cf:
                penyakit_cf[kode_penyakit] = cf_gejala
            else:
                penyakit_cf[kode_penyakit] = kombinasi_cf(
                    penyakit_cf[kode_penyakit], 
                    cf_gejala
                )
        
        if not penyakit_cf:
            return jsonify({
                'success': False,
                'no_diagnosis': True,
                'message': 'Tidak ada diagnosis',
                'detail': 'Tidak ditemukan penyakit yang cocok dengan gejala yang Anda pilih.'
            })
        
        # Urutkan berdasarkan CF tertinggi
        sorted_penyakit = sorted(penyakit_cf.items(), key=lambda x: x[1], reverse=True)
        
        # Penyakit utama
        kode_penyakit_utama = sorted_penyakit[0][0]
        cf_utama = sorted_penyakit[0][1]
        
        penyakit_utama = Penyakit.query.filter_by(kode_penyakit=kode_penyakit_utama).first()
        
        # Alternatif diagnosis (PERBAIKAN: Tambahkan solusi)
        alternatif = []
        for kode, cf in sorted_penyakit[1:4]:  # Ambil 3 alternatif
            penyakit = Penyakit.query.filter_by(kode_penyakit=kode).first()
            if penyakit:
                alternatif.append({
                    'kode_penyakit': kode,
                    'nama_penyakit': penyakit.nama_penyakit,
                    'persentase': round(cf * 100, 2),
                    'nilai_cf': cf,  # Tambahkan nilai_cf
                    'solusi': penyakit.solusi  # Tambahkan solusi
                })
        
        # Simpan ke riwayat (PERBAIKAN: Tambahkan alternatif_diagnosis)
        gejala_dipilih_json = json.dumps([
            {
                'kode': g['kode'],
                'nama': next((gej.pertanyaan for gej in Gejala.query.filter_by(kode_gejala=g['kode']).all()), g['kode']),
                'kepastian': g['kepastian']
            }
            for g in gejala_aktif
        ])
        
        # PERBAIKAN: Simpan alternatif_diagnosis sebagai JSON string
        alternatif_diagnosis_json = json.dumps(alternatif)
        
        riwayat = RiwayatUser(
            nama_user=nama_user,
            usia=usia,
            jenis_kelamin=jenis_kelamin,
            email=email,
            kode_penyakit=kode_penyakit_utama,
            nilai_cf=cf_utama,
            gejala_dipilih=gejala_dipilih_json,
            alternatif_diagnosis=alternatif_diagnosis_json  # TAMBAHKAN INI
        )
        
        db.session.add(riwayat)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'data': {
                'hasil_diagnosis': {
                    'kode_penyakit': kode_penyakit_utama,
                    'nama_penyakit': penyakit_utama.nama_penyakit,
                    'persentase': round(cf_utama * 100, 2),
                    'solusi': penyakit_utama.solusi
                },
                'alternatif_diagnosis': alternatif,
                'detail_perhitungan': detail_perhitungan
            }
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@konsultasi_bp.route('/riwayat/<int:id>', methods=['GET'])
def get_riwayat(id):
    """Get riwayat by ID"""
    try:
        riwayat = RiwayatUser.query.get(id)
        
        if not riwayat:
            return jsonify({
                'success': False,
                'message': 'Riwayat tidak ditemukan'
            }), 404
        
        penyakit = Penyakit.query.filter_by(kode_penyakit=riwayat.kode_penyakit).first()
        
        # PERBAIKAN: Parse alternatif_diagnosis dari JSON string
        alternatif_diagnosis = []
        if hasattr(riwayat, 'alternatif_diagnosis') and riwayat.alternatif_diagnosis:
            try:
                alternatif_diagnosis = json.loads(riwayat.alternatif_diagnosis)
            except:
                alternatif_diagnosis = []
        
        return jsonify({
            'success': True,
            'data': {
                'id': riwayat.id,
                'nama_user': riwayat.nama_user,
                'usia': riwayat.usia,
                'jenis_kelamin': riwayat.jenis_kelamin,
                'kode_penyakit': riwayat.kode_penyakit,
                'nilai_cf': riwayat.nilai_cf,
                'tanggal_konsultasi': riwayat.tanggal_konsultasi.isoformat(),
                'gejala_dipilih': riwayat.gejala_dipilih,
                'penyakit': {
                    'nama_penyakit': penyakit.nama_penyakit if penyakit else None,
                    'solusi': penyakit.solusi if penyakit else None
                },
                'alternatif_diagnosis': alternatif_diagnosis  # TAMBAHKAN INI
            }
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@konsultasi_bp.route('/riwayat-user/<email>', methods=['GET'])
def get_all_riwayat_user(email):
    """Get semua riwayat berdasarkan email user (PERBAIKAN: Tambahkan alternatif_diagnosis)"""
    try:
        riwayat_list = RiwayatUser.query.filter_by(email=email).order_by(
            RiwayatUser.tanggal_konsultasi.desc()
        ).all()
        
        result = []
        for riwayat in riwayat_list:
            penyakit = Penyakit.query.filter_by(kode_penyakit=riwayat.kode_penyakit).first()
            
            # PERBAIKAN: Parse alternatif_diagnosis dari JSON string
            alternatif_diagnosis = []
            if hasattr(riwayat, 'alternatif_diagnosis') and riwayat.alternatif_diagnosis:
                try:
                    alternatif_diagnosis = json.loads(riwayat.alternatif_diagnosis)
                except:
                    alternatif_diagnosis = []
            
            result.append({
                'id': riwayat.id,
                'nama_user': riwayat.nama_user,
                'usia': riwayat.usia,
                'jenis_kelamin': riwayat.jenis_kelamin,
                'kode_penyakit': riwayat.kode_penyakit,
                'nilai_cf': riwayat.nilai_cf,
                'tanggal_konsultasi': riwayat.tanggal_konsultasi.isoformat(),
                'gejala_dipilih': riwayat.gejala_dipilih,
                'penyakit': {
                    'nama_penyakit': penyakit.nama_penyakit if penyakit else None,
                    'solusi': penyakit.solusi if penyakit else None
                },
                'alternatif_diagnosis': alternatif_diagnosis  # TAMBAHKAN INI
            })
        
        return jsonify({
            'success': True,
            'data': result
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@konsultasi_bp.route('/riwayat/<int:id>', methods=['DELETE'])
def delete_riwayat(id):
    """Hapus riwayat berdasarkan ID"""
    try:
        riwayat = RiwayatUser.query.get(id)
        
        if not riwayat:
            return jsonify({
                'success': False,
                'message': 'Riwayat tidak ditemukan'
            }), 404
        
        db.session.delete(riwayat)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Riwayat berhasil dihapus'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500

@konsultasi_bp.route('/riwayat-user/<email>', methods=['DELETE'])
def delete_all_riwayat_user(email):
    """Hapus semua riwayat berdasarkan email user"""
    try:
        # Hapus semua riwayat dengan email tersebut
        deleted_count = RiwayatUser.query.filter_by(email=email).delete()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': f'{deleted_count} riwayat berhasil dihapus'
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({
            'success': False,
            'message': f'Error: {str(e)}'
        }), 500