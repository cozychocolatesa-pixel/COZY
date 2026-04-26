# Cozy Chocolate - موقع شوكولاتة فاخر

## التش��يل

```bash
cd ~/Desktop/cozy-chocolate
npm run dev
```

ثم افتح: http://localhost:3000

## إعداد Supabase

1. أنشئ مشروع جديد على [supabase.com](https://supabase.com)
2. شغّل الـ SQL الموجود في `supabase-schema.sql` في SQL Editor
3. عدّل `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
ADMIN_PASSWORD=كلمة_سر_الأدمن
```

## الصفحات

| الصفحة | الرابط | الوصف |
|--------|--------|-------|
| الرئيسية | `/` | صفحة العرض مع particles ذهبية + منيو المناسبات + منيو البوكسات |
| لوحة التح��م | `/dashboard` | إدارة المنتجات (إضافة/حذف/تعديل/إخفاء) |

## الميزات

### الصفحة ال��ئيسية:
- Hero section مع gold particles (Three.js) تتفاعل مع الماوس
- عنوان يتكتب حرف حرف (GSAP)
- Smooth scroll (Lenis)
- منيو المناسبات + منيو البوكسات مع scroll-triggered animations
- Horizontal scroll للمنتجات (GSAP ScrollTrigger)
- تصميم بني داكن + ذهبي فاخر
- RTL + خط Cairo

### لوحة التحكم:
- تسجيل دخول بكلمة سر
- إضافة منتج جديد مع رفع صورة
- تعديل السعر بالنقر المبا��ر
- إخفاء/إ��هار المنتج
- حذف منتج
- تصنيف: مناسبات أو بوكسات

## Stack
- Next.js 14 (App Router)
- Three.js + React Three Fiber (particles)
- GSAP + ScrollTrigger (animations)
- Lenis (smooth scroll)
- Framer Motion
- Tailwind CSS
- Supabase (database + storage)
