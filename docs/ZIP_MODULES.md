# HeroLife ZIP Module Contract

از مرحله 02 به بعد هر ماژول به‌صورت یک ZIP مستقل تحویل می‌شود.

## روش استفاده

فایل ZIP ماژول را **بدون Extract کردن** داخل پوشه زیر Repository آپلود کنید:

`module-zips/`

Gradle در زمان Sync/Build فایل‌های ZIP را می‌خواند، آن‌ها را در پوشه موقت
`.generated-modules/`
Extract می‌کند و ماژول را به Build اضافه می‌کند.

بنابراین لازم نیست محتوای ZIPهای 02 تا 20 را با گوشی در GitHub جداگانه آپلود کنید.

## ساختار اجباری هر ZIP

هر ZIP باید یک فایل `herolife-module.json` در ریشه داشته باشد.

نمونه:

```json
{
  "gradlePath": ":feature:designsystem",
  "projectDir": "feature/designsystem"
}
```

و مسیر `projectDir` باید داخل همان ZIP وجود داشته باشد.

## استقلال ماژول‌ها

هر ZIP:
- Build script مستقل خودش را دارد.
- Asset/Resourceهای خودش را دارد.
- تست‌های خودش را نگه می‌دارد.
- به فایل داخلی ZIPهای دیگر دسترسی مستقیم ندارد.
- فقط از API/contractهای عمومی Core یا dependencyهای صریح استفاده می‌کند.

## اجرای GitHub

Workflow موجود در `.github/workflows/android-build.yml`
در هر Push پروژه را Build می‌کند. Module Loader قبل از Gradle project loading،
ZIPها را استخراج و ثبت می‌کند.

## نکته

خود Android Studio نمی‌تواند مستقیم یک Android Gradle module را داخل ZIP compile کند.
HeroLife Module Loader این مشکل را با Extract خودکار در زمان Gradle Sync/Build حل می‌کند.
