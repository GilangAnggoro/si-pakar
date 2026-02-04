# Sistem Pakar Gangguan Kecemasan

Sistem pakar berbasis web untuk mendiagnosis gangguan kecemasan menggunakan metode Certainty Factor.

## Fitur

- **Autentikasi Admin**: Login, Register, dan Lupa Password
- **Dashboard**: Statistik dan diagram distribusi penyakit
- **CRUD Gejala**: Kelola data gejala dengan pertanyaan untuk frontend
- **CRUD Penyakit**: Kelola data penyakit dan solusinya
- **CRUD Aturan**: Kelola aturan dengan nilai MB, MD, dan CF
- **Riwayat Konsultasi**: Melihat histori konsultasi user
- **Riwayat Login Admin**: Tracking aktivitas login admin
- **Profil Admin**: Update profil dan ganti password

## Teknologi

- **Backend**: Flask 3.0.0
- **Database**: SQLite
- **Frontend**: Bootstrap 5.3.0, Chart.js
- **Authentication**: Flask-Login

## Cara Instalasi

### 1. Clone atau Download Project

```bash
cd sistem_pakar
```

### 2. Buat Virtual Environment

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Isi Database dengan Data Awal

```bash
python seed_database.py
```

### 5. Jalankan Aplikasi

```bash
python app.py
```

Aplikasi akan berjalan di `http://127.0.0.1:5000`

## Login Default

- **Username**: admin
- **Password**: admin

## Struktur Database

### Tabel Admin
- id, username, nama_admin, password_hash, created_at

### Tabel Gejala
- id, kode_gejala, nama_gejala, pertanyaan, created_at

### Tabel Penyakit
- id, kode_penyakit, nama_penyakit, solusi, created_at

### Tabel Aturan
- id, kode_penyakit, kode_gejala, mb, md, cf, created_at

### Tabel RiwayatUser
- id, nama_user, usia, jenis_kelamin, kode_penyakit, nilai_cf, gejala_dipilih, tanggal_konsultasi

### Tabel RiwayatLogin
- id, admin_id, waktu_login, ip_address, user_agent

## Metode Certainty Factor

### Rumus Dasar
```
CF[H,E] = MB[H,E] - MD[H,E]
```

### CF Gejala
```
CF[gejala] = CF[pengguna] x CF[pakar]
```

### CF Kombinasi
```
CF[kombinasi] = CF[lama] + CF[gejala] x (1 - CF[lama])
```

### Skala Kepastian Pengguna
- Tidak Pernah: 0.2
- Jarang: 0.6
- Sering: 0.8
- Sangat Sering: 1.0

## Metode Forward Chaining

Forward Chaining adalah metode inferensi yang bekerja dari fakta (gejala yang dialami) menuju kesimpulan (diagnosis penyakit).

**Algoritma:**
1. User memilih gejala beserta tingkat kepastiannya
2. Sistem mengambil semua aturan (rules) dari database
3. Untuk setiap penyakit, cocokkan gejala user dengan aturan
4. Hitung CF untuk setiap gejala yang cocok
5. Kombinasikan semua CF gejala menjadi CF penyakit
6. Penyakit dengan CF tertinggi adalah hasil diagnosis

## API Endpoints

Backend menyediakan RESTful API untuk konsultasi:

### 1. Get Gejala
```
GET /api/konsultasi/gejala
```
Mendapatkan semua gejala beserta pertanyaan.

### 2. Diagnosa
```
POST /api/konsultasi/diagnosa
```
Melakukan diagnosa dengan Forward Chaining & CF.

**Request Body:**
```json
{
  "nama_user": "John Doe",
  "usia": 25,
  "jenis_kelamin": "Laki-laki",
  "gejala": [
    {"kode": "G01", "kepastian": "sering"},
    {"kode": "G02", "kepastian": "sangat_sering"}
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hasil_diagnosis": {
      "kode_penyakit": "P01",
      "nama_penyakit": "Gangguan Kecemasan Perpisahan",
      "solusi": "CBT dan Dukungan Keluarga",
      "cf_akhir": 0.896,
      "persentase": 89.6
    }
  }
}
```

### 3. Get Penyakit
```
GET /api/konsultasi/penyakit
```
Mendapatkan semua penyakit dan solusi.

### 4. Get Riwayat
```
GET /api/konsultasi/riwayat/{id}
```
Mendapatkan detail riwayat konsultasi.

**Dokumentasi lengkap:** Lihat file `API_DOCUMENTATION.md`

**Test API:** Buka file `test_api.html` di browser

## Jenis Penyakit

1. **P01**: Gangguan Kecemasan Perpisahan
2. **P02**: Mutisme Selektif
3. **P03**: Gangguan Kecemasan Sosial
4. **P04**: Gangguan Panik
5. **P05**: Agoraphobia
6. **P06**: Gangguan Kecemasan Umum

## Pengembangan Frontend

Data gejala sudah dilengkapi dengan field `pertanyaan` yang dapat digunakan untuk:
- Menampilkan pertanyaan kepada user saat konsultasi
- Format pertanyaan: "Apakah Anda mengalami..."
- User memilih tingkat kepastian untuk setiap gejala

### Contoh Implementasi Frontend
1. Ambil semua gejala dari endpoint API
2. Tampilkan pertanyaan satu per satu
3. User memilih: Tidak Pernah, Jarang, Sering, Sangat Sering
4. Kirim data ke backend untuk perhitungan CF
5. Tampilkan hasil diagnosis dan solusi

## Catatan

- Pastikan Python 3.8+ terinstall
- Database SQLite akan dibuat otomatis di folder `instance/`
- Gunakan `seed_database.py` untuk reset database ke data awal
- Semua password di-hash menggunakan Werkzeug Security

## Troubleshooting

### Error: ModuleNotFoundError
```bash
pip install -r requirements.txt
```

### Error: No module named 'models' atau 'routes'
Pastikan file `__init__.py` ada di folder `models/` dan `routes/`

### Database tidak terbuat
Jalankan:
```bash
python
>>> from app import create_app
>>> app = create_app()
>>> with app.app_context():
...     from models.models import db
...     db.create_all()
```

## Lisensi

MIT License - Bebas digunakan untuk keperluan pendidikan dan pengembangan.

---
**Developed with ❤️ using Flask**