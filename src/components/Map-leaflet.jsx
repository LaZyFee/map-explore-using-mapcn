'use client';

import { useEffect, useRef, useState } from 'react';
import { leafletProvider } from '@/lib/providers/leaflet';
import { mockData } from '@/lib/mockData';
import 'leaflet/dist/leaflet.css';

export default function Map({ showShops = true, showRiders = true, segmentedRoute = false }) {
    const mapRef = useRef(null);
    const initializedRef = useRef(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);

    // Init ONCE on mount 
    useEffect(() => {
        if (!mapRef.current || initializedRef.current) return;
        initializedRef.current = true;

        leafletProvider.initMap(
            mapRef.current,
            { lat: mockData.user.lat, lng: mockData.user.lng },
            14
        );

        return () => {
            initializedRef.current = false;
            leafletProvider.destroy();
        };
    }, []);

    // Update markers + route whenever props change 
    useEffect(() => {
        if (!initializedRef.current || !leafletProvider.mapInstance) return;

        const markers = [mockData.user];
        if (showShops) markers.push(...mockData.shops);
        if (showRiders) markers.push(...mockData.riders);
        leafletProvider.addMarkers(markers);
        
        const route = mockData.route;
        if (!route) return;

        const { from, to, waypoints = [] } = route;
        if (segmentedRoute && waypoints.length > 0) {
            leafletProvider.drawSegmentedRoute(from, to, waypoints);
        } else {
            leafletProvider.drawRoute(from, to);
        }
    }, [showShops, showRiders, segmentedRoute]);

    const handleSearch = (e) => {
        e.preventDefault();
        setSearching(true);
        setTimeout(() => {
            const results = mockData.shops.filter((s) =>
                s.name.toLowerCase().includes(searchQuery.toLowerCase())
            );
            setSearchResults(results);
            setSearching(false);

            if (results.length > 0 && leafletProvider.mapInstance) {
                const markers = [mockData.user, ...results];
                if (showRiders) markers.push(...mockData.riders);
                leafletProvider.addMarkers(markers);
            }
        }, 200);
    };

    return (
        <div className="relative w-full h-125">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-1000 w-[min(480px,calc(100%-32px))]">
                <form
                    onSubmit={handleSearch}
                    className="flex gap-2 bg-white/95 rounded-2xl p-2 shadow-xl border border-black/5"
                >
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search nearby shops..."
                        className="flex-1 bg-transparent border-none outline-none px-3 py-1.5 text-[13px] text-[#1a1a2e] placeholder-gray-400"
                    />
                    <button
                        type="submit"
                        disabled={searching}
                        className="bg-[#1a1a2e] text-[#ffd23f] rounded-lg px-4 py-2 text-xs font-bold tracking-wide whitespace-nowrap hover:bg-[#2d2d4e] transition-colors disabled:opacity-60 cursor-pointer"
                    >
                        {searching ? '…' : '🔍 Search'}
                    </button>
                </form>

                {searchResults.length > 0 && (
                    <div className="mt-2 bg-white/95 rounded-xl px-4 py-3 shadow-lg border border-black/5 text-[13px] text-[#1a1a2e] font-medium">
                        <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-1">
                            Found {searchResults.length} result{searchResults.length > 1 ? 's' : ''}
                        </div>
                        {searchResults.map(s => s.name).join(' · ')}
                    </div>
                )}
            </div>
            <div ref={mapRef} className="absolute inset-0" />
        </div>
    );
}