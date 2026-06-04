import { useState, useEffect, useRef } from "react";
import emailjs from "@emailjs/browser";

// ─── EmailJS config — fill in your IDs from emailjs.com dashboard ───
const EJS_SERVICE  = "service_na57ys5";   // e.g. "service_abc123"
const EJS_TEMPLATE = "template_18inx6j";  // e.g. "template_xyz789"
const EJS_PUBLIC   = "GQbjhdUhHgNi7qpf7";   // e.g. "aBcDeFgHiJkLm"
import houstonImg from "./assets/houston.jpg";
import portwest1 from "./assets/Portwest 6955.jpg";
import portwest2 from "./assets/Portwest 6955 air.jpg";
import idcAerial from "./assets/IDC aerial from SE.jpeg.jpg";
import idcEntry from "./assets/IDC Entry.jpeg.jpg";
import spaceCenterImg from "./assets/Billip Space Center2.jpg";
import lockheedLogo from "./assets/lockheed.png";  

// ─────────────────────────────────────────────
//  THEME / DESIGN TOKENS
// ─────────────────────────────────────────────
const T = {
  navy: "#0b2540", navyMid: "#163656", navyLight: "#1e4a73",
  gold: "#c8a96e", goldLight: "#e2c99a",
  offWhite: "#f7f5f1", warmGray: "#e8e4dc",
  textDark: "#1a1a1a", textMuted: "#6b6b6b", textLight: "#9a9a9a",
  border: "rgba(0,0,0,0.09)",
};

const GF = "@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=DM+Sans:wght@300;400;500&display=swap');";

// ─────────────────────────────────────────────
//  DATA
// ─────────────────────────────────────────────
const PROPERTIES = [
  {
    id: "sam-houston",
    badge: "Planned", badgeColor: "#edf2fb", badgeText: "#2c52a0",
    type: ["office", "available"],
    category: "Office · Planned Development",
    name: "4477 W. Sam Houston Pkwy N",
    address: "Houston, TX 77041",
    specs: [{ label: "Total Size", value: "256,000 SF" }, { label: "Height", value: "10 stories" }, { label: "Delivery", value: "TBD" }],
    featured: true,
    description: "Planned 10-story Class A office building at the intersection of West Sam Houston Pkwy N and Beltway 8. Positioned for corporate headquarters or multi-tenant occupancy.",
    features: ["Beltway 8 visibility", "Pre-lease available", "Structured parking", "LEED targeting"],
    mapLat: 29.8301, mapLng: -95.5683,
    price: "Pre-lease — contact for terms",
    floorPlan: true,
    photo: portwest2,
  },
  {
    id: "lockheed",
    badge: "Completed", badgeColor: "#f0f0f0", badgeText: "#888",
    type: ["office", "industrial"],
    category: "Office / Technology · Build-to-Suit",
    name: "Lockheed Martin / Johnson Engineering",
    address: "555 Forge River Rd, Houston, TX",
    specs: [{ label: "Total Size", value: "108,600 SF" }, { label: "Type", value: "Build-to-suit" }],
    featured: false,
    description: "Office and technology build-to-suit delivered for Lockheed Martin and Johnson Engineering. Advanced tech and assembly space custom-designed for aerospace operations.",
    features: ["Office + tech space", "Assembly areas", "Secure site design", "Build-to-suit (leased)"],
    mapLat: 29.5518, mapLng: -95.1309,
    price: null, floorPlan: false,
    photo: idcAerial,
  },
  {
    id: "office-depot",
    badge: "Completed", badgeColor: "#f0f0f0", badgeText: "#888",
    type: ["industrial"],
    category: "Office / Warehouse · Build-to-Suit",
    name: "Office Depot Distribution",
    address: "6225 N by NW Blvd, Houston, TX",
    specs: [{ label: "Total Size", value: "250,000 SF" }, { label: "Type", value: "Build-to-suit" }],
    featured: false,
    description: "Large-scale office and warehouse distribution center built to suit for Office Depot. One of the largest single-tenant industrial developments in the Billipp portfolio.",
    features: ["Distribution layout", "Office component", "Dock-high loading", "NW Houston location"],
    mapLat: 29.8744, mapLng: -95.5539,
    price: null, floorPlan: false,
    photo: portwest1,
  },
  {
    id: "imperial-valley",
    badge: "Available", badgeColor: "#e8f5ec", badgeText: "#2d7a45",
    type: ["available"],
    category: "Development Site · Available",
    name: "Imperial Valley Development Site",
    address: "Imperial Valley Dr & Lockhaven Dr, Houston, TX",
    specs: [{ label: "Site Area", value: "4.95 acres" }, { label: "Pricing", value: "Contact us" }],
    featured: false,
    description: "Available development site at the SW corner of Imperial Valley Drive and Lockhaven Drive. Suitable for office, industrial, or build-to-suit development. Utilities on-site.",
    features: ["Corner lot", "Utilities on-site", "BTS-ready", "Clear zoning"],
    mapLat: 29.8516, mapLng: -95.3783,
    price: "Contact for pricing",
    floorPlan: false,
    photo: idcEntry,
  },
  {
    id: "forum",
    badge: "Completed", badgeColor: "#f0f0f0", badgeText: "#888",
    type: ["office"],
    category: "Residential / Resort",
    name: "The Forum at Memorial Woods",
    address: "777 N. Post Oak Rd, Houston, TX",
    specs: [{ label: "Total Size", value: "363,000 SF" }, { label: "Type", value: "High-rise" }],
    featured: false,
    description: "363,000 SF luxury high-rise retirement community — one of the flagship mixed-use projects in the Billipp portfolio. Delivered on time and on budget.",
    features: ["High-rise design", "Full amenities", "Flagship project", "Memorial area"],
    mapLat: 29.7602, mapLng: -95.4596,
    price: null, floorPlan: false,
    photo: spaceCenterImg,
  },
  {
    id: "time-warner",
    badge: "Completed", badgeColor: "#f0f0f0", badgeText: "#888",
    type: ["office", "retail"],
    category: "Broadcast / Office · Build-to-Suit",
    name: "Time Warner News 24",
    address: "11150 Equity Dr, Houston, TX",
    specs: [{ label: "Total Size", value: "30,000 SF" }, { label: "Type", value: "Build-to-suit" }],
    featured: false,
    description: "30,000 SF television studio and office build-to-suit for Time Warner Cable's Houston news operation. Custom broadcast infrastructure integrated into the building design.",
    features: ["Broadcast studio", "Office space", "Custom infrastructure", "NW Houston"],
    mapLat: 29.8201, mapLng: -95.5401,
    price: null, floorPlan: false,
    photo: idcEntry,
  },
];

const TEAM = [
  { initials: "JB", name: "Andrew Billipp", role: "Board Executive", bio: "Founder of J.A. Billipp Company with over 40 years developing and investing in Houston commercial real estate. Has led every major project in the firm's portfolio.", color: T.navy },
  { initials: "JB", name: "Peter Billipp", role: "President", bio: "Founder of J.A. Billipp Company with over 40 years developing and investing in Houston commercial real estate. Has led every major project in the firm's portfolio.", color: T.navy },
  { initials: "JB", name: "Margaret Centra", role: "Board Executive", bio: "Founder of J.A. Billipp Company with over 40 years developing and investing in Houston commercial real estate. Has led every major project in the firm's portfolio.", color: T.navy },
 
  { initials: "LL", name: "Liz Lancaster", role: "Leasing & Acquisitions", bio: "Primary point of contact for all leasing and property acquisition inquiries. Deep knowledge of available properties across the Houston metro market.", color: T.navyMid },
  
  { initials: "PM", name: "Lori Hart", role: "Development Team", bio: "Oversees all ground-up development and build-to-suit projects from site selection through delivery, working with Houston's most trusted contractors.", color: T.navyLight },
  { initials: "JB", name: "Matt", role: "__", bio: "Founder of J.A. Billipp Company with over 40 years developing and investing in Houston commercial real estate. Has led every major project in the firm's portfolio.", color: T.navy },

];

const CLIENTS = [
  "Lockheed Martin", "Office Depot", "CooperVision", "McDonnell Douglas",
  "Rockwell Space Ops", "Time Warner", "Administaff / Insperity",
  "Hitachi Construction", "Sears Hardware", "BFI",
];

const LOGOS = [
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
    name: "Development",
    desc: "Ground-up commercial and industrial development across office, retail, industrial, and residential asset classes.",
    items: ["Office buildings", "Industrial / warehouse", "Retail centers", "Residential / resort"],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:40,height:40}}><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>,
  },
  {
    name: "Build-to-Suit",
    desc: "Custom facilities designed and built around your operational requirements — available leased or purchased.",
    items: ["Leased (Billipp owns)", "Purchased (you own)", "Site selection included", "Turnkey delivery"],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:40,height:40}}><path d="M3 21h18M5 21V7l7-4 7 4v14"/></svg>,
  },
  {
    name: "Investment",
    desc: "Strategic acquisition, joint venture, and partnership opportunities in commercial and industrial real estate.",
    items: ["Acquisitions", "Joint ventures", "Partnerships", "Sale-leasebacks"],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:40,height:40}}><path d="M3 3v18h18"/><path d="M7 16l4-4 4 4 4-6"/></svg>,
  },
  {
    name: "Sale-Leasebacks",
    desc: "Sell your property to Billipp and remain as a long-term tenant — unlocking capital without relocating.",
    items: ["Immediate liquidity", "No relocation required", "Flexible lease terms", "Close in 60–90 days"],
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:40,height:40}}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>,
  },
];

const PROCESS_TABS = {
  bts: {
    label: "Build-to-suit",
    steps: [
      { n: "01", title: "Discovery call", desc: "We learn your space requirements, timeline, preferred location, and whether lease or purchase fits your goals." },
      { n: "02", title: "Site selection", desc: "We identify and evaluate sites in Houston that meet your operational and logistical needs." },
      { n: "03", title: "Design & approval", desc: "Architect and engineer the facility around your specs. You review and approve before a shovel turns." },
      { n: "04", title: "Construction", desc: "Billipp manages the build with trusted contractors. Regular updates without managing vendors." },
      { n: "05", title: "Delivery", desc: "Move in on time. Ongoing property management by Billipp with direct access to the team." },
    ],
  },
  invest: {
    label: "Investment",
    steps: [
      { n: "01", title: "Initial discussion", desc: "Share the opportunity — acquisition target, JV structure, or partnership concept. We respond within 48 hours." },
      { n: "02", title: "Underwriting", desc: "We analyze the deal with our own capital and expertise — no lengthy approval committees." },
      { n: "03", title: "Letter of intent", desc: "If the deal works, we move to LOI quickly. Our 40-year track record means lenders and partners know us." },
      { n: "04", title: "Due diligence", desc: "Thorough but efficient. We know what to look for in Houston commercial and industrial assets." },
      { n: "05", title: "Close & manage", desc: "We close and operate the asset as owners — aligned with every partner in the deal." },
    ],
  },
  leaseback: {
    label: "Sale-leaseback",
    steps: [
      { n: "01", title: "You own a property", desc: "Your business owns the building it operates in — and you want to free up that capital for growth." },
      { n: "02", title: "Billipp buys it", desc: "We purchase the property at fair market value, providing immediate liquidity to your business." },
      { n: "03", title: "You stay in place", desc: "Simultaneously, you sign a long-term lease — your operations never skip a beat." },
      { n: "04", title: "Capital deployed", desc: "Cash from the sale goes into your business — new equipment, expansion, acquisitions, or debt reduction." },
    ],
  },
};

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
function LogoCarousel() {
  const doubled = [...LOGOS, ...LOGOS]; // seamless loop
  return (
    <div style={{ background:T.navy, borderTop:`1px solid rgba(200,169,110,0.2)`, borderBottom:`1px solid rgba(200,169,110,0.2)`, padding:"28px 0", overflow:"hidden" }}>
      <div style={{ display:"flex", width:"max-content", animation:"marquee 28s linear infinite" }}>
        {doubled.map((l, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:14, padding:"0 44px", borderRight:`1px solid rgba(200,169,110,0.15)`, flexShrink:0 }}>
            <div style={{ width:48, height:48, borderRadius:8, background:"rgba(200,169,110,0.12)", border:`1px solid rgba(200,169,110,0.35)`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:T.gold, letterSpacing:"0.06em", flexShrink:0 }}>
              {l.icon || l.abbr}
            </div>
            <span style={{ fontSize:14, color:"rgba(255,255,255,0.75)", fontWeight:400, whiteSpace:"nowrap", letterSpacing:"0.02em" }}>{l.name}</span>
          </div>
        ))}
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
    { label:"Services", anchor:"services" }, { label:"Portfolio", anchor:"portfolio" },
    { label:"About", anchor:"about" }, { label:"Directory", id:"directory" },
    
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
      <button onClick={()=>{setPage("home");window.scrollTo(0,0)}} style={{ background:"none", border:"none", cursor:"pointer", textAlign:"left", padding:0 }}>
        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:17, color:T.goldLight, letterSpacing:"0.02em" }}>Billipp</div>
        <div style={{ color:"rgba(255,255,255,0.45)", fontSize:11, fontWeight:300, letterSpacing:"0.12em", textTransform:"uppercase", marginTop:-2 }}>Company</div>
      </button>
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
        Commercial & industrial<br/>real estate. <span style={{ color:T.goldLight, fontStyle:"normal" }}>Built to endure.</span>
      </h1>
      <p className="fade-up fade3" style={{ color:"rgba(255,255,255,0.55)", fontSize:16, fontWeight:300, maxWidth:480, lineHeight:1.7, marginBottom:"2.5rem" }}>
        Development, build-to-suit, and strategic investment across Greater Houston — managed by an owner, not a manager.
      </p>
      <div className="fade-up fade4" style={{ display:"flex", gap:12, flexWrap:"wrap" }}>
        <BtnPrimary onClick={()=>document.getElementById("portfolio")?.scrollIntoView({behavior:"smooth"})}>View portfolio</BtnPrimary>
        <BtnGhost onClick={()=>document.getElementById("contact")?.scrollIntoView({behavior:"smooth"})}>Start a conversation</BtnGhost>
      </div>
      </div>

      {/* Stats */}
      <div style={{ position:"absolute", right:"3rem", bottom:"5rem", display:"flex", flexDirection:"column", gap:24, zIndex:1 }}>
        {[["40+","Years active"],["3M+","Sq. ft. developed"],["32+","Completed projects"]].map(([n,l])=>(
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
//  SERVICES
// ─────────────────────────────────────────────
function Services() {
  const [hov, setHov] = useState(null);
  return (
    <section id="services" style={{ background:T.navy, padding:"6rem 1.5rem" }}>
      <SectionTag>What we do</SectionTag>
      <SectionTitle light>Four disciplines.<br/>One firm.</SectionTitle>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:1, background:"rgba(200,169,110,0.15)", border:"1px solid rgba(200,169,110,0.15)", borderRadius:8, overflow:"hidden", marginTop:"3rem" }}>
        {SERVICES.map((s,i) => (
          <div key={s.name} onMouseEnter={()=>setHov(i)} onMouseLeave={()=>setHov(null)}
            style={{ background: hov===i?T.navyLight:T.navyMid, padding:"2rem 1.75rem", transition:"background 0.2s" }}>
            <div style={{ color:T.gold, marginBottom:"1.25rem" }}>{s.icon}</div>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:18, color:"#fff", marginBottom:"0.6rem" }}>{s.name}</p>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.45)", lineHeight:1.7, fontWeight:300 }}>{s.desc}</p>
            <ul style={{ listStyle:"none", marginTop:"1rem" }}>
              {s.items.map(item=>(
                <li key={item} style={{ fontSize:12, color:"rgba(255,255,255,0.4)", padding:"3px 0", display:"flex", alignItems:"center", gap:6 }}>
                  <span style={{ color:T.gold, fontSize:10 }}>—</span>{item}
                </li>
              ))}
            </ul>
          </div>
        ))}
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
          <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", flexDirection:"column", gap:8 }}>
            <svg style={{ width:48, height:48, color:"rgba(11,37,64,0.18)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/></svg>
            <span style={{ fontSize:11, color:"rgba(11,37,64,0.28)", letterSpacing:"0.1em", textTransform:"uppercase" }}>Property photo</span>
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

function Portfolio({ setDetailProp }) {
  const [filter, setFilter] = useState("all");
  const filters = ["all","office","industrial","retail","available"];
  const visible = PROPERTIES.filter(p => filter==="all" || p.type.includes(filter));

  return (
    <section id="portfolio" style={{ background:T.offWhite, padding:"6rem 1.5rem" }}>
      <SectionTag>Portfolio</SectionTag>
      <SectionTitle>32 completed projects.<br/>One Houston market.</SectionTitle>
      <p style={{ color:T.textMuted, fontSize:15, lineHeight:1.75, maxWidth:560, marginBottom:"2.5rem", fontWeight:300 }}>
        A selective track record built over four decades for tenants including Lockheed Martin, Office Depot, and CooperVision.
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
function MapEmbed({ lat, lng, name }) {
  const mapRef = useRef(null);
  // Use OpenStreetMap iframe embed (no API key needed)
  const bbox = `${lng-0.02},${lat-0.015},${lng+0.02},${lat+0.015}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lng}`;
  return (
    <div style={{ borderRadius:8, overflow:"hidden", border:`1px solid ${T.border}`, position:"relative" }}>
      <iframe title={`Map for ${name}`} src={src} width="100%" height="320" style={{ border:"none", display:"block" }} loading="lazy" />
      <div style={{ position:"absolute", top:10, right:10 }}>
        <a href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`} target="_blank" rel="noopener noreferrer"
          style={{ background:T.navy, color:T.goldLight, fontSize:11, padding:"5px 10px", borderRadius:4, textDecoration:"none", letterSpacing:"0.06em" }}>
          Open map ↗
        </a>
      </div>
    </div>
  );
}

function PropertyDetail({ prop, setDetailProp, setPage }) {
  const [tab, setTab] = useState("overview");
  if (!prop) return null;

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
        {["overview","map","contact"].map(t=>(
          <button key={t} onClick={()=>setTab(t)}
            style={{ padding:"14px 24px", borderBottom:`2px solid ${tab===t?T.gold:"transparent"}`, background:"none", border:"none", borderBottom:`2px solid ${tab===t?T.gold:"transparent"}`, fontSize:13, color: tab===t?T.navy:T.textMuted, cursor:"pointer", fontWeight: tab===t?500:400, transition:"all 0.2s", fontFamily:"inherit", textTransform:"capitalize" }}>
            {t}
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
              {prop.floorPlan && (
                <div style={{ marginTop:"1.5rem", padding:"1rem 1.25rem", border:`1px dashed ${T.border}`, borderRadius:8, display:"flex", alignItems:"center", gap:12 }}>
                  <svg style={{ width:28, height:28, color:T.navy, flexShrink:0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 9v12"/></svg>
                  <div>
                    <p style={{ fontSize:13, fontWeight:500, color:T.navy }}>Floor plan available</p>
                    <p style={{ fontSize:12, color:T.textLight }}>PDF download upon request</p>
                  </div>
                  <BtnSm variant="outline" style={{ marginLeft:"auto" }} onClick={()=>document.getElementById("contact")?.scrollIntoView({behavior:"smooth"})}>Request PDF</BtnSm>
                </div>
              )}
            </div>
            <div>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:T.navy, marginBottom:"1rem" }}>Location</h3>
              <MapEmbed lat={prop.mapLat} lng={prop.mapLng} name={prop.name} />
              <div style={{ marginTop:"1rem", padding:"0.875rem 1rem", background:"#fff", border:`1px solid ${T.border}`, borderRadius:6, display:"flex", alignItems:"center", gap:10 }}>
                <svg style={{ width:18, height:18, color:T.gold, flexShrink:0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>
                <p style={{ fontSize:13, color:T.textMuted }}>{prop.address}</p>
              </div>
            </div>
          </div>
        )}

        {tab==="map" && (
          <div>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:T.navy, marginBottom:"1.5rem" }}>Property location</h3>
            <MapEmbed lat={prop.mapLat} lng={prop.mapLng} name={prop.name} />
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
              <p style={{ fontSize:14, color:T.textMuted, lineHeight:1.75, marginBottom:"1.5rem" }}>Contact Liz Lancaster directly for leasing rates, availability, and to schedule a site tour.</p>
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                {[["Phone","(713) 426-5000"],["Toll free","(800) 216-9013"],["Leasing contact","Liz Lancaster"],["Office","6925 Portwest Dr, Suite 130, Houston TX 77024"]].map(([l,v])=>(
                  <div key={l}><p style={{ fontSize:11, color:T.textLight, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:2 }}>{l}</p><p style={{ fontSize:14, color:T.navy }}>{v}</p></div>
                ))}
              </div>
            </div>
            <ContactForm propertyName={prop.name} />
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
    </section>
  );
}

// ─────────────────────────────────────────────
//  PROCESS
// ─────────────────────────────────────────────
function Process() {
  const [activeTab, setActiveTab] = useState("bts");
  return (
    <section id="process" style={{ background:T.offWhite, padding:"6rem 1.5rem" }}>
      <SectionTag>How we work</SectionTag>
      <SectionTitle>A straightforward process<br/>for each engagement.</SectionTitle>
      <p style={{ color:T.textMuted, fontSize:15, lineHeight:1.75, maxWidth:560, marginBottom:"2.5rem", fontWeight:300 }}>
        Whether you're a prospective tenant, an investor, or exploring a build-to-suit — here's what working with Billipp looks like.
      </p>
      {/* Tabs */}
      <div style={{ display:"flex", gap:4, background:T.warmGray, borderRadius:4, padding:4, width:"fit-content", marginBottom:"2.5rem" }}>
        {Object.entries(PROCESS_TABS).map(([k,v])=>(
          <button key={k} onClick={()=>setActiveTab(k)}
            style={{ padding:"8px 20px", borderRadius:4, border:"none", fontSize:13, cursor:"pointer", background: activeTab===k?"#fff":"transparent", color: activeTab===k?T.navy:T.textMuted, fontWeight: activeTab===k?500:400, boxShadow: activeTab===k?"0 1px 4px rgba(0,0,0,0.08)":"none", transition:"all 0.2s", fontFamily:"inherit" }}>
            {v.label}
          </button>
        ))}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:`repeat(${PROCESS_TABS[activeTab].steps.length},1fr)`, gap:0, position:"relative" }}>
        {PROCESS_TABS[activeTab].steps.map((s,i)=>(
          <div key={s.n} style={{ padding:"1.5rem", position:"relative" }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:40, color:T.warmGray, fontWeight:500, lineHeight:1, marginBottom:8 }}>{s.n}</div>
            <p style={{ fontSize:14, fontWeight:500, color:T.navy, marginBottom:4 }}>{s.title}</p>
            <p style={{ fontSize:12, color:T.textMuted, lineHeight:1.6 }}>{s.desc}</p>
            {i < PROCESS_TABS[activeTab].steps.length-1 && (
              <span style={{ position:"absolute", right:-10, top:"40%", color:T.gold, fontSize:20, fontWeight:300 }}>→</span>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────
//  CONTACT FORM (reusable)
// ─────────────────────────────────────────────
function ContactForm({ propertyName }) {
  const [form, setForm] = useState({
    first: "", last: "", company: "", email: "",
    topic: propertyName ? "Leasing available space" : "",
    message: propertyName ? `I'm interested in ${propertyName}.` : "",
  });
  const [status, setStatus] = useState("idle"); // "idle" | "sending" | "sent" | "error"

  const inputStyle = { background:"rgba(255,255,255,0.06)", border:`1px solid rgba(255,255,255,0.12)`, borderRadius:4, padding:"10px 14px", color:"rgba(255,255,255,0.85)", fontSize:14, fontWeight:300, outline:"none", width:"100%", fontFamily:"inherit" };
  const labelStyle = { fontSize:11, color:"rgba(255,255,255,0.4)", letterSpacing:"0.08em", textTransform:"uppercase" };

  const field = (label, key, type="text", placeholder="") => (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={labelStyle}>{label}</label>
      <input type={type} value={form[key]} onChange={e=>setForm({...form,[key]:e.target.value})}
        placeholder={placeholder} style={inputStyle} />
    </div>
  );

  async function handleSend() {
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
      setStatus("sent");
    } catch (err) {
      console.error("EmailJS error:", err);
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
          style={{ ...inputStyle, fontWeight:400, background:T.navyMid, color:"rgba(255,255,255,0.85)" }}>
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
          {[["Address","6925 Portwest Drive, Suite 130\nHouston, Texas 77024"],["Phone","(713) 426-5000"],["Leasing inquiries","Contact Liz Lancaster directly"]].map(([l,v])=>(
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
      <p style={{ fontSize:12, color:"rgba(255,255,255,0.25)" }}>© 2025 J.A. Billipp Company · Houston, Texas · All rights reserved</p>
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
function DirectoryPage({ setPage }) {
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
          {[["40+","Years in business"],["32+","Completed projects"],["3M+ SF","Developed & managed"],["10+","Fortune 500 tenants"]].map(([n,l])=>(
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
            {CLIENTS.map(c=>(
              <div key={c} style={{ background:"#fff", border:`1px solid ${T.border}`, borderRadius:6, padding:"1rem 1.1rem", display:"flex", alignItems:"center", gap:10 }}>
                <div style={{ width:32, height:32, borderRadius:5, background:T.navy, display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, color:T.gold, flexShrink:0, letterSpacing:"0.05em" }}>
                  {c.split(" ").map(w=>w[0]).join("").slice(0,2)}
                </div>
                <span style={{ fontSize:13, color:T.textMuted, lineHeight:1.3 }}>{c}</span>
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
function HomePage({ setPage, setDetailProp }) {
  return (
    <>
      <Hero setPage={setPage} />
      <LogoCarousel />
      <Services />
      <Portfolio setDetailProp={setDetailProp} />
      <About />
      <Process />
      <Contact />
      <Footer setPage={setPage} />
    </>
  );
}

// ─────────────────────────────────────────────
//  ROOT APP
// ─────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home"); // "home" | "about" | "directory" | "detail"
  const [detailProp, setDetailProp] = useState(null);

  function handleSetDetailProp(p) {
    setDetailProp(p);
    setPage("detail");
    window.scrollTo(0,0);
  }

  return (
    <>
      <style>{GF}{css}</style>
      <Nav page={page} setPage={(p)=>{ setPage(p); if(p==="home") setDetailProp(null); }} />
      <main>
        {page === "home" && <HomePage setPage={setPage} setDetailProp={handleSetDetailProp} />}
        {page === "directory" && <DirectoryPage setPage={setPage} />}
        {page === "detail" && detailProp && (
          <PropertyDetail prop={detailProp} setDetailProp={(p)=>{ if(p){setDetailProp(p);}else{setPage("home");setDetailProp(null);window.scrollTo(0,0);}}} setPage={setPage} />
        )}
      </main>
    </>
  );
}
