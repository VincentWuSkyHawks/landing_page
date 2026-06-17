import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";
import { T, GF } from "./theme";
import { FALLBACK_PROPERTIES, fetchProperties } from "./data/properties";
import PortfolioMapPage from "./PortfolioMapPage";
import AdminLogin from "./AdminLogin";
import AdminPortal from "./AdminPortal";
import { supabase } from "./supabaseClient";

// ─── EmailJS config — fill in your IDs from emailjs.com dashboard ───
const EJS_SERVICE  = "service_na57ys5";   // e.g. "service_abc123"
const EJS_TEMPLATE = "template_18inx6j";  // e.g. "template_xyz789"
const EJS_PUBLIC   = "GQbjhdUhHgNi7qpf7";   // e.g. "aBcDeFgHiJkLm"
import houstonImg from "./assets/houston.jpg";
import austinImg from "./assets/austin.webp";
import dallasImg from "./assets/dallas.webp";
import spaceCenterImg from "./assets/Billip Space Center2.jpg";
import lockheedLogo from "./assets/lockheed.png";
import skyhawkLogo from "./assets/skyhawk_white (002).png";

// ─────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────

const TEAM = [
  { initials: "JB", name: "Andrew Billipp", role: "Board Executive", bio: "Founder of J.A. Billipp Company with over 40 years developing and investing in Houston commercial real estate. Has led every major project in the firm's portfolio.", color: T.navy },
  { initials: "JB", name: "Peter Billipp", role: "President", bio: "Founder of J.A. Billipp Company with over 40 years developing and investing in Houston commercial real estate. Has led every major project in the firm's portfolio.", color: T.navy },
  { initials: "JB", name: "Margaret Centra", role: "Board Executive", bio: "Founder of J.A. Billipp Company with over 40 years developing and investing in Houston commercial real estate. Has led every major project in the firm's portfolio.", color: T.navy },
 
  { initials: "LL", name: "Liz Lancaster", role: "Leasing & Acquisitions", bio: "Primary point of contact for all leasing and property acquisition inquiries. Deep knowledge of available properties across the Houston metro market.", color: T.navyMid },
  
  { initials: "PM", name: "Lori Hart", role: "Development Team", bio: "Oversees all ground-up development and build-to-suit projects from site selection through delivery, working with Houston's most trusted contractors.", color: T.navyLight },
  { initials: "JB", name: "Matt", role: "__", bio: "Founder of J.A. Billipp Company with over 40 years developing and investing in Houston commercial real estate. Has led every major project in the firm's portfolio.", color: T.navy },

];

const FALLBACK_CLIENTS = [
  "Lockheed Martin", "Office Depot", "CooperVision", "McDonnell Douglas",
  "Rockwell Space Ops", "Time Warner", "Administaff / Insperity",
  "Hitachi Construction", "Sears Hardware", "BFI",
];

const FALLBACK_LOGOS = [
  {
    name: "Lockheed Martin",
    abbr: "LM",
    icon: <img src={lockheedLogo} alt="Lockheed Martin" style={{ width:28, height:28, objectFit:"contain" }} />,
  },
  { name: "Office Depot", abbr: "OD" },
  { name: "CooperVision", abbr: "CV" }, { name: "McDonnell Douglas", abbr: "MD" },
  { name: "Rockwell", abbr: "RW" }, { name: "Time Warner", abbr: "TW" },
  { name: "Insperity", abbr: "IN" }, { name: "Hitachi", abbr: "HC" },
  { name: "Sears", abbr: "SH" }, { name: "BFI", abbr: "BF" },
  { name: "Roger Beasley", abbr: "RB" }, { name: "Johnson Eng.", abbr: "JE" },
];

const SERVICES = [
  {
    name: "Development & Build-to-Suit",
    desc: "Ground-up commercial and industrial development and custom build-to-suit facilities — designed around your requirements and delivered leased or purchased.",
    items: ["Office buildings", "Industrial / warehouse", "Retail centers", "Residential / resort", "Leased (Billipp owns)", "Purchased (you own)", "Site selection included", "Turnkey delivery"],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:40,height:40}}><path d="M3 21h18M5 21V7l7-4 7 4v14"/><path d="M9 21v-6h6v6"/></svg>,
    steps: [
      { n:"01", title:"Discovery", desc:"We learn your space requirements, timeline, and whether lease or purchase fits your goals." },
      { n:"02", title:"Site selection", desc:"We identify and evaluate sites that meet your operational and logistical needs." },
      { n:"03", title:"Design & approval", desc:"Facility engineered to your specs — you review and approve before a shovel turns." },
      { n:"04", title:"Construction", desc:"Billipp manages the build with trusted contractors. Regular updates, no vendor management on your end." },
      { n:"05", title:"Delivery", desc:"Move in on time. Ongoing property management by Billipp with direct team access." },
    ],
  },
  {
    name: "Investment & Sale-Leasebacks",
    desc: "Strategic acquisitions, joint ventures, and sale-leaseback transactions — we deploy our own capital and manage every asset as owners.",
    items: ["Acquisitions", "Joint ventures", "Partnerships", "Sale-leasebacks", "Immediate liquidity", "No relocation required", "Flexible lease terms", "Close in 60–90 days"],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:40,height:40}}><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-6"/></svg>,
    steps: [
      { n:"01", title:"Initial discussion", desc:"Share the opportunity — acquisition, JV structure, or sale-leaseback. We respond within 48 hours." },
      { n:"02", title:"Underwriting", desc:"We analyze the deal with our own capital and expertise — no lengthy approval committees." },
      { n:"03", title:"Letter of intent", desc:"If the deal works, we move to LOI quickly. Our 40-year track record means lenders and partners know us." },
      { n:"04", title:"Due diligence", desc:"Thorough but efficient. We know what to look for in commercial and industrial assets." },
      { n:"05", title:"Close & manage", desc:"We close and operate the asset as owners — aligned with every partner in the deal." },
    ],
  },
  {
    name: "Property Management",
    desc: "Full-service, in-house property management for commercial and industrial assets — handled directly by ownership, not outsourced.",
    items: ["Lease administration", "Preventive maintenance", "Tenant relations", "Financial reporting", "Vendor management", "Capital improvements", "24/7 emergency response", "Annual property review"],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:40,height:40}}><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 3v18M3 9h6M3 15h6"/><path d="M12 8h6M12 12h6M12 16h6"/></svg>,
    steps: [
      { n:"01", title:"Onboarding", desc:"We review leases, contracts, and property condition to establish a management baseline." },
      { n:"02", title:"Tenant coordination", desc:"Direct point of contact for all tenants — fast response, no middlemen or call centers." },
      { n:"03", title:"Maintenance", desc:"In-house capabilities handle day-to-day repairs, preventive schedules, and capital projects." },
      { n:"04", title:"Reporting", desc:"Monthly financial statements and property performance reports delivered on time, every time." },
    ],
  },
  {
    name: "Agency & Brokerage",
    desc: "Tenant representation, landlord representation, and investment sales — backed by 40+ years of Houston market relationships and deep local knowledge.",
    items: ["Tenant representation", "Landlord representation", "Buyer representation", "Investment sales", "Market analysis", "Site selection advisory", "Lease negotiation", "Disposition strategy"],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:40,height:40}}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    steps: [
      { n:"01", title:"Market analysis", desc:"We assess the market, identify options, and define the opportunity against your objectives." },
      { n:"02", title:"Sourcing", desc:"Active outreach using 40+ years of Houston relationships to find the right space or tenant." },
      { n:"03", title:"Negotiation", desc:"We negotiate terms on your behalf — lease, purchase, or sale — with full market context." },
      { n:"04", title:"Closing support", desc:"We guide the transaction through due diligence, documentation, and a clean close." },
    ],
  },
];

// ─────────────────────────────────────────────
//  SHARED COMPONENTS
// ─────────────────────────────────────────────
const css = `
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  html{scroll-behavior:smooth}
  body{font-family:'DM Sans',system-ui,sans-serif;background:#f7f5f1;color:#1a1a1a;-webkit-font-smoothing:antialiased}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
  @keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}
  .fade-up{animation:fadeUp 0.6s ease forwards}
  .fade1{animation-delay:.1s;opacity:0}.fade2{animation-delay:.2s;opacity:0}.fade3{animation-delay:.3s;opacity:0}.fade4{animation-delay:.4s;opacity:0}
  input,select,textarea,button{font-family:inherit}
  ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#0b2540}::-webkit-scrollbar-thumb{background:#c8a96e;border-radius:3px}
`;

function SectionTag({ children, light }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:11, letterSpacing:"0.18em", textTransform:"uppercase", color: T.gold, fontWeight:400, marginBottom:"0.75rem" }}>
      <span style={{ display:"block", width:24, height:1, background: T.gold, flexShrink:0 }} />
      {children}
    </div>
  );
}

function SectionTitle({ children, light, style }) {
  return (
    <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"clamp(28px,3vw,40px)", fontWeight:500, color: light?"#fff":T.navy, lineHeight:1.2, marginBottom:"1rem", ...style }}>
      {children}
    </h2>
  );
}

function BtnPrimary({ children, onClick, style }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background: hov?T.goldLight:T.gold, color:T.navy, border:"none", padding:"13px 28px", borderRadius:4, fontSize:14, fontWeight:500, cursor:"pointer", letterSpacing:"0.04em", transition:"background 0.2s", ...style }}>
      {children}
    </button>
  );
}

function BtnGhost({ children, onClick, style }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:"transparent", color: hov?T.goldLight:"rgba(255,255,255,0.8)", border:`1px solid ${hov?T.gold:"rgba(255,255,255,0.25)"}`, padding:"13px 28px", borderRadius:4, fontSize:14, cursor:"pointer", letterSpacing:"0.04em", transition:"all 0.2s", ...style }}>
      {children}
    </button>
  );
}

function BtnSm({ children, onClick, variant="navy", style }) {
  const [hov, setHov] = useState(false);
  const base = { fontSize:13, padding:"8px 18px", borderRadius:4, cursor:"pointer", transition:"all 0.2s", fontWeight:500, letterSpacing:"0.03em" };
  const vars = {
    navy: { background: hov?"#1e4a73":T.navy, color:"#fff", border:`1px solid ${T.navy}` },
    outline: { background:"transparent", color:T.navy, border:`1px solid ${hov?T.navy:T.border}` },
    gold: { background: hov?T.goldLight:T.gold, color:T.navy, border:"none" },
  };
  return <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} style={{...base,...vars[variant],...style}}>{children}</button>;
}

// ─────────────────────────────────────────────
//  LOGO CAROUSEL
// ─────────────────────────────────────────────
function LogoCarousel({ logos }) {
  const list = logos && logos.length ? logos : FALLBACK_LOGOS;
  const doubled = [...list, ...list]; // seamless loop
  return (
    <div style={{ background:T.navy, borderTop:`1px solid rgba(200,169,110,0.2)`, borderBottom:`1px solid rgba(200,169,110,0.2)` }}>
      <div style={{ textAlign:"center", padding:"14px 1.5rem 10px" }}>
        <p style={{ fontSize:11, color:"rgba(255,255,255,0.45)", letterSpacing:"0.14em", textTransform:"uppercase" }}>
          Billipp Company is trusted by staff and professionals at ...
        </p>
      </div>
      <div style={{ padding:"20px 0", overflow:"hidden" }}>
      <div style={{ display:"flex", width:"max-content", animation:"marquee 28s linear infinite" }}>
        {doubled.map((l, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", padding:"0 60px", borderRight:`1px solid rgba(200,169,110,0.15)`, flexShrink:0 }}>
            <div style={{ width:160, height:80, borderRadius:8, background:"rgba(200,169,110,0.08)", border:`1px solid rgba(200,169,110,0.25)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:16, fontWeight:700, color:T.gold, letterSpacing:"0.08em", overflow:"hidden", padding:"0 12px" }}>
              {l.logo_url
                ? <img src={l.logo_url} alt={l.name} style={{ maxWidth:"100%", maxHeight:60, objectFit:"contain" }} />
                : l.icon || l.abbr}
            </div>
          </div>
        ))}
      </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  NAV
// ─────────────────────────────────────────────
function Nav({ page, setPage }) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    
    { label:"About", anchor:"about" }, { label:"Services", anchor:"services" },{ label:"Directory", id:"directory" },
    { label:"Property Portfolio", id:"portfolio-map" },
  ];

  function handleNav(link) {
    if (link.id) { setPage(link.id); window.scrollTo(0,0); return; }
    if (link.anchor) {
      if (page !== "home") { setPage("home"); setTimeout(() => document.getElementById(link.anchor)?.scrollIntoView({behavior:"smooth"}), 100); }
      else document.getElementById(link.anchor)?.scrollIntoView({ behavior:"smooth" });
    }
  }

  return (
    <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:200, height:64, background: scrolled?"rgba(11,37,64,0.97)":"rgba(11,37,64,0.97)", backdropFilter:"blur(8px)", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 1.5rem", borderBottom:`1px solid rgba(200,169,110,0.2)`, transition:"background 0.3s" }}>
      <div style={{ display:"flex", alignItems:"center", gap:16 }}>
        <button onClick={()=>{setPage("home");window.scrollTo(0,0)}} style={{ background:"none", border:"none", cursor:"pointer", textAlign:"left", padding:0 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, color:T.goldLight, letterSpacing:"0.02em" }}>Billipp</div>
          <div style={{ color:"rgba(255,255,255,0.45)", fontSize:18, fontWeight:300, letterSpacing:"0.12em", textTransform:"uppercase", marginTop:-2 }}>Company</div>
        </button>
        <div style={{ width:1, height:36, background:"rgba(200,169,110,0.2)" }} />
        <img src={skyhawkLogo} alt="Skyhawk Partners" style={{ height:30, width:"auto", objectFit:"contain", opacity:0.8 }} />
      </div>
      <div style={{ display:"flex", gap:"2.5rem", alignItems:"center" }}>
        {links.map(l => (
          <button key={l.label} onClick={()=>handleNav(l)} style={{ background:"none", border:"none", color:"rgba(255,255,255,0.7)", fontSize:13, letterSpacing:"0.06em", cursor:"pointer", padding:0, transition:"color 0.2s" }}
            onMouseEnter={e=>e.target.style.color=T.goldLight} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.7)"}>
            {l.label}
          </button>
        ))}
        <BtnPrimary onClick={()=>{if(page!=="home"){setPage("home");setTimeout(()=>document.getElementById("contact")?.scrollIntoView({behavior:"smooth"}),100)}else document.getElementById("contact")?.scrollIntoView({behavior:"smooth"})}} style={{padding:"8px 20px",fontSize:13}}>
          Inquire Now
        </BtnPrimary>
      </div>
    </nav>
  );
}

// ─────────────────────────────────────────────
//  HERO
// ─────────────────────────────────────────────
function Hero({ setPage }) {
  return (
    <section id="home" style={{ minHeight:"100vh", background:T.navy, display:"flex", flexDirection:"column", justifyContent:"flex-end", padding:"0 0 5rem", position:"relative", overflow:"hidden" }}>
      {/* Houston cityscape background */}
      <div style={{ position:"absolute", inset:0, backgroundImage:`url(${houstonImg})`, backgroundSize:"cover", backgroundPosition:"center 60%", backgroundRepeat:"no-repeat", pointerEvents:"none" }} />
      {/* Dark overlay */}
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(to bottom, rgba(11,37,64,0.55) 0%, rgba(11,37,64,0.75) 50%, rgba(11,37,64,0.92) 100%)", pointerEvents:"none" }} />
      {/* Grid overlay */}
      <div style={{ position:"absolute", inset:0, backgroundImage:`linear-gradient(rgba(200,169,110,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(200,169,110,0.04) 1px,transparent 1px)`, backgroundSize:"60px 60px", pointerEvents:"none" }} />

      <div style={{ padding:"0 1.5rem", position:"relative", zIndex:1 }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:11, letterSpacing:"0.18em", textTransform:"uppercase", color:T.gold, marginBottom:"1.5rem" }} className="fade-up fade1">
        <span style={{ width:32, height:1, background:T.gold, display:"block" }} />
        Houston, Texas · Est. 1980
      </div>
      <h1 className="fade-up fade2" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(38px,5vw,66px)", fontWeight:500, color:"#fff", lineHeight:1.12, maxWidth:720, marginBottom:"1.75rem" }}>
        Commercial & Industrial<br/>Real Estate. <span style={{ color:T.goldLight, fontStyle:"normal" }}>Built to Endure.</span>
      </h1>
      <p className="fade-up fade3" style={{ color:"rgba(255,255,255,0.55)", fontSize:16, fontWeight:300, maxWidth:480, lineHeight:1.7, marginBottom:"2.5rem" }}>
        Development, build-to-suit, and strategic investment across  Texas - Nationwide Relations.
      </p>
      <div className="fade-up fade4" style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
        <BtnPrimary onClick={()=>document.getElementById("portfolio")?.scrollIntoView({behavior:"smooth"})}>View portfolio</BtnPrimary>
        <BtnGhost onClick={()=>document.getElementById("contact")?.scrollIntoView({behavior:"smooth"})}>Start a conversation</BtnGhost>
      </div>
      </div>

      {/* Stats */}
      <div style={{ position:"absolute", right:"3rem", bottom:"5rem", display:"flex", flexDirection:"column", gap:24, zIndex:1 }}>
        {[["45+","Years in business"]].map(([n,l])=>(
          <div key={l} style={{ textAlign:"right", borderRight:`2px solid ${T.gold}`, paddingRight:16 }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:32, color:"#fff" }}>{n}</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.45)", letterSpacing:"0.1em", textTransform:"uppercase" }}>{l}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
//  SERVICES  (combined disciplines + how we work)
// ─────────────────────────────────────────────
function Services() {
  const [activeIdx, setActiveIdx] = useState(0);
  const s = SERVICES[activeIdx];
  return (
    <section id="services" style={{ background:T.navy, padding:"6rem 1.5rem" }}>
      <SectionTag>What we do</SectionTag>
      <SectionTitle light>Four disciplines.<br/>One firm.</SectionTitle>
      <p style={{ color:"rgba(255,255,255,0.45)", fontSize:15, lineHeight:1.75, maxWidth:560, marginBottom:"3rem", fontWeight:300 }}>
        From ground-up development to full-service brokerage — every capability is managed in-house by an owner-operated team.
      </p>

      {/* Tab layout */}
      <div style={{ display:"flex", border:"1px solid rgba(200,169,110,0.18)", borderRadius:10, overflow:"hidden", minHeight:460 }}>

        {/* LEFT — tab list 30% */}
        <div style={{ width:"30%", flexShrink:0, background:T.navyMid, borderRight:"1px solid rgba(200,169,110,0.18)", display:"flex", flexDirection:"column" }}>
          {SERVICES.map((tab, i) => {
            const active = activeIdx === i;
            return (
              <button key={tab.name} onClick={()=>setActiveIdx(i)}
                style={{ background: active ? T.navyLight : "transparent", border:"none", borderLeft: active ? `3px solid ${T.gold}` : "3px solid transparent", borderBottom:"1px solid rgba(200,169,110,0.1)", padding:"1.5rem 1.5rem 1.5rem 1.25rem", textAlign:"left", cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", gap:14, flex:1 }}>
                <div style={{ color: active ? T.gold : "rgba(200,169,110,0.45)", flexShrink:0, transition:"color 0.2s" }}>{tab.icon}</div>
                <div>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:15, color: active ? "#fff" : "rgba(255,255,255,0.55)", fontWeight:500, lineHeight:1.3, marginBottom:3, transition:"color 0.2s" }}>{tab.name}</p>
                  <p style={{ fontSize:11, color: active ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.25)", lineHeight:1.4 }}>{tab.items.slice(0,2).join(" · ")}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* RIGHT — content panel 70% */}
        <div style={{ flex:1, background:T.navyLight, padding:"2.5rem 2.5rem 2rem", overflow:"auto", display:"flex", flexDirection:"column", gap:"2rem" }}>

          {/* Header */}
          <div>
            <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:"1rem" }}>
              <div style={{ color:T.gold }}>{s.icon}</div>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:24, color:"#fff", fontWeight:500 }}>{s.name}</h3>
            </div>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.6)", lineHeight:1.8, fontWeight:300, maxWidth:600 }}>{s.desc}</p>
          </div>

          {/* Capabilities grid */}
          <div>
            <p style={{ fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase", color:T.gold, marginBottom:"0.875rem" }}>Capabilities</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(190px,1fr))", gap:8 }}>
              {s.items.map(item => (
                <div key={item} style={{ display:"flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(200,169,110,0.12)", borderRadius:5, padding:"0.6rem 0.875rem" }}>
                  <span style={{ color:T.gold, fontSize:9, flexShrink:0 }}>◆</span>
                  <span style={{ fontSize:12, color:"rgba(255,255,255,0.75)", lineHeight:1.4 }}>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* How it works steps */}
          <div>
            <p style={{ fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase", color:T.gold, marginBottom:"0.875rem" }}>How it works</p>
            <div style={{ display:"flex", gap:0, flexWrap:"wrap", alignItems:"center" }}>
              {s.steps.map((st, j) => (
                <div key={st.n} style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, padding:"0.5rem 0.75rem", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(200,169,110,0.12)", borderRadius:5 }}>
                    <span style={{ fontFamily:"'Playfair Display',serif", fontSize:13, color:"rgba(200,169,110,0.5)", fontWeight:500 }}>{st.n}</span>
                    <span style={{ fontSize:13, fontWeight:500, color:"rgba(255,255,255,0.85)" }}>{st.title}</span>
                  </div>
                  {j < s.steps.length - 1 && (
                    <span style={{ color:T.gold, fontSize:13, opacity:0.4, flexShrink:0 }}>→</span>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
//  PORTFOLIO
// ─────────────────────────────────────────────
function PortfolioCard({ p, setDetailProp }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ background:"#fff", border:`1px solid ${T.border}`, borderRadius:8, overflow:"hidden", cursor:"pointer", transition:"box-shadow 0.25s,transform 0.25s", boxShadow: hov?"0 12px 40px rgba(11,37,64,0.12)":"none", transform: hov?"translateY(-3px)":"translateY(0)", gridColumn: p.featured?"span 2":"span 1" }}
      onClick={()=>setDetailProp(p)}>
      {/* property photo */}
      <div style={{ width:"100%", aspectRatio: p.featured?"16/10":"16/9", background:T.warmGray, position:"relative", overflow:"hidden" }}>
        <span style={{ position:"absolute", top:12, left:12, zIndex:2, fontSize:10, fontWeight:500, letterSpacing:"0.1em", textTransform:"uppercase", padding:"4px 10px", borderRadius:99, background:p.badgeColor, color:p.badgeText }}>{p.badge}</span>
        {p.photo ? (
          <img src={p.photo} alt={p.name} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block", transition:"transform 0.4s ease", transform: hov?"scale(1.04)":"scale(1)" }} />
        ) : (
          <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:T.navy }}>
            <img src={skyhawkLogo} alt="Skyhawk Partners" style={{ width:"40%", maxWidth:120, objectFit:"contain", opacity:0.35 }} />
          </div>
        )}
      </div>
      <div style={{ padding:"1.25rem 1.4rem" }}>
        <p style={{ fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:T.gold, marginBottom:4 }}>{p.category}</p>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:17, color:T.navy, marginBottom:4, fontWeight:500 }}>{p.name}</h3>
        <p style={{ fontSize:12, color:T.textLight, marginBottom:12 }}>{p.address}</p>
        <div style={{ display:"flex", gap:16, paddingTop:12, borderTop:`1px solid ${T.border}`, flexWrap:"wrap" }}>
          {p.specs.map(s=>(
            <div key={s.label}><strong style={{ display:"block", fontSize:14, color:T.navy, fontWeight:500 }}>{s.value}</strong><span style={{ fontSize:12, color:T.textMuted }}>{s.label}</span></div>
          ))}
        </div>
        <div style={{ marginTop:12, fontSize:12, color:T.gold, fontWeight:500, display:"flex", alignItems:"center", gap:4 }}>View details →</div>
      </div>
    </div>
  );
}

function Portfolio({ setDetailProp, properties }) {
  const [filter, setFilter] = useState("all");
  const filters = ["all","office","industrial","retail","available"];
  const visible = properties.filter(p =>
    filter === "all" ||
    p.type.includes(filter) ||
    (filter === "available" && p.badge?.toLowerCase() === "available")
  );

  return (
    <section id="portfolio" style={{ background:T.offWhite, padding:"6rem 1.5rem" }}>
      <SectionTag>Portfolio</SectionTag>
      <SectionTitle>32 completed projects.<br/>One Houston market.</SectionTitle>
      <p style={{ color:T.textMuted, fontSize:15, lineHeight:1.75, maxWidth:560, marginBottom:"2.5rem", fontWeight:300 }}>
        A selective track record built over four decades for tenants.
      </p>
      <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginBottom:"2.5rem" }}>
        {filters.map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            style={{ padding:"6px 16px", borderRadius:99, fontSize:12, cursor:"pointer", transition:"all 0.2s", border:`1px solid ${filter===f?T.navy:T.border}`, background: filter===f?T.navy:"#fff", color: filter===f?"#fff":T.textMuted, fontFamily:"inherit" }}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
        {visible.map(p=><PortfolioCard key={p.id} p={p} setDetailProp={setDetailProp}/>)}
      </div>
      <div style={{ marginTop:"2rem", paddingTop:"2rem", borderTop:`1px solid ${T.border}`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
        <p style={{ fontSize:13, color:T.textMuted }}>Showing {visible.length} of 32+ completed and planned projects</p>
        <BtnSm onClick={()=>document.getElementById("contact")?.scrollIntoView({behavior:"smooth"})}>Request full portfolio →</BtnSm>
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
//  PROPERTY DETAIL PAGE
// ─────────────────────────────────────────────
// Geocode an address string → { lat, lng } using Nominatim (free, no key needed).
async function geocodeAddress(address) {
  const q = encodeURIComponent(address);
  const res = await fetch(
    `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
    { headers: { "Accept-Language": "en", "User-Agent": "BillippCompanyWebsite/1.0" } }
  );
  const data = await res.json();
  if (data && data[0]) return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
  return null;
}

function MapEmbed({ lat, lng, address, name }) {
  const [coords, setCoords] = useState(
    lat && lng && lat !== 29.75 && lng !== -95.37   // non-default values stored
      ? { lat, lng }
      : null
  );
  const [geocoding, setGeocoding] = useState(false);
  const [geoError, setGeoError]   = useState(false);

  useEffect(() => {
    // Already have real coords — no need to geocode
    if (coords) return;
    if (!address) { setGeoError(true); return; }
    setGeocoding(true);
    geocodeAddress(address)
      .then(result => {
        if (result) setCoords(result);
        else setGeoError(true);
      })
      .catch(() => setGeoError(true))
      .finally(() => setGeocoding(false));
  }, [address]);

  if (geocoding) return (
    <div style={{ height: 320, borderRadius: 8, border: `1px solid ${T.border}`, background: T.warmGray, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10 }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: `3px solid ${T.border}`, borderTopColor: T.navy, animation: "spin 0.8s linear infinite" }} />
      <p style={{ fontSize: 13, color: T.textMuted }}>Locating address…</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (geoError || !coords) return (
    <div style={{ height: 180, borderRadius: 8, border: `1px dashed ${T.border}`, background: T.offWhite, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
      <svg viewBox="0 0 24 24" fill="none" stroke={T.textMuted} strokeWidth="1.5" width={28} height={28}><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
      <p style={{ fontSize: 13, color: T.textMuted }}>Map unavailable — address could not be located</p>
      {address && (
        <a href={`https://www.google.com/maps/search/${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer"
          style={{ fontSize: 12, color: T.navy, textDecoration: "none", borderBottom: `1px solid ${T.border}` }}>
          Search on Google Maps ↗
        </a>
      )}
    </div>
  );

  const { lat: clat, lng: clng } = coords;
  const bbox = `${clng-0.018},${clat-0.013},${clng+0.018},${clat+0.013}`;
  const src  = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${clat},${clng}`;

  return (
    <div style={{ borderRadius: 8, overflow: "hidden", border: `1px solid ${T.border}`, position: "relative" }}>
      <iframe title={`Map for ${name}`} src={src} width="100%" height="320" style={{ border: "none", display: "block" }} loading="lazy" />
      <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 6 }}>
        <a href={`https://www.google.com/maps/search/${encodeURIComponent(address || name)}`} target="_blank" rel="noopener noreferrer"
          style={{ background: T.navy, color: T.goldLight, fontSize: 11, padding: "5px 10px", borderRadius: 4, textDecoration: "none", letterSpacing: "0.06em" }}>
          Google Maps ↗
        </a>
        <a href={`https://www.openstreetmap.org/?mlat=${clat}&mlon=${clng}#map=16/${clat}/${clng}`} target="_blank" rel="noopener noreferrer"
          style={{ background: "rgba(255,255,255,0.85)", color: T.navy, fontSize: 11, padding: "5px 10px", borderRadius: 4, textDecoration: "none", letterSpacing: "0.06em" }}>
          OSM ↗
        </a>
      </div>
    </div>
  );
}

function PhotoGallery({ files }) {
  const images = (files || []).filter(f => f.type === "image");
  const [lightbox, setLightbox] = useState(null); // index

  if (!images.length) return <p style={{ color: T.textMuted, fontSize: 14 }}>No photos uploaded.</p>;

  return (
    <>
      {/* Grid */}
      <div style={{ columns: "3 200px", gap: 12 }}>
        {images.map((img, i) => (
          <div key={img.url}
            onClick={() => setLightbox(i)}
            style={{ breakInside: "avoid", marginBottom: 12, borderRadius: 6, overflow: "hidden", cursor: "zoom-in", border: `1px solid ${T.border}`, position: "relative" }}>
            <img src={img.url} alt={img.name}
              style={{ width: "100%", display: "block", transition: "transform 0.3s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"}
              onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />
            {i === 0 && (
              <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(200,169,110,0.9)", color: T.navy, fontSize: 9, fontWeight: 700, padding: "2px 7px", borderRadius: 3, letterSpacing: "0.06em" }}>HERO</span>
            )}
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div onClick={() => setLightbox(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* Prev */}
          <button onClick={e => { e.stopPropagation(); setLightbox((lightbox - 1 + images.length) % images.length); }}
            style={{ position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", fontSize: 28, width: 48, height: 48, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>‹</button>
          {/* Image */}
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: "88vw", maxHeight: "88vh", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <img src={images[lightbox].url} alt={images[lightbox].name}
              style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", borderRadius: 6, boxShadow: "0 24px 80px rgba(0,0,0,0.6)" }} />
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>{lightbox + 1} / {images.length} — {images[lightbox].name}</p>
          </div>
          {/* Next */}
          <button onClick={e => { e.stopPropagation(); setLightbox((lightbox + 1) % images.length); }}
            style={{ position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", background: "rgba(255,255,255,0.1)", border: "none", color: "#fff", fontSize: 28, width: 48, height: 48, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>›</button>
          {/* Close */}
          <button onClick={() => setLightbox(null)}
            style={{ position: "absolute", top: 16, right: 20, background: "none", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 22, cursor: "pointer" }}>✕</button>
        </div>
      )}
    </>
  );
}

function PropertyDetail({ prop, setDetailProp, setPage }) {
  const [tab, setTab] = useState("overview");
  if (!prop) return null;

  const propImages = (prop.files || []).filter(f => f.type === "image");
  const propPdfs   = (prop.files || []).filter(f => f.type === "pdf");
  const propLinks  = prop.links || [];
  const hasPhotos  = propImages.length > 0;
  const hasPdfs    = propPdfs.length > 0;

  return (
    <div style={{ paddingTop:64, minHeight:"100vh", background:T.offWhite }}>
      {/* Back bar */}
      <div style={{ background:"#fff", borderBottom:`1px solid ${T.border}`, padding:"12px 1.5rem", display:"flex", alignItems:"center", gap:8 }}>
        <button onClick={()=>setDetailProp(null)} style={{ background:"none", border:"none", cursor:"pointer", color:T.textMuted, fontSize:13, display:"flex", alignItems:"center", gap:6, padding:0 }}>
          ← Back to portfolio
        </button>
        <span style={{ color:T.border, fontSize:18 }}>|</span>
        <span style={{ fontSize:13, color:T.textLight }}>{prop.name}</span>
      </div>

      {/* Hero strip */}
      <div style={{ background:T.navy, padding:"3rem 1.5rem 2.5rem" }}>
        <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:"1.5rem" }}>
          <div>
            <span style={{ fontSize:10, fontWeight:500, letterSpacing:"0.1em", textTransform:"uppercase", padding:"4px 12px", borderRadius:99, background:prop.badgeColor, color:prop.badgeText, display:"inline-block", marginBottom:12 }}>{prop.badge}</span>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(24px,3vw,38px)", color:"#fff", fontWeight:500, lineHeight:1.2, marginBottom:8 }}>{prop.name}</h1>
            <p style={{ color:"rgba(255,255,255,0.5)", fontSize:14, marginBottom:"1.5rem" }}>{prop.address}</p>
            <div style={{ display:"flex", gap:24, flexWrap:"wrap" }}>
              {prop.specs.map(s=>(
                <div key={s.label} style={{ borderRight:`1px solid rgba(255,255,255,0.1)`, paddingRight:24, lastChild:{borderRight:"none"} }}>
                  <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, color:"#fff" }}>{s.value}</div>
                  <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.1em" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          {prop.price && (
            <div style={{ background:"rgba(255,255,255,0.06)", border:`1px solid rgba(200,169,110,0.2)`, borderRadius:8, padding:"1.25rem 1.5rem", textAlign:"center", minWidth:180 }}>
              <div style={{ fontSize:11, color:T.gold, letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:6 }}>Asking price</div>
              <div style={{ fontSize:16, color:"#fff", fontWeight:500 }}>{prop.price}</div>
              <BtnPrimary style={{ marginTop:14, width:"100%", padding:"10px 0", fontSize:13 }} onClick={()=>document.getElementById("contact")?.scrollIntoView({behavior:"smooth"})}>
                Inquire now
              </BtnPrimary>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:"#fff", borderBottom:`1px solid ${T.border}`, padding:"0 1.5rem", display:"flex", gap:0 }}>
        {["overview", ...(hasPhotos ? ["photos"] : []), "map", "contact"].map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{ padding:"14px 24px", background:"none", border:"none", borderBottom:`2px solid ${tab===t?T.gold:"transparent"}`, fontSize:13, color: tab===t?T.navy:T.textMuted, cursor:"pointer", fontWeight: tab===t?500:400, transition:"all 0.2s", fontFamily:"inherit", textTransform:"capitalize", display:"flex", alignItems:"center", gap:6 }}>
            {t}
            {t === "photos" && <span style={{ fontSize:11, background: tab===t?T.navy:T.border, color: tab===t?"#fff":T.textMuted, borderRadius:99, padding:"1px 7px", fontWeight:500 }}>{propImages.length}</span>}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ padding:"3rem 1.5rem" }}>
        {tab==="overview" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"3rem", alignItems:"start" }}>
            <div>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:T.navy, marginBottom:"1rem" }}>About this property</h3>
              <p style={{ color:T.textMuted, fontSize:15, lineHeight:1.8, fontWeight:300, marginBottom:"1.5rem" }}>{prop.description}</p>
              <div style={{ background:T.offWhite, borderRadius:8, padding:"1.25rem 1.4rem" }}>
                <p style={{ fontSize:12, fontWeight:500, color:T.navy, marginBottom:"0.75rem", textTransform:"uppercase", letterSpacing:"0.08em" }}>Key features</p>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {prop.features.map(f=>(
                    <div key={f} style={{ display:"flex", alignItems:"center", gap:8, fontSize:13, color:T.textMuted }}>
                      <span style={{ color:T.gold, fontSize:10, fontWeight:700 }}>✓</span>{f}
                    </div>
                  ))}
                </div>
              </div>
              {(hasPdfs || prop.floorPlan) && (
                <div style={{ marginTop:"1.5rem" }}>
                  <p style={{ fontSize:12, fontWeight:500, color:T.navy, marginBottom:10, textTransform:"uppercase", letterSpacing:"0.08em" }}>Documents</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {hasPdfs ? propPdfs.map(pdf => (
                      <div key={pdf.url} style={{ padding:"0.875rem 1.1rem", border:`1px solid ${T.border}`, borderRadius:8, display:"flex", alignItems:"center", gap:12, background:"#fff" }}>
                        {/* PDF icon */}
                        <div style={{ width:34, height:34, borderRadius:5, background:"#fee2e2", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" width={16} height={16}><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:13, fontWeight:500, color:T.navy, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{pdf.name}</p>
                          <p style={{ fontSize:11, color:T.textMuted }}>PDF · Click to download</p>
                        </div>
                        <a href={pdf.url} download={pdf.name} target="_blank" rel="noopener noreferrer"
                          style={{ background:T.navy, color:"#fff", border:"none", borderRadius:5, padding:"7px 14px", fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"inherit", textDecoration:"none", display:"flex", alignItems:"center", gap:5, flexShrink:0 }}>
                          <svg viewBox="0 0 20 20" fill="currentColor" width={13} height={13}><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd"/></svg>
                          Download
                        </a>
                      </div>
                    )) : (
                      <div style={{ padding:"1rem 1.25rem", border:`1px dashed ${T.border}`, borderRadius:8, display:"flex", alignItems:"center", gap:12 }}>
                        <svg style={{ width:28, height:28, color:T.navy, flexShrink:0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 9v12"/></svg>
                        <div>
                          <p style={{ fontSize:13, fontWeight:500, color:T.navy }}>Floor plan available</p>
                          <p style={{ fontSize:12, color:T.textMuted }}>PDF available upon request</p>
                        </div>
                        <BtnSm variant="outline" style={{ marginLeft:"auto" }} onClick={()=>document.getElementById("contact")?.scrollIntoView({behavior:"smooth"})}>Request PDF</BtnSm>
                      </div>
                    )}
                  </div>
                </div>
              )}
            {propLinks.length > 0 && (
              <div style={{ marginTop:"1.5rem" }}>
                <p style={{ fontSize:12, fontWeight:500, color:T.navy, marginBottom:10, textTransform:"uppercase", letterSpacing:"0.08em" }}>Links & resources</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {propLinks.map((l, i) => (
                    <a key={i} href={l.url} target="_blank" rel="noopener noreferrer"
                      style={{ display:"inline-flex", alignItems:"center", gap:7, background:T.offWhite, border:`1px solid ${T.border}`, borderRadius:5, padding:"8px 16px", fontSize:13, color:T.navy, textDecoration:"none", fontWeight:500, transition:"all 0.2s" }}
                      onMouseEnter={e => { e.currentTarget.style.background = T.navy; e.currentTarget.style.color = T.goldLight; }}
                      onMouseLeave={e => { e.currentTarget.style.background = T.offWhite; e.currentTarget.style.color = T.navy; }}>
                      <svg viewBox="0 0 20 20" fill="currentColor" width={13} height={13}><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/></svg>
                      {l.label} ↗
                    </a>
                  ))}
                </div>
              </div>
            )}
            </div>
            <div>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:T.navy, marginBottom:"1rem" }}>Location</h3>
              <MapEmbed lat={prop.mapLat} lng={prop.mapLng} address={prop.address} name={prop.name} />
              <div style={{ marginTop:"1rem", padding:"0.875rem 1rem", background:"#fff", border:`1px solid ${T.border}`, borderRadius:6, display:"flex", alignItems:"center", gap:10 }}>
                <svg style={{ width:18, height:18, color:T.gold, flexShrink:0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                <p style={{ fontSize:13, color:T.textMuted }}>{prop.address}</p>
              </div>
            </div>
          </div>
        )}

        {tab==="photos" && (
          <div>
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1.5rem", flexWrap:"wrap", gap:10 }}>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:T.navy }}>Photo collection</h3>
              <p style={{ fontSize:13, color:T.textMuted }}>{propImages.length} photo{propImages.length !== 1 ? "s" : ""} · Click any image to expand</p>
            </div>
            <PhotoGallery files={prop.files} />
          </div>
        )}

        {tab==="map" && (
          <div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:T.navy, marginBottom:"1.5rem" }}>Property location</h3>
            <MapEmbed lat={prop.mapLat} lng={prop.mapLng} address={prop.address} name={prop.name} />
            <div style={{ marginTop:"1.5rem", display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12 }}>
              <div style={{ background:"#fff", border:`1px solid ${T.border}`, borderRadius:6, padding:"1rem 1.2rem" }}>
                <p style={{ fontSize:11, color:T.textLight, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>Full address</p>
                <p style={{ fontSize:14, color:T.navy }}>{prop.address}</p>
              </div>
              <div style={{ background:"#fff", border:`1px solid ${T.border}`, borderRadius:6, padding:"1rem 1.2rem" }}>
                <p style={{ fontSize:11, color:T.textLight, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:4 }}>Market</p>
                <p style={{ fontSize:14, color:T.navy }}>Greater Houston, TX</p>
              </div>
            </div>
          </div>
        )}

        {tab==="contact" && (
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"3rem", alignItems:"start" }}>
            <div>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:T.navy, marginBottom:"1rem" }}>Inquire about this property</h3>
              <p style={{ fontSize:14, color:T.textMuted, lineHeight:1.75, marginBottom:"1.5rem" }}>Contact Management directly for leasing rates, availability, and to schedule a site tour.</p>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {[["Phone","(713) 426-5000"],["Office","6925 Portwest Dr, Suite 130, Houston TX 77024"]].map(([l,v])=>(
                  <div key={l}><p style={{ fontSize:11, color:T.textLight, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:2 }}>{l}</p><p style={{ fontSize:14, color:T.navy }}>{v}</p></div>
                ))}
              </div>
            </div>
            <ContactForm propertyName={prop.name} onLight />
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  ABOUT SECTION (on homepage)
// ─────────────────────────────────────────────
function About() {
  const values = [
    { name:"Integrity", desc:"We own the properties we build. Our word is the contract." },
    { name:"Responsiveness", desc:"Direct access to decision-makers — not a call center." },
    { name:"Long-term view", desc:"We measure success in decades, not quarters." },
    { name:"Selectivity", desc:"We take on fewer projects so every one is done right." },
  ];
  return (
    <section id="about" style={{ background:"#fff", padding:"6rem 1.5rem" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5rem", alignItems:"start" }}>
        {/* Photo side */}
        <div style={{ position:"relative" }}>
          <div style={{ width:"100%", aspectRatio:"4/5", borderRadius:8, overflow:"hidden" }}>
            <img src={spaceCenterImg} alt="Billipp Space Center" style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
          </div>
          <div style={{ position:"absolute", bottom:-24, right:-24, width:"55%", aspectRatio:"1", background:T.navy, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", border:"6px solid #fff" }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:36, color:T.gold }}>40+</div>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.5)", letterSpacing:"0.1em", textTransform:"uppercase", textAlign:"center", lineHeight:1.4, padding:"0 12px" }}>Years of Houston real estate</div>
          </div>
        </div>
        {/* Copy side */}
        <div>
          <SectionTag>About the company</SectionTag>
          <SectionTitle>Owner-operated.<br/>Houston-rooted.</SectionTitle>
          <div style={{ width:48, height:2, background:T.gold, marginBottom:"2rem" }} />
          <p style={{ color:T.textMuted, fontSize:15, lineHeight:1.75, fontWeight:300, marginBottom:"1.5rem" }}>
            J.A. Billipp Company is a privately held commercial and industrial real estate firm that selectively develops, acquires, and invests in properties across the Houston metropolitan area. Unlike third-party managers, we own what we build.
          </p>
          <p style={{ color:T.textMuted, fontSize:15, lineHeight:1.75, fontWeight:300, marginBottom:"2rem" }}>
            Our relationships with tenants like Lockheed Martin, Office Depot, and CooperVision span decades — not because of contracts, but because of how we operate.
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginTop:"2rem" }}>
            {values.map(v=>(
              <div key={v.name} style={{ background:T.offWhite, borderRadius:4, padding:"1rem 1.1rem", borderLeft:`3px solid ${T.gold}` }}>
                <p style={{ fontSize:13, fontWeight:500, color:T.navy, marginBottom:4 }}>{v.name}</p>
                <p style={{ fontSize:12, color:T.textMuted, lineHeight:1.6 }}>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* City market cards */}
      <div style={{ marginTop:"4rem" }}>
        <SectionTag>Our Markets</SectionTag>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16, marginTop:"1.25rem" }}>
          {[
            { city:"Houston", img:houstonImg, desc:"Serving commercial and industrial professionals across the Houston metropolitan area for over 40 years." },
            { city:"Austin", img:austinImg, desc:"Expanding real estate services for Austin's growing community of business and professional tenants." },
            { city:"Dallas", img:dallasImg, desc:"Commercial real estate services for professionals and firms across the Dallas–Fort Worth metroplex." },
          ].map(c => (
            <div key={c.city} style={{ position:"relative", height:220, borderRadius:8, overflow:"hidden" }}>
              <img src={c.img} alt={c.city} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
              <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(11,37,64,0.88) 0%, rgba(11,37,64,0.18) 60%)" }} />
              <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"1.25rem" }}>
                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:20, color:"#fff", fontWeight:500, marginBottom:4 }}>{c.city}</p>
                <p style={{ fontSize:12, color:"rgba(255,255,255,0.72)", lineHeight:1.55 }}>{c.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


// ─────────────────────────────────────────────
//  CONTACT FORM (reusable)
// ─────────────────────────────────────────────
function ContactForm({ propertyName, onLight = false }) {
  const [form, setForm] = useState({
    first: "", last: "", company: "", email: "",
    topic: propertyName ? "Leasing available space" : "",
    message: propertyName ? `I'm interested in ${propertyName}.` : "",
    _honey: "",  // honeypot — must stay empty
  });
  const [status, setStatus] = useState("idle"); // "idle" | "sending" | "sent" | "error"
  const lastSent = useRef(0);

  const inputStyle = { background:"rgba(255,255,255,0.92)", border:`1px solid ${onLight ? T.border : "rgba(255,255,255,0.25)"}`, borderRadius:4, padding:"10px 14px", color:"#1a1a1a", fontSize:14, fontWeight:300, outline:"none", width:"100%", fontFamily:"inherit" };
  const labelStyle = { fontSize:11, color: onLight ? T.textMuted : "rgba(255,255,255,0.6)", letterSpacing:"0.08em", textTransform:"uppercase" };

  const field = (label, key, type="text", placeholder="") => (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}
        placeholder={placeholder} style={inputStyle} />
    </div>
  );

  async function handleSend() {
    // Honeypot — bots fill hidden fields, humans don't
    if (form._honey) return;
    // Rate limit — one submission per 60 seconds
    const now = Date.now();
    if (now - lastSent.current < 60_000) {
      alert("Please wait a moment before sending another message.");
      return;
    }
    if (!form.first || !form.email) {
      alert("Please fill in your name and email before sending.");
      return;
    }
    setStatus("sending");
    try {
      await emailjs.send(
        EJS_SERVICE,
        EJS_TEMPLATE,
        {
          first_name: form.first,
          last_name:  form.last,
          company:    form.company,
          reply_to:   form.email,
          topic:      form.topic || "General inquiry",
          message:    form.message,
          property:   propertyName || "—",
        },
        EJS_PUBLIC
      );
      lastSent.current = Date.now();
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") return (
    <div style={{ background:"rgba(200,169,110,0.1)", border:`1px solid ${T.gold}`, borderRadius:8, padding:"2rem", textAlign:"center" }}>
      <p style={{ color:T.goldLight, fontSize:16, fontFamily:"'Playfair Display',serif" }}>Message received.</p>
      <p style={{ color:"rgba(255,255,255,0.5)", fontSize:13, marginTop:8 }}>We'll be in touch shortly.</p>
    </div>
  );

  if (status === "error") return (
    <div style={{ background:"rgba(200,50,50,0.1)", border:"1px solid rgba(200,80,80,0.4)", borderRadius:8, padding:"2rem", textAlign:"center" }}>
      <p style={{ color:"#f87171", fontSize:15 }}>Something went wrong — please email us directly at <strong>vincent@skyhawkpartners.com</strong></p>
      <button onClick={()=>setStatus("idle")} style={{ marginTop:12, background:"none", border:"none", color:T.gold, cursor:"pointer", fontSize:13 }}>Try again</button>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {field("First name","first","text","Jane")}
        {field("Last name","last","text","Smith")}
      </div>
      {field("Company","company","text","Acme Corp")}
      {field("Email","email","email","jane@acme.com")}
      <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
        <label style={labelStyle}>I'm interested in</label>
        <select value={form.topic} onChange={e=>setForm({...form,topic:e.target.value})}
          style={{ ...inputStyle, fontWeight:400, background:"rgba(255,255,255,0.92)", color:"#1a1a1a" }}>
          <option value="" style={{ background:T.navyMid, color:"rgba(255,255,255,0.7)" }}>Select a topic</option>
          {["Leasing available space","Build-to-suit (leased)","Build-to-suit (purchased)","Investment / acquisition","Joint venture / partnership","Sale-leaseback","General inquiry"].map(o=><option key={o} style={{ background:T.navyMid, color:"#fff" }}>{o}</option>)}
        </select>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
        <label style={labelStyle}>Message</label>
        <textarea value={form.message} onChange={e=>setForm({...form,message:e.target.value})} rows={4}
          style={{ ...inputStyle, resize:"vertical" }}
          placeholder="Tell us about your project, timeline, and space requirements…" />
      </div>
      {/* Honeypot — hidden from real users, filled by bots */}
      <input type="text" name="_honey" value={form._honey} onChange={e=>setForm({...form,_honey:e.target.value})}
        tabIndex={-1} autoComplete="off" style={{ position:"absolute", left:"-9999px", opacity:0, height:0, width:0 }} />
      <BtnPrimary style={{ width:"100%", padding:13, fontSize:14, opacity: status==="sending"?0.7:1 }}
        onClick={handleSend}>
        {status === "sending" ? "Sending…" : "Send inquiry"}
      </BtnPrimary>
    </div>
  );
}

// ─────────────────────────────────────────────
//  CONTACT SECTION
// ─────────────────────────────────────────────
function Contact() {
  return (
    <section id="contact" style={{ background:T.navy, padding:"6rem 1.5rem" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"5rem", alignItems:"start" }}>
        <div>
          <SectionTag>Get in touch</SectionTag>
          <SectionTitle light>Let's talk about<br/>your project.</SectionTitle>
          <p style={{ color:"rgba(255,255,255,0.45)", fontSize:15, fontWeight:300, lineHeight:1.75, margin:"1.5rem 0 2.5rem", maxWidth:380 }}>
            Whether you're looking for space, exploring a build-to-suit, or want to discuss an investment — we respond to every inquiry directly.
          </p>
          {[["Address","6925 Portwest Drive, Suite 130\nHouston, Texas 77024"],["Phone","(713) 426-5000"],["Inquiries","info@billipp.com"]].map(([l,v])=>(
            <div key={l} style={{ marginBottom:"1.5rem" }}>
              <p style={{ fontSize:11, letterSpacing:"0.12em", textTransform:"uppercase", color:"rgba(255,255,255,0.35)", marginBottom:4 }}>{l}</p>
              <p style={{ fontSize:15, color:"rgba(255,255,255,0.85)", fontWeight:300, whiteSpace:"pre-line" }}>{v}</p>
            </div>
          ))}
        </div>
        <ContactForm />
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
//  FOOTER
// ─────────────────────────────────────────────
function Footer({ setPage }) {
  return (
    <footer style={{ background:"#080f18", padding:"1.75rem 1.5rem", display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem", borderTop:`1px solid rgba(200,169,110,0.15)` }}>
      <p style={{ fontSize:12, color:"rgba(255,255,255,0.25)" }}>© 2026 J.A. Billipp Company · Houston, Texas · All rights reserved</p>
      <div style={{ display:"flex", gap:"1.5rem" }}>
        {[["Services","services"],["Portfolio","portfolio"],["About","about"],["Contact","contact"]].map(([l,a])=>(
          <button key={l} onClick={()=>document.getElementById(a)?.scrollIntoView({behavior:"smooth"})}
            style={{ background:"none", border:"none", fontSize:12, color:"rgba(255,255,255,0.3)", cursor:"pointer", transition:"color 0.2s", fontFamily:"inherit" }}
            onMouseEnter={e=>e.target.style.color=T.goldLight} onMouseLeave={e=>e.target.style.color="rgba(255,255,255,0.3)"}>
            {l}
          </button>
        ))}
      </div>
    </footer>
  );
}

// ─────────────────────────────────────────────
//  DIRECTORY / ABOUT PAGE
// ─────────────────────────────────────────────
function DirectoryPage({ setPage, companies }) {
  const [activeTeam, setActiveTeam] = useState(0);
  return (
    <div style={{ paddingTop:64, background:T.offWhite, minHeight:"100vh" }}>

      {/* Page hero */}
      <div style={{ background:T.navy, padding:"4rem 1.5rem 3rem" }}>
        <SectionTag>Company</SectionTag>
        <SectionTitle light>About J.A. Billipp Company</SectionTitle>
        <p style={{ color:"rgba(255,255,255,0.5)", fontSize:15, fontWeight:300, lineHeight:1.75, maxWidth:560 }}>
          A privately held Houston commercial real estate firm operating since 1980. We develop, acquire, and invest in commercial and industrial properties — owning everything we build.
        </p>
        <div style={{ display:"flex", gap:"2.5rem", marginTop:"2.5rem", flexWrap:"wrap" }}>
          {[["45+","Years in business"],["32+","Completed projects"],["3M+ SF","Developed & managed"],["10+","Fortune 500 tenants"]].map(([n,l])=>(
            <div key={l} style={{ borderRight:`1px solid rgba(255,255,255,0.1)`, paddingRight:"2.5rem" }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:30, color:"#fff" }}>{n}</div>
              <div style={{ fontSize:11, color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.1em" }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:"4rem 1.5rem" }}>
        {/* ── TEAM ── */}
        <div style={{ marginBottom:"4rem" }}>
          <SectionTag>Leadership</SectionTag>
          <SectionTitle>The team behind the portfolio.</SectionTitle>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:16, marginTop:"2rem" }}>
            {TEAM.map((m,i)=>(
              <div key={m.name} onClick={()=>setActiveTeam(i)} style={{ background: activeTeam===i?"#fff":T.offWhite, border:`1px solid ${activeTeam===i?T.gold:T.border}`, borderRadius:8, padding:"1.5rem", cursor:"pointer", transition:"all 0.2s", boxShadow: activeTeam===i?"0 4px 20px rgba(11,37,64,0.1)":"none" }}>
                <div style={{ display:"flex", alignItems:"center", gaFp:14, marginBottom:"1rem" }}>
                  <div style={{ width:52, height:52, borderRadius:"50%", background:m.color, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Playfair Display',serif", fontSize:18, color:T.goldLight, flexShrink:0 }}>{m.initials}</div>
                  <div>
                    <p style={{ fontSize:15, fontWeight:500, color:T.navy }}>{m.name}</p>
                    <p style={{ fontSize:12, color:T.textLight }}>{m.role}</p>
                  </div>
                </div>
                <p style={{ fontSize:13, color:T.textMuted, lineHeight:1.7 }}>{m.bio}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── SERVICES DIRECTORY ── */}
        <div style={{ marginBottom:"4rem" }}>
          <SectionTag>Services directory</SectionTag>
          <SectionTitle>What we do — in detail.</SectionTitle>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginTop:"2rem" }}>
            {[
              { title:"Development", sub:"Office", desc:"Multi-tenant and single-tenant office buildings throughout Houston. Projects range from 25,000 SF flex buildings to 130,000 SF corporate campuses." },
              { title:"Development", sub:"Industrial", desc:"Warehouse, distribution, and office/warehouse hybrid buildings. Ground-up development for manufacturing, aerospace, and logistics tenants." },
              { title:"Development", sub:"Retail", desc:"Retail build-to-suits including the Sears Hardware / Bike Barn project at Bay Area Blvd. Street-facing, high-visibility locations." },
              { title:"Development", sub:"Residential / Resort", desc:"The Forum at Memorial Woods — a 363,000 SF luxury high-rise retirement community at 777 N. Post Oak Road." },
              { title:"Build-to-Suit", sub:"Leased", desc:"Billipp designs, builds, and owns the facility. The client leases it long-term. Ideal for companies that want a custom space without capital tied up in real estate." },
              { title:"Build-to-Suit", sub:"Purchased", desc:"Billipp develops the building and transfers ownership to the client at completion. The client ends up owning a facility built exactly to their specifications." },
              { title:"Investment", sub:"Acquisitions", desc:"Billipp selectively acquires existing commercial and industrial properties in Houston. Criteria: office, industrial, or flex; 25,000 SF+; value-add or stabilized." },
              { title:"Investment", sub:"Sale-Leasebacks", desc:"Billipp purchases your property and you stay in place as a long-term tenant. Unlocks capital without business disruption. Closes in 60–90 days." },
              { title:"Investment", sub:"Joint Ventures", desc:"Co-development or co-ownership with another party. Billipp brings market expertise, development management, and relationships. Partners bring capital, land, or both." },
              { title:"Investment", sub:"Partnerships", desc:"Longer-term equity relationships with family offices, private equity, and institutional investors. Billipp manages, partners participate in returns." },
            ].map(item=>(
              <div key={item.sub} style={{ background:"#fff", border:`1px solid ${T.border}`, borderRadius:8, padding:"1.25rem 1.4rem" }}>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
                  <span style={{ fontSize:10, padding:"2px 8px", borderRadius:99, background:"#edf2fb", color:"#2c52a0", fontWeight:500, letterSpacing:"0.08em", textTransform:"uppercase" }}>{item.title}</span>
                  <span style={{ fontSize:13, fontWeight:500, color:T.navy }}>{item.sub}</span>
                </div>
                <p style={{ fontSize:13, color:T.textMuted, lineHeight:1.7 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── CLIENT LIST ── */}
        <div style={{ marginBottom:"4rem" }}>
          <SectionTag>Client & tenant directory</SectionTag>
          <SectionTitle>Companies that have trusted Billipp.</SectionTitle>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:10, marginTop:"2rem" }}>
            {(companies && companies.length ? companies.filter(c=>c.show_directory) : FALLBACK_CLIENTS.map(n=>({ name:n }))).map(c=>(
              <div key={c.name} style={{ background:"#fff", border:`1px solid ${T.border}`, borderRadius:6, padding:"1rem 1.1rem", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:5, background:T.navy, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:T.gold, flexShrink:0, letterSpacing:"0.05em", overflow:"hidden" }}>
                  {c.logo_url
                    ? <img src={c.logo_url} alt={c.name} style={{ width:24, height:24, objectFit:"contain" }} />
                    : (c.abbr || c.name.split(" ").map(w=>w[0]).join("").slice(0,2))}
                </div>
                <span style={{ fontSize:13, color:T.textMuted, lineHeight:1.3 }}>{c.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── COMMUNITY ── */}
        <div>
          <SectionTag>Community engagement</SectionTag>
          <SectionTitle>Rooted in Houston.</SectionTitle>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:16, marginTop:"2rem" }}>
            {[
              { label:"Local workforce", desc:"Every project is built with Houston-based contractors and subcontractors, supporting the regional economy." },
              { label:"Long-term ownership", desc:"Billipp holds its properties long-term rather than flipping — contributing to stable, quality commercial districts." },
              { label:"Tenant success", desc:"We invest in tenant relationships because when businesses thrive in our buildings, the broader community benefits." },
            ].map(c=>(
              <div key={c.label} style={{ borderLeft:`3px solid ${T.gold}`, paddingLeft:"1rem" }}>
                <p style={{ fontWeight:500, color:T.navy, marginBottom:6 }}>{c.label}</p>
                <p style={{ fontSize:13, color:T.textMuted, lineHeight:1.7 }}>{c.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
//  HOME PAGE
// ─────────────────────────────────────────────
function HomePage({ setPage, setDetailProp, properties, companies }) {
  return (
    <>
      <Hero setPage={setPage} />
      <LogoCarousel logos={companies.filter(c=>c.show_carousel)} />
      <Services />
      <Portfolio setDetailProp={setDetailProp} properties={properties} />
      <About />
      <Contact />
      <Footer setPage={setPage} />
    </>
  );
}

// ─────────────────────────────────────────────
//  ROOT APP
// ─────────────────────────────────────────────
export default function App() {
  const [page, setPage]           = useState("home");
  const [detailProp, setDetailProp] = useState(null);
  const [properties, setProperties] = useState(FALLBACK_PROPERTIES);
  const [companies, setCompanies]   = useState([]);
  const [adminSession, setAdminSession] = useState(null);
  const [authChecked, setAuthChecked]   = useState(false);

  // Check for /admin in URL hash to enter admin mode
  const isAdminRoute = window.location.hash === "#/admin" || window.location.pathname === "/admin";

  // Restore existing session on mount
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAdminSession(data.session);
      setAuthChecked(true);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setAdminSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchProperties().then(setProperties);
    supabase.from("companies").select("*").order("sort_order").order("name")
      .then(({ data }) => { if (data && data.length) setCompanies(data); });
  }, []);

  function handleSetDetailProp(p) {
    setDetailProp(p);
    setPage("detail");
    window.scrollTo(0, 0);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setAdminSession(null);
    window.location.hash = "";
  }

  // ── Admin portal route ────────────────────────────────────────────────────
  if (isAdminRoute) {
    if (!authChecked) return null; // wait for session check
    if (!adminSession) return <AdminLogin onLogin={setAdminSession} />;
    return <AdminPortal session={adminSession} onSignOut={handleSignOut} />;
  }

  // ── Public site ───────────────────────────────────────────────────────────
  return (
    <>
      <style>{GF}{css}</style>
      <Nav page={page} setPage={(p) => { setPage(p); if (p === "home") setDetailProp(null); }} />
      <main>
        {page === "home" && <HomePage setPage={setPage} setDetailProp={handleSetDetailProp} properties={properties} companies={companies} />}
        {page === "directory" && <DirectoryPage setPage={setPage} companies={companies} />}
        {page === "portfolio-map" && <PortfolioMapPage properties={properties} setDetailProp={handleSetDetailProp} />}
        {page === "detail" && detailProp && (
          <PropertyDetail prop={detailProp} setDetailProp={(p) => { if (p) { setDetailProp(p); } else { setPage("home"); setDetailProp(null); window.scrollTo(0, 0); } }} setPage={setPage} />
        )}
      </main>
    </>
  );
}
