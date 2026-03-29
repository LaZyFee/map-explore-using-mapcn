import maplibregl from 'maplibre-gl';

const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY || 'YOUR_MAPTILER_KEY';

export const maplibreProvider = {
  mapInstance: null,
  markers: [],
  _mapReady: null, // Promise that resolves when map style is loaded

  initMap(containerId, center, zoom = 13) {
    this.mapInstance = new maplibregl.Map({
      container: containerId,
      style: `https://api.maptiler.com/maps/basic-v2/style.json?key=${MAPTILER_KEY}`,
      center: [center.lng, center.lat],
      zoom: zoom,
    });

    // Track when map style is fully loaded — required before adding sources/layers
    this._mapReady = new Promise((resolve) => {
      if (this.mapInstance.isStyleLoaded()) {
        resolve();
      } else {
        this.mapInstance.once('load', resolve);
      }
    });

    this.mapInstance.addControl(new maplibregl.NavigationControl());

    return this.mapInstance;
  },

  // Helper: safely remove a layer+source pair if they exist
  _removeLayerAndSource(id) {
    try {
      if (this.mapInstance.getLayer(id)) this.mapInstance.removeLayer(id);
    } catch (_) { }
    try {
      if (this.mapInstance.getSource(id)) this.mapInstance.removeSource(id);
    } catch (_) { }
  },

  addMarkers(locations) {
    this.clearMarkers();

    locations.forEach((loc) => {
      const el = document.createElement('div');
      el.className = 'marker';
      el.style.width = '30px';
      el.style.height = '30px';
      el.style.borderRadius = '50%';
      el.style.border = '3px solid white';
      el.style.boxShadow = '0 2px 5px rgba(0,0,0,0.3)';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.justifyContent = 'center';
      el.style.color = 'white';
      el.style.fontWeight = 'bold';
      el.style.fontSize = '12px';
      el.style.cursor = 'pointer';

      const colors = {
        user: '#3b82f6',
        shop: '#10b981',
        rider: '#f59e0b',
      };
      el.style.backgroundColor = colors[loc.type] || '#6b7280';
      el.textContent = loc.type === 'user' ? 'U' : loc.type === 'shop' ? 'S' : 'R';

      const marker = new maplibregl.Marker(el)
        .setLngLat([loc.lng, loc.lat])
        .setPopup(new maplibregl.Popup().setHTML(`<b>${loc.name}</b><br/>${loc.type}`))
        .addTo(this.mapInstance);

      this.markers.push(marker);
    });
  },

  clearMarkers() {
    this.markers.forEach((m) => m.remove());
    this.markers = [];
  },

  async drawRoute(from, to) {
    // Wait for style to be fully loaded before touching sources/layers
    await this._mapReady;

    // Clean up any existing route — do this before the fetch so there's no race
    this._removeLayerAndSource('route');

    const url =
      `https://router.project-osrm.org/route/v1/driving/` +
      `${from.lng},${from.lat};${to.lng},${to.lat}` +
      `?overview=full&geometries=geojson`;

    let coords;
    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.routes?.[0]) {
        coords = data.routes[0].geometry.coordinates;
      }
    } catch (e) {
      console.error('Routing error (fetch):', e);
    }

    // Remove again in case something was added while we were fetching
    this._removeLayerAndSource('route');

    const lineCoords = coords ?? [[from.lng, from.lat], [to.lng, to.lat]];
    const isReal = !!coords;

    this.mapInstance.addSource('route', {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: lineCoords },
      },
    });

    this.mapInstance.addLayer({
      id: 'route',
      type: 'line',
      source: 'route',
      layout: { 'line-join': 'round', 'line-cap': 'round' },
      paint: {
        'line-color': isReal ? '#3b82f6' : '#ef4444',
        'line-width': isReal ? 5 : 3,
        'line-opacity': isReal ? 0.8 : 1,
        ...(isReal ? {} : { 'line-dasharray': [2, 2] }),
      },
    });

    if (isReal) {
      const bounds = lineCoords.reduce(
        (b, coord) => b.extend(coord),
        new maplibregl.LngLatBounds(lineCoords[0], lineCoords[0])
      );
      this.mapInstance.fitBounds(bounds, { padding: 50 });
    }
  },

  async drawSegmentedRoute(from, to, waypoints = []) {
    await this._mapReady;

    const segmentIds = ['route-seg-0', 'route-seg-1', 'route-seg-2'];
    segmentIds.forEach((id) => this._removeLayerAndSource(id));

    const points = [from, ...waypoints, to];
    const colors = ['#3b82f6', '#10b981', '#f59e0b'];

    for (let i = 0; i < points.length - 1; i++) {
      const start = points[i];
      const end = points[i + 1];
      const sourceId = `route-seg-${i}`;
      let coords;

      try {
        const url =
          `https://router.project-osrm.org/route/v1/driving/` +
          `${start.lng},${start.lat};${end.lng},${end.lat}` +
          `?overview=full&geometries=geojson`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes?.[0]) coords = data.routes[0].geometry.coordinates;
      } catch (e) {
        console.error(`Segment ${i} fetch error:`, e);
      }

      // Remove in case of concurrent calls
      this._removeLayerAndSource(sourceId);

      const lineCoords = coords ?? [[start.lng, start.lat], [end.lng, end.lat]];
      const isReal = !!coords;

      this.mapInstance.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: { type: 'LineString', coordinates: lineCoords },
        },
      });

      this.mapInstance.addLayer({
        id: sourceId,
        type: 'line',
        source: sourceId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': colors[i % colors.length],
          'line-width': isReal ? 5 : 3,
          'line-opacity': isReal ? 0.8 : 1,
          ...(isReal ? {} : { 'line-dasharray': [2, 2] }),
        },
      });
    }
  },

  searchNearby(query, center, radius = 5000) {
    return new Promise((resolve) => {
      setTimeout(() => {
        const results = mockData.shops.filter((s) =>
          s.name.toLowerCase().includes(query.toLowerCase())
        );
        resolve(results);
      }, 300);
    });
  },

  destroy() {
    if (this.mapInstance) {
      this.mapInstance.remove();
      this.mapInstance = null;
      this._mapReady = null;
    }
  },
};