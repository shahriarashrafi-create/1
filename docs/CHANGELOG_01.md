# Module 01 Changelog

- پروژه Android ساخته شد.
- `app` به‌عنوان ماژول اجرایی ایجاد شد.
- `core:model` به‌عنوان اولین ماژول مستقل دامنه ایجاد شد.
- پشتیبانی RTL فعال شد.
- مدل XP، Gold، Diamond تعریف شد.
- Task Priority و Lane پایه اضافه شد.
- Bottom Navigation هدف نهایی در Shell قرار گرفت.
- Home Shell قابل اجرا برای تست ساختار اضافه شد.

## Revision B — Gradle security fix
- Removed the previously committed unverified wrapper JAR.
- Added SHA-256 verified wrapper bootstrap to `gradlew` and `gradlew.bat`.
- Pinned the Gradle 8.7 distribution SHA-256.
- Updated GitHub Actions to bootstrap first, validate through setup-gradle, build the debug APK, and upload it as an artifact.
