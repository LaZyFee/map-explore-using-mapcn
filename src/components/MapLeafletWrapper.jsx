'use client';

import { useState, useEffect } from 'react';
import { mockData } from '../lib/mockData';

function LeafletMap({ showShops, showRiders, segmentedRoute }) {
    const [MapComponent, setMapComponent] = useState(null);

    useEffect(() => {
        import('./Map-leaflet').then((mod) => {
            setMapComponent(() => mod.default);
        });
    }, []);

    if (!MapComponent) {
        return (
            <div className="h-125 flex items-center justify-center bg-[#f5f0e8] text-gray-400 font-mono text-sm">
                Loading map…
            </div>
        );
    }

    return (
        <MapComponent
            showShops={showShops}
            showRiders={showRiders}
            segmentedRoute={segmentedRoute}
        />
    );
}

function Chip({ active, onClick, children }) {
    return (
        <div
            onClick={onClick}
            className={[
                'flex items-center gap-2 px-3.5 py-1.5 rounded-lg cursor-pointer select-none text-[13px] font-semibold transition-all border',
                active
                    ? 'bg-[#ffd23f]/15 border-[#ffd23f]/40 text-[#ffd23f]'
                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white/90',
            ].join(' ')}
        >
            <span
                className={[
                    'w-4 h-4 rounded flex items-center justify-center text-[10px] border transition-all',
                    active ? 'bg-[#ffd23f] border-[#ffd23f] text-[#1a1a2e]' : 'border-current',
                ].join(' ')}
            >
                {active ? '✓' : ''}
            </span>
            {children}
        </div>
    );
}

export default function MapLeafletWrapper() {
    const [showShops, setShowShops] = useState(true);
    const [showRiders, setShowRiders] = useState(true);
    const [segmentedRoute, setSegmentedRoute] = useState(false);

    return (
        <div className="w-full flex flex-col bg-[#f5f0e8] text-[#1a1a2e] font-sans">

            {/* Header */}
            <header className="relative flex items-center gap-8 h-16 px-8 bg-[#1a1a2e] shrink-0 overflow-hidden">
                <div
                    className="absolute bottom-0 left-0 right-0 h-0.5"
                    style={{
                        background: 'linear-gradient(90deg,#ff6b35,#ffd23f,#ff6b35)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 3s linear infinite',
                    }}
                />
                <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

                {/* Badge */}
                <span className="font-mono text-[9px] text-white/40 uppercase tracking-widest border border-white/10 rounded px-2 py-0.5 shrink-0">
                    Leaflet + OSM
                </span>

                <div className="w-px h-6 bg-white/10 shrink-0" />

                {/* Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                    <Chip active={showShops} onClick={() => setShowShops(v => !v)}>🛒 Shops</Chip>
                    <Chip active={showRiders} onClick={() => setShowRiders(v => !v)}>🏍️ Riders</Chip>
                    <Chip active={segmentedRoute} onClick={() => setSegmentedRoute(v => !v)}>⛓ Segmented A→B→C</Chip>
                </div>

                {/* Coords */}
                <span className="ml-auto font-mono text-[10px] text-white/30 tracking-wide whitespace-nowrap">
                    📍 {mockData.user.lat}°N · {mockData.user.lng}°E · Chattogram
                </span>
            </header>

            {/* Map */}
            <LeafletMap
                showShops={showShops}
                showRiders={showRiders}
                segmentedRoute={segmentedRoute}
            />
        </div>
    );
}