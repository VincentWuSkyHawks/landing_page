import { useState, useEffect, useRef, forwardRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { T } from "./theme";

// ─── Custom map marker (gold = active, navy = inactive) ───────────────────────
function makeMarkerIcon(active) {
  return L.divIcon({
    className: "",
    html: `<div style="
      width:22px;height:22px;
      background:${active ? T.gold : T.navy};
      border:2.5px solid ${active ? "#fff" : T.gold};
      border-radius:50%;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -14],
  });
}

const FILTERS = ["all", "available", "office", "industrial", "retail"];

// ─── Compact property card for the left panel ─────────────────────────────────
const PropertyCard = forwardRef(function PropertyCard({ p, active, onClick, onViewDetail }, ref) {
  return (
    <div
      ref={ref}
      onClick={onClick}
      style={{
        display: "flex", gap: 14, padding: "14px 16px", cursor: "pointer",
        borderBottom: `1px solid ${T.border}`,
        background: active ? "#fff" : T.offWhite,
        borderLeft: `3px solid ${active ? T.gold : "transparent"}`,
        transition: "background 0.15s, border-color 0.15s",
      }}
    >
      {/* Thumbnail */}
      <div style={{ width: 80, height: 80, flexShrink: 0, borderRadius: 6, overflow: "hidden", background: T.warmGray }}>
        {p.photo ? (
          <img src={p.photo} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{ width: 28, height: 28, color: "rgba(11,37,64,0.2)" }}>
              <rect x="3" y="3" width="18" height="18" rx="1"/><path d="M9 3v18M15 3v18M3 9h18M3 15h18"/>
            </svg>
          </div>
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 9, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 99, background: p.badgeColor, color: p.badgeText, display: "inline-block", marginBottom: 4 }}>
          {p.badge}
        </span>
        <p style={{ fontSize: 13, fontWeight: 500, color: T.navy, lineHeight: 1.3, marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {p.name}
        </p>
        <p style={{ fontSize: 11, color: T.textLight, marginBottom: 5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {p.address}
        </p>
        {p.specs[0] && (
          <p style={{ fontSize: 12, color: T.textMuted }}>
            <strong style={{ color: T.navy, fontWeight: 500 }}>{p.specs[0].value}</strong>{" "}
            <span style={{ color: T.textLight }}>{p.specs[0].label}</span>
          </p>
        )}
        <button
          onClick={e => { e.stopPropagation(); onViewDetail(p); }}
          style={{ marginTop: 6, fontSize: 11, color: T.gold, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", fontWeight: 500 }}
        >
          View details →
        </button>
      </div>
    </div>
  );
});

// ─── Leaflet map (plain JS, no react-leaflet dependency) ─────────────────────
function LeafletMap({ properties, activeId, onMarkerClick }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});

  // Initialize map once
  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map(containerRef.current, { center: [29.75, -95.37], zoom: 11 });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current = {};
    };
  }, []);

  // Rebuild markers when visible properties change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    Object.values(markersRef.current).forEach(m => m.remove());
    markersRef.current = {};
    properties.forEach(p => {
      if (!p.mapLat || !p.mapLng) return;
      const marker = L.marker([p.mapLat, p.mapLng], { icon: makeMarkerIcon(false) })
        .addTo(map)
        .on("click", () => onMarkerClick(p.id));
      markersRef.current[p.id] = marker;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties]);

  // Update marker styles and fly to active property
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    Object.entries(markersRef.current).forEach(([id, marker]) => {
      marker.setIcon(makeMarkerIcon(id === activeId));
    });
    if (activeId) {
      const prop = properties.find(p => p.id === activeId);
      if (prop?.mapLat && prop?.mapLng) {
        map.flyTo([prop.mapLat, prop.mapLng], 14, { duration: 0.7 });
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  return <div ref={containerRef} style={{ width: "100%", height: "100%" }} />;
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function PortfolioMapPage({ properties, setDetailProp }) {
  const [activeId, setActiveId] = useState(null);
  const [filter, setFilter] = useState("all");
  const cardRefs = useRef({});
  const listRef = useRef(null);

  const visible = filter === "all"
    ? properties
    : properties.filter(p => p.type.includes(filter));

  function handleCardClick(id) {
    setActiveId(prev => prev === id ? null : id);
  }

  function handleMarkerClick(id) {
    setActiveId(id);
    const el = cardRefs.current[id];
    if (el && listRef.current) {
      const listRect = listRef.current.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const inView = elRect.top >= listRect.top && elRect.bottom <= listRect.bottom;
      if (!inView) el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }

  return (
    <div style={{ paddingTop: 64, height: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── Header ── */}
      <div style={{ background: T.navy, padding: "1.25rem 1.5rem", flexShrink: 0, borderBottom: "1px solid rgba(200,169,110,0.2)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <p style={{ fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: T.gold, marginBottom: 2 }}>Portfolio</p>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: "#fff", fontWeight: 500, margin: 0 }}>Property Map</h1>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {FILTERS.map(f => (
              <button
                key={f}
                onClick={() => { setFilter(f); setActiveId(null); }}
                style={{
                  padding: "5px 14px", borderRadius: 99, fontSize: 11, cursor: "pointer",
                  fontFamily: "inherit", transition: "all 0.2s",
                  border: `1px solid ${filter === f ? T.gold : "rgba(255,255,255,0.2)"}`,
                  background: filter === f ? T.gold : "transparent",
                  color: filter === f ? T.navy : "rgba(255,255,255,0.7)",
                  fontWeight: filter === f ? 500 : 400,
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body: list + map ── */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* Left: scrollable card list */}
        <div
          ref={listRef}
          style={{ width: 380, flexShrink: 0, overflowY: "auto", borderRight: `1px solid ${T.border}`, background: T.offWhite, display: "flex", flexDirection: "column" }}
        >
          {visible.length === 0 ? (
            <div style={{ padding: "3rem 1.5rem", textAlign: "center", color: T.textMuted, fontSize: 13 }}>
              No properties match this filter.
            </div>
          ) : (
            visible.map(p => (
              <PropertyCard
                key={p.id}
                ref={el => cardRefs.current[p.id] = el}
                p={p}
                active={activeId === p.id}
                onClick={() => handleCardClick(p.id)}
                onViewDetail={setDetailProp}
              />
            ))
          )}
          <div style={{ marginTop: "auto", padding: "0.75rem 1rem", borderTop: `1px solid ${T.border}` }}>
            <p style={{ fontSize: 11, color: T.textLight }}>
              {visible.length} of {properties.length} properties
              {activeId && (
                <button
                  onClick={() => setActiveId(null)}
                  style={{ marginLeft: 10, fontSize: 11, color: T.gold, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
                >
                  Clear selection
                </button>
              )}
            </p>
          </div>
        </div>

        {/* Right: map */}
        <div style={{ flex: 1, position: "relative" }}>
          <LeafletMap properties={visible} activeId={activeId} onMarkerClick={handleMarkerClick} />
        </div>
      </div>
    </div>
  );
}
