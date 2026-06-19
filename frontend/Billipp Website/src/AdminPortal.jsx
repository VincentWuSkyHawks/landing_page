import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabaseClient";
import billippLogo from "./assets/logo.png";

const T = {
  navy: "#0b2540", navyMid: "#163656", navyLight: "#1e4a73",
  gold: "#c8a96e", goldLight: "#e2c99a",
  offWhite: "#f7f5f1", warmGray: "#e8e4dc",
  textMuted: "#6b6b6b", border: "rgba(0,0,0,0.09)",
};

const BLANK = {
  name: "", address: "", category: "", badge: "Planned",
  badge_color: "#edf2fb", badge_text: "#2c52a0",
  type: [], featured: false, description: "",
  features: "", specs: "",
  map_lat: "", map_lng: "",
  price: "", floor_plan: false,
  files: [],   // [{ url, name, type: "image"|"pdf", size }]
  links: [],   // [{ label, url }]
};

const BADGE_PRESETS = [
  { label: "Planned",   bg: "#edf2fb", text: "#2c52a0" },
  { label: "Available", bg: "#e8f5ec", text: "#2d7a45" },
  { label: "Completed", bg: "#f0f0f0", text: "#888888" },
  { label: "Active",    bg: "#fff8e1", text: "#b45309" },
];

const TYPE_OPTIONS = ["office", "industrial", "retail", "available", "residential"];

const inp = {
  width: "100%", padding: "9px 12px", borderRadius: 5,
  border: `1px solid ${T.border}`, background: "#fff",
  fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
};

const Label = ({ children }) => (
  <label style={{ fontSize: 11, fontWeight: 500, color: T.textMuted, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>
    {children}
  </label>
);

const Field = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <Label>{label}</Label>
    {children}
  </div>
);

function specsFromString(str) {
  return str.split("|").map(s => {
    const [label, ...rest] = s.split(":");
    return { label: label?.trim(), value: rest.join(":").trim() };
  }).filter(s => s.label && s.value);
}

function specsToString(arr) {
  if (!Array.isArray(arr)) return "";
  return arr.map(s => `${s.label}: ${s.value}`).join(" | ");
}

function featuresFromString(str) {
  return str.split(",").map(f => f.trim()).filter(Boolean);
}

function typesFromString(str) {
  if (Array.isArray(str)) return str;
  return str ? str.split(",").map(t => t.trim()).filter(Boolean) : [];
}

function fmtSize(bytes) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// ─────────────────────────────────────────────────────────────────────────────
//  FILE MANAGER  — handles multi-photo + PDF uploads
// ─────────────────────────────────────────────────────────────────────────────
function FileManager({ files, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors]       = useState([]);
  const fileRef = useRef();

  const images = files.filter(f => f.type === "image");
  const docs   = files.filter(f => f.type === "pdf");

  async function handleFiles(e) {
    const selected = Array.from(e.target.files);
    if (!selected.length) return;
    setErrors([]);
    setUploading(true);

    const newFiles = [];
    const errs = [];

    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"];
    const MAX_BYTES = 50 * 1024 * 1024; // 50 MB

    for (const file of selected) {
      const isPdf = file.type === "application/pdf";
      const isImg = file.type.startsWith("image/");
      if (!ALLOWED_TYPES.includes(file.type)) {
        errs.push(`${file.name}: unsupported type (allowed: JPG, PNG, WEBP, GIF, PDF)`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        errs.push(`${file.name}: file too large (max 10 MB)`);
        continue;
      }

      const ext  = file.name.split(".").pop();
      const slug = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
      const path = `properties/${Date.now()}_${slug}`;

      const { error } = await supabase.storage
        .from("property-photos")
        .upload(path, file, { upsert: true });

      if (error) { errs.push(`${file.name}: ${error.message}`); continue; }

      const { data } = supabase.storage.from("property-photos").getPublicUrl(path);
      newFiles.push({
        url:  data.publicUrl,
        name: file.name,
        type: isPdf ? "pdf" : "image",
        size: file.size,
      });
    }

    setErrors(errs);
    setUploading(false);
    onChange([...files, ...newFiles]);
    e.target.value = ""; // reset input
  }

  function remove(url) {
    onChange(files.filter(f => f.url !== url));
  }

  function moveHero(url) {
    const idx = files.findIndex(f => f.url === url);
    if (idx <= 0) return;
    const next = [...files];
    [next[0], next[idx]] = [next[idx], next[0]];
    onChange(next);
  }

  const thumbStyle = (isHero) => ({
    position: "relative", borderRadius: 6, overflow: "hidden",
    border: `2px solid ${isHero ? T.gold : T.border}`,
    background: T.warmGray,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

      {/* Upload button */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept="image/*,.pdf,application/pdf"
          onChange={handleFiles}
          style={{ display: "none" }}
        />
        <button
          type="button"
          onClick={() => fileRef.current.click()}
          disabled={uploading}
          style={{ padding: "9px 18px", background: T.navy, color: "#fff", border: "none", borderRadius: 5, fontSize: 13, cursor: uploading ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7, opacity: uploading ? 0.6 : 1 }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width={15} height={15}><path d="M10 3a1 1 0 0 1 .707.293l3 3a1 1 0 0 1-1.414 1.414L11 6.414V13a1 1 0 1 1-2 0V6.414L7.707 7.707A1 1 0 0 1 6.293 6.293l3-3A1 1 0 0 1 10 3zM4 15a1 1 0 1 0 0 2h12a1 1 0 1 0 0-2H4z"/></svg>
          {uploading ? "Uploading…" : "Upload photos / PDFs"}
        </button>
        <span style={{ fontSize: 12, color: T.textMuted }}>Select multiple files at once · JPG, PNG, WEBP, PDF</span>
      </div>

      {/* Upload errors */}
      {errors.length > 0 && (
        <div style={{ background: "#fef2f2", border: "1px solid #fca5a5", borderRadius: 6, padding: "10px 14px" }}>
          {errors.map((e, i) => <p key={i} style={{ fontSize: 12, color: "#dc2626" }}>{e}</p>)}
        </div>
      )}

      {/* Photo gallery */}
      {images.length > 0 && (
        <div>
          <Label>Photos — first image is the portfolio card hero</Label>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 6 }}>
            {images.map((f, i) => (
              <div key={f.url} style={{ ...thumbStyle(i === 0), width: 140 }}>
                <img src={f.url} alt={f.name} style={{ width: "100%", height: 96, objectFit: "cover", display: "block" }} />

                {/* Hero badge */}
                {i === 0 && (
                  <div style={{ position: "absolute", top: 6, left: 6, background: T.gold, color: T.navy, fontSize: 9, fontWeight: 700, padding: "2px 6px", borderRadius: 3, letterSpacing: "0.06em" }}>
                    HERO
                  </div>
                )}

                {/* Controls overlay */}
                <div style={{ display: "flex", gap: 4, padding: "6px 6px 6px", background: "rgba(0,0,0,0.03)", borderTop: `1px solid ${T.border}` }}>
                  {i !== 0 && (
                    <button type="button" onClick={() => moveHero(f.url)}
                      title="Set as hero"
                      style={{ flex: 1, fontSize: 10, padding: "3px 6px", background: T.navy, color: "#fff", border: "none", borderRadius: 3, cursor: "pointer", fontFamily: "inherit" }}>
                      ★ Hero
                    </button>
                  )}
                  <button type="button" onClick={() => remove(f.url)}
                    title="Remove"
                    style={{ flex: i === 0 ? 1 : 0, fontSize: 10, padding: "3px 8px", background: "#fff", color: "#dc2626", border: "1px solid #fca5a5", borderRadius: 3, cursor: "pointer", fontFamily: "inherit" }}>
                    ✕
                  </button>
                </div>

                {/* Filename */}
                <div style={{ padding: "4px 6px 6px", fontSize: 10, color: T.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={f.name}>
                  {f.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PDF documents */}
      {docs.length > 0 && (
        <div>
          <Label>Documents (PDFs)</Label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 6 }}>
            {docs.map(f => (
              <div key={f.url} style={{ display: "flex", alignItems: "center", gap: 12, background: "#fff", border: `1px solid ${T.border}`, borderRadius: 6, padding: "10px 14px" }}>
                {/* PDF icon */}
                <div style={{ width: 36, height: 36, borderRadius: 5, background: "#fee2e2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" width={18} height={18}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                    <line x1="9" y1="11" x2="15" y2="11"/>
                  </svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: T.navy, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</p>
                  <p style={{ fontSize: 11, color: T.textMuted }}>{fmtSize(f.size)}</p>
                </div>
                <a href={f.url} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: 12, color: T.navy, textDecoration: "none", padding: "5px 10px", border: `1px solid ${T.border}`, borderRadius: 4 }}>
                  Preview ↗
                </a>
                <button type="button" onClick={() => remove(f.url)}
                  style={{ background: "none", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: 4, padding: "5px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {files.length === 0 && !uploading && (
        <p style={{ fontSize: 13, color: "#aaa", fontStyle: "italic" }}>No files yet — upload photos or PDF documents above.</p>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  LINKS MANAGER  — named hyperlinks attached to a property
// ─────────────────────────────────────────────────────────────────────────────
function LinksManager({ links, onChange }) {
  const [label, setLabel] = useState("");
  const [url,   setUrl]   = useState("");
  const [err,   setErr]   = useState("");

  function add() {
    if (!label.trim()) { setErr("Enter a link name."); return; }
    if (!url.trim() || (!url.startsWith("http://") && !url.startsWith("https://"))) {
      setErr("Enter a full URL starting with https://");
      return;
    }
    setErr("");
    onChange([...links, { label: label.trim(), url: url.trim() }]);
    setLabel("");
    setUrl("");
  }

  function remove(i) {
    onChange(links.filter((_, idx) => idx !== i));
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Existing links */}
      {links.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {links.map((l, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "#fff", border: `1px solid ${T.border}`, borderRadius: 6, padding: "9px 14px" }}>
              <svg viewBox="0 0 20 20" fill="currentColor" width={14} height={14} style={{ color: T.navy, flexShrink: 0 }}><path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/></svg>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 500, color: T.navy }}>{l.label}</p>
                <p style={{ fontSize: 11, color: T.textMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.url}</p>
              </div>
              <a href={l.url} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 12, color: T.navy, padding: "4px 10px", border: `1px solid ${T.border}`, borderRadius: 4, textDecoration: "none", flexShrink: 0 }}>
                Test ↗
              </a>
              <button type="button" onClick={() => remove(i)}
                style={{ background: "none", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: 4, padding: "4px 10px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add new link */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 10, alignItems: "flex-end" }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 500, color: T.textMuted, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Link name</label>
          <input
            value={label} onChange={e => setLabel(e.target.value)}
            placeholder='e.g. "View Brochure"'
            style={{ width: "100%", padding: "9px 12px", borderRadius: 5, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
            onKeyDown={e => e.key === "Enter" && add()}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 500, color: T.textMuted, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>URL</label>
          <input
            value={url} onChange={e => setUrl(e.target.value)}
            placeholder="https://..."
            style={{ width: "100%", padding: "9px 12px", borderRadius: 5, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box" }}
            onKeyDown={e => e.key === "Enter" && add()}
          />
        </div>
        <button type="button" onClick={add}
          style={{ padding: "9px 18px", background: T.navy, color: "#fff", border: "none", borderRadius: 5, fontSize: 13, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
          + Add link
        </button>
      </div>
      {err && <p style={{ fontSize: 12, color: "#dc2626" }}>{err}</p>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  GEOCODER ROW  — auto-fills lat/lng from the property address
// ─────────────────────────────────────────────────────────────────────────────
function GeocoderRow({ address, lat, lng, onResult, inp, onChange }) {
  const [status, setStatus] = useState("idle"); // idle | loading | ok | err

  async function handleGeocode() {
    if (!address) return;
    setStatus("loading");
    try {
      const q = encodeURIComponent(address);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${q}&format=json&limit=1`,
        { headers: { "Accept-Language": "en", "User-Agent": "BillippAdminPortal/1.0" } }
      );
      const data = await res.json();
      if (data && data[0]) {
        onResult(parseFloat(data[0].lat).toFixed(6), parseFloat(data[0].lon).toFixed(6));
        setStatus("ok");
      } else {
        setStatus("err");
      }
    } catch {
      setStatus("err");
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: 11, fontWeight: 500, color: T.textMuted, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Latitude</label>
          <input style={inp} type="number" step="any" value={lat} onChange={e => onChange("map_lat", e.target.value)} placeholder="29.8744" />
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <label style={{ fontSize: 11, fontWeight: 500, color: T.textMuted, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Longitude</label>
          <input style={inp} type="number" step="any" value={lng} onChange={e => onChange("map_lng", e.target.value)} placeholder="-95.5539" />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          type="button"
          onClick={handleGeocode}
          disabled={!address || status === "loading"}
          style={{ padding: "7px 16px", background: T.navy, color: "#fff", border: "none", borderRadius: 5, fontSize: 12, cursor: !address || status === "loading" ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 7, opacity: !address || status === "loading" ? 0.55 : 1 }}
        >
          <svg viewBox="0 0 20 20" fill="currentColor" width={13} height={13}><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd"/></svg>
          {status === "loading" ? "Locating…" : "Auto-fill from address"}
        </button>
        {status === "ok"  && <span style={{ fontSize: 12, color: "#16a34a" }}>✓ Coordinates filled</span>}
        {status === "err" && <span style={{ fontSize: 12, color: "#dc2626" }}>Address not found — enter coordinates manually</span>}
        {!address && <span style={{ fontSize: 12, color: T.textMuted }}>Fill in Address above first</span>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  PROPERTY FORM
// ─────────────────────────────────────────────────────────────────────────────
function PropertyForm({ initial, onSave, onCancel }) {
  const [form, setForm] = useState({
    ...BLANK,
    ...initial,
    specs:    specsToString(initial?.specs),
    features: Array.isArray(initial?.features) ? initial.features.join(", ") : (initial?.features || ""),
    type:     typesFromString(initial?.type),
    files:    Array.isArray(initial?.files) ? initial.files : [],
    links:    Array.isArray(initial?.links) ? initial.links : [],
  });
  const [saving, setSaving] = useState(false);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  function toggleType(t) {
    set("type", form.type.includes(t) ? form.type.filter(x => x !== t) : [...form.type, t]);
  }

  async function handleSave() {
    setSaving(true);
    const badge = BADGE_PRESETS.find(b => b.label === form.badge) || BADGE_PRESETS[0];
    const images = form.files.filter(f => f.type === "image");
    const payload = {
      name:        form.name,
      address:     form.address,
      category:    form.category,
      badge:       form.badge,
      badge_color: badge.bg,
      badge_text:  badge.text,
      type:        form.type,
      featured:    form.featured,
      description: form.description,
      features:    featuresFromString(form.features),
      specs:       specsFromString(form.specs),
      map_lat:     parseFloat(form.map_lat) || null,
      map_lng:     parseFloat(form.map_lng) || null,
      price:       form.price || null,
      floor_plan:  form.floor_plan,
      files:       form.files,
      links:       form.links,
      photo_url:   images[0]?.url || null,   // first image = hero for cards
    };
    await onSave(payload, form.id);
    setSaving(false);
  }

  const sectionHead = (label) => (
    <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: T.navy, borderBottom: `2px solid ${T.gold}`, paddingBottom: 6, marginBottom: 4 }}>
      {label}
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

      {sectionHead("Basic info")}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Property name">
          <input style={inp} value={form.name} onChange={e => set("name", e.target.value)} placeholder="e.g. Portwest Distribution Center" />
        </Field>
        <Field label="Address">
          <input style={inp} value={form.address} onChange={e => set("address", e.target.value)} placeholder="6925 Portwest Dr, Houston, TX" />
        </Field>
        <Field label="Category subtitle">
          <input style={inp} value={form.category} onChange={e => set("category", e.target.value)} placeholder="Office / Warehouse · Build-to-Suit" />
        </Field>
        <Field label="Status badge">
          <select style={inp} value={form.badge} onChange={e => set("badge", e.target.value)}>
            {BADGE_PRESETS.map(b => <option key={b.label}>{b.label}</option>)}
          </select>
        </Field>
      </div>

      {sectionHead("Classification")}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {TYPE_OPTIONS.map(t => (
          <button key={t} type="button" onClick={() => toggleType(t)}
            style={{ padding: "5px 14px", borderRadius: 99, fontSize: 12, cursor: "pointer", border: `1px solid ${form.type.includes(t) ? T.navy : T.border}`, background: form.type.includes(t) ? T.navy : "#fff", color: form.type.includes(t) ? "#fff" : T.textMuted, fontFamily: "inherit", transition: "all 0.15s" }}>
            {t}
          </button>
        ))}
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: T.textMuted, cursor: "pointer", marginLeft: 8 }}>
          <input type="checkbox" checked={form.featured} onChange={e => set("featured", e.target.checked)} />
          Featured (wide card)
        </label>
      </div>

      {sectionHead("Description & features")}
      <Field label="Description">
        <textarea style={{ ...inp, resize: "vertical" }} rows={4} value={form.description}
          onChange={e => set("description", e.target.value)}
          placeholder="Describe the property — location, tenant, use type, and notable details." />
      </Field>
      <Field label="Key features (comma-separated)">
        <input style={inp} value={form.features} onChange={e => set("features", e.target.value)}
          placeholder="Dock-high loading, Office component, NW Houston location" />
      </Field>
      <Field label="Specs (Label: Value | Label: Value)">
        <input style={inp} value={form.specs} onChange={e => set("specs", e.target.value)}
          placeholder="Total Size: 250,000 SF | Type: Build-to-suit | Year: 2003" />
      </Field>

      {sectionHead("Pricing & plan")}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Field label="Price / asking (leave blank if not shown)">
          <input style={inp} value={form.price} onChange={e => set("price", e.target.value)}
            placeholder="Pre-lease — contact for terms" />
        </Field>
        <div style={{ display: "flex", alignItems: "flex-end", paddingBottom: 2 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13, color: T.textMuted, cursor: "pointer" }}>
            <input type="checkbox" checked={form.floor_plan} onChange={e => set("floor_plan", e.target.checked)} />
            Floor plan available (PDF on request)
          </label>
        </div>
      </div>

      {sectionHead("Map coordinates")}
      <GeocoderRow
        address={form.address}
        lat={form.map_lat}
        lng={form.map_lng}
        onResult={(lat, lng) => { set("map_lat", lat); set("map_lng", lng); }}
        inp={inp}
        onChange={(k, v) => set(k, v)}
      />

      {sectionHead("Links")}
      <LinksManager links={form.links} onChange={v => set("links", v)} />

      {sectionHead("Photos & documents")}
      <FileManager files={form.files} onChange={v => set("files", v)} />

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10, paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
        <button onClick={handleSave} disabled={saving || !form.name}
          style={{ background: saving ? "rgba(200,169,110,0.5)" : T.gold, color: T.navy, border: "none", borderRadius: 5, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: saving || !form.name ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
          {saving ? "Saving…" : form.id ? "Save changes" : "Add property"}
        </button>
        <button onClick={onCancel}
          style={{ background: "transparent", color: T.textMuted, border: `1px solid ${T.border}`, borderRadius: 5, padding: "10px 20px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  COMPANY MANAGER
// ─────────────────────────────────────────────────────────────────────────────
function CompanyManager({ showToast }) {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState(null); // null = list, {} = new, row = edit
  const [deleteId, setDeleteId]   = useState(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const logoRef = useRef();

  const blankForm = { name: "", abbr: "", logo_url: "", show_carousel: true, show_directory: true };
  const [form, setForm] = useState(blankForm);
  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function load() {
    setLoading(true);
    const { data } = await supabase.from("companies").select("*").order("sort_order").order("name");
    setCompanies(data || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  function startAdd()  { setForm(blankForm); setEditing("new"); }
  function startEdit(c) { setForm({ ...blankForm, ...c }); setEditing(c.id); }
  function cancel()    { setEditing(null); }

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setLogoUploading(true);
    const path = `companies/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, "_")}`;
    const { error } = await supabase.storage.from("property-photos").upload(path, file, { upsert: true });
    if (error) { showToast(error.message, "error"); setLogoUploading(false); return; }
    const { data } = supabase.storage.from("property-photos").getPublicUrl(path);
    setF("logo_url", data.publicUrl);
    setLogoUploading(false);
    e.target.value = "";
  }

  async function handleSave() {
    const payload = {
      name:           form.name,
      abbr:           form.abbr || form.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase(),
      logo_url:       form.logo_url || null,
      show_carousel:  form.show_carousel,
      show_directory: form.show_directory,
    };
    if (editing === "new") {
      const { error } = await supabase.from("companies").insert(payload);
      if (error) { showToast(error.message, "error"); return; }
      showToast("Company added.");
    } else {
      const { error } = await supabase.from("companies").update(payload).eq("id", editing);
      if (error) { showToast(error.message, "error"); return; }
      showToast("Company updated.");
    }
    load(); setEditing(null);
  }

  async function handleDelete(id) {
    const { error } = await supabase.from("companies").delete().eq("id", id);
    if (error) { showToast(error.message, "error"); return; }
    setDeleteId(null); showToast("Company removed."); load();
  }

  const rowInp = { padding: "8px 12px", borderRadius: 5, border: `1px solid ${T.border}`, fontSize: 13, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" };

  if (editing !== null) return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.5rem" }}>
        <button onClick={cancel} style={{ background: "none", border: "none", color: T.textMuted, fontSize: 13, cursor: "pointer", padding: 0 }}>← Back</button>
        <span style={{ color: T.border }}>|</span>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 20, color: T.navy }}>{editing === "new" ? "Add company" : `Edit: ${form.name}`}</h2>
      </div>
      <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 10, padding: "2rem", display: "flex", flexDirection: "column", gap: 20, maxWidth: 560 }}>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: T.textMuted, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Company name *</label>
            <input style={rowInp} value={form.name} onChange={e => setF("name", e.target.value)} placeholder="Lockheed Martin" />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 500, color: T.textMuted, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 5 }}>Abbreviation</label>
            <input style={rowInp} value={form.abbr} onChange={e => setF("abbr", e.target.value)} placeholder="LM" maxLength={3} />
            <p style={{ fontSize: 11, color: T.textMuted, marginTop: 4 }}>Auto-filled if blank</p>
          </div>
        </div>

        <div>
          <label style={{ fontSize: 11, fontWeight: 500, color: T.textMuted, letterSpacing: "0.07em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>Logo image (optional)</label>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            {form.logo_url && (
              <div style={{ width: 56, height: 56, borderRadius: 6, border: `1px solid ${T.border}`, background: T.navy, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                <img src={form.logo_url} alt="" style={{ maxWidth: 40, maxHeight: 40, objectFit: "contain" }} />
              </div>
            )}
            <input ref={logoRef} type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
            <button type="button" onClick={() => logoRef.current.click()} disabled={logoUploading}
              style={{ padding: "7px 16px", background: T.navy, color: "#fff", border: "none", borderRadius: 5, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
              {logoUploading ? "Uploading…" : form.logo_url ? "Replace logo" : "Upload logo"}
            </button>
            {form.logo_url && (
              <button type="button" onClick={() => setF("logo_url", "")}
                style={{ background: "none", border: "1px solid #fca5a5", color: "#dc2626", borderRadius: 4, padding: "6px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                Remove
              </button>
            )}
          </div>
          <input style={{ ...rowInp, marginTop: 10, fontSize: 12, color: T.textMuted }} value={form.logo_url} onChange={e => setF("logo_url", e.target.value)} placeholder="Or paste a public image URL" />
        </div>

        <div style={{ display: "flex", gap: 24 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", color: T.textMuted }}>
            <input type="checkbox" checked={form.show_carousel} onChange={e => setF("show_carousel", e.target.checked)} />
            Show in carousel
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, cursor: "pointer", color: T.textMuted }}>
            <input type="checkbox" checked={form.show_directory} onChange={e => setF("show_directory", e.target.checked)} />
            Show in directory
          </label>
        </div>

        <div style={{ display: "flex", gap: 10, paddingTop: 8, borderTop: `1px solid ${T.border}` }}>
          <button onClick={handleSave} disabled={!form.name}
            style={{ background: T.gold, color: T.navy, border: "none", borderRadius: 5, padding: "10px 24px", fontSize: 14, fontWeight: 600, cursor: !form.name ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {editing === "new" ? "Add company" : "Save changes"}
          </button>
          <button onClick={cancel}
            style={{ background: "transparent", color: T.textMuted, border: `1px solid ${T.border}`, borderRadius: 5, padding: "10px 20px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: "2rem", maxWidth: 380, width: "90%" }}>
            <h3 style={{ fontSize: 17, color: T.navy, marginBottom: 10, fontFamily: "'Playfair Display',serif" }}>Remove company?</h3>
            <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6, marginBottom: "1.5rem" }}>This will remove the company from the carousel and directory.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => handleDelete(deleteId)} style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 5, padding: "9px 20px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Remove</button>
              <button onClick={() => setDeleteId(null)} style={{ background: "transparent", color: T.textMuted, border: `1px solid ${T.border}`, borderRadius: 5, padding: "9px 16px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: T.navy, marginBottom: 4 }}>Companies</h1>
          <p style={{ fontSize: 13, color: T.textMuted }}>{companies.length} companies · manage carousel and directory visibility</p>
        </div>
        <button onClick={startAdd}
          style={{ background: T.gold, color: T.navy, border: "none", borderRadius: 6, padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
          + Add company
        </button>
      </div>

      {loading ? <p style={{ color: T.textMuted, fontSize: 14 }}>Loading…</p> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {companies.map(c => (
            <div key={c.id} style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 8, display: "flex", alignItems: "center", gap: 14, padding: "0.875rem 1.25rem", flexWrap: "wrap" }}>
              {/* Logo tile */}
              <div style={{ width: 48, height: 48, borderRadius: 6, background: T.navy, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
                {c.logo_url
                  ? <img src={c.logo_url} alt={c.name} style={{ maxWidth: 36, maxHeight: 36, objectFit: "contain" }} />
                  : <span style={{ fontSize: 12, fontWeight: 700, color: T.gold, letterSpacing: "0.04em" }}>{c.abbr}</span>
                }
              </div>
              {/* Name */}
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 14, fontWeight: 500, color: T.navy }}>{c.name}</p>
                <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                  {c.show_carousel  && <span style={{ fontSize: 11, background: "#edf2fb", color: "#2c52a0", padding: "2px 8px", borderRadius: 99 }}>Carousel</span>}
                  {c.show_directory && <span style={{ fontSize: 11, background: "#e8f5ec", color: "#2d7a45", padding: "2px 8px", borderRadius: 99 }}>Directory</span>}
                  {!c.show_carousel && !c.show_directory && <span style={{ fontSize: 11, background: "#f0f0f0", color: "#888", padding: "2px 8px", borderRadius: 99 }}>Hidden</span>}
                </div>
              </div>
              {/* Actions */}
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => startEdit(c)} style={{ background: T.navy, color: "#fff", border: "none", borderRadius: 5, padding: "7px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Edit</button>
                <button onClick={() => setDeleteId(c.id)} style={{ background: "transparent", color: "#ef4444", border: "1px solid #fca5a5", borderRadius: 5, padding: "7px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Remove</button>
              </div>
            </div>
          ))}
          {companies.length === 0 && (
            <div style={{ textAlign: "center", padding: "4rem", background: "#fff", borderRadius: 10, border: `1px solid ${T.border}` }}>
              <p style={{ fontSize: 14, color: T.textMuted }}>No companies yet — add one above.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
//  ADMIN PORTAL  (main page)
// ─────────────────────────────────────────────────────────────────────────────
export default function AdminPortal({ session, onSignOut }) {
  const [section, setSection]       = useState("properties");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [view, setView]             = useState("list");
  const [editing, setEditing]       = useState(null);
  const [deleteId, setDeleteId]     = useState(null);
  const [toast, setToast]           = useState(null);

  async function fetchProperties() {
    setLoading(true);
    const { data, error } = await supabase.from("properties").select("*").order("created_at", { ascending: false });
    if (!error) setProperties(data || []);
    setLoading(false);
  }

  useEffect(() => { fetchProperties(); }, []);

  function showToast(msg, type = "success") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleSave(payload, id) {
    if (id) {
      const { error } = await supabase.from("properties").update(payload).eq("id", id);
      if (error) { showToast(error.message, "error"); return; }
      showToast("Property updated.");
    } else {
      const { error } = await supabase.from("properties").insert(payload);
      if (error) { showToast(error.message, "error"); return; }
      showToast("Property added.");
    }
    fetchProperties();
    setView("list");
  }

  async function handleDelete(id) {
    const { error } = await supabase.from("properties").delete().eq("id", id);
    if (error) { showToast(error.message, "error"); return; }
    setDeleteId(null);
    showToast("Property deleted.");
    fetchProperties();
  }

  return (
    <div style={{ minHeight: "100vh", background: T.offWhite, fontFamily: "'DM Sans',system-ui,sans-serif" }}>

      {/* Top bar */}
      <div style={{ background: T.navy, padding: "0 1.5rem", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(200,169,110,0.2)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <img src={billippLogo} alt="Billipp Company" style={{ height: 32, width: "auto", objectFit: "contain" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Admin</span>
          <span style={{ color: "rgba(255,255,255,0.2)", margin: "0 4px" }}>|</span>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{session?.user?.email}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          {[["properties", "Properties"], ["companies", "Companies"]].map(([id, label]) => (
            <button key={id} onClick={() => setSection(id)}
              style={{ background: section === id ? "rgba(200,169,110,0.15)" : "none", border: `1px solid ${section === id ? T.gold : "rgba(255,255,255,0.15)"}`, color: section === id ? T.goldLight : "rgba(255,255,255,0.5)", borderRadius: 4, padding: "5px 16px", fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
              {label}
            </button>
          ))}
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.15)", margin: "0 6px" }} />
          <button onClick={onSignOut}
            style={{ background: "none", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.5)", borderRadius: 4, padding: "5px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}
            onMouseEnter={e => e.currentTarget.style.borderColor = T.gold}
            onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"}>
            Sign out
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 999, background: toast.type === "error" ? "#991b1b" : T.navy, color: "#fff", padding: "12px 20px", borderRadius: 8, fontSize: 13, boxShadow: "0 8px 24px rgba(0,0,0,0.25)", borderLeft: `4px solid ${toast.type === "error" ? "#f87171" : T.gold}` }}>
          {toast.msg}
        </div>
      )}

      {/* Delete modal */}
      {deleteId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: "2rem", maxWidth: 400, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <h3 style={{ fontSize: 17, color: T.navy, marginBottom: 10, fontFamily: "'Playfair Display',serif" }}>Delete property?</h3>
            <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.6, marginBottom: "1.5rem" }}>This will permanently remove the property from the database and portfolio. Uploaded files in storage are not deleted.</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => handleDelete(deleteId)}
                style={{ background: "#dc2626", color: "#fff", border: "none", borderRadius: 5, padding: "9px 20px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", fontWeight: 500 }}>Delete</button>
              <button onClick={() => setDeleteId(null)}
                style={{ background: "transparent", color: T.textMuted, border: `1px solid ${T.border}`, borderRadius: 5, padding: "9px 16px", fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.5rem" }}>

        {section === "companies" && <CompanyManager showToast={showToast} />}

        {section === "properties" && <>
        {/* LIST */}
        {view === "list" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.75rem", flexWrap: "wrap", gap: "1rem" }}>
              <div>
                <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 26, color: T.navy, marginBottom: 4 }}>Property Portfolio</h1>
                <p style={{ fontSize: 13, color: T.textMuted }}>{properties.length} properties in database</p>
              </div>
              <button onClick={() => { setEditing(null); setView("add"); }}
                style={{ background: T.gold, color: T.navy, border: "none", borderRadius: 6, padding: "10px 22px", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                + Add property
              </button>
            </div>

            {loading ? (
              <p style={{ color: T.textMuted, fontSize: 14 }}>Loading…</p>
            ) : properties.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem", background: "#fff", borderRadius: 10, border: `1px solid ${T.border}` }}>
                <p style={{ fontSize: 16, color: T.textMuted }}>No properties yet.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {properties.map(p => {
                  const images = (p.files || []).filter(f => f.type === "image");
                  const pdfs   = (p.files || []).filter(f => f.type === "pdf");
                  const hero   = images[0]?.url || p.photo_url;
                  return (
                    <div key={p.id} style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 8, display: "flex", gap: 16, alignItems: "center", padding: "1rem 1.25rem", flexWrap: "wrap" }}>
                      {/* Hero thumb */}
                      <div style={{ width: 88, height: 60, borderRadius: 5, overflow: "hidden", flexShrink: 0, background: T.warmGray, position: "relative" }}>
                        {hero
                          ? <img src={hero} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#aaa" }}>No photo</div>
                        }
                        {images.length > 1 && (
                          <div style={{ position: "absolute", bottom: 3, right: 3, background: "rgba(0,0,0,0.6)", color: "#fff", fontSize: 9, padding: "1px 5px", borderRadius: 3 }}>+{images.length - 1}</div>
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 180 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 10, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 8px", borderRadius: 99, background: p.badge_color, color: p.badge_text }}>{p.badge}</span>
                          {p.featured && <span style={{ fontSize: 10, padding: "2px 8px", borderRadius: 99, background: "#fef9c3", color: "#854d0e" }}>Featured</span>}
                          {(p.type || []).map(t => <span key={t} style={{ fontSize: 10, color: "#888", background: "#f3f4f6", padding: "2px 6px", borderRadius: 4 }}>{t}</span>)}
                        </div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: T.navy }}>{p.name}</p>
                        <p style={{ fontSize: 12, color: T.textMuted }}>{p.address}</p>
                        {/* File counts */}
                        <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                          {images.length > 0 && <span style={{ fontSize: 11, color: T.textMuted }}>🖼 {images.length} photo{images.length !== 1 ? "s" : ""}</span>}
                          {pdfs.length > 0   && <span style={{ fontSize: 11, color: T.textMuted }}>📄 {pdfs.length} PDF{pdfs.length !== 1 ? "s" : ""}</span>}
                        </div>
                      </div>

                      {/* Specs */}
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        {(p.specs || []).slice(0, 2).map(s => (
                          <div key={s.label} style={{ textAlign: "center" }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: T.navy }}>{s.value}</div>
                            <div style={{ fontSize: 11, color: T.textMuted }}>{s.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                        <button onClick={() => { setEditing(p); setView("edit"); }}
                          style={{ background: T.navy, color: "#fff", border: "none", borderRadius: 5, padding: "7px 14px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Edit</button>
                        <button onClick={() => setDeleteId(p.id)}
                          style={{ background: "transparent", color: "#ef4444", border: "1px solid #fca5a5", borderRadius: 5, padding: "7px 12px", fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Delete</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ADD / EDIT */}
        {(view === "add" || view === "edit") && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: "1.75rem" }}>
              <button onClick={() => setView("list")}
                style={{ background: "none", border: "none", color: T.textMuted, fontSize: 13, cursor: "pointer", padding: 0 }}>
                ← Back
              </button>
              <span style={{ color: T.border }}>|</span>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: T.navy }}>
                {view === "edit" ? `Edit: ${editing?.name}` : "Add new property"}
              </h1>
            </div>
            <div style={{ background: "#fff", border: `1px solid ${T.border}`, borderRadius: 10, padding: "2rem" }}>
              <PropertyForm
                initial={view === "edit" ? editing : null}
                onSave={handleSave}
                onCancel={() => setView("list")}
              />
            </div>
          </>
        )}
        </>}

      </div>
    </div>
  );
}
