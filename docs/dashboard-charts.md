# Dashboard Analytics — Panduan Membaca Grafik

Dokumen ini menjelaskan setiap grafik yang tersedia di halaman **Dashboard** beserta cara membacanya dan insight yang dapat diperoleh.

---

## Struktur Dashboard

Dashboard dibagi menjadi empat bagian utama:

1. **Grafik Tren Global** — tren lintas semua kelompok usulan
2. **Tabel Ringkasan Kelompok** — data tabel perbandingan antar kelompok
3. **Grafik Detail Kelompok** — distribusi status dan jenis untuk kelompok yang dipilih
4. **Grafik Analisis Lanjutan** — korelasi, radar, dan performa per unit

> Data dimuat secara **deferred** (background fetch). Skeleton loading akan muncul sebentar sebelum grafik tampil.

---

## 1. Grafik Tren Global (Area Sparklines)

Lima grafik area mini (sparklines) di bagian atas menunjukkan **ringkasan metrik utama** secara visual tanpa sumbu (axis) untuk memberikan gambaran cepat tentang tren pertumbuhan. Grafik ini mengisi seluruh lebar kartu (full-to-card).

### 1.1 Total Usulan

- **Apa yang ditampilkan:** Jumlah total usulan kebutuhan per kelompok.
- **Cara membaca:** Titik lebih tinggi = lebih banyak usulan di kelompok tersebut. Tren naik menunjukkan organisasi semakin aktif mengusulkan kebutuhan.
- **Perhatikan:** Penurunan tajam di kelompok terbaru bisa berarti proses pengisian masih berjalan, bukan berarti kebutuhan berkurang.

### 1.2 Total Anggaran

- **Apa yang ditampilkan:** Akumulasi total harga (`total_price`) dari seluruh usulan per kelompok, dalam format Rupiah kompak (Juta / Milyar / Triliun).
- **Cara membaca:** Nilai tinggi = nilai anggaran besar yang diusulkan. Bandingkan dengan Total Usulan — jika usulan sedikit tapi anggaran besar, berarti ada item berbiaya sangat tinggi.
- **Perhatikan:** Lonjakan anggaran yang tidak sebanding dengan jumlah usulan perlu dicermati.

### 1.3 Usulan Prioritas

- **Apa yang ditampilkan:** Jumlah usulan yang ditandai sebagai prioritas (`is_priority = true`) per kelompok.
- **Cara membaca:** Tren naik = makin banyak usulan yang dianggap mendesak. Idealnya, prioritas tidak mendominasi seluruh usulan — jika semua usulan diprioritaskan, maka prioritas kehilangan maknanya.
- **Perhatikan:** Bandingkan dengan Total Usulan untuk melihat **rasio prioritas** (lihat juga Grafik 13 - Radar).

### 1.4 Disetujui Direktur

- **Apa yang ditampilkan:** Jumlah usulan yang telah mendapat persetujuan direktur (`approved_by_director_at` tidak null) per kelompok.
- **Cara membaca:** Angka ini mencerminkan seberapa jauh proses review telah berjalan. Kelompok aktif (tahun berjalan) wajarnya memiliki angka lebih rendah.
- **Perhatikan:** Jika kelompok lama masih memiliki banyak usulan yang belum disetujui, ada bottleneck di proses review.

### 1.5 Rata-rata Kelengkapan

- **Apa yang ditampilkan:** Rata-rata `checklist_percentage` dari semua usulan per kelompok, dalam persentase.
- **Cara membaca:** Nilai mendekati 100% = usulan sudah dilengkapi dengan baik. Kelompok lama seharusnya memiliki persentase lebih tinggi.
- **Perhatikan:** Kelengkapan rendah di kelompok aktif adalah hal wajar. Kelengkapan rendah di kelompok lama perlu tindakan korektif.

---

## 2. Tabel Ringkasan Kelompok

Tabel ini menampilkan **semua kelompok usulan** dalam satu pandangan horizontal untuk perbandingan cepat.

| Kolom | Penjelasan |
|---|---|
| **Kelompok Usulan** | Nama kelompok usulan |
| **Tahun** | Tahun anggaran kelompok |
| **Total Usulan** | Jumlah usulan dalam kelompok |
| **Total Anggaran** | Akumulasi nilai anggaran (format kompak IDR) |
| **Prioritas** | Jumlah usulan yang ditandai prioritas |
| **Disetujui** | Jumlah yang disetujui direktur |
| **Kelengkapan** | Rata-rata persentase kelengkapan checklist |

**Cara membaca:** Scan baris dari kiri ke kanan untuk memahami profil tiap kelompok. Bandingkan antar baris untuk menemukan kelompok yang memerlukan perhatian.

---

## 3. Grafik Detail Kelompok (Per-Kelompok)

Bagian ini menampilkan analisis mendalam untuk **satu kelompok yang dipilih**. Gunakan dropdown di pojok kanan untuk berpindah antar kelompok.

### 3.1 Distribusi Status (Bar Chart)

- **Apa yang ditampilkan:** Jumlah usulan berdasarkan status (`draft`, `approved`, `rejected`, dst.) dalam kelompok terpilih.
- **Cara membaca:** Bar lebih tinggi = lebih banyak usulan di status tersebut. Status `draft` tinggi berarti banyak yang belum difinalisasi.
- **Perhatikan:** Idealnya kelompok yang sudah selesai memiliki dominasi status `approved`. Banyak `rejected` perlu evaluasi kualitas pengisian usulan.

### 3.2 Kebutuhan Berdasarkan Jenis (Pie Chart / Donut)

- **Apa yang ditampilkan:** Proporsi usulan berdasarkan jenis kebutuhan (`NeedType`) dalam kelompok terpilih.
- **Cara membaca:** Potongan lebih besar = jenis kebutuhan lebih dominan. Legenda di kanan menunjukkan nama jenis.
- **Perhatikan:** Dominasi satu jenis tertentu bisa mencerminkan kebutuhan strategis organisasi, atau bisa juga menunjukkan gap di jenis lain.

---

## 4. Grafik Performa Per Unit (Unit Charts)

Tiga grafik horizontal menampilkan **kinerja per unit organisasi** dalam kelompok terpilih.

### 4.1 Top 10 Anggaran Berdasarkan Unit (Horizontal Bar)

- **Apa yang ditampilkan:** 10 unit dengan total nilai anggaran usulan tertinggi.
- **Cara membaca:** Bar lebih panjang = anggaran lebih besar. Nama unit di sumbu Y, nilai di sumbu X (tersembunyi, baca dari tooltip).
- **Perhatikan:** Unit dengan anggaran sangat jauh di atas yang lain perlu verifikasi apakah angka tersebut realistis.

### 4.2 Top 10 Jumlah Usulan Berdasarkan Unit (Horizontal Bar)

- **Apa yang ditampilkan:** 10 unit dengan jumlah usulan terbanyak.
- **Cara membaca:** Bar lebih panjang = lebih produktif mengajukan usulan. Bandingkan dengan grafik anggaran — unit aktif belum tentu mengajukan anggaran besar.
- **Perhatikan:** Unit yang tidak muncul di Top 10 mungkin belum aktif mengisi usulan.

### 4.3 Prioritas vs Non-Prioritas per Unit (Stacked Bar)

- **Apa yang ditampilkan:** Proporsi usulan prioritas vs non-prioritas untuk 10 unit teratas.
- **Cara membaca:** Tiap bar dibagi dua warna — **warna pertama** = prioritas, **warna kedua** = non-prioritas. Panjang total bar = total usulan.
- **Perhatikan:** Unit dengan hampir seluruh usulan ditandai prioritas perlu dikaji — apakah memang semua mendesak, atau ada inflasi status prioritas.

---

## 5. Analisis Lintas Kelompok (Cross-Group Charts)

### 5.1 Analisis Multi-Dimensi / Radar Chart

- **Apa yang ditampilkan:** Perbandingan **3 kelompok terbaru** di lima dimensi yang dinormalisasi ke skala 0–100:
  - **Volume Usulan** — proporsi jumlah usulan relatif terhadap kelompok terbanyak
  - **Anggaran** — proporsi anggaran relatif terhadap kelompok terbesar
  - **Rasio Prioritas** — persentase usulan yang diprioritaskan
  - **Kelengkapan** — rata-rata persentase checklist
  - **Tingkat Persetujuan** — persentase usulan yang disetujui direktur
- **Cara membaca:** Area lebih luas = performa lebih baik di semua dimensi. Bentuk yang simetris = seimbang antar dimensi. Bentuk yang condong ke satu sudut = kuat di dimensi itu tapi lemah di lainnya.
- **Perhatikan:** Normalisasi membuat nilai bersifat relatif — nilai 100 berarti yang terbaik di antara 3 kelompok ini, bukan nilai absolut sempurna.

### 5.2 Korelasi Anggaran & Tingkat Prioritas (Scatter Chart)

- **Apa yang ditampilkan:** Setiap titik mewakili satu kelompok usulan. Sumbu X = total anggaran, sumbu Y = persentase usulan prioritas. Ukuran titik = jumlah total usulan.
- **Cara membaca:**
  - Titik **kanan atas** = anggaran besar + banyak prioritas → kelompok ambisi tinggi
  - Titik **kanan bawah** = anggaran besar + sedikit prioritas → kelompok fokus anggaran besar tapi selektif
  - Titik **kiri atas** = anggaran kecil + banyak prioritas → kelompok dengan keterbatasan anggaran tapi kebutuhan mendesak
  - Titik **kiri bawah** = anggaran kecil + sedikit prioritas → kelompok konservatif
- **Hover** pada titik untuk melihat nama kelompok, nilai anggaran, dan rasio prioritas.
- **Perhatikan:** Korelasi positif (semakin ke kanan semakin ke atas) menunjukkan unit yang mengajukan lebih banyak anggaran juga cenderung menandai lebih banyak usulan sebagai prioritas.

---

## Tips Penggunaan Dashboard

1. **Mulai dari Tren Global** — lihat apakah ada pola kenaikan atau penurunan yang konsisten antar kelompok.
2. **Bandingkan Tabel** — identifikasi kelompok yang memiliki anomali (anggaran sangat besar, kelengkapan rendah, dll).
3. **Drill-down per Kelompok** — gunakan dropdown untuk fokus ke kelompok yang ingin dianalisis.
4. **Gunakan Radar** — untuk mendapat gambaran holistik tentang kualitas kelompok terbaru.
5. **Hover selalu** — semua grafik memiliki tooltip yang memberikan nilai tepat saat di-hover.

---

## Catatan Teknis

- Data diambil secara **deferred** (background) untuk memastikan halaman awal cepat dimuat.
- Semua anggaran ditampilkan dalam format **IDR kompak** (contoh: `Rp 1.2 Milyar`).
- Radar chart menggunakan **normalisasi relatif** — nilai 100 = yang terbaik di antara 3 kelompok yang dibandingkan.
- Scatter chart menggunakan **ukuran gelembung (Z-axis)** untuk menunjukkan volume usulan.
