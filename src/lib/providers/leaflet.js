import L from 'leaflet';

export const leafletProvider = {
    mapInstance: null,
    markers: [],
    routeLayer: null,
    _destroyed: false,

    initMap(containerId, center, zoom = 13) {
        this._destroyed = false;
        this.mapInstance = L.map(containerId).setView([center.lat, center.lng], zoom);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
            maxZoom: 19,
        }).addTo(this.mapInstance);

        return this.mapInstance;
    },

    createIcon(type) {
        const colors = { user: 'blue', shop: 'green', rider: 'orange' };
        return L.divIcon({
            className: 'custom-marker',
            html: `<div style="
                width:30px;height:30px;
                background:${colors[type] || 'gray'};
                border-radius:50%;border:3px solid white;
                box-shadow:0 2px 5px rgba(0,0,0,0.3);
                display:flex;align-items:center;justify-content:center;
                color:white;font-weight:bold;font-size:12px;
            ">${type === 'user' ? 'U' : type === 'shop' ? 'S' : 'R'}</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
        });
    },

    addMarkers(locations) {
        if (!this.mapInstance) return;
        this.clearMarkers();
        locations.forEach((loc) => {
            const marker = L.marker([loc.lat, loc.lng], {
                icon: this.createIcon(loc.type),
            }).addTo(this.mapInstance);
            marker.bindPopup(`<b>${loc.name}</b><br/>${loc.type}`);
            this.markers.push(marker);
        });
    },

    clearMarkers() {
        if (!this.mapInstance) return;
        this.markers.forEach((m) => this.mapInstance.removeLayer(m));
        this.markers = [];
    },

    async drawRoute(from, to) {
        const url = `https://router.project-osrm.org/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;

        let coords = null;
        let fallback = false;

        try {
            const res = await fetch(url);
            const data = await res.json();
            if (data.routes?.[0]) {
                coords = data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]);
            } else {
                fallback = true;
            }
        } catch (e) {
            console.error('Routing error:', e);
            fallback = true;
        }

        // Guard: map may have been destroyed while fetch was in-flight
        if (this._destroyed || !this.mapInstance) return;

        if (this.routeLayer) {
            this.mapInstance.removeLayer(this.routeLayer);
            this.routeLayer = null;
        }

        if (!fallback && coords) {
            this.routeLayer = L.polyline(coords, {
                color: '#3b82f6', weight: 5, opacity: 0.8,
            }).addTo(this.mapInstance);
            this.mapInstance.fitBounds(this.routeLayer.getBounds());
        } else {
            this.routeLayer = L.polyline(
                [[from.lat, from.lng], [to.lat, to.lng]],
                { color: '#ef4444', weight: 3, dashArray: '10, 10' }
            ).addTo(this.mapInstance);
        }
    },

    async drawSegmentedRoute(from, to, waypoints = []) {
        const points = [from, ...waypoints, to];
        const colors = ['#3b82f6', '#10b981', '#f59e0b'];

        // Fetch all segments in parallel before touching the map
        const segments = await Promise.all(
            points.slice(0, -1).map(async (start, i) => {
                const end = points[i + 1];
                const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
                try {
                    const res = await fetch(url);
                    const data = await res.json();
                    if (data.routes?.[0]) {
                        return {
                            coords: data.routes[0].geometry.coordinates.map((c) => [c[1], c[0]]),
                            fallback: false,
                        };
                    }
                } catch (_) { }
                return {
                    coords: [[start.lat, start.lng], [end.lat, end.lng]],
                    fallback: true,
                };
            })
        );

        // Guard: map may have been destroyed while fetches were in-flight
        if (this._destroyed || !this.mapInstance) return;

        if (this.routeLayer) {
            this.mapInstance.removeLayer(this.routeLayer);
            this.routeLayer = null;
        }

        segments.forEach((seg, i) => {
            L.polyline(seg.coords, {
                color: colors[i % colors.length],
                weight: seg.fallback ? 3 : 5,
                opacity: 0.8,
                ...(seg.fallback ? { dashArray: '5, 5' } : {}),
            }).addTo(this.mapInstance);
        });

        const group = new L.featureGroup(this.markers);
        if (group.getLayers().length > 0) {
            this.mapInstance.fitBounds(group.getBounds().pad(0.1));
        }
    },

    destroy() {
        this._destroyed = true;
        if (this.mapInstance) {
            this.mapInstance.remove();
            this.mapInstance = null;
        }
        this.markers = [];
        this.routeLayer = null;
    },
};