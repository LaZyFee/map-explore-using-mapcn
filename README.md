# Real-Time Location System

## Architecture Overview
```
Rider App (GPS)
     ↓
Backend (real-time server)
     ↓
WebSocket / PubSub
     ↓
Customer App (Map UI)
```

---

## 📍 1. Live Rider Location (Core Feature)

### On the Rider's Phone
The rider app uses:
- GPS (device location)
- Updates every 1–5 seconds
- Sends data to backend

### Backend (Real-Time System)
#### Typical stack -
- WebSocket server (real-time push)
- Or Firebase Realtime DB / Firestore
- Or Kafka / Redis PubSub

Stores latest rider location and broadcasts updates.

### Customer App
Moves marker smoothly on map.

---

## 2. Map Rendering (What You See)

Popular choices:
- Google Maps (Uber historically)
- Mapbox / MapLibre
- MapTiler

Used only for:
- Map tiles
- Markers
- UI

---

## 3. Routing (A → B Path)

### Routing Tools
- OSRM (open-source)
- ORS (OpenRouteService)
- GraphHopper
- Google Directions API

### Flow
```
Pickup → Drop
   ↓
Routing API
   ↓
Returns polyline (road path)
   ↓
Draw on map
```

---

## 4. Snap to Road ⚠️ (Important)

Raw GPS is noisy ❌

Fixed using **Map Matching / Snap-to-Road**:
- OSRM Match API
- Mapbox Map Matching
- Google Roads API

Keeps the rider visually on the road.

---

## 5. Smooth Movement (Uber-Like Animation)

Markers don't just jump. Instead:
- Interpolate between points
- Animate along route

---

## 6. ETA Calculation

Based on:
- Route distance
- Traffic data
- Historical speed
```
ETA = distance / avg_speed
```

Advanced apps use ML models.

---

## 7. Real-Time Communication

Common technologies:
- WebSockets (best)
- Socket.IO
- Firebase
- MQTT (lightweight)