:root{
  --bg:#0b1020;
  --bg2:#070b16;
  --card:rgba(255,255,255,.06);
  --card2:rgba(255,255,255,.08);
  --stroke:rgba(255,255,255,.12);
  --text:#eaf0ff;
  --muted:rgba(234,240,255,.72);
  --brand:#4f7cff;
  --brand2:#8a5bff;
  --ok:#31d27a;
  --warn:#ffd166;
  --danger:#ff5b7a;
  --shadow: 0 20px 60px rgba(0,0,0,.45);
  --shadow2: 0 10px 30px rgba(0,0,0,.35);
  --r: 18px;
  --r2: 24px;
}

*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;
  color:var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Apple Color Emoji","Segoe UI Emoji";
  background:
    radial-gradient(900px 500px at 15% 10%, rgba(79,124,255,.28), transparent 60%),
    radial-gradient(900px 500px at 85% 20%, rgba(138,91,255,.22), transparent 60%),
    radial-gradient(1200px 700px at 50% 100%, rgba(49,210,122,.10), transparent 55%),
    linear-gradient(180deg, var(--bg), var(--bg2));
  overflow-x:hidden;
}

a{color:inherit;text-decoration:none}
img{max-width:100%}

.wrap{max-width:1180px;margin:0 auto;padding:28px 18px 80px}
.container{max-width:1180px;margin:0 auto;padding:0 18px}

/* ===== NAV ===== */
.nav{
  position:sticky; top:0; z-index:50;
  backdrop-filter: blur(12px);
  background: linear-gradient(180deg, rgba(10,15,32,.72), rgba(10,15,32,.35));
  border-bottom:1px solid rgba(255,255,255,.08);
}
.nav-inner{
  max-width:1180px;
  margin:0 auto;
  padding:14px 18px;
  display:flex;align-items:center;gap:14px;justify-content:space-between;
}
.brand{
  display:flex;align-items:center;gap:10px;font-weight:800;letter-spacing:.2px;
}
.logo{
  width:34px;height:34px;border-radius:12px;
  background: radial-gradient(circle at 30% 30%, rgba(255,255,255,.35), transparent 55%),
              linear-gradient(135deg, var(--brand), var(--brand2));
  box-shadow: 0 10px 30px rgba(79,124,255,.25);
}
.nav-links{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.nav-links a{
  padding:10px 12px;border-radius:12px;
  color:var(--muted);
  transition:transform .18s ease, background .18s ease, color .18s ease;
}
.nav-links a:hover{background:rgba(255,255,255,.06); color:var(--text); transform:translateY(-1px)}
.nav-cta{display:flex;gap:10px;align-items:center}

/* ===== BUTTONS ===== */
.btn{
  display:inline-flex;align-items:center;justify-content:center;gap:10px;
  padding:12px 16px;border-radius:14px;
  border:1px solid rgba(255,255,255,.14);
  background:rgba(255,255,255,.06);
  color:var(--text);
  font-weight:700;
  cursor:pointer;
  transition: transform .18s ease, box-shadow .18s ease, background .18s ease, border-color .18s ease;
  box-shadow: 0 10px 30px rgba(0,0,0,.18);
}
.btn:hover{transform:translateY(-1px); background:rgba(255,255,255,.085); border-color:rgba(255,255,255,.2)}
.btn:active{transform:translateY(0px)}
.btn-primary{
  border:none;
  background: linear-gradient(135deg, var(--brand), var(--brand2));
  box-shadow: 0 18px 60px rgba(79,124,255,.22);
}
.btn-primary:hover{box-shadow: 0 24px 70px rgba(79,124,255,.28)}
.btn-ghost{background:transparent}
.btn-danger{background:rgba(255,91,122,.12); border-color:rgba(255,91,122,.22)}
.btn-success{background:rgba(49,210,122,.12); border-color:rgba(49,210,122,.22)}
.btn-sm{padding:10px 12px;border-radius:12px;font-size:14px}

/* ===== BADGE ===== */
.badge{
  display:inline-flex;align-items:center;gap:8px;
  padding:7px 10px;border-radius:999px;
  border:1px solid rgba(255,255,255,.14);
  background:rgba(255,255,255,.06);
  color:var(--muted);
  font-weight:700;
  font-size:12px;
}
.badge .dot{width:7px;height:7px;border-radius:99px;background:var(--ok); box-shadow:0 0 0 4px rgba(49,210,122,.12)}

/* ✅ statusy badge dla JS (QM) */
.badge.ok{
  border-color: rgba(49,210,122,.28);
  background: rgba(49,210,122,.10);
  color: rgba(234,240,255,.92);
}
.badge.warn{
  border-color: rgba(255,209,102,.30);
  background: rgba(255,209,102,.10);
  color: rgba(234,240,255,.90);
}

/* ===== HERO (stary layout) ===== */
.hero{
  padding:54px 0 10px;
  position:relative;
}
.hero-grid{
  display:grid;
  grid-template-columns: 1.08fr .92fr;
  gap:26px;
  align-items:stretch;
}
.hero-card{
  border-radius: var(--r2);
  border:1px solid rgba(255,255,255,.12);
  background:
    radial-gradient(800px 300px at 30% 0%, rgba(79,124,255,.22), transparent 60%),
    radial-gradient(800px 300px at 80% 20%, rgba(138,91,255,.18), transparent 60%),
    rgba(255,255,255,.05);
  box-shadow: var(--shadow);
  padding:28px;
  overflow:hidden;
  position:relative;
}
.hero-card:before{
  content:"";
  position:absolute; inset:-2px;
  background: radial-gradient(400px 120px at 20% 10%, rgba(255,255,255,.18), transparent 60%);
  pointer-events:none;
  opacity:.7;
}
.h1{
  font-size:44px;
  line-height:1.05;
  margin:14px 0 12px;
  letter-spacing:-.6px;
}
.p{
  color:var(--muted);
  font-size:16.5px;
  line-height:1.6;
  margin:0 0 18px;
}
.hero-cta{display:flex;gap:12px;flex-wrap:wrap;align-items:center;margin-top:10px}
.stats{
  display:grid;
  grid-template-columns: repeat(3,1fr);
  gap:12px;
  margin-top:18px;
}
.stat{
  border-radius:16px;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.05);
  padding:12px 12px;
}
.stat strong{display:block;font-size:18px}
.stat span{color:var(--muted); font-size:12.5px}

/* ===== PANEL / LIST ===== */
.panel{
  border-radius: var(--r2);
  border:1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.05);
  box-shadow: var(--shadow2);
  padding:18px;
}
.panel h3{margin:0 0 10px;font-size:16px}
.panel .list{display:grid;gap:10px}
.item{
  border-radius:16px;
  border:1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.05);
  padding:12px;
  display:flex;gap:10px;align-items:flex-start;
}
.icon{
  width:34px;height:34px;border-radius:14px;
  background: rgba(255,255,255,.08);
  border:1px solid rgba(255,255,255,.14);
  display:flex;align-items:center;justify-content:center;
}
.item b{display:block}
.item div{color:var(--muted); font-size:13px; line-height:1.4}

/* ===== SECTIONS / GRIDS ===== */
.section{padding:26px 0}
.section-title{
  display:flex;align-items:flex-end;justify-content:space-between;gap:14px;flex-wrap:wrap;
  margin:22px 0 14px;
}
.section-title h2{margin:0;font-size:22px;letter-spacing:-.2px}
.section-title p{margin:0;color:var(--muted);max-width:640px}

.cards{
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap:14px;
}
.card{
  border-radius: var(--r);
  border:1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.05);
  padding:16px;
  box-shadow: 0 12px 30px rgba(0,0,0,.22);
  transition: transform .18s ease, background .18s ease;
}
.card:hover{transform:translateY(-2px); background:rgba(255,255,255,.07)}
.card h3{margin:0 0 8px;font-size:16px}
.card p{margin:0;color:var(--muted);line-height:1.55;font-size:14px}

.hr{
  height:1px;
  background:rgba(255,255,255,.10);
  margin:16px 0;
}

.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}

/* ===== KPI ===== */
.kpi{
  display:flex;align-items:center;justify-content:space-between;gap:10px;
  border-radius:16px;
  border:1px solid rgba(255,255,255,.12);
  background:rgba(255,255,255,.05);
  padding:14px;
}
.kpi strong{font-size:18px}
.kpi span{color:var(--muted);font-size:12px}

/* ===== FORMS ===== */
.input{
  width:100%;
  padding:12px 14px;
  border-radius:14px;
  border:1px solid rgba(255,255,255,.14);
  background: rgba(0,0,0,.20);
  color:var(--text);
  outline:none;
}
.input::placeholder{color:rgba(234,240,255,.45)}
.form-row{display:grid;grid-template-columns: 1fr 1fr; gap:12px}

.note{
  border-radius:16px;
  border:1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.05);
  padding:12px 14px;
  color:var(--muted);
  font-size:13px;
  line-height:1.55;
}

/* ===== FOOTER ===== */
.footer{
  margin-top:28px;
  padding:26px 18px;
  border-top:1px solid rgba(255,255,255,.08);
  color:rgba(234,240,255,.55);
  text-align:center;
  background: rgba(0,0,0,.10);
}

/* ===== Animacje wejścia ===== */
.reveal{
  opacity:0;
  transform: translateY(10px);
  animation: in .55s ease forwards;
}
.reveal.d2{animation-delay:.08s}
.reveal.d3{animation-delay:.16s}
.reveal.d4{animation-delay:.24s}
@keyframes in{
  to{opacity:1; transform:translateY(0)}
}

/* ===== glow tło ===== */
.glow{
  position:absolute; inset:-180px;
  background:
    radial-gradient(500px 240px at 20% 20%, rgba(79,124,255,.18), transparent 60%),
    radial-gradient(500px 240px at 80% 30%, rgba(138,91,255,.14), transparent 60%),
    radial-gradient(600px 280px at 50% 75%, rgba(49,210,122,.08), transparent 60%);
  filter: blur(20px);
  pointer-events:none;
  opacity:.9;
}

/* ===== HERO PREMIUM ===== */
.hero-premium{
  position:relative;
  height:85vh;
  min-height:600px;
  overflow:hidden;
  display:flex;
  align-items:center;
  justify-content:center;
  text-align:center;
}

.hero-bg{ position:absolute; inset:0; }
.hero-bg img{
  width:100%;
  height:100%;
  object-fit:cover;
  transform:scale(1.05);
}
.hero-overlay{
  position:absolute;
  inset:0;
  background:linear-gradient(180deg, rgba(10,12,18,0.40) 0%, rgba(10,12,18,0.88) 72%);
}

.hero-content{
  position:relative;
  z-index:2;
  max-width:980px;
  padding:22px;
}

.hero-badge{
  display:inline-block;
  padding:8px 18px;
  border:1px solid rgba(255,255,255,0.20);
  border-radius:40px;
  font-size:12px;
  letter-spacing:2px;
  margin-bottom:18px;
  color:rgba(255,255,255,0.70);
  backdrop-filter: blur(6px);
}

.hero-content h1{
  font-size:52px;
  line-height:1.15;
  margin:0 0 16px 0;
}

.hero-content p{
  font-size:18px;
  color:rgba(255,255,255,0.78);
  margin:0 0 26px 0;
}

.hero-buttons{
  display:flex;
  gap:16px;
  justify-content:center;
  flex-wrap:wrap;
  margin-bottom:24px;
}

/* scope tylko do HERO PREMIUM */
.hero-premium .btn-primary{
  background:linear-gradient(135deg,#4f7cff,#8a5bff);
  padding:14px 26px;
  border-radius:12px;
  text-decoration:none;
  font-weight:800;
  color:#fff;
  box-shadow: 0 14px 40px rgba(0,0,0,.30);
}
.hero-premium .btn-primary:hover{ filter: brightness(1.05); }

.hero-premium .btn-ghost{
  border:1px solid rgba(255,255,255,0.22);
  padding:14px 26px;
  border-radius:12px;
  text-decoration:none;
  font-weight:800;
  color:#fff;
  background: rgba(255,255,255,0.04);
  backdrop-filter: blur(6px);
}
.hero-premium .btn-ghost:hover{ background: rgba(255,255,255,0.06); }

.hero-stats{
  display:flex;
  gap:18px;
  justify-content:center;
  flex-wrap:wrap;
}
.hero-stat{
  border:1px solid rgba(255,255,255,0.14);
  background: rgba(255,255,255,0.05);
  border-radius:16px;
  padding:12px 16px;
  min-width:160px;
  backdrop-filter: blur(6px);
}
.hero-stat strong{
  display:block;
  font-size:20px;
}
.hero-stat span{
  display:block;
  font-size:12px;
  color:rgba(255,255,255,0.75);
}

/* ===== PRODUCTS (NOWE - qm-products) ===== */
.qm-products{ padding: 4px 0 0; }
.qm-products .qm-head{ margin: 0 0 18px; }

.qm-products-grid{
  display:grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.qm-product-card{
  border-radius: 18px;
  border:1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.05);
  overflow:hidden;
  box-shadow: 0 12px 30px rgba(0,0,0,.22);
  transition: transform .18s ease, background .18s ease, border-color .18s ease, box-shadow .18s ease;
}
.qm-product-card:hover{
  transform: translateY(-2px);
  background: rgba(255,255,255,.07);
  border-color: rgba(255,255,255,.18);
  box-shadow: 0 14px 34px rgba(0,0,0,.30);
}

/* ✅ IDEALNY KADR: domyślnie 18%, per-karta przez --focus-y */
.qm-product-media{
  aspect-ratio: 16 / 10;
  height: auto;
  background: rgba(0,0,0,.20);
  border-bottom:1px solid rgba(255,255,255,.10);
  overflow:hidden;
  position: relative;
}
.qm-product-media img{
  width:100%;
  height:100%;
  object-fit: cover;
  object-position: 50% var(--focus-y, 18%);
  display:block;
  transform: scale(1.02);
  transition: transform .25s ease, object-position .25s ease;
}
.qm-product-card:hover .qm-product-media img{
  transform: scale(1.06);
  object-position: 50% var(--focus-y-hover, 14%);
}

.qm-product-body{ padding: 14px 14px 16px; }
.qm-product-body h3{ margin: 0 0 6px; font-size: 16px; letter-spacing: -.1px; }
.qm-product-body .muted{ margin: 0 0 12px; opacity: .82; }

.qm-product-meta{
  display:flex;
  flex-wrap:wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.qm-chip{
  padding:6px 9px;
  border-radius:999px;
  background: rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.12);
  color: var(--muted);
  font-size:12px;
  font-weight:800;
}

/* ===== LEGACY product-grid ===== */
.product-grid{
  display:grid;
  grid-template-columns: repeat(3, 1fr);
  gap:14px;
}
.product-card{
  border-radius: 18px;
  border:1px solid rgba(255,255,255,.12);
  background: rgba(255,255,255,.05);
  overflow:hidden;
  box-shadow: 0 12px 30px rgba(0,0,0,.22);
  transition: transform .18s ease, background .18s ease;
}
.product-card:hover{transform: translateY(-2px); background: rgba(255,255,255,.07);}
.product-img-wrapper{ height:180px; overflow:hidden; border-bottom:1px solid rgba(255,255,255,.10); }
.product-img-real{
  width:100%;
  height:100%;
  object-fit:cover;
  object-position: 50% 18%;
  display:block;
  transition: transform .25s ease, object-position .25s ease;
}
.product-card:hover .product-img-real{ transform: scale(1.05); object-position: 50% 14%; }
.product-body{ padding:14px; }
.product-title{ margin:0 0 6px; font-size:15px; }
.product-meta{ color:var(--muted); font-size:12.5px; line-height:1.4; }
.product-tags{ display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
.tag{
  padding:6px 9px; border-radius:999px;
  background: rgba(255,255,255,.06);
  border:1px solid rgba(255,255,255,.12);
  color: var(--muted);
  font-size:12px;
  font-weight:800;
}

/* ===== RWD ===== */
@media (max-width: 980px){
  .hero-grid{grid-template-columns:1fr; }
  .h1{font-size:38px}
  .cards{grid-template-columns:1fr}
  .grid-2, .grid-3{grid-template-columns:1fr}
  .stats{grid-template-columns:1fr}
  .form-row{grid-template-columns:1fr}

  .hero-visual{height: 260px;}
  .product-grid{grid-template-columns: 1fr;}
  .qm-products-grid{grid-template-columns: repeat(2, minmax(0, 1fr));}
}

@media (max-width: 900px){
  .hero-content h1{font-size:36px;}
  .hero-premium{min-height:560px;}
}

@media (max-width: 640px){
  .qm-products-grid{grid-template-columns: 1fr;}
}
/* ===== QM TABLE + DETAIL (dopinka) ===== */
.qm-table-wrap{ overflow:auto; border-radius:16px; border:1px solid rgba(255,255,255,.10); background:rgba(0,0,0,.18); }
.qm-table{ width:100%; border-collapse: collapse; min-width: 920px; }
.qm-table thead th{
  text-align:left;
  font-size:12px;
  color:rgba(234,240,255,.70);
  letter-spacing:.4px;
  padding:12px 12px;
  border-bottom:1px solid rgba(255,255,255,.10);
  background:rgba(255,255,255,.03);
}
.qm-table td{
  padding:12px 12px;
  border-bottom:1px solid rgba(255,255,255,.08);
  vertical-align:middle;
}
.qm-table .right{ text-align:right; }
.qm-row{ cursor:pointer; transition: background .15s ease; }
.qm-row:hover{ background:rgba(255,255,255,.04); }
.qm-row.active{ background:rgba(79,124,255,.10); outline:1px solid rgba(79,124,255,.20); }
.qm-cell-title b{ font-size:14px; }
.qm-sub{ color:rgba(234,240,255,.62); font-size:12px; margin-top:2px; }

.qm-detail-title{ font-weight:900; font-size:16px; letter-spacing:-.2px; }
.qm-bars{ display:grid; gap:12px; }
.qm-bar-head{ display:flex; justify-content:space-between; gap:10px; color:rgba(234,240,255,.78); font-size:12px; }
.qm-bar-track{
  height:10px;
  border-radius:999px;
  background: rgba(255,255,255,.08);
  border: 1px solid rgba(255,255,255,.10);
  overflow:hidden;
}
.qm-bar-fill{
  height:100%;
  border-radius:999px;
  background: linear-gradient(135deg, var(--brand), var(--brand2));
  box-shadow: 0 10px 30px rgba(79,124,255,.18);
}

.qm-bp-card{ position:relative; }
.qm-bp-top{ display:flex; gap:8px; flex-wrap:wrap; justify-content:space-between; align-items:center; }
.qm-bp-tags{ display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
.qm-bp-btn{ width:100%; }
