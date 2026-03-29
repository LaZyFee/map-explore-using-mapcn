import { config, Map, Marker, Popup } from "@maptiler/sdk";
import "@maptiler/sdk/dist/maptiler-sdk.css";
import { mockData } from "../mockData";

//  Set API key safely
config.apiKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;

if (!config.apiKey) {
  throw new Error("❌ MapTiler API key is missing");
}

// Search function
export function searchNearby(query = "") {
  const lowerQuery = query.toLowerCase().trim();

  const filteredShops = mockData.shops.filter(
    (item) =>
      !lowerQuery || item.name.toLowerCase().includes(lowerQuery)
  );

  const filteredRiders = mockData.riders.filter(
    (item) =>
      !lowerQuery || item.name.toLowerCase().includes(lowerQuery)
  );

  return {
    shops: filteredShops,
    riders: filteredRiders,
  };
}

// Add markers
export function addMarkers(map, items, type) {
  if (!map) return [];

  const markers = items.map((item) => {
    let color = "#3388ff"; // default blue
    if (type === "shop") color = "#e74c3c";   // red
    if (type === "rider") color = "#2ecc71";  // green
    if (type === "user") color = "#f1c40f";   // yellow

    const marker = new Marker({ color })
      .setLngLat([item.lng, item.lat])
      .setPopup(
        new Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false,
        }).setHTML(`
          <div style="min-width:140px;font-family:sans-serif;">
            <strong>${item.name || "Unknown"}</strong><br>
            ${type === "rider"
            ? `Status: ${item.status || "unknown"}<br>`
            : ""
          }
            <small>${item.lat.toFixed(4)}, ${item.lng.toFixed(4)}</small>
          </div>
        `)
      )
      .addTo(map);

    return marker;
  });

  return markers;
}

// Initialize map
export function initMap(containerId, center, zoom = 14) {
  const map = new Map({
    container: containerId,

    // Use latest NON-deprecated style
    style: `https://api.maptiler.com/maps/streets-v3/style.json?key=${config.apiKey}`,

    center: [center.lng, center.lat],
    zoom: zoom,
  });

  // Fix missing icons issue
  map.on("styleimagemissing", (e) => {
    const id = e.id;

    if (!map.hasImage(id)) {
      const size = 32;
      const data = new Uint8Array(size * size * 4);

      for (let i = 0; i < size * size; i++) {
        data[i * 4 + 0] = 0;   // R
        data[i * 4 + 1] = 150; // G
        data[i * 4 + 2] = 255; // B
        data[i * 4 + 3] = 255; // A
      }

      map.addImage(id, {
        width: size,
        height: size,
        data,
      });
    }
  });

  // Safe load event
  map.on("load", () => {
    console.log("MapTiler map loaded successfully");
  });

  return map;
}

//  Remove map
export function removeMap(map) {
  if (map) {
    map.remove();
  }
}