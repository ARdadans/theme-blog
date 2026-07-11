# Panduan Penulisan Konten Seri Novel / Manga (Series Profile Guide)

Dokumen ini berisi panduan untuk membuat postingan profil novel/manga utama (**berlabel `type:series`**) di editor Blogger. 

Dengan sistem tema modular ini, Anda **cukup mengetik datanya saja** menggunakan tag HTML sederhana (tanpa CSS inline). Tema secara otomatis akan menyusun data tersebut ke dalam bentuk grid modern dan menambahkan label penjelas (seperti "Author", "Status", "Genres", dll.) menggunakan CSS.

---

## 1. Cara Penggunaan di Editor Blogger

1. Buat postingan baru di Blogger.
2. Tambahkan label wajib **`type:series`** di kolom label sebelah kanan.
3. Ubah mode penulisan dari **Tampilan Menulis (Compose View)** menjadi **Tampilan HTML (HTML View)** dengan mengeklik ikon pena di pojok kiri atas.
4. Salin salah satu contoh template di bawah ini, sesuaikan nilainya, lalu terbitkan.

---

## 2. Kelas & Tag yang Didukung

Berikut adalah daftar elemen data yang bisa Anda gunakan:

| Kelas CSS | Jenis Tag HTML | Fungsi & Keterangan |
| :--- | :--- | :--- |
| `summary` | `<span>` | Menampung sinopsis novel lengkap. |
| `title-alts` | `<ul>` & `<li>` | Judul alternatif (Bahasa Inggris, Romaji, dll.). |
| `latest-chapter` | `<span>` | Nomor bab/chapter terbaru (hanya angka). |
| `genres` | `<ul>` & `<li>` | Daftar kategori/genre novel (otomatis menjadi pil tag). |
| `tag` | `<ul>` & `<li>` | Daftar tagar/kata kunci (otomatis menjadi pil tag). |
| `media` | `<span>` | Jenis media (misal: `Novel`, `Manga`, `Manhua`). |
| `author` | `<span>` atau `<ul>` | Nama penulis novel (bisa berupa list jika > 1 orang). |
| `artist` | `<span>` atau `<ul>` | Nama komikus / ilustrator cover. |
| `publisher` | `<span>` | Nama penerbit resmi. |
| `country` | `<span>` | Negara asal (misal: `Japan`, `Korea`, `China`). |
| `language` | `<span>` | Bahasa utama. |
| `status` | `<span>` | Status rilis (misal: `Ongoing`, `Completed`, `Hiatus`). |
| `year` | `<span>` | Tahun pertama kali rilis (misal: `2018`). |
| `badge` | `<span>` | Label penanda khusus (misal: `Hot`, `Featured`, `New`). |
| `poster` | `<img>` | Foto sampul/cover seri (otomatis rata tengah dengan border membulat). |

---

## 3. Template Siap Pakai (Copy-Paste)

### A. Template Lengkap (Rekomendasi)
Gunakan ini untuk seri novel/manga yang memiliki data informasi komplit:

```html
<!-- 1. Sinopsis Novel (Otomatis dilekatkan paling atas oleh Tema) -->
<span class="summary">
  Di dunia di mana monster keluar dari portal dimensi (gate) untuk menyerang manusia, beberapa orang mendapatkan kekuatan khusus untuk memburu mereka. Mereka disebut Hunter. Sung Jin-Woo adalah Hunter berperingkat E yang sangat lemah, namun takdirnya berubah saat ia menemukan rahasia 'System' di dalam Double Dungeon misterius.
</span>

<!-- 2. Metadata Seri (Otomatis disusun menjadi Grid di bawah Sinopsis) -->
<ul class="title-alts">
  <li>Solo Leveling</li>
  <li>Na Honjaman Level Up</li>
</ul>

<span class="latest-chapter">179</span>

<ul class="genres">
  <li>Action</li>
  <li>Adventure</li>
  <li>Fantasy</li>
  <li>System</li>
</ul>

<ul class="tag">
  <li>Overpowered MC</li>
  <li>Shadow Army</li>
  <li>Solo Player</li>
</ul>

<span class="media">Novel</span>
<span class="author">Chugong</span>
<span class="artist">Dubu (Redice Studio)</span>
<span class="publisher">D&C Media</span>
<span class="country">South Korea</span>
<span class="language">Korean</span>
<span class="status">Completed</span>
<span class="year">2018</span>
<span class="badge">Featured</span>

<!-- 3. Gambar Poster/Sampul Seri (Diletakkan di posisi paling bawah) -->
<img class="poster" alt="Nama Novel/Manga" title="Cover Nama Novel/Manga" loading="lazy" src="URL_GAMBAR_COVER_DISINI" width="300" height="400" />
```

### B. Template Sederhana
Gunakan ini jika Anda hanya ingin menuliskan informasi mendasar:

```html
<span class="summary">
  Tuliskan sinopsis singkat mengenai manga/novel Anda di sini. Paragraf ini akan secara otomatis dihias dan diletakkan paling atas oleh sistem tema.
</span>

<span class="latest-chapter">45</span>

<ul class="genres">
  <li>Romance</li>
  <li>Comedy</li>
  <li>School Life</li>
</ul>

<span class="media">Manga</span>
<span class="author">Author Name</span>
<span class="status">Ongoing</span>
<span class="year">2026</span>

<!-- Gambar Poster/Sampul Seri -->
<img class="poster" alt="Nama Novel/Manga" title="Cover Nama Novel/Manga" loading="lazy" src="URL_GAMBAR_COVER_DISINI" width="300" height="400" />
```

---

## 4. Menulis Konten Tambahan (Defensif CSS)

Jika Anda ingin menambahkan teks ulasan tambahan, link external, atau gambar ilustrasi di dalam halaman profil novel di luar kotak metadata:
* Anda cukup mengetikkan paragraf biasa menggunakan tag `<p>` atau tag heading (`<h2>`, `<h3>`).
* Tema secara otomatis memiliki pengaman (*Defensive CSS*) yang membuat tag standar tanpa kelas ini melebar penuh (`grid-column: 1 / -1`) di bawah kotak metadata, sehingga tata letak halaman profil Anda tidak akan rusak.

---

## 5. Fitur Otomatisasi Halaman Seri (Layout & Chapters Feed)

Ketika halaman seri dimuat, sistem tema secara cerdas melakukan pemrosesan otomatis sebagai berikut:

### A. Rekonstruksi Layout Tampilan (MangaFire Style)
* **Cover Sampul**: Gambar dengan kelas `poster` (`img.poster`) ditarik keluar dari isi postingan dan diletakkan di kolom kiri khusus dengan efek animasi transisi skala (hover scale).
* **Metadata Grid**: Data `alt-title`, `media`, `status`, `genres`, `tag`, `author`, `publisher`, dll., diatur kembali posisinya menjadi rapi di kolom kanan.
* **Sinopsis**: Paragraf synopsis (`span.summary`) secara otomatis dibaca panjangnya. Jika melebihi 200 karakter, tombol interaktif **"Read more" / "Read less"** akan muncul untuk melipat sinopsis agar hemat ruang.

### B. Otomatisasi Daftar Isi Chapter (Chapters List)
Di bawah sinopsis, tema akan menampilkan daftar chapter secara otomatis tanpa perlu Anda ketik manual di editor:
1. **Pencarian Hubungan**: Sistem mencari label **`series:<slug-nama-novel>`** pada postingan seri Anda.
2. **Pemuatan Feed**: Sistem memanggil Blogger Feeds API secara real-time untuk memuat semua postingan bab yang memiliki label seri tersebut dan berlabel **`type:chapter`**.
3. **Fitur Panel Daftar Isi**:
   * **Pencarian Lokal**: Pengguna dapat mengetikkan nomor bab di kolom pencarian untuk memfilter chapter secara instan.
   * **Pengurutan (Sort)**: Tombol pengurutan untuk mengubah urutan rilis bab dari yang terbaru (Descending) ke yang terlama (Ascending).
   * **Start Reading**: Tombol pintasan di atas otomatis mengarahkan pembaca ke Chapter 1 secara dinamis.
   * **Pagination**: Memuat bab dengan batas maksimal 100 item per halaman. Jika terdapat lebih dari 100 bab, tombol **"Previous Page"** dan **"Next Page"** akan muncul otomatis.

