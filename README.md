# CPV Arabia — Regional Productivity Dashboard

## This update

- **Fixed:** "Map container is already initialized" error when
  re-importing a KML file.
- **Chart Builder:** new "Show data labels on chart" option — values
  now print directly on bars/slices, so a downloaded PNG carries real
  data, not just an unlabeled picture.
- **Admin → Regions:** "Hide from map" and "Delete boundary" buttons
  per region (data/employees are kept either way).
- **Branding:** Admin → Settings → Branding — upload a company logo
  and set a company name; the logo now shows in the topbar.
- **Font:** the whole app now uses Calibri (with a Segoe UI/Candara/
  Arial fallback stack, since Calibri isn't a web font).
- **Dark mode:** toggle button in the topbar (sun/moon icon), including
  a matching dark basemap on the map.
- **Map labels:** now draggable — pull overlapping labels apart by
  hand; the new position is remembered.
- **Map PNG export:** region boundary fill/outline is now hidden in
  the downloaded image (labels + basemap stay visible), matching what
  a clean report should look like.

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

### -3. Region-only data entry (no employee list required)

Admin → Regions now has a **Totals** button per region that opens a
small form: employee count, average productivity (Jul), 3-month
average, total visits, tasks, and projects. Fill this in for a region
that has zero individual employee records, and the map, KPI rail,
region panel, and every chart use those numbers automatically — you
don't need a per-employee roster to get a region onto the dashboard.

CSV/Excel import now recognizes this too: a row with a region but **no
name** is treated as a region-total row instead of an employee row
(add an `employeeCount` column for these). A single file can mix both
— rows with a name become employees, rows without one update that
region's totals — so you can import full employee-level data for some
regions and aggregate-only totals for others in one upload.

> إدارة → المناطق فيها زرار "Totals" لكل منطقة، بيفتح فورم صغير:
> عدد الموظفين، متوسط الإنتاجية (يوليو)، متوسط آخر 3 شهور، الزيارات،
> المهام، المشاريع. تملأه لمنطقة مفيهاش موظفين مُدخلين، وكل حاجة في
> الداشبورد (الخريطة، الإحصائيات، الرسوم) هتستخدم الأرقام دي تلقائي —
> مش لازم تدخل كل موظف لوحده عشان المنطقة تظهر صح. لو رفعت ملف
> إكسل/CSV وفيه صف بمنطقة من غير اسم موظف، هيتعامل معاه كإجمالي
> للمنطقة مش كموظف (ضيف عمود employeeCount له).

### -4. Chart Builder — a page to build your own charts

New "Chart Builder" tab (the icon next to Analytics). Pick **Group
By** (Region or Employee), a **Metric** (total productivity, average,
employee count, visits, tasks, projects, % share of total...), an
optional **Compare With** metric for a two-series chart, a **Chart
Type** (bar, horizontal bar, line, pie, doughnut), and — for
employee-level charts — a region filter and a "show top N" limit. A
live preview updates as you change any option; "+ Add Chart" saves it
below, where it stays (synced like everything else) until you remove
it. Every saved chart has its own "Download PNG" button.

This is what gives you the flexibility to look at the same data
either **by region** (totals/averages rolled up) or **by employee**
(individual rankings) — or both side by side as separate saved charts.

> تبويب جديد "Chart Builder" جنب الأنالتكس. تختار تجميع البيانات
> (بالمنطقة ولا بالموظف)، المقياس (إجمالي الإنتاجية، المتوسط، عدد
> الموظفين، نسبة من الإجمالي...)، ومقياس تاني تقارن بيه لو حبيت، ونوع
> الرسم (أعمدة، خط، دائري...). فيه معاينة حية بتتحدث أول ما تغير أي
> اختيار، وزرار "+ Add Chart" يحفظ الرسم تحت وهيفضل محفوظ. كل رسم
> محفوظ له زرار تحميل PNG لوحده. ده اللي بيديك المرونة تشوف نفس
> البيانات بالمنطقة أو بالموظف أو الاتنين مع بعض كرسومات منفصلة.

### -5. Print the map with region labels, and download charts as PNG

The map toolbar has three new buttons: a label icon (toggles a
permanent on-map label per region showing employee count, % share of
total productivity, 3-month average, and July productivity — all four
numbers you asked for, together), a download icon (exports the map as
a PNG, via `html2canvas`), and a print icon (opens the browser's print
dialog with everything except the map hidden, so you can print or
"save as PDF"). All four analytics charts, and every chart in the
Chart Builder, also got a "Download PNG" button — each export bakes a
small title/date header into the image so it drops straight into a
Word or PowerPoint slide without extra cropping.

`html2canvas` loads the same way the other libraries do (multiple CDN
mirrors, non-blocking) — if it can't load for some reason, the PNG
button shows a message pointing you to Print instead, so nothing hangs.

> شريط أدوات الخريطة فيه 3 أزرار جديدة: أيقونة "ليبل" بتظهر/تخفي
> تسمية ثابتة فوق كل منطقة فيها (عدد الموظفين - نسبة إنتاجية المنطقة
> من الإجمالي - متوسط آخر 3 شهور - إنتاجية يوليو) زي ما طلبت بالظبط،
> وأيقونة تحميل بتصدّر الخريطة كصورة PNG، وأيقونة طباعة بتفتح نافذة
> طباعة المتصفح (تقدر تحفظها PDF من هناك). كل الرسوم البيانية (في
> صفحة Analytics وصفحة Chart Builder) بقى لها زرار تحميل PNG كمان،
> وكل صورة بيتحط فيها عنوان وتاريخ صغير فوق عشان تنزلها وتحطها في
> وورد أو باوربوينت على طول من غير قص.

### -6. Region colors and labels now stay correct with mixed data sources

`computeRegionStats` (used by the map, KPI rail, region panel, and
every chart) now checks manual region totals whenever a region has no
employee records, instead of only ever reading from the employee list.
Company-wide totals/averages and each region's "% share of total
productivity" were recalculated the same way, so a dashboard that mixes
employee-level regions and totals-only regions adds up correctly
everywhere, not just on the map.

> `computeRegionStats` (اللي بتستخدمه الخريطة والإحصائيات ولوحة كل
> منطقة) بقى يرجع للأرقام اليدوية لو المنطقة مفيهاش موظفين مسجلين،
> بدل ما يعتمد بس على قائمة الموظفين. إجمالي ومتوسط الشركة، ونسبة كل
> منطقة من الإجمالي، اتحسبوا بنفس الطريقة، فالداشبورد اللي فيه خليط
> بين مناطق فيها موظفين ومناطق بأرقام إجمالية بس، بيطلع صح في كل حتة.

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
