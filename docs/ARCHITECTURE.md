# Architecture — Module 01

## تصمیم‌های پایه

- Android Native
- Kotlin
- Jetpack Compose
- Multi-module Gradle
- Persian-first / RTL-first
- Java 17
- minSdk 26
- compileSdk / targetSdk 35

## قرارداد اقتصاد بازی

- XP: فقط پیشرفت، قابل خرج کردن نیست
- Gold: خرید Hero و آیتم‌های Hero
- Diamond: فروشگاه پاداش‌های واقعی، بسیار کمیاب

## قرارداد Battle آینده

Task Library و Battle Session دو مفهوم مستقل‌اند.
Battle از Taskهای فعال و واجد شرایط، Minion تولید خواهد کرد.
Priority از همین مرحله در مدل پایه تعریف شده تا بعداً موتور Match بتواند از آن استفاده کند.

## اصل تحویل 20 مرحله‌ای

هر مرحله:
1. ماژول جدید را مستقل نگه می‌دارد.
2. Snapshot کامل پروژه را تحویل می‌دهد.
3. باید پس از جایگزینی/ادغام فایل‌ها Build و Run شود.
4. مستند تغییرات همان مرحله را خواهد داشت.
