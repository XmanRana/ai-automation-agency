# AI Automation Agency

Full-stack automation platform with multiple tools.

---

## 🛠️ Tools

### 1. Document Converter
- Word to PDF
- PDF to Word
- Excel to PDF
- Image to PDF
- Merge PDFs

### 2. Email Generator
- Generate professional emails
- AI-powered templates

### 3. Data Analyzer
- Analyze data trends
- Generate insights

---

## 🚀 Quick Start

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

## 📚 API Endpoints

**Document Converter:**
```
POST /api/upload
POST /api/convert
POST /api/merge-pdfs
```

**Email Generator:**
```
POST /api/generate-email
```

**Data Analyzer:**
```
POST /api/analyze-data
```
