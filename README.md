# Document Converter - SaaS

A production-ready Laravel document conversion SaaS using CloudConvert API.

**Status:** ✅ Production Ready

---

## 🎯 Features

- ✅ **Word to PDF** - Convert DOCX to PDF
- ✅ **Excel to PDF** - Convert XLSX to PDF  
- ✅ **Image to PDF** - Convert JPG/PNG/GIF to PDF
- ✅ **PDF to Word** - Convert PDF to DOCX
- ✅ **Merge PDFs** - Combine multiple PDFs

---

## 🛠️ Tech Stack

- **Backend:** Laravel 10
- **API:** CloudConvert
- **Database:** MySQL
- **Storage:** Local filesystem

---

## 📦 Quick Start

### Backend Setup

```bash
# Clone repository
git clone https://github.com/XmanRana/ai-automation-agency.git
cd ai-automation-agency

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Create symlink
php artisan storage:link

# Run migrations
php artisan migrate

# Start server
php artisan serve
```

---

## 🔑 Configuration

Add CloudConvert API key to `.env`:

```env
CLOUDCONVERT_KEY=your_api_key_here
```

---

## 📚 API Endpoints

**Upload File:**
```
POST /api/upload
Content-Type: multipart/form-data
```

**Convert Document:**
```
POST /api/convert
{
  "filename": "document.pdf",
  "task": "pdf to word"
}
```

**Merge PDFs:**
```
POST /api/merge-pdfs
{
  "files": ["file1.pdf", "file2.pdf"]
}
```

---

## ✅ Tested Conversions

- ✅ Word → PDF
- ✅ Excel → PDF  
- ✅ Image → PDF
- ✅ PDF → Word
- ✅ Merge PDFs
