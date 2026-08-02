# CPV Arabia — Regional Productivity Dashboard

## Running it

**Locally (quick preview, no cross-device sync):**

```bash
cd path/to/folder
python3 -m http.server 8000
```

Then open `http://localhost:8000`. This works for browsing and for
editing on that one browser, but `/api/state` (see below) doesn't
exist under a plain `http.server`, so edits stay in that browser's
`localStorage` only — same as before this pass.

**On Vercel (real deployment, edits shared across every device) —
one-time setup:**

1. Push this folder to a GitHub repo and import it in Vercel (or run
   `vercel` from this folder), so `index.html`, `app.js`, `regions.kml`,
   `package.json`, and the `api/` folder all get deployed together.
2. In the Vercel project dashboard: **Storage → Create Database → KV**
   (Vercel's managed Redis, on the free tier). Create it and connect it
   to this project — Vercel automatically adds the `KV_REST_API_URL` /
   `KV_REST_API_TOKEN` environment variables the API route needs.
3. Redeploy (or it auto-redeploys once the KV store is connected).

That's it — no separate database to manage, no API keys to paste in
code. `npm install` (Vercel runs this automatically on deploy) picks up
the `@vercel/kv` dependency in `package.json`.

You can also test this locally with `vercel dev` (from the Vercel CLI)
instead of `python3 -m http.server`, which runs `/api/state` locally too.

---

## What changed in this pass (شرح بالعربي تحت كل نقطة)

### 0. Edits now sync across devices and survive a cache clear

Every edit (boundary shapes, region names/descriptions/colors,
imported or bulk-edited employees, labels, thresholds, visibility
toggles) used to live only in that one browser's `localStorage` — so
a different device, a different browser, or clearing site data saw the
defaults again, as if nothing had ever been changed.

There's now a tiny serverless API, `/api/state`, backed by a Vercel KV
database (see the setup steps above). The app still writes instantly
to `localStorage` (so the UI never waits on a network round-trip), and
in the background pushes the same change to `/api/state`. On load, the
app first pulls the latest shared state down from `/api/state` into
`localStorage`, then renders — so opening the dashboard from any
device or browser, or after clearing the cache, now picks up
everyone's latest edits instead of starting fresh. If the API isn't
reachable (offline, running via plain `http.server`, KV not connected
yet) the app quietly falls back to that device's local cache only —
nothing breaks, it just stops syncing until the API is reachable again.

> بقى فيه قاعدة بيانات مشتركة (Vercel KV) وراء نقطة API صغيرة
> (`/api/state`). أي تعديل (حدود منطقة، اسم/لون منطقة، موظفين، إعدادات)
> بيتسجل فورًا في نفس الجهاز وكمان بيتبعت في الخلفية للسيرفر. ولما تفتح
> الداشبورد من أي جهاز أو متصفح تاني، أو حتى بعد مسح الكاش، البرنامج
> بيسحب أحدث نسخة من السيرفر الأول قبل ما يعرض أي حاجة — يعني كل
> التعديلات بتفضل موجودة لأي حد يفتح الرابط. لازم تعمل خطوات الإعداد
> اللي فوق (ربط Vercel KV) مرة واحدة عشان الميزة دي تشتغل بعد الرفع.

### -1. Mobile layout

The dashboard previously had one breakpoint (tablet-width, 1000px) and
no phone-specific layout: the icon sidebar, the side-by-side
map+KPI-rail split, fixed-width panels, and multi-column chart grids
all stayed at desktop proportions on a phone screen, which meant
clipped content and things that didn't fit.

Below 720px width, the layout now reflows for touch/phone use: the
sidebar becomes a bottom icon bar instead of a left column, the map
and KPI rail stack vertically instead of splitting the width, the
region panel and modals go full-width instead of a fixed desktop
pixel size, and the analytics chart grids collapse to a single column.

> الداشبورد قبل كده معندهوش تصميم مخصص للموبايل، فكانت الشاشات بتتقص أو
> العناصر بتتزنق. دلوقتي لو فتحت من موبايل (عرض أقل من 720px)، الشريط
> الجانبي بيبقى شريط سفلي بالأيقونات، والخريطة وكروت الـ KPI بيترتبوا
> فوق بعض بدل جنب بعض، ولوحة تفاصيل المنطقة والنوافذ المنبثقة بتاخد
> عرض الشاشة كاملة، والرسوم البيانية بترتب في عمود واحد.

### -2. Custom region color on the map

Admin → Regions now has a color swatch/picker next to each region's
name — pick any color and the map, the map hover tooltip color swatch,
and the "Productivity by Region" chart all use it for that region
instead of the automatic productivity-tier color. A **"Reset color"**
button appears once a region has a custom color, to go back to the
automatic tier-based coloring.

> في Admin → Regions بقى جنب كل منطقة دايرة لون تقدر تدوس عليها وتختار
> أي لون تحبه — الخريطة والرسم البياني هيستخدموا اللون ده للمنطقة دي
> بدل اللون التلقائي (المبني على الإنتاجية). لو عايز ترجع للون
> التلقائي، فيه زرار "Reset color" هيظهر جنب أي منطقة معدّلة.

---

## What changed in the previous pass (شرح بالعربي تحت كل نقطة)

### 1. Boundary editing — unlimited points, not just the original vertex count

Region boundary editing no longer limits you to dragging the exact
handles the source KML happened to have (e.g. Abha's 6). Open a
region, click **"Edit boundary"**, and you now get two kinds of
handles:

- **Solid dots** on every existing vertex — drag to reposition,
  **double-click (or right-click) to delete** that point.
- **Small "+" markers** on the midpoint of every edge — **click to
  insert a brand-new point** right there, splitting that edge in two.

Add or remove as many points as you like, in any shape, then click
**"Save boundary"** (or <kbd>Esc</kbd> to cancel). Edits are still
stored separately and re-applied automatically over a freshly
re-imported KML.

> تعديل حدود المنطقة بقى بدون حد أقصى للنقاط. لما تفتح "Edit boundary"
> هتلاقي نوعين من العلامات: نقاط صلبة على كل ركن — اسحبها لتحريكها،
> ودبل كليك (أو كليك يمين) عليها يمسحها. وعلامات "+" صغيرة في منتصف كل
> ضلع — كليك عليها يضيف نقطة جديدة في مكانها. بالطريقة دي تقدر تكبّر أو
> تفصّل شكل أي منطقة (زي أبها) لأي عدد من النقاط تحتاجه.

### 2. Excel/CSV import now asks before overwriting duplicate employees

Importing a sheet that includes a name already in the system no
longer silently creates a second record. The app now checks for
duplicates **by employee name** first, and if any are found, shows a
dialog before touching any data:

- **استبدال البيانات (Replace)** — overwrite the existing employee's
  data with what's in the file, keeping their existing ID.
- **تجاهل المكرر (Skip)** — leave existing employees untouched; only
  the genuinely new names in the file get added.
- **إلغاء الاستيراد (Cancel)** — abort the whole import, nothing is
  written.

Column matching also now recognizes common **Arabic headers** (e.g.
"الاسم", "المنطقة", "متوسط 3 أشهر") in addition to English ones, so a
sheet with Arabic column titles works without renaming anything.

> رفع ملف إكسيل/CSV فيه موظف موجود بالفعل (بنفس الاسم) مش هيكرر البيانات
> تلقائيًا. البرنامج بيدور على الأسماء المكررة الأول، ولو لقى، بيسألك:
> تستبدل بياناتهم القديمة، ولا تتجاهل المكرر وتضيف الجدد بس، ولا تلغي
> الاستيراد بالكامل. وكمان أسماء الأعمدة بقت تتعرف على العناوين العربية
> ("الاسم"، "المنطقة"، "متوسط 3 أشهر"...) مش بس الإنجليزية.

### 3. Company Productivity KPI is now a real total, not an average

The main "Company Productivity" card on the dashboard now shows the
**sum** of every employee's productivity (a true company-wide total),
with the 3-month average and employee count as supporting context
underneath — matching how region totals and region shares are
calculated everywhere else (map hover, region panel).

Imports that only provide the July figure and the 3-month average (no
separate "overall productivity" column) now also populate the general
productivity field correctly, so ranking and best/worst-region
calculations don't quietly treat those employees as zero.

> كارت "Company Productivity" الرئيسي بقى بيعرض **إجمالي** إنتاجية كل
> الموظفين (مجموع فعلي)، ومتوسط آخر 3 أشهر وعدد الموظفين تحته كتفاصيل —
> بنفس منطق إجمالي ونسبة كل منطقة الموجودة في الخريطة ولوحة المنطقة.
> ولو رفعت ملف فيه بس إنتاجية يوليو ومتوسط 3 أشهر (من غير عمود إنتاجية
> عامة منفصل)، البرنامج بقى يملأ الحقل العام صح بدل ما يفضل صفر.

### 4. Region boundary editing — Abha, and any other region (from before)

Abha's polygon in your KML is real and correct, but it's genuinely tiny
(a 6-point hexagon covering a few km²) next to your other regions, which
are entire provinces — so at national zoom it reads as a dot rather than
a shape. Boundary editing (see point 1 above) is the fix — you can now
freely add points, not just move the original six.

### 5. Company Productivity is a plain number, not a percentage

Removed the `%` formatting everywhere — top-bar ticker, KPI cards,
employee table, region panel, charts, map tooltip, and the threshold
settings. Productivity (overall, July, and 3-month average) is now
whatever number you enter manually or import — no 0–100 clamping.

You can now import employees from **CSV or Excel (.xlsx/.xls)** in
Admin → Import. Column headers are matched flexibly (English or
Arabic), so your own sheet layout will usually just work. Expected
fields: name, region, status, productivity, productivityJul,
productivityAvg3m, visits, completedTasks, projects.

### 6. Customizable dashboard labels

Admin → Labels lets you rename anything shown on the Overview
dashboard: KPI card titles, the ticker label, chart titles, region
panel stat names, tier names (Elite/Good/Needs Attention/Critical),
and an optional unit suffix for productivity numbers (e.g. "pts").
"Reset to Defaults" is available too.

### 7. Map hover shows employee count, productivity, and share of total

Hovering (or clicking) a region shows: employee count, average July
productivity, and the region's **percentage share of total company
productivity** — the one legitimate percentage left, since it's a
share of a whole rather than a raw score. Clicking a region also opens
the full region panel with total (Jul), 3-month average, visits,
tasks, projects, and top performers.

### 8. 3-month average now shown per employee in the region panel

Clicking a region and scrolling to "Top Performers" now shows each
employee's July productivity **and** their 3-month average stacked
together, instead of just the July figure.

> لما تدوس على أي منطقة، قائمة "Top Performers" بقت تعرض تحت كل موظف
> رقمين: إنتاجية يوليو ومتوسط آخر 3 أشهر مع بعض، مش رقم يوليو بس.

### 9. Bulk select, edit, and delete in the Employee Directory

The Employees table now has a checkbox column:

- Tick individual rows to select some employees, or use the header
  checkbox to **select all employees matching the current filters**
  (across every page, not just the visible one).
- A toolbar appears once anything is selected, with **"Edit
  selected"** (bulk-set region, status, productivity, July
  productivity, and/or 3-month average — any field left as "No
  change" keeps each employee's existing value) and **"Delete
  selected"** (with a confirmation showing how many will be removed).

> جدول الموظفين بقى فيه عمود تشيك بوكس: تقدر تحدد موظفين معينين، أو
  تستخدم التشيك بوكس اللي فوق عشان تحدد كل الموظفين المطابقين للفلاتر
  الحالية (في كل الصفحات مش الظاهرة بس). لما تحدد أي عدد، هيظهر شريط
  فوق الجدول فيه زرار **"Edit selected"** (تعدّل المنطقة/الحالة/
  الإنتاجية لكل المحددين مرة واحدة — أي حقل تسيبه "No change" بيفضل
  زي ما هو لكل موظف) وزرار **"Delete selected"** (بتأكيد قبل الحذف).

---

## Note on the employee pins in your KML

Your `regions.kml` also has ~51 point placemarks with real employee
names — the app correctly ignores these when reading regions (points
can't form a boundary). If you'd like those turned into actual employee
records (auto-assigned to whichever region contains each pin), that's
a well-defined next step — just say the word.
