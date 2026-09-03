const API_BASE = "https://tapi.bale.ai";

function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...extra,
    },
  });
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function faDigits(value) {
  return String(value).replace(/\d/g, d => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
}

function nowTehran() {
  return new Intl.DateTimeFormat("fa-IR", {
    timeZone: "Asia/Tehran",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date());
}

function getBaseUrl(request, env) {
  return (env.APP_URL || new URL(request.url).origin).replace(/\/+$/, "");
}

async function baleCall(env, method, body) {
  if (!env.BALE_BOT_TOKEN) throw new Error("BALE_BOT_TOKEN تنظیم نشده است");
  const url = `${API_BASE}/bot${env.BALE_BOT_TOKEN}/${method}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {"content-type": "application/json"},
    body: JSON.stringify(body),
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok || out?.ok === false) {
    throw new Error(out?.description || `Bale API error: ${res.status}`);
  }
  return out;
}

async function baleSendPhoto(env, chatId, bytes, mime, filename, caption) {
  if (!env.BALE_BOT_TOKEN || !chatId) return;
  const form = new FormData();
  form.append("chat_id", String(chatId));
  form.append("caption", caption);
  form.append("photo", new File([bytes], filename || "arrival.jpg", { type: mime || "image/jpeg" }));
  const res = await fetch(`${API_BASE}/bot${env.BALE_BOT_TOKEN}/sendPhoto`, {
    method: "POST",
    body: form,
  });
  const out = await res.json().catch(() => ({}));
  if (!res.ok || out?.ok === false) {
    throw new Error(out?.description || `sendPhoto failed: ${res.status}`);
  }
}

async function addArrival(env, record, photoBytes, mime) {
  const indexKey = `event:${record.eventId}:index`;
  const oldIndex = (await env.ARRIVALS.get(indexKey, "json")) || [];
  const filtered = oldIndex.filter(x => x.userKey !== record.userKey);
  const next = [{ id: record.id, userKey: record.userKey, name: record.name, at: record.at }, ...filtered].slice(0, 250);

  await Promise.all([
    env.ARRIVALS.put(`event:${record.eventId}:record:${record.id}`, JSON.stringify(record)),
    env.ARRIVALS.put(`event:${record.eventId}:photo:${record.id}`, photoBytes, {
      metadata: { mime: mime || "image/jpeg" }
    }),
    env.ARRIVALS.put(indexKey, JSON.stringify(next)),
    env.ARRIVALS.put(`event:${record.eventId}:user:${record.userKey}`, record.id),
  ]);
}

async function listArrivals(env, eventId) {
  return (await env.ARRIVALS.get(`event:${eventId}:index`, "json")) || [];
}

function eventId(env) {
  return env.EVENT_ID || "directors-event";
}

function eventTitle(env) {
  return env.EVENT_TITLE || "ایونت دایرکتورها";
}

function appHtml(request, env) {
  const title = escapeHtml(eventTitle(env));
  const eid = escapeHtml(eventId(env));
  const groupNote = env.BALE_GROUP_CHAT_ID
    ? "بعد از ثبت، عکس شما در گروه هم منتشر می‌شود."
    : "حضور شما در گالری همین صفحه ثبت می‌شود.";

  return `<!doctype html>
<html lang="fa" dir="rtl">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"/>
  <meta name="theme-color" content="#091323"/>
  <title>${title}</title>
  <style>
    *{box-sizing:border-box}
    body{margin:0;font-family:Tahoma,Arial,sans-serif;background:
      radial-gradient(circle at 15% 10%,#17345b 0,#091323 34%,#050a12 100%);
      color:#fff;min-height:100vh}
    .wrap{max-width:720px;margin:auto;padding:18px 14px 34px}
    .hero{border:1px solid #ffffff1f;border-radius:28px;padding:22px;
      background:linear-gradient(145deg,#ffffff13,#ffffff06);backdrop-filter:blur(14px);
      box-shadow:0 24px 60px #0007;overflow:hidden;position:relative}
    .hero:after{content:"";position:absolute;width:180px;height:180px;border-radius:50%;
      background:#f6c75822;left:-65px;top:-70px;filter:blur(5px)}
    .badge{display:inline-flex;gap:8px;align-items:center;background:#f6c7581f;
      border:1px solid #f6c75855;color:#ffe49a;padding:8px 12px;border-radius:999px;font-size:13px}
    h1{font-size:28px;margin:16px 0 8px;line-height:1.35}
    .sub{color:#b8c5d8;line-height:1.9;font-size:14px}
    .count{font-size:52px;font-weight:800;margin-top:12px;color:#ffe49a}
    .countlabel{color:#9aacbf}
    .card{margin-top:14px;border:1px solid #ffffff1a;background:#0c1729d9;border-radius:24px;padding:16px}
    label{display:block;font-size:13px;color:#aebcd0;margin:10px 4px 7px}
    input[type=text]{width:100%;padding:15px 14px;border-radius:16px;border:1px solid #ffffff20;
      background:#ffffff0b;color:#fff;outline:none;font-size:16px}
    .photoPick{display:block;border:1px dashed #ffffff45;border-radius:18px;padding:18px;text-align:center;
      background:#ffffff08;cursor:pointer}
    .photoPick strong{display:block;margin-bottom:6px}
    .preview{width:100%;max-height:340px;object-fit:cover;border-radius:18px;margin-top:12px;display:none}
    button{width:100%;border:0;border-radius:18px;padding:16px;margin-top:14px;font-size:16px;font-weight:800;
      background:linear-gradient(90deg,#f0bf45,#ffe78e);color:#142033;cursor:pointer}
    button:disabled{opacity:.55}
    .status{min-height:24px;text-align:center;color:#bcd0e9;margin-top:10px;font-size:13px}
    .sectionTitle{display:flex;justify-content:space-between;align-items:center;margin:22px 3px 10px}
    .sectionTitle h2{font-size:18px;margin:0}
    .gallery{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
    .person{border:1px solid #ffffff16;background:#0b1525;border-radius:20px;overflow:hidden}
    .person img{width:100%;aspect-ratio:1/1;object-fit:cover;background:#101d31}
    .person .meta{padding:11px}
    .person .name{font-weight:800;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .person .time{font-size:11px;color:#92a6be;margin-top:6px}
    .empty{grid-column:1/-1;border:1px dashed #ffffff25;border-radius:18px;padding:28px;text-align:center;color:#91a4bc}
    .foot{font-size:11px;color:#687e98;text-align:center;margin-top:20px;line-height:1.8}
    @media(min-width:620px){.gallery{grid-template-columns:repeat(3,1fr)}}
  </style>
</head>
<body>
<div class="wrap">
  <section class="hero">
    <div class="badge">🏆 BILLIONERS TEAM</div>
    <h1>${title}</h1>
    <div class="sub">رسیدی؟ عکس خودت را ثبت کن تا حضور تو به جمع دایرکتورها اضافه شود.</div>
    <div class="count" id="count">۰</div>
    <div class="countlabel">نفر تا الان رسیده‌اند</div>
  </section>

  <section class="card">
    <label>نام و نام خانوادگی</label>
    <input id="name" type="text" maxlength="60" placeholder="مثلاً شهریار اشرفی" autocomplete="name"/>

    <label>عکس حضور</label>
    <label class="photoPick" for="photo">
      <strong>📸 عکس بگیر یا انتخاب کن</strong>
      <span style="color:#92a6be;font-size:12px">عکس قبل از ارسال به‌صورت خودکار کم‌حجم می‌شود</span>
    </label>
    <input id="photo" type="file" accept="image/*" capture="user" hidden/>
    <img id="preview" class="preview" alt="پیش‌نمایش"/>

    <button id="submit">✅ ثبت حضور در ایونت</button>
    <div id="status" class="status">${escapeHtml(groupNote)}</div>
  </section>

  <div class="sectionTitle">
    <h2>رسیده‌های ایونت</h2>
    <span id="smallCount" style="color:#ffe49a;font-size:13px"></span>
  </div>
  <section id="gallery" class="gallery"></section>

  <div class="foot">نسخه ۱ • مینی‌اپ حضور و عکس ایونت دایرکتورها<br/>اطلاعات فقط برای همین ایونت ذخیره می‌شود.</div>
</div>

<script>
const EVENT_ID = ${JSON.stringify(eid)};
const el = id => document.getElementById(id);
let compressed = null;

function toFa(v){return String(v).replace(/\\d/g,d=>"۰۱۲۳۴۵۶۷۸۹"[Number(d)])}

async function compressImage(file){
  const bitmap = await createImageBitmap(file);
  const max = 1080;
  const ratio = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * ratio), h = Math.round(bitmap.height * ratio);
  const canvas = document.createElement("canvas");
  canvas.width=w; canvas.height=h;
  canvas.getContext("2d").drawImage(bitmap,0,0,w,h);
  const blob = await new Promise(r=>canvas.toBlob(r,"image/jpeg",0.78));
  return blob;
}

el("photo").addEventListener("change", async e=>{
  const file=e.target.files?.[0];
  if(!file)return;
  el("status").textContent="در حال آماده‌سازی عکس…";
  try{
    compressed=await compressImage(file);
    el("preview").src=URL.createObjectURL(compressed);
    el("preview").style.display="block";
    el("status").textContent="عکس آماده است.";
  }catch(err){
    compressed=file;
    el("preview").src=URL.createObjectURL(file);
    el("preview").style.display="block";
    el("status").textContent="عکس انتخاب شد.";
  }
});

async function load(){
  const r=await fetch("/api/arrivals?event="+encodeURIComponent(EVENT_ID),{cache:"no-store"});
  const data=await r.json();
  const items=data.items||[];
  el("count").textContent=toFa(items.length);
  el("smallCount").textContent=toFa(items.length)+" نفر";
  el("gallery").innerHTML=items.length?items.map(x=>\`
    <article class="person">
      <img loading="lazy" src="/api/photo/\${encodeURIComponent(x.id)}?event=\${encodeURIComponent(EVENT_ID)}" alt="">
      <div class="meta">
        <div class="name">\${escapeHtml(x.name)}</div>
        <div class="time">✅ رسیده • \${escapeHtml(x.at)}</div>
      </div>
    </article>\`).join(""):\`<div class="empty">هنوز کسی ثبت حضور نکرده؛ اولین نفر باش 🌟</div>\`;
}

function escapeHtml(s){
  return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
}

el("submit").addEventListener("click",async()=>{
  const name=el("name").value.trim();
  if(!name){el("status").textContent="نامت را وارد کن.";return}
  if(!compressed){el("status").textContent="یک عکس انتخاب کن.";return}

  el("submit").disabled=true;
  el("status").textContent="در حال ثبت حضور…";

  const fd=new FormData();
  fd.append("event",EVENT_ID);
  fd.append("name",name);
  fd.append("photo",compressed,"arrival.jpg");

  try{
    const r=await fetch("/api/arrive",{method:"POST",body:fd});
    const data=await r.json();
    if(!r.ok)throw new Error(data.error||"خطا در ثبت");
    localStorage.setItem("arrivalName",name);
    el("status").textContent="✅ حضورت ثبت شد. خوش اومدی!";
    await load();
  }catch(err){
    el("status").textContent="❌ "+err.message;
  }finally{
    el("submit").disabled=false;
  }
});

el("name").value=localStorage.getItem("arrivalName")||"";
load().catch(()=>{el("gallery").innerHTML='<div class="empty">خطا در دریافت لیست حاضرین</div>'});
setInterval(load,20000);
</script>
</body>
</html>`;
}

async function handleArrival(request, env) {
  if (!env.ARRIVALS) return json({ error: "KV binding با نام ARRIVALS تنظیم نشده است" }, 500);
  const form = await request.formData();
  const name = String(form.get("name") || "").trim().slice(0, 60);
  const incomingEvent = String(form.get("event") || eventId(env));
  const photo = form.get("photo");

  if (incomingEvent !== eventId(env)) return json({ error: "ایونت معتبر نیست" }, 400);
  if (name.length < 2) return json({ error: "نام معتبر وارد کن" }, 400);
  if (!(photo instanceof File) || photo.size < 100) return json({ error: "عکس معتبر انتخاب کن" }, 400);
  if (photo.size > 2_500_000) return json({ error: "حجم عکس باید کمتر از ۲.۵ مگابایت باشد" }, 413);
  if (!String(photo.type).startsWith("image/")) return json({ error: "فقط فایل تصویری مجاز است" }, 415);

  const ip = request.headers.get("cf-connecting-ip") || crypto.randomUUID();
  const ua = request.headers.get("user-agent") || "";
  const userKey = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(`${ip}|${ua}|${name.toLowerCase()}`)
  ).then(buf => [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("").slice(0,32));

  const previousId = await env.ARRIVALS.get(`event:${incomingEvent}:user:${userKey}`);
  const id = previousId || crypto.randomUUID();
  const bytes = await photo.arrayBuffer();
  const at = nowTehran();
  const record = {
    id,
    userKey,
    name,
    at,
    eventId: incomingEvent,
    createdAt: new Date().toISOString(),
    mime: photo.type || "image/jpeg",
  };

  await addArrival(env, record, bytes, record.mime);

  let groupPublished = false;
  if (env.BALE_BOT_TOKEN && env.BALE_GROUP_CHAT_ID) {
    try {
      const caption = `✅ ${name} رسید به ${eventTitle(env)}\n🕒 ${at}`;
      await baleSendPhoto(env, env.BALE_GROUP_CHAT_ID, bytes, record.mime, "arrival.jpg", caption);
      groupPublished = true;
    } catch (e) {
      console.log("Bale publish error:", e.message);
    }
  }

  return json({ ok: true, id, groupPublished });
}

async function handlePhoto(request, env, id) {
  if (!env.ARRIVALS) return new Response("KV not configured", { status: 500 });
  const eid = new URL(request.url).searchParams.get("event") || eventId(env);
  if (eid !== eventId(env)) return new Response("Not found", { status: 404 });

  const result = await env.ARRIVALS.getWithMetadata(`event:${eid}:photo:${id}`, "arrayBuffer");
  if (!result.value) return new Response("Not found", { status: 404 });
  return new Response(result.value, {
    headers: {
      "content-type": result.metadata?.mime || "image/jpeg",
      "cache-control": "public, max-age=600",
    },
  });
}

async function sendBotMenu(env, chatId) {
  const url = (env.APP_URL || "").replace(/\/+$/, "");
  const replyMarkup = url ? {
    inline_keyboard: [[
      { text: "📸 ثبت حضور در ایونت", web_app: { url } }
    ]]
  } : undefined;

  return baleCall(env, "sendMessage", {
    chat_id: chatId,
    text: `🏆 ${eventTitle(env)}\n\nبرای ثبت حضور، روی دکمه زیر بزن و یک عکس از خودت اضافه کن.`,
    ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
  });
}

async function handleWebhook(request, env) {
  const update = await request.json().catch(() => ({}));
  const msg = update.message;
  if (!msg) return json({ ok: true });

  const chatId = msg.chat?.id;
  const text = String(msg.text || "").trim();
  if (!chatId) return json({ ok: true });

  if (["/start", "/event", "ایونت", "دایرکتورها"].some(x => text === x || text.startsWith(x + " "))) {
    try { await sendBotMenu(env, chatId); } catch (e) { console.log(e.message); }
  } else if (text === "/count" || text === "تعداد حاضرین") {
    const items = await listArrivals(env, eventId(env));
    try {
      await baleCall(env, "sendMessage", {
        chat_id: chatId,
        text: `✅ تا این لحظه ${faDigits(items.length)} نفر حضورشان را در ${eventTitle(env)} ثبت کرده‌اند.`
      });
    } catch (e) { console.log(e.message); }
  }
  return json({ ok: true });
}

async function adminPage(request, env) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("key") || "";
  if (!env.ADMIN_KEY || secret !== env.ADMIN_KEY) return new Response("Forbidden", { status: 403 });
  const items = await listArrivals(env, eventId(env));
  return json({ event: eventTitle(env), count: items.length, items });
}

async function resetEvent(request, env) {
  const auth = request.headers.get("authorization") || "";
  if (!env.ADMIN_KEY || auth !== `Bearer ${env.ADMIN_KEY}`) return json({ error: "Forbidden" }, 403);
  const eid = eventId(env);
  const items = await listArrivals(env, eid);
  const keys = [];
  for (const x of items) {
    keys.push(
      `event:${eid}:record:${x.id}`,
      `event:${eid}:photo:${x.id}`,
      `event:${eid}:user:${x.userKey}`,
    );
  }
  keys.push(`event:${eid}:index`);
  await Promise.all(keys.map(k => env.ARRIVALS.delete(k)));
  return json({ ok: true, deleted: items.length });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "GET" && path === "/") {
      return new Response(appHtml(request, env), {
        headers: { "content-type": "text/html; charset=utf-8" }
      });
    }

    if (request.method === "GET" && path === "/api/arrivals") {
      const requested = url.searchParams.get("event") || eventId(env);
      if (requested !== eventId(env)) return json({ items: [] });
      return json({ items: await listArrivals(env, requested) });
    }

    if (request.method === "GET" && path.startsWith("/api/photo/")) {
      return handlePhoto(request, env, decodeURIComponent(path.split("/").pop()));
    }

    if (request.method === "POST" && path === "/api/arrive") {
      return handleArrival(request, env);
    }

    if (request.method === "POST" && path === "/webhook") {
      return handleWebhook(request, env);
    }

    if (request.method === "GET" && path === "/admin") {
      return adminPage(request, env);
    }

    if (request.method === "POST" && path === "/admin/reset") {
      return resetEvent(request, env);
    }

    if (request.method === "GET" && path === "/health") {
      return json({ ok: true, event: eventTitle(env) });
    }

    return new Response("Not found", { status: 404 });
  }
};
