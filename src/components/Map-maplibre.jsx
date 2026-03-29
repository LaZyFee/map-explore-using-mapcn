'use client';

import { useEffect, useRef, useState } from 'react';
import { maplibreProvider } from '@/lib/providers/maplibre';
import { mockData } from '@/lib/mockData';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function Map({ showShops = true, showRiders = true, segmentedRoute = false }) {
    const mapRef = useRef(null);
    const initializedRef = useRef(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // Init ONCE on mount only
    useEffect(() => {
        if (!mapRef.current || initializedRef.current) return;
        initializedRef.current = true;

        maplibreProvider.initMap(
            mapRef.current,
            { lat: mockData.user.lat, lng: mockData.user.lng },
            13
        );

        return () => {
            initializedRef.current = false;
            maplibreProvider.destroy();
        };
    }, []);

    // Update markers + route when props change (no re-init, no destroy)
    useEffect(() => {
        if (!initializedRef.current || !maplibreProvider.mapInstance) return;

        const markers = [mockData.user];
        if (showShops) markers.push(...mockData.shops);
        if (showRiders) markers.push(...mockData.riders);
        maplibreProvider.addMarkers(markers);

        const { from, to, waypoints } = mockData.route;
        if (segmentedRoute && waypoints.length > 0) {
            maplibreProvider.drawSegmentedRoute(from, to, waypoints);
        } else {
            maplibreProvider.drawRoute(from, to);
        }
    }, [showShops, showRiders, segmentedRoute]);

    const handleSearch = (e) => {
        e.preventDefault();
        const results = mockData.shops.filter((s) =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(results);
        if (results.length > 0 && maplibreProvider.mapInstance) {
            const markers = [mockData.user, ...results];
            if (showRiders) markers.push(...mockData.riders);
            maplibreProvider.addMarkers(markers);
        }
    };

    return (
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* Floating search */}
            <div style={{
                position: 'absolute', top: 16, left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                width: 'min(440px, calc(100% - 32px))',
                fontFamily: "'DM Sans', sans-serif",
            }}>
                <form onSubmit={handleSearch} style={{
                    display: 'flex', gap: 6,
                    background: 'rgba(15,25,35,0.92)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(56,189,248,0.2)',
                    borderRadius: 14, padding: 7,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search nearby shops..."
                        style={{
                            flex: 1, background: 'transparent', border: 'none',
                            outline: 'none', color: '#e8f4f8',
                            fontFamily: "'DM Sans', sans-serif", fontSize: 13,
                            padding: '6px 10px',
                        }}
                    />
                    <button type="submit" style={{
                        background: 'linear-gradient(135deg, #38bdf8, #818cf8)',
                        border: 'none', borderRadius: 9,
                        padding: '8px 18px', color: 'white',
                        fontFamily: "'DM Sans', sans-serif",
                        fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    }}>
                        🔍 Find
                    </button>
                </form>

                {searchResults.length > 0 && (
                    <div style={{
                        marginTop: 8,
                        background: 'rgba(15,25,35,0.92)',
                        backdropFilter: 'blur(20px)',
                        border: '1px solid rgba(56,189,248,0.15)',
                        borderRadius: 10, padding: '10px 14px',
                        fontSize: 13, color: '#38bdf8',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                    }}>
                        ✓ Found: {searchResults.map((s) => s.name).join(' · ')}
                    </div>
                )}
            </div>

            {/* Map fills entire container */}
            <div ref={mapRef} style={{ position: 'absolute', inset: 0 }} />
        </div>
    );
}