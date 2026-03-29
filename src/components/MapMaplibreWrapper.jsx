'use client';

import { useState, useEffect } from 'react';
import { mockData } from '../lib/mockData';

function MapLibreMap({ showShops, showRiders, segmentedRoute }) {
    const [MapComponent, setMapComponent] = useState(null);

    useEffect(() => {
        import('./Map-maplibre').then((mod) => {
            setMapComponent(() => mod.default);
        });
    }, []);

    if (!MapComponent) {
        return (
            <div style={{
                flex: 1, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: '#0f1923', color: 'rgba(255,255,255,0.3)',
                fontFamily: "'DM Mono', monospace", fontSize: 13,
                letterSpacing: '0.05em',
            }}>
                Loading map…
            </div>
        );
    }

    return <MapComponent showShops={showShops} showRiders={showRiders} segmentedRoute={segmentedRoute} />;
}

export default function MapMaplibreWrapper() {
    const [showShops, setShowShops] = useState(true);
    const [showRiders, setShowRiders] = useState(true);
    const [segmentedRoute, setSegmentedRoute] = useState(false);

    return (
        <>
            <div className="maplibre-wrapper">
                <header className="maplibre-topbar">
                    <div className="ml-brand">
                        <div className="ml-brand-text">
                            <div className="ml-brand-sub">MapLibre GL</div>
                        </div>
                    </div>
                    <div className="ml-pills">
                        <div className={`ml-pill ${showShops ? 'on' : ''}`} onClick={() => setShowShops(v => !v)}>
                            <div className="ml-pill-dot" /> 🛒 Shops
                        </div>
                        <div className={`ml-pill ${showRiders ? 'on' : ''}`} onClick={() => setShowRiders(v => !v)}>
                            <div className="ml-pill-dot" /> 🏍️ Riders
                        </div>
                        <div className={`ml-pill route ${segmentedRoute ? 'on' : ''}`} onClick={() => setSegmentedRoute(v => !v)}>
                            <div className="ml-pill-dot" /> A→B→C Route
                        </div>
                    </div>
                    <div className="ml-spacer" />
                    <div className="ml-coords">
                        {mockData.user.lat}°N · {mockData.user.lng}°E
                    </div>
                </header>

                <div className="maplibre-body">
                    <MapLibreMap
                        showShops={showShops}
                        showRiders={showRiders}
                        segmentedRoute={segmentedRoute}
                    />
                </div>
            </div>
        </>
    );
}