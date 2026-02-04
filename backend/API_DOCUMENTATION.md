# API Documentation - Sistem Pakar Gangguan Kecemasan

API ini mengimplementasikan metode **Certainty Factor** dan **Forward Chaining** untuk diagnosis gangguan kecemasan.

## Base URL
```
http://127.0.0.1:5000/api/konsultasi
```

---

## Endpoints

### 1. Get All Gejala
Mendapatkan semua daftar gejala beserta pertanyaan untuk user.

**Endpoint:** `GET /api/konsultasi/gejala`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "kode": "G01",
      "nama": "Merasa sangat sedih saat berpisah dari rumah atau orang terdekat",
      "pertanyaan": "Apakah Anda merasa sangat sedih saat berpisah dari rumah atau orang terdekat?"
    }
  ],
  "total": 52
}
```

---

### 2. Get All Penyakit
Mendapatkan semua daftar penyakit dan solusinya.

**Endpoint:** `GET /api/konsultasi/penyakit`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "kode": "P01",
      "nama": "Gangguan Kecemasan Perpisahan",
      "solusi": "CBT dan Dukungan Keluarga"
    }
  ],
  "total": 6
}
```

---

### 3. Diagnosa (Forward Chaining + Certainty Factor)
Melakukan diagnosa berdasarkan gejala yang dipilih user.

**Endpoint:** `POST /api/konsultasi/diagnosa`

**Request Body:**
```json
{
  "nama_user": "John Doe",
  "usia": 25,
  "jenis_kelamin": "Laki-laki",
  "gejala": [
    {
      "kode": "G01",
      "kepastian": "sering"
    },
    {
      "kode": "G02",
      "kepastian": "sangat_sering"
    },
    {
      "kode": "G03",
      "kepastian": "sering"
    }
  ]
}
```

**Tingkat Kepastian:**
- `tidak_pernah` = 0.2
- `jarang` = 0.6
- `sering` = 0.8
- `sangat_sering` = 1.0

**Response:**
```json
{
  "success": true,
  "data": {
    "id_riwayat": 1,
    "hasil_diagnosis": {
      "kode_penyakit": "P01",
      "nama_penyakit": "Gangguan Kecemasan Perpisahan",
      "solusi": "CBT dan Dukungan Keluarga",
      "cf_akhir": 0.896,
      "persentase": 89.6,
      "aturan_matched": [
        {
          "kode_gejala": "G01",
          "nama_gejala": "Merasa sangat sedih saat berpisah dari rumah atau orang terdekat",
          "mb": 0.8,
          "md": 0.2,
          "cf_pakar": 0.6,
          "cf_user": 0.8,
          "cf_gejala": 0.48,
          "kepastian": "sering"
        }
      ]
    },
    "alternatif_diagnosis": [
      {
        "kode_penyakit": "P03",
        "nama_penyakit": "Gangguan Kecemasan Sosial",
        "cf_akhir": 0.512,
        "persentase": 51.2
      }
    ],
    "detail_perhitungan": [...]
  },
  "message": "Diagnosa berhasil"
}
```

---

### 4. Get Riwayat by ID
Mendapatkan detail riwayat konsultasi.

**Endpoint:** `GET /api/konsultasi/riwayat/{id}`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nama_user": "John Doe",
    "usia": 25,
    "jenis_kelamin": "Laki-laki",
    "tanggal_konsultasi": "03/12/2024 14:30",
    "hasil_diagnosis": {
      "kode_penyakit": "P01",
      "nama_penyakit": "Gangguan Kecemasan Perpisahan",
      "solusi": "CBT dan Dukungan Keluarga",
      "cf_akhir": 0.896,
      "persentase": 89.6
    },
    "gejala_dipilih": [
      {
        "kode": "G01",
        "nama": "Merasa sangat sedih saat berpisah dari rumah atau orang terdekat",
        "kepastian": "sering"
      }
    ]
  }
}
```

---

## Metode Forward Chaining & Certainty Factor

### Algoritma Forward Chaining

Forward Chaining adalah metode inferensi yang bekerja dari fakta (gejala) menuju kesimpulan (penyakit).

**Langkah-langkah:**
1. User memilih gejala yang dialami beserta tingkat kepastiannya
2. Sistem mengambil semua aturan (rules) dari database
3. Untuk setiap penyakit, sistem mencocokkan gejala user dengan aturan
4. Jika gejala cocok, hitung CF gejala dan kombinasikan
5. Penyakit dengan CF tertinggi adalah hasil diagnosis

### Rumus Certainty Factor

#### 1. CF Dasar
```
CF[H,E] = MB[H,E] - MD[H,E]
```
- MB = Measure of Belief (tingkat keyakinan)
- MD = Measure of Disbelief (tingkat ketidakpercayaan)

#### 2. CF Gejala
```
CF[gejala] = CF[pengguna] × CF[pakar]
```
- CF[pengguna] = Tingkat kepastian yang dipilih user (0.2 - 1.0)
- CF[pakar] = CF dari database (MB - MD)

#### 3. CF Kombinasi
```
CF[kombinasi] = CF[lama] + (CF[gejala] × (1 - CF[lama]))
```
Digunakan untuk menggabungkan CF dari multiple gejala.

### Contoh Perhitungan

**Data:**
- Gejala G01 dipilih dengan kepastian "sering" (0.8)
- MB = 0.8, MD = 0.2, maka CF Pakar = 0.6

**Perhitungan:**
```
CF[gejala1] = CF[user] × CF[pakar]
            = 0.8 × 0.6
            = 0.48
```

Jika ada gejala kedua:
- Gejala G02 dengan kepastian "sangat_sering" (1.0)
- CF Pakar = 0.6

```
CF[gejala2] = 1.0 × 0.6 = 0.6

CF[kombinasi] = CF[gejala1] + (CF[gejala2] × (1 - CF[gejala1]))
              = 0.48 + (0.6 × (1 - 0.48))
              = 0.48 + (0.6 × 0.52)
              = 0.48 + 0.312
              = 0.792 (79.2%)
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Data tidak lengkap"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Tidak dapat mendiagnosis penyakit berdasarkan gejala yang dipilih"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Terjadi kesalahan: ..."
}
```

---

## Contoh Penggunaan dengan JavaScript

### Fetch All Gejala
```javascript
fetch('http://127.0.0.1:5000/api/konsultasi/gejala')
  .then(response => response.json())
  .then(data => {
    console.log(data.data); // Array of gejala
  });
```

### Submit Diagnosis
```javascript
const diagnosis = {
  nama_user: "John Doe",
  usia: 25,
  jenis_kelamin: "Laki-laki",
  gejala: [
    { kode: "G01", kepastian: "sering" },
    { kode: "G02", kepastian: "sangat_sering" }
  ]
};

fetch('http://127.0.0.1:5000/api/konsultasi/diagnosa', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(diagnosis)
})
  .then(response => response.json())
  .then(data => {
    console.log(data.data.hasil_diagnosis);
  });
```

### Using Axios
```javascript
import axios from 'axios';

// Get Gejala
const gejala = await axios.get('/api/konsultasi/gejala');

// Diagnosa
const hasil = await axios.post('/api/konsultasi/diagnosa', {
  nama_user: "John Doe",
  usia: 25,
  jenis_kelamin: "Laki-laki",
  gejala: [
    { kode: "G01", kepastian: "sering" }
  ]
});
```

---

## Testing dengan cURL

### Get Gejala
```bash
curl http://127.0.0.1:5000/api/konsultasi/gejala
```

### Diagnosa
```bash
curl -X POST http://127.0.0.1:5000/api/konsultasi/diagnosa \
  -H "Content-Type: application/json" \
  -d '{
    "nama_user": "John Doe",
    "usia": 25,
    "jenis_kelamin": "Laki-laki",
    "gejala": [
      {"kode": "G01", "kepastian": "sering"},
      {"kode": "G02", "kepastian": "sangat_sering"}
    ]
  }'
```

---

## Notes

1. Semua endpoint API tidak memerlukan autentikasi (untuk frontend public)
2. Endpoint admin (`/gejala`, `/penyakit`, dll) tetap memerlukan login
3. CF final berkisar antara 0.0 - 1.0 (0% - 100%)
4. Sistem akan mengembalikan penyakit dengan CF tertinggi sebagai hasil utama
5. Alternatif diagnosis juga disertakan untuk referensi

---

**Developed with ❤️ using Flask**