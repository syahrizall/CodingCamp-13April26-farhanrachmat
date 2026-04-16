# 💸 Expense Tracker

Aplikasi web sederhana untuk mencatat dan memvisualisasikan pengeluaran harianmu — langsung di browser, tanpa perlu login atau install apapun!

<div align="center">

[![Open App](https://img.shields.io/badge/Buka_Aplikasi-6c63ff?style=for-the-badge&logo=googlechrome&logoColor=white)](task.html)

</div>

---

## ✨ Fitur Utama

| Fitur | Keterangan |
|---|---|
| ➕ **Tambah Transaksi** | Catat nama item, jumlah, dan kategori pengeluaran |
| 📊 **Grafik Donut** | Visualisasi pengeluaran per kategori secara real-time |
| 🏷️ **Kategori Custom** | Buat kategori sendiri lengkap dengan emoji |
| 🔃 **Urutkan Riwayat** | Sort berdasarkan tanggal, nominal, atau kategori |
| 🌙 **Dark / Light Mode** | Ganti tema sesuai selera, tersimpan otomatis |
| 💾 **Auto-Save** | Semua data tersimpan di `localStorage` — aman meski browser ditutup |
| 📱 **Responsif** | Tampilan optimal di HP, tablet, maupun desktop |

---

## 🚀 Cara Pakai

### 1. Buka Aplikasi
Cukup buka file `task.html` di browser favoritmu — tidak perlu server!

> **Tip:** Klik tombol di bawah ini kalau kamu baca README ini di editor yang mendukung preview HTML.

### 2. Tambah Transaksi
1. Isi **Item Name** (contoh: `Makan Siang`, `Grab`, `Netflix`)
2. Masukkan **Amount** dalam Rupiah
3. Pilih **Category** yang sesuai
4. Klik **+ Add Transaction** ✅

### 3. Lihat Grafik
Grafik donut di bagian tengah akan otomatis update setiap kali kamu menambah atau menghapus transaksi.

### 4. Buat Kategori Sendiri
Di bagian **Custom Categories**, ketik nama kategori + emoji pilihanmu, lalu klik **+ Add**.

### 5. Ganti Tema
Klik tombol 🌙 / ☀️ di pojok kanan atas header untuk beralih antara dark dan light mode.

---

## 📂 Struktur Proyek

```
📁 project/
├── 📄 task.html        # File utama aplikasi
├── 📁 css/
│   └── style.css       # Semua styling & tema
├── 📁 js/
│   └── app.js          # Logic aplikasi (transaksi, chart, storage)
└── 📄 README.md        # Dokumentasi ini
```

---

## 🛠️ Teknologi

- **HTML5** — Struktur halaman
- **CSS3** — Styling dengan CSS Variables untuk theming
- **Vanilla JavaScript** — Logika aplikasi tanpa framework
- **[Chart.js v4](https://www.chartjs.org/)** — Visualisasi grafik donut
- **localStorage** — Penyimpanan data di browser

---

## 📦 Kategori Bawaan

| Emoji | Kategori |
|---|---|
| 🍔 | Food |
| 🚗 | Transport |
| 🎮 | Fun |
| 💊 | Health |
| 🛍️ | Shopping |
| 📦 | Other |

> Kamu bisa menambahkan kategori custom sesuai kebutuhan!

---

## 💡 Tips

- **Hapus satu transaksi:** Klik tombol `✕` di sebelah kanan item
- **Hapus semua:** Klik tombol **Clear All** di bagian History
- **Data tidak hilang:** Semua tersimpan otomatis di browser, bahkan setelah di-refresh

---

<div align="center">

**Dibuat dengan ❤️ oleh farhanrachmat**

[![Coba Sekarang](https://img.shields.io/badge/Coba_Sekarang-6c63ff?style=for-the-badge&logo=googlechrome&logoColor=white)](task.html)

</div>
