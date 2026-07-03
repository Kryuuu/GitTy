# 🚀 GitTy — AI-Native SaaS Platform (Operating System)

GitTy adalah platform *Software as a Service* (SaaS) *multi-tenant* yang dirancang sebagai **AI-Native Operating System** untuk individu, kreator, agensi, dan perusahaan berskala besar. Platform ini tidak hanya berfungsi sebagai alat manajemen proyek, melainkan sebuah ekosistem yang terpusat pada asisten Kecerdasan Buatan (AI) yang memiliki ingatan (*Memory/RAG*), Agen Khusus (*Agents*), Publikasi Halaman Bisnis (*Public Pages*), dan Ekosistem Jual-Beli (*Marketplace*).

Aplikasi ini dirancang sebagai purwarupa (*MVP*) yang siap untuk skala produksi (*VC-ready*), mendukung berbagai penyedia model AI (OpenAI, Claude, Gemini), memiliki sistem keamanan dan akses berbasis peran (RBAC), serta terintegrasi langsung dengan payment gateway **Midtrans** untuk monetisasi langganan.

---

## 🧠 Konsep Utama (Core Concepts)

1. **AI sebagai Inti (AI-Native OS)**
   Semuanya berputar di sekitar AI. Proyek, Berkas Pengetahuan, Agen, dan Otomatisasi dikendalikan oleh "Otak" (*AI Core*) yang cerdas. AI dapat mengingat konteks lintas-sesi dengan dukungan penyimpanan Vektor (pgvector).
   
2. **Multi-tenant & Role-Based Access Control (RBAC)**
   Sistem ini memungkinkan pengguna untuk memiliki atau bergabung ke dalam banyak "Organisasi" (Multi-tenant). Pengguna di dalam organisasi memiliki peran (Owner, Admin, Member) yang secara ketat mengatur izin akses mereka, diamankan di sisi *database* melalui Row Level Security (RLS).

3. **Knowledge Base (RAG)**
   Setiap organisasi memiliki Basis Pengetahuan sendiri. Pengguna dapat mengunggah file (PDF, TXT, DOCX, Markdown, CSV, Gambar), dan file tersebut akan secara otomatis diekstrak menjadi konteks AI. Ini membuat AI GitTy memahami data bisnis spesifik perusahaan Anda.

4. **Kustomisasi Agen (Agent Builder)**
   Selain agen AI bawaan, pengguna dapat memprogram Agen AI Kustom dengan instruksi khusus (*system prompt*), penyedia model, tingkat kreativitas, dan izin akses tertentu yang dapat dipublikasikan untuk tim maupun publik.

5. **Hub Bisnis Publik (Public Pages)**
   Pengguna maupun Organisasi dapat membangun halaman publik bergaya modern (`gitty.app/@username`). Halaman ini berfungsi sebagai tautan bio, portofolio digital, dan etalase toko yang terhubung langsung ke sistem Marketplace.

6. **Monetisasi & Marketplace**
   GitTy menggunakan model berlangganan yang diproses secara lokal menggunakan **Midtrans Snap/Webhook**. Lebih dari itu, kreator dapat menjual (*Publish*) aset digital (Prompts, Agents, UI Kits, Workflows) kepada pengguna lain melalui **GitTy Marketplace**.

---

## 🛠 Teknologi yang Digunakan (Tech Stack)

* **Meta-Framework**: Next.js 16 (App Router, Turbopack, Server Actions, Server Components).
* **Styling & UI**: Tailwind CSS (Glassmorphism, Dark Mode, & Cybernetic Premium Aesthetic).
* **Database & Auth**: Supabase (PostgreSQL, `pgvector`, Row Level Security, Storage, Supabase Auth).
* **Payment Gateway**: Midtrans (Core API & Snap untuk Checkout + Webhook).
* **AI Engine**: Model-agnostik (Mendukung OpenAI, Anthropic Claude, Google Gemini).

---

## 📌 Penjelasan Fungsi Modul (Modul GitTy OS)

### 1. Global Workspace (`/app/org/[id]/workspace`)
Ini adalah pusat operasi setelah Anda login. Sebuah antarmuka *chat* berdesain futuristik di mana Anda berinteraksi dengan AI secara global tanpa terikat proyek tertentu. Dilengkapi panel konteks di sebelah kanan untuk aksi instan (*Quick Actions*) dan daftar Proyek Terakhir.

### 2. Knowledge Base (`/app/org/[id]/knowledge`)
Modul unggah dokumen. Berkas yang diunggah akan masuk ke *bucket* Supabase Storage `knowledge_files` dan metadatanya dimasukkan ke tabel `ai_memory`. AI akan menggunakan memori ini untuk memberikan jawaban yang spesifik sesuai dokumen Anda.

### 3. AI Agents (`/app/org/[id]/agents`)
Direktori Agen bawaan dan *Custom Agents*. Fitur **Agent Builder** memungkinkan pengguna mendefinisikan persona bot baru, mengatur Provider AI-nya, mengatur tingkat `temperature` (kreativitas), dan mengatur apakah agen tersebut hanya untuk Privat, Tim, atau dipasarkan (Public).

### 4. Public Pages (`/app/public-page` & `/[username]`)
Fitur Etalase Digital. Pengguna dapat menyunting URL kustom mereka (`/@username`), memilih tema, memasukkan berbagai tautan (seperti Linktree namun lebih interaktif), menyematkan produk, dan memublikasikannya secara *real-time* ke internet.

### 5. Vendor Marketplace (`/app/org/[id]/marketplace`)
*Dashboard* khusus kreator. Pengguna dapat me-listing produk AI mereka, mengatur tipe (Prompt/Workflow/Template), memberikan harga (termasuk produk gratis), lalu memublikasikannya.

### 6. Public Marketplace (`/marketplace`)
Etalase global yang dapat diakses oleh publik untuk menjelajahi dan mengunduh produk digital hasil karya para kreator (Vendor) dari modul sebelumnya.

### 7. Manajemen Proyek & Organisasi
Modul fungsional untuk mengelola pengaturan tingkat tinggi, seperti membuat organisasi baru, menambah *Members*, mengatur *Projects*, serta mengatur tagihan *(Billing)* yang terhubung dengan siklus Midtrans.

---

## 🗄 Skema Database Inti (PostgreSQL via Supabase)

1. `profiles`: Data diri dan profil dasar pengguna.
2. `public_pages`: Konfigurasi desain, URL slug, dan tautan etalase publik pengguna.
3. `organizations` & `org_members`: Ekosistem Multi-tenant dan pengaturan peran (RBAC).
4. `projects`: Pengelompokan tugas dan *chat* spesifik.
5. `ai_memory`: Konteks persisten yang menggunakan dukungan `pgvector` (RAG Knowledge).
6. `agents`: Definisi bot kustom (Prompt, Konfigurasi LLM).
7. `marketplace_items`: Katalog aset yang dijual/dibagikan oleh pengguna.
8. `subscriptions`: Data paket langganan pengguna (tersinkronisasi dari Midtrans).

---

## 🔒 Arsitektur Keamanan (Security)

Keamanan diterapkan sangat ketat menggunakan standar produksi:
1. **Validasi Server Actions**: Setiap input dari klien difilter dan divalidasi langsung di *Server*.
2. **PostgreSQL RLS (Row Level Security)**: Walaupun serangan berhasil menembus celah API, *database* Supabase akan otomatis menolak kueri `SELECT/INSERT/UPDATE/DELETE` yang tidak memiliki kunci `auth.uid()` yang sesuai dengan izin tingkat *Org Members*. Data dijamin tidak akan bocor ke *tenant* lain.

---

## 🚀 Panduan Menjalankan Secara Lokal (Quick Start)

### 1. Install Dependencies
Buka terminal di *root* proyek dan jalankan:
```bash
npm install
```

### 2. Siapkan Environment Variables
Salin `.env.example` menjadi `.env.local` lalu isi kredensial Anda:
* Kunci Supabase (URL, ANON KEY, SERVICE ROLE KEY)
* Kunci Midtrans (SERVER KEY, CLIENT KEY)
* Kunci API AI (OpenAI / Claude / Gemini)

### 3. Inisialisasi Database Supabase
Buka **SQL Editor** di *dashboard* Supabase proyek Anda, *Copy-Paste* seluruh isi dari *file* `supabase/schema.sql` dan jalankan *(Run)*. Skrip ini akan secara otomatis:
* Membuat tabel-tabel utama (Profiles, Public Pages, Orgs, Knowledge, Agents, Marketplace).
* Mengaktifkan ekstensi `vector`.
* Membuat kebijakan keamanan RLS.
* Mengatur *Bucket Storage* (contoh: `knowledge_files`).
* Menyiapkan pelatuk (*Triggers*) sinkronisasi.

### 4. Jalankan Aplikasi
```bash
npm run dev
```
Buka browser dan navigasikan ke `http://localhost:3000`.

### 5. Testing Sistem
Untuk simulasi, daftar dengan email apa saja, dan coba navigasikan *workspace*, unggah berkas ke *Knowledge*, buat agen kustom, lalu rancang halaman *Public Page* Anda!
