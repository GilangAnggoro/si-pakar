"""
Script untuk mengisi database dengan data awal
Jalankan: python seed_database.py
"""
from app import create_app
from models.models import db, Penyakit, Gejala, Aturan

app = create_app()

# Data Penyakit
penyakit_data =  [
{
        'kode': 'P01',
        'nama': 'Gangguan Kecemasan Perpisahan',
        'solusi': (
            "CBT: Identifikasi pikiran berlebihan tentang bahaya saat berpisah, "
            "restrukturisasi kognitif untuk mengganti pikiran irasional dengan pikiran realistis, "
            "exposure bertahap terhadap perpisahan (durasi pendek → lebih lama), "
            "dan latihan relaksasi untuk menurunkan gejala fisik cemas. "
            "Dukungan Keluarga: Komunikasi menenangkan dan memberikan rasa aman, "
            "tidak overprotective, membiarkan anak belajar berpisah secara perlahan, "
            "mendampingi latihan exposure sesuai arahan terapis, dan memberikan pujian setiap ada kemajuan."
        )
    },
    {
        'kode': 'P02',
        'nama': 'Mutisme Selektif',
        'solusi': (
            "CBT: Mengurangi kecemasan berbicara dengan latihan bertahap (stimulus fading), "
            "shaping komunikasi mulai dari bisikan → kata pendek → kalimat, "
            "restrukturisasi pikiran negatif seperti takut dihakimi saat berbicara, "
            "dan latihan relaksasi untuk menurunkan ketegangan. "
            "Dukungan Keluarga: Tidak memaksa berbicara, memberi ruang untuk komunikasi non-verbal, "
            "kolaborasi dengan sekolah agar memberi lingkungan aman, "
            "memberikan pujian dan reinforcement positif, serta menciptakan suasana tenang saat latihan berbicara."
        )
    },
    {
        'kode': 'P03',
        'nama': 'Gangguan Kecemasan Sosial',
        'solusi': (
            "CBT: Mengidentifikasi pikiran negatif tentang dinilai orang lain, "
            "restrukturisasi kognitif untuk mengganti pikiran salah seperti ‘semua orang memperhatikan saya’, "
            "exposure sosial bertahap (menyapa, berdiskusi, presentasi kecil), "
            "dan pelatihan keterampilan sosial seperti kontak mata dan komunikasi dasar. "
            "Pendekatan Tambahan: Teknik relaksasi untuk gejala fisik, mindfulness untuk fokus saat berinteraksi, "
            "serta dukungan lingkungan agar tidak mengkritik atau mempermalukan pasien."
        )
    },
    {
        'kode': 'P04',
        'nama': 'Gangguan Panik',
        'solusi': (
            "CBT: Edukasi tentang panik agar pasien memahami bahwa gejala tidak berbahaya, "
            "identifikasi dan koreksi pikiran salah tafsir (misalnya ‘jantung berdebar berarti mau mati’), "
            "exposure interoseptif untuk menghadapi sensasi tubuh yang ditakuti, "
            "serta teknik grounding & pernapasan lambat untuk mengurangi intensitas serangan. "
            "Pendekatan Tambahan: Pencatatan pemicu serangan untuk mengetahui pola, "
            "latihan relaksasi rutin untuk menurunkan sensitivitas stres, "
            "dan obat SSRI bila gejala berat sesuai rekomendasi profesional."
        )
    },
    {
        'kode': 'P05',
        'nama': 'Agorafobia',
        'solusi': (
            "CBT: Mengidentifikasi keyakinan salah tentang bahaya tempat umum, "
            "exposure bertahap ke lokasi yang ditakuti dari dekat rumah hingga tempat ramai, "
            "restrukturisasi pikiran seperti ‘saya tidak bisa kabur’ menjadi ‘situasi ini aman’, "
            "dan manajemen kecemasan melalui teknik pernapasan dan relaksasi. "
            "Dukungan Tambahan: Pendampingan awal keluarga saat exposure, "
            "menghindari penghindaran total, serta SSRI bila diperlukan pada kasus berat."
        )
    },
    {
        'kode': 'P06',
        'nama': 'Gangguan Kecemasan Umum',
        'solusi': (
            "CBT: Mengidentifikasi pola kekhawatiran berlebihan yang berlangsung lama, "
            "restrukturisasi kognitif untuk mengganti pikiran irasional, "
            "problem-solving terstruktur untuk mengatasi kecemasan pada masalah nyata, "
            "serta teknik relaksasi & mindfulness untuk menurunkan ketegangan fisik. "
            "Pendekatan Tambahan: Menetapkan ‘worry time’ untuk melatih kontrol kekhawatiran, "
            "mengatur pola tidur dan gaya hidup, serta SSRI bila gejala sangat mengganggu."
        )
    },
]


# Data Gejala
gejala_data = [
    {'kode': 'G01', 'nama': 'Merasa sangat sedih saat berpisah dari rumah atau orang terdekat', 'pertanyaan': 'Apakah Anda merasa sangat sedih saat berpisah dari rumah atau orang terdekat?'},
    {'kode': 'G02', 'nama': 'Sering khawatir berlebihan terhadap keselamatan orang terdekat', 'pertanyaan': 'Apakah Anda sering khawatir berlebihan terhadap keselamatan orang terdekat?'},
    {'kode': 'G03', 'nama': 'Takut berlebihan jika hal buruk terjadi seperti tersesat, diculik, dan sakit', 'pertanyaan': 'Apakah Anda takut berlebihan jika hal buruk terjadi seperti tersesat, diculik, dan sakit?'},
    {'kode': 'G04', 'nama': 'Menolak pergi dari rumah ke sekolah, kerja, tempat lain karena takut berpisah', 'pertanyaan': 'Apakah Anda menolak pergi dari rumah ke sekolah, kerja, atau tempat lain karena takut berpisah?'},
    {'kode': 'G05', 'nama': 'Merasa takut jika sendirian di rumah atau tempat lain', 'pertanyaan': 'Apakah Anda merasa takut jika sendirian di rumah atau tempat lain?'},
    {'kode': 'G06', 'nama': 'Sulit tidur jika jauh dari rumah', 'pertanyaan': 'Apakah Anda sulit tidur jika jauh dari rumah?'},
    {'kode': 'G07', 'nama': 'Sering mengalami mimpi buruk tentang perpisahan', 'pertanyaan': 'Apakah Anda sering mengalami mimpi buruk tentang perpisahan?'},
    {'kode': 'G08', 'nama': 'Mengeluh sakit fisik berulang seperti sakit kepala, mual, muntah saat berpisah', 'pertanyaan': 'Apakah Anda mengeluh sakit fisik berulang seperti sakit kepala, mual, muntah saat berpisah?'},
    {'kode': 'G09', 'nama': 'Mengalami kesulitan berbicara di depan banyak orang', 'pertanyaan': 'Apakah Anda mengalami kesulitan berbicara di depan banyak orang?'},
    {'kode': 'G10', 'nama': 'Susah berkomunikasi dengan orang lain', 'pertanyaan': 'Apakah Anda susah berkomunikasi dengan orang lain?'},
    {'kode': 'G11', 'nama': 'Gejala berlangsung lebih dari 1 bulan, bukan hanya di lingkungan baru', 'pertanyaan': 'Apakah gejala ini berlangsung lebih dari 1 bulan, bukan hanya di lingkungan baru?'},
    {'kode': 'G12', 'nama': 'Kesulitan berbicara tidak disebabkan keterbatasan bahasa atau pengetahuan', 'pertanyaan': 'Apakah kesulitan berbicara Anda tidak disebabkan keterbatasan bahasa atau pengetahuan?'},
    {'kode': 'G13', 'nama': 'Kesulitan berbicara tidak dapat dijelaskan dengan gangguan lain seperti gagap', 'pertanyaan': 'Apakah kesulitan berbicara Anda tidak dapat dijelaskan dengan gangguan lain seperti gagap?'},
    {'kode': 'G14', 'nama': 'Mengalami ketakutan saat diamati orang lain', 'pertanyaan': 'Apakah Anda mengalami ketakutan saat diamati orang lain?'},
    {'kode': 'G15', 'nama': 'Merasa takut menunjukkan gejala cemas di depan orang lain', 'pertanyaan': 'Apakah Anda merasa takut menunjukkan gejala cemas di depan orang lain?'},
    {'kode': 'G16', 'nama': 'Takut dengan lingkungan sosial tertentu', 'pertanyaan': 'Apakah Anda takut dengan lingkungan sosial tertentu?'},
    {'kode': 'G17', 'nama': 'Menghindari lingkungan sosial dengan ketakutan yang tinggi', 'pertanyaan': 'Apakah Anda menghindari lingkungan sosial dengan ketakutan yang tinggi?'},
    {'kode': 'G18', 'nama': 'Gejala berlangsung minimal 6 bulan', 'pertanyaan': 'Apakah gejala ini berlangsung minimal 6 bulan?'},
    {'kode': 'G19', 'nama': 'Menyebabkan gangguan signifikan dalam kehidupan sosial', 'pertanyaan': 'Apakah gejala ini menyebabkan gangguan signifikan dalam kehidupan sosial Anda?'},
    {'kode': 'G20', 'nama': 'Bukan akibat dari penyalahgunaan obat', 'pertanyaan': 'Apakah gejala ini bukan akibat dari penyalahgunaan obat?'},
    {'kode': 'G21', 'nama': 'Mengalami ketakutan berlebih terkait kondisi fisik seperti cacat, luka, obesitas', 'pertanyaan': 'Apakah Anda mengalami ketakutan berlebih terkait kondisi fisik seperti cacat, luka, atau obesitas?'},
    {'kode': 'G22', 'nama': 'Jantung berdebar cepat', 'pertanyaan': 'Apakah Anda merasakan jantung berdebar cepat?'},
    {'kode': 'G23', 'nama': 'Berkeringat berlebihan', 'pertanyaan': 'Apakah Anda berkeringat berlebihan?'},
    {'kode': 'G24', 'nama': 'Tubuh dan tangan gemetar', 'pertanyaan': 'Apakah tubuh dan tangan Anda gemetar?'},
    {'kode': 'G25', 'nama': 'Sulit bernapas', 'pertanyaan': 'Apakah Anda sulit bernapas?'},
    {'kode': 'G26', 'nama': 'Perasaan seperti tercekik', 'pertanyaan': 'Apakah Anda merasakan perasaan seperti tercekik?'},
    {'kode': 'G27', 'nama': 'Nyeri atau tidak nyaman di dada', 'pertanyaan': 'Apakah Anda merasakan nyeri atau tidak nyaman di dada?'},
    {'kode': 'G28', 'nama': 'Mual atau gangguan perut', 'pertanyaan': 'Apakah Anda mengalami mual atau gangguan perut?'},
    {'kode': 'G29', 'nama': 'Pusing, goyah, dan pingsan', 'pertanyaan': 'Apakah Anda merasa pusing, goyah, atau seperti akan pingsan?'},
    {'kode': 'G30', 'nama': 'Menggigil atau merasa sangat panas', 'pertanyaan': 'Apakah Anda menggigil atau merasa sangat panas?'},
    {'kode': 'G31', 'nama': 'Mati rasa atau kesemutan', 'pertanyaan': 'Apakah Anda merasakan mati rasa atau kesemutan?'},
    {'kode': 'G32', 'nama': 'Merasa tidak nyata atau terlepas dari diri sendiri', 'pertanyaan': 'Apakah Anda merasa tidak nyata atau terlepas dari diri sendiri?'},
    {'kode': 'G33', 'nama': 'Takut kehilangan kendali', 'pertanyaan': 'Apakah Anda takut kehilangan kendali?'},
    {'kode': 'G34', 'nama': 'Takut akan mati', 'pertanyaan': 'Apakah Anda takut akan mati?'},
    {'kode': 'G35', 'nama': 'Mengalami rasa takut berlebih saat berada di tempat umum', 'pertanyaan': 'Apakah Anda mengalami rasa takut berlebih saat berada di tempat umum?'},
    {'kode': 'G36', 'nama': 'Khawatir dan panik jika tidak ada yang menolong dalam kondisi tertentu', 'pertanyaan': 'Apakah Anda khawatir dan panik jika tidak ada yang menolong dalam kondisi tertentu?'},
    {'kode': 'G37', 'nama': 'Mengalami gangguan berulang saat menghadapi situasi yang membuat takut', 'pertanyaan': 'Apakah Anda mengalami gangguan berulang saat menghadapi situasi yang membuat takut?'},
    {'kode': 'G38', 'nama': 'Menghindari kondisi yang membuat khawatir atau cemas', 'pertanyaan': 'Apakah Anda menghindari kondisi yang membuat khawatir atau cemas?'},
    {'kode': 'G39', 'nama': 'Rasa takut lebih besar daripada bahaya sebenarnya', 'pertanyaan': 'Apakah rasa takut Anda lebih besar daripada bahaya sebenarnya?'},
    {'kode': 'G40', 'nama': 'Gejala berlangsung lebih dari 6 bulan', 'pertanyaan': 'Apakah gejala ini berlangsung lebih dari 6 bulan?'},
    {'kode': 'G41', 'nama': 'Gejala mengganggu aktivitas & hubungan sosial', 'pertanyaan': 'Apakah gejala ini mengganggu aktivitas dan hubungan sosial Anda?'},
    {'kode': 'G42', 'nama': 'Cemas berlebihan hampir setiap hari selama lebih dari 6 bulan', 'pertanyaan': 'Apakah Anda cemas berlebihan hampir setiap hari selama lebih dari 6 bulan?'},
    {'kode': 'G43', 'nama': 'Sulit mengendalikan rasa cemas', 'pertanyaan': 'Apakah Anda sulit mengendalikan rasa cemas?'},
    {'kode': 'G44', 'nama': 'Gelisah atau tegang', 'pertanyaan': 'Apakah Anda merasa gelisah atau tegang?'},
    {'kode': 'G45', 'nama': 'Mudah lelah', 'pertanyaan': 'Apakah Anda mudah lelah?'},
    {'kode': 'G46', 'nama': 'Sulit konsentrasi atau pikiran kosong', 'pertanyaan': 'Apakah Anda sulit konsentrasi atau merasa pikiran kosong?'},
    {'kode': 'G47', 'nama': 'Mudah marah atau tersinggung', 'pertanyaan': 'Apakah Anda mudah marah atau tersinggung?'},
    {'kode': 'G48', 'nama': 'Otot tegang', 'pertanyaan': 'Apakah otot Anda tegang?'},
    {'kode': 'G49', 'nama': 'Gangguan tidur', 'pertanyaan': 'Apakah Anda mengalami gangguan tidur?'},
    {'kode': 'G50', 'nama': 'Gejala mengganggu aktivitas sehari-hari', 'pertanyaan': 'Apakah gejala ini mengganggu aktivitas sehari-hari Anda?'},
    
]

# Data Aturan (MB, MD, CF)
aturan_data = [
    # P01 - Gangguan Kecemasan Perpisahan
    ('P01', 'G01', 0.8, 0.2, 0.6),
    ('P01', 'G02', 0.8, 0.2, 0.6),
    ('P01', 'G03', 0.8, 0.2, 0.6),
    ('P01', 'G04', 0.6, 0.0, 0.6),
    ('P01', 'G05', 0.6, 0.0, 0.6),
    ('P01', 'G06', 0.4, 0.0, 0.4),
    ('P01', 'G07', 0.4, 0.0, 0.4),
    ('P01', 'G08', 0.4, 0.0, 0.4),
    
    # P02 - Mutisme Selektif
    ('P02', 'G09', 0.8, 0.2, 0.6),
    ('P02', 'G10', 0.6, 0.0, 0.6),
    ('P02', 'G11', 0.8, 0.2, 0.6),
    ('P02', 'G12', 0.8, 0.2, 0.6),
    ('P02', 'G13', 0.8, 0.2, 0.6),
    
    # P03 - Gangguan Kecemasan Sosial
    ('P03', 'G14', 0.8, 0.2, 0.6),
    ('P03', 'G15', 0.6, 0.0, 0.6),
    ('P03', 'G16', 0.8, 0.2, 0.6),
    ('P03', 'G17', 0.6, 0.0, 0.6),
    ('P03', 'G18', 0.8, 0.2, 0.6),
    ('P03', 'G19', 0.8, 0.2, 0.6),
    ('P03', 'G20', 0.8, 0.2, 0.6),
    ('P03', 'G21', 0.4, 0.0, 0.4),
    
    # P04 - Gangguan Panik
    ('P04', 'G22', 0.8, 0.2, 0.6),
    ('P04', 'G23', 0.4, 0.0, 0.4),
    ('P04', 'G24', 0.6, 0.0, 0.6),
    ('P04', 'G25', 0.8, 0.2, 0.6),
    ('P04', 'G26', 0.4, 0.0, 0.4),
    ('P04', 'G27', 0.8, 0.0, 0.8),
    ('P04', 'G28', 0.4, 0.0, 0.4),
    ('P04', 'G29', 0.4, 0.0, 0.4),
    ('P04', 'G30', 0.4, 0.0, 0.4),
    ('P04', 'G31', 0.6, 0.0, 0.6),
    ('P04', 'G32', 0.4, 0.0, 0.4),
    ('P04', 'G33', 0.8, 0.2, 0.6),
    ('P04', 'G34', 0.8, 0.2, 0.6),
    
    # P05 - Agoraphobia
    ('P05', 'G35', 0.8, 0.0, 0.8),
    ('P05', 'G36', 0.8, 0.0, 0.8),
    ('P05', 'G37', 0.6, 0.0, 0.6),
    ('P05', 'G38', 0.6, 0.0, 0.6),
    ('P05', 'G39', 0.8, 0.2, 0.6),
    ('P05', 'G40', 0.8, 0.2, 0.6),
    ('P05', 'G41', 0.8, 0.2, 0.6),
    
    # P06 - Gangguan Kecemasan Umum
    ('P06', 'G42', 0.8, 0.2, 0.6),
    ('P06', 'G43', 0.8, 0.2, 0.6),
    ('P06', 'G44', 0.6, 0.0, 0.6),
    ('P06', 'G45', 0.4, 0.0, 0.4),
    ('P06', 'G46', 0.6, 0.0, 0.6),
    ('P06', 'G47', 0.4, 0.0, 0.4),
    ('P06', 'G48', 0.6, 0.0, 0.6),
    ('P06', 'G49', 0.8, 0.0, 0.8),
    ('P06', 'G50', 0.8, 0.2, 0.6),
  
]

def seed_data():
    with app.app_context():
        print("Mengisi database dengan data awal...")
        
        # Clear existing data
        print("Menghapus data lama...")
        Aturan.query.delete()
        Gejala.query.delete()
        Penyakit.query.delete()
        
        # Insert Penyakit
        print("Menambahkan data penyakit...")
        for p in penyakit_data:
            penyakit = Penyakit(
                kode_penyakit=p['kode'],
                nama_penyakit=p['nama'],
                solusi=p['solusi']
            )
            db.session.add(penyakit)
        
        # Insert Gejala
        print("Menambahkan data gejala...")
        for g in gejala_data:
            gejala = Gejala(
                kode_gejala=g['kode'],
                nama_gejala=g['nama'],
                pertanyaan=g['pertanyaan']
            )
            db.session.add(gejala)
        
        db.session.commit()
        
        # Insert Aturan
        print("Menambahkan data aturan...")
        for a in aturan_data:
            aturan = Aturan(
                kode_penyakit=a[0],
                kode_gejala=a[1],
                mb=a[2],
                md=a[3],
                cf=a[4]
            )
            db.session.add(aturan)
        
        db.session.commit()
        
        print("✓ Database berhasil diisi!")
        print(f"Total Penyakit: {Penyakit.query.count()}")
        print(f"Total Gejala: {Gejala.query.count()}")
        print(f"Total Aturan: {Aturan.query.count()}")

if __name__ == '__main__':
    seed_data()