# CMS Label & Chapter Conventions

Dokumen ini menjelaskan konvensi penggunaan label (tag) dan struktur penulisan judul postingan pada Blogger untuk memetakan konten Series (Novel/Manga) dan Chapter rilis secara otomatis.

---

## CMS Label Convention

Gunakan format label Blogger berikut:

```text
prefix:value
```

### Aturan Normalisasi Value

- Jika value terdiri dari lebih dari satu kata, gunakan huruf kecil semua.
- Ganti spasi dengan tanda `-`.
- Aturan ini berlaku untuk semua value label di konvensi CMS.

#### Contoh Normalisasi:

| Original Text | Label Format |
| :--- | :--- |
| Shadow Army | `tag:shadow-army` |
| The Reluctant Dictator | `series:the-reluctant-dictator` |
| Masashi Kishimoto | `author:masashi-kishimoto` |
| Red Ice Studio | `artist:red-ice-studio` |
| Shonen Jump | `publisher:shonen-jump` |
| South Korea | `country:south-korea` |
| Web Novel | `media:web-novel` |

### Struktur Label

| Prefix | Fungsi | Contoh Value | Deskripsi |
| :--- | :--- | :--- | :--- |
| `type:` | Jenis halaman | `series`, `chapter`, `news` | Membedakan halaman profil seri dengan halaman isi chapter |
| `media:` | Jenis karya | `manga`, `manhwa`, `manhua`, `novel`, `web-novel` | Mengkategorikan format media |
| `series:` | Slug seri | `naruto`, `the-reluctant-dictator` | **Kunci utama** untuk menghubungkan Chapter dengan Series |
| `genre:` | Genre | `action`, `fantasy`, `adventure` | Pengelompokan genre |
| `tag:` | Tema / Keyword | `ninja`, `magic`, `system`, `shounen`, `shadow-army` | Sub-tagging cerita |
| `author:` | Penulis | `masashi-kishimoto` | Nama penulis novel/manga |
| `artist:` | Ilustrator | `redice-studio` | Nama komikus/ilustrator |
| `publisher:` | Penerbit | `shueisha` | Nama penerbit/lisensi |
| `country:` | Negara asal | `japan`, `korea`, `china` | Asal karya |
| `language:` | Bahasa asli | `japanese`, `korean`, `chinese` | Bahasa pengantar |
| `status:` | Status rilis | `ongoing`, `completed`, `hiatus` | Kondisi penerbitan |
| `badge:` | Badge UI | `new`, `hot`, `featured` | Label dekorasi pada sampul |
| `year:` | Tahun rilis | `1999`, `2024` | Tahun terbit pertama |
| `rating:` | Rating umur | `teen`, `18-plus` | Batasan usia pembaca |

---

## Contoh Penulisan Label

### 1. Contoh Posting Halaman Series
Halaman ini adalah halaman profil novel utama yang menampung deskripsi dan daftar chapter.
```text
type:series
media:manga
series:naruto
genre:action
genre:adventure
tag:ninja
tag:shounen
author:masashi-kishimoto
artist:masashi-kishimoto
publisher:shueisha
country:japan
language:japanese
status:completed
year:1999
badge:featured
```

### 2. Contoh Posting Halaman Chapter
Halaman ini adalah rilis chapter individu yang dibaca oleh pengunjung.
```text
type:chapter
media:manga
series:naruto
badge:new
```

### Contoh Link Pencarian Label

Saat membuat link ke label dari halaman Series, selalu tambahkan filter `label:"type:series"` supaya chapter dan posting lain tidak ikut terambil.

#### Format Link Pencarian:
```
/search?q=label:"<prefix>:<value>"+label:"type:series"
```

#### Contoh Lengkap:
| Kategori | Link |
| :--- | :--- |
| Media (Novel) | `/search?q=label:"media:novel"+label:"type:series"` |
| Genre (Action) | `/search?q=label:"genre:action"+label:"type:series"` |
| Tag (Shadow Army) | `/search?q=label:"tag:shadow-army"+label:"type:series"` |
| Author | `/search?q=label:"author:masashi-kishimoto"+label:"type:series"` |
| Artist | `/search?q=label:"artist:red-ice-studio"+label:"type:series"` |
| Publisher | `/search?q=label:"publisher:shonen-jump"+label:"type:series"` |
| Country | `/search?q=label:"country:south-korea"+label:"type:series"` |
| Language | `/search?q=label:"language:korean"+label:"type:series"` |
| Status | `/search?q=label:"status:ongoing"+label:"type:series"` |
| Year | `/search?q=label:"year:2024"+label:"type:series"` |

---

## Aturan Penulisan Judul Chapter (Chapter Title Convention)

Untuk mendukung **Solusi A (Parsing Judul Otomatis)**, judul artikel rilis chapter baru harus mengandung kata **"Chapter"** atau **"Ch."** diikuti oleh **nomor chapter**.

### Contoh Judul yang Didukung:
* `The Reluctant Dictator for Life - Chapter 1`
* `The Reluctant Dictator for Life - Chapter 1 Plake Doom`
* `The Reluctant Dictator for Life - Volume 1 - Chapter 1 Plake Doom`
* `The Reluctant Dictator for Life - Volume 1 - Chapter 16 Plake Doom`
* `Solo Leveling - Ch. 12`
* `Solo Leveling Ch.134`

### Cara Kerja Pencocokan Otomatis di Homepage:
1. Script homepage memanggil list **Series** (postingan berlabel `type:series`).
2. Script homepage memanggil list **Chapter Terbaru** (postingan berlabel `type:chapter`).
3. Script mencocokkan keduanya menggunakan label **`series:<slug>`** (misalnya `series:naruto`).
4. Angka chapter di parsed secara otomatis menggunakan regular expression: `/(?:Chapter|Ch\.?)\s*(\d+(\.\d+)?)/i`.
5. Link menuju chapter serta waktu relatif update chapter tersebut dipasangkan langsung ke card Series utama di homepage secara otomatis.
