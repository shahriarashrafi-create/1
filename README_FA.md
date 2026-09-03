# مینی‌اپ حضور ایونت دایرکتورها برای بله

این پروژه یک **Cloudflare Worker** است که همزمان سه کار انجام می‌دهد:

1. یک صفحه مینی‌اپ فارسی برای ثبت حضور و عکس اعضا
2. گالری زنده افراد رسیده به ایونت
3. یک وب‌هوک ربات بله که دکمه «ثبت حضور» را داخل بله می‌فرستد

اگر `BALE_GROUP_CHAT_ID` تنظیم شود، پس از ثبت حضور، همان عکس با نام و ساعت ورود در گروه بله نیز توسط ربات منتشر می‌شود.

---

## امکانات نسخه 1

- ثبت نام و عکس
- باز شدن دوربین موبایل از داخل صفحه
- کم‌حجم کردن خودکار عکس قبل از ارسال
- نمایش تعداد حاضرین
- گالری زنده حاضرین
- جلوگیری نسبی از ثبت چندباره یک کاربر/دستگاه
- ذخیره اطلاعات در Cloudflare KV
- دکمه Web App داخل ربات بله
- ارسال عکس ثبت‌شده به گروه بله
- دستور `/count` برای تعداد حاضرین
- پنل JSON ادمین
- ریست کامل ایونت با کلید ادمین

---

## مرحله 1 — ساخت ربات در بله

در بله وارد `@BotFatherBale` شو و یک ربات بساز.
توکن ربات را **جایی امن نگه دار و داخل GitHub قرار نده**.

---

## مرحله 2 — ساخت Cloudflare KV

در Cloudflare:

Workers & Pages → KV → Create namespace

مثلاً اسمش را بگذار:

`bale-directors-arrivals`

بعد ID آن را بردار و در `wrangler.toml` به جای:

`PUT_YOUR_KV_NAMESPACE_ID_HERE`

قرار بده.

---

## مرحله 3 — Deploy

اگر Node.js روی سیستم داری:

```bash
npm install
npx wrangler login
npm run deploy
```

بعد از Deploy یک آدرس شبیه زیر می‌گیری:

`https://bale-directors-event.USERNAME.workers.dev`

این آدرس را در `wrangler.toml` جلوی `APP_URL` بگذار و دوباره:

```bash
npm run deploy
```

---

## مرحله 4 — تعریف Secret ها

توکن ربات را هرگز داخل فایل نگذار:

```bash
npx wrangler secret put BALE_BOT_TOKEN
```

یک کلید مدیریت هم بساز:

```bash
npx wrangler secret put ADMIN_KEY
```

---

## مرحله 5 — تعیین گروه بله

ربات را به گروه ایونت اضافه کن.

آیدی عددی گروه را در `wrangler.toml` جلوی این مقدار بگذار:

```toml
BALE_GROUP_CHAT_ID = "YOUR_GROUP_ID"
```

اگر این مقدار را خالی بگذاری، ثبت حضور و گالری کار می‌کند، ولی عکس به گروه ارسال نمی‌شود.

---

## مرحله 6 — فعال کردن Webhook بله

بعد از اینکه Worker بالا آمد، وب‌هوک باید روی این آدرس تنظیم شود:

`https://YOUR-WORKER.workers.dev/webhook`

برای Bot API بله، متد `setWebhook` را با URL بالا صدا بزن.

نمونه درخواست:

```bash
curl -X POST "https://tapi.bale.ai/botYOUR_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://YOUR-WORKER.workers.dev/webhook"}'
```

---

## استفاده داخل گروه

در گروه به ربات بگو:

`/start`

ربات دکمه:

`📸 ثبت حضور در ایونت`

را نمایش می‌دهد.

عضو روی دکمه می‌زند، نام و عکسش را ثبت می‌کند و در لیست حاضرین می‌آید.

برای دیدن تعداد حاضرین:

`/count`

---

## پنل ادمین

لیست JSON:

`/admin?key=ADMIN_KEY`

ریست ایونت:

```bash
curl -X POST "https://YOUR-WORKER.workers.dev/admin/reset" \
  -H "Authorization: Bearer ADMIN_KEY"
```

ریست فقط حضورها و عکس‌های همین ایونت را پاک می‌کند.

---

## تغییر نام ایونت

در `wrangler.toml`:

```toml
EVENT_TITLE = "ایونت دایرکتورها"
EVENT_ID = "directors-event"
```

برای ایونت بعدی کافی است `EVENT_ID` را عوض کنی. اطلاعات ایونت قبلی پاک نمی‌شود، ولی صفحه روی ایونت جدید کار می‌کند.

---

## نکته مهم

این نسخه برای شروع سریع طراحی شده است. برای نسخه عمومی با تعداد عضو خیلی بالا بهتر است:
- احراز هویت امضاشده Mini App بله اضافه شود.
- عکس‌ها به R2 منتقل شوند.
- پنل ادمین گرافیکی ساخته شود.
