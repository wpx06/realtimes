# 🚀 Vercel Deployment Guide

## 📋 Persyaratan

### ✅ **Vercel Free Plan Limitations**
- **Bandwidth**: 100GB/bulan
- **Function Duration**: 10 detik (Free), 60 detik (Pro)
- **Database**: 512MB (Vercel Postgres gratis)
- **Real-time**: Socket.IO tidak didukung, gunakan SSE

### 🔧 **Langkah Deployment**

#### 1. **Fork Repository**
```bash
# Fork ke GitHub Anda
https://github.com/robingladys/cpa-lead-dashboard
```

#### 2. **Import ke Vercel**
1. Login ke [vercel.com](https://vercel.com)
2. Klik "New Project"
3. Import dari GitHub
4. Pilih repository yang sudah di-fork

#### 3. **Environment Variables**
```bash
# Database (Vercel Postgres)
DATABASE_URL="postgresql://..."

# NextAuth (jika digunakan)
NEXTAUTH_SECRET="random-secret-key"

# API Keys (opsional)
CPA_API_KEY="your-api-key"
```

#### 4. **Build Settings**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

## 🗄️ **Database Setup**

### Vercel Postgres (Gratis)
1. Di Vercel Dashboard → Storage
2. Create Database → Postgres
3. Pilih Hobby plan (gratis)
4. Copy DATABASE_URL ke environment variables

### Schema Migration
```bash
# Install Prisma CLI
npm install -g prisma

# Generate client
npx prisma generate

# Push schema ke database
npx prisma db push
```

## 🔄 **Real-time Alternatives**

### Server-Sent Events (SSE)
```typescript
// Client-side
const eventSource = new EventSource('/api/realtime');
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('New lead:', data);
};
```

### Pusher (Alternatif)
```bash
npm install pusher-js
```

## 📊 **API Endpoints yang Berfungsi**

### ✅ **Working in Vercel**
- `/api/leads` - Get all leads
- `/api/export` - Export CSV/JSON
- `/api/postback/*` - CPA postbacks
- `/api/health` - Health check
- `/api/realtime` - Real-time updates (SSE)

### ⚠️ **Modified for Vercel**
- Socket.IO → Server-Sent Events
- SQLite → PostgreSQL
- Custom server → Vercel Functions

## 🎯 **Postback URLs (Vercel)**

```
Imonetizeit:  https://your-app.vercel.app/api/postback/imonetizeit
Trafee:       https://your-app.vercel.app/api/postback/trafee
Clickdealer:  https://your-app.vercel.app/api/postback/clickdealer
```

## 🧪 **Testing di Vercel**

```bash
# Test postback
curl "https://your-app.vercel.app/api/postback/imonetizeit?click_id=test123&payout=5.50&country=US"

# Test API
curl "https://your-app.vercel.app/api/leads"
```

## 📈 **Performance Tips**

### 1. **Database Optimization**
```sql
-- Add indexes for better performance
CREATE INDEX idx_leads_platform ON leads(platform);
CREATE INDEX idx_leads_created_at ON leads(created_at);
```

### 2. **Caching**
```typescript
// Use Vercel KV for caching
import { kv } from '@vercel/kv';

const cachedLeads = await kv.get('leads');
if (!cachedLeads) {
  const leads = await db.lead.findMany();
  await kv.set('leads', leads, { ex: 60 }); // 60 seconds
}
```

### 3. **Function Optimization**
```typescript
// Reduce function execution time
export async function GET() {
  // Fast queries only
  const leads = await db.lead.findMany({
    take: 100, // Limit results
    orderBy: { createdAt: 'desc' }
  });
  
  return Response.json(leads);
}
```

## 🔍 **Monitoring**

### Vercel Analytics
- Real-time metrics
- Performance monitoring
- Error tracking

### Database Monitoring
- Connection pool usage
- Query performance
- Storage usage

## 🚨 **Limitations Vercel Free**

| Feature | Free Plan | Pro Plan ($20/bulan) |
|---------|-----------|---------------------|
| Bandwidth | 100GB | 1TB |
| Function Duration | 10s | 60s |
| Database | 512MB | 10GB |
| Custom Domains | 1 | Unlimited |
| Edge Functions | 100k/month | Unlimited |

## 💰 **Biaya Estimasi**

### **Free Plan (Rp 0/bulan)**
- ✅ Basic tracking
- ✅ 100GB bandwidth
- ✅ 512MB database
- ❌ Limited real-time

### **Pro Plan (Rp 300k/bulan)**
- ✅ Full features
- ✅ 1TB bandwidth
- ✅ 10GB database
- ✅ Better performance

## 🎉 **Kesimpulan**

**CPA Lead Dashboard bisa berjalan di Vercel gratis dengan modifikasi:**

1. ✅ **Frontend** - 100% compatible
2. ✅ **API Routes** - 100% compatible  
3. ✅ **Database** - Gunakan Vercel Postgres
4. ⚠️ **Real-time** - Ganti Socket.IO dengan SSE
5. ✅ **Deployment** - Otomatis dari GitHub

**Rekomendasi:** Mulai dengan free plan, upgrade jika traffic tinggi.