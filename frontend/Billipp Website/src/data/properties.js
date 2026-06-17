import portwest1 from '../assets/Portwest 6955.jpg';
import portwest2 from '../assets/Portwest 6955.jpg';
import idcAerial from '../assets/IDC aerial from SE.jpeg.jpg';
import idcEntry from '../assets/IDC Entry.jpeg.jpg';

const BADGE_STYLES = {
  Available: { badgeColor: "#e8f5ec", badgeText: "#2d7a45" },
  Planned:   { badgeColor: "#edf2fb", badgeText: "#2c52a0" },
  Completed: { badgeColor: "#f0f0f0", badgeText: "#888888" },
};

export const FALLBACK_PROPERTIES = [
  {
    id: "sam-houston",
    badge: "Planned", badgeColor: "#edf2fb", badgeText: "#2c52a0",
    type: ["office", "available"],
    category: "Office · Planned Development",
    name: "4477 W. Sam Houston Pkwy N",
    address: "Houston, TX 77041",
    specs: [
      { label: "Total Size", value: "256,000 SF" },
      { label: "Height", value: "10 stories" },
      { label: "Delivery", value: "TBD" },
    ],
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
    specs: [
      { label: "Total Size", value: "108,600 SF" },
      { label: "Type", value: "Build-to-suit" },
    ],
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
    specs: [
      { label: "Total Size", value: "250,000 SF" },
      { label: "Type", value: "Build-to-suit" },
    ],
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
    specs: [
      { label: "Site Area", value: "4.95 acres" },
      { label: "Pricing", value: "Contact us" },
    ],
    featured: false,
    description: "Available development site at the SW corner of Imperial Valley Drive and Lockhaven Drive. Suitable for office, industrial, or build-to-suit development. Utilities on-site.",
    features: ["Corner lot", "Utilities on-site", "BTS-ready", "Clear zoning"],
    mapLat: 29.8516, mapLng: -95.3783,
    price: "Contact for pricing",
    floorPlan: false,
    photo: idcEntry,
  },
];

// Converts one Excel row (plain object from sheet_to_json) into a property object.
function parseRow(row) {
  const badge = String(row.badge || 'Available');
  const { badgeColor, badgeText } = BADGE_STYLES[badge] ?? BADGE_STYLES.Available;

  const specs = [];
  for (let i = 1; i <= 3; i++) {
    const label = row[`spec${i}Label`];
    const value = row[`spec${i}Value`];
    if (label && value) specs.push({ label: String(label), value: String(value) });
  }

  return {
    id: String(row.id || Math.random()),
    badge,
    badgeColor,
    badgeText,
    type: String(row.type || 'available').split(',').map(t => t.trim().toLowerCase()),
    category: String(row.category || ''),
    name: String(row.name || ''),
    address: String(row.address || ''),
    specs,
    featured: String(row.featured).toLowerCase() === 'true',
    description: String(row.description || ''),
    features: String(row.features || '').split('|').map(f => f.trim()).filter(Boolean),
    mapLat: parseFloat(row.mapLat) || 29.75,
    mapLng: parseFloat(row.mapLng) || -95.37,
    price: row.price ? String(row.price) : null,
    floorPlan: String(row.floorPlan).toLowerCase() === 'true',
    // photo: full URL string from Excel, or null to show placeholder
    photo: row.photo ? String(row.photo) : null,
  };
}

/**
 * Normalize a Supabase row (snake_case) into the shape the app expects (camelCase).
 */
function normalizeSupabaseRow(row) {
  const styles = BADGE_STYLES[row.badge] ?? BADGE_STYLES.Available;
  return {
    id:          row.id,
    badge:       row.badge       ?? "Available",
    badgeColor:  row.badge_color ?? styles.badgeColor,
    badgeText:   row.badge_text  ?? styles.badgeText,
    type:        Array.isArray(row.type) ? row.type : (row.type ?? "").split(",").map(t => t.trim()).filter(Boolean),
    category:    row.category    ?? "",
    name:        row.name        ?? "",
    address:     row.address     ?? "",
    specs:       Array.isArray(row.specs) ? row.specs : [],
    featured:    row.featured    ?? false,
    description: row.description ?? "",
    features:    Array.isArray(row.features) ? row.features : [],
    mapLat:      row.map_lat     ?? 29.75,
    mapLng:      row.map_lng     ?? -95.37,
    price:       row.price       ?? null,
    floorPlan:   row.floor_plan  ?? false,
    photo:       row.photo_url   ?? null,
    files:       Array.isArray(row.files) ? row.files : [],
    links:       Array.isArray(row.links) ? row.links : [],
  };
}

/**
 * Loads properties — priority order:
 *   1. Supabase database  (if VITE_SUPABASE_URL is configured)
 *   2. VITE_PROPERTIES_URL / public/properties.xlsx  (Excel fallback)
 *   3. Hardcoded FALLBACK_PROPERTIES
 */
export async function fetchProperties() {
  // 1. Try Supabase
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  if (supabaseUrl && !supabaseUrl.startsWith("YOUR_")) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const client = createClient(supabaseUrl, import.meta.env.VITE_SUPABASE_ANON_KEY);
      const { data, error } = await client
        .from("properties")
        .select("*")
        .order("created_at", { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map(normalizeSupabaseRow);
      }
    } catch {
      // fall through to Excel/static
    }
  }

  // 2. Try Excel
  const candidates = [
    import.meta.env.VITE_PROPERTIES_URL,
    '/properties.xlsx',
  ].filter(Boolean);

  for (const url of candidates) {
    try {
      const res = await fetch(url);
      if (!res.ok) continue;
      const buf = await res.arrayBuffer();
      const { read, utils } = await import('xlsx');
      const wb = read(buf, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = utils.sheet_to_json(ws);
      if (rows.length > 0) {
        return rows.map(parseRow);
      }
    } catch {
      // try next
    }
  }

  // 3. Static fallback
  return FALLBACK_PROPERTIES;
}
