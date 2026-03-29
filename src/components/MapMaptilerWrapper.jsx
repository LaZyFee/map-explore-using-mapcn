"use client";
import { useEffect, useRef, useState } from "react";
import { initMap, addMarkers, searchNearby, removeMap } from "../lib/providers/maptiler";
import { mockData } from "../lib/mockData";

export default function MapMaptilerWrapper() {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const userMarkersRef = useRef([]);
    const shopMarkersRef = useRef([]);
    const riderMarkersRef = useRef([]);

    const [showShops, setShowShops] = useState(true);
    const [showRiders, setShowRiders] = useState(true);
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const updateMarkers = () => {
        if (!mapInstance.current) return;
        const map = mapInstance.current;

        shopMarkersRef.current.forEach((m) => m.remove());
        shopMarkersRef.current = [];
        if (showShops) {
            const nearby = searchNearby(searchQuery);
            shopMarkersRef.current = addMarkers(map, nearby.shops, "shop");
        }

        riderMarkersRef.current.forEach((m) => m.remove());
        riderMarkersRef.current = [];
        if (showRiders) {
            const nearby = searchNearby(searchQuery);
            riderMarkersRef.current = addMarkers(map, nearby.riders, "rider");
        }
    };

    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;
        const map = initMap("map-container", mockData.user, 14);
        mapInstance.current = map;
        userMarkersRef.current = addMarkers(map, [mockData.user], "user");
        updateMarkers();
        return () => { if (map) removeMap(map); };
    }, []);

    useEffect(() => {
        if (mapInstance.current) updateMarkers();
    }, [showShops, showRiders, searchQuery]);

    const handleSearch = () => {
        setSearchQuery(searchInput);
    };

    return (
        <>
            <div className="maptiler-wrapper">
                {/* Sidebar */}
                <aside className="sidebar">
                    <div className="sidebar-header">
                        <div className="brand-badge">
                            <div className="brand-dot" />
                            MapTiler SDK
                        </div>
                    </div>

                    <div className="sidebar-body">
                        {/* Location */}
                        <div className="location-card">
                            <div className="location-title">📍 Your Location</div>
                            <div className="location-name">Chattogram, BD</div>
                            <div className="location-coords">{mockData.user.lat}°N, {mockData.user.lng}°E</div>
                        </div>

                        {/* Search */}
                        <div className="search-box">
                            <input
                                type="text"
                                value={searchInput}
                                onChange={(e) => setSearchInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                placeholder="Search shops or riders..."
                                className="search-input"
                            />
                            <button onClick={handleSearch} className="search-btn">🔍</button>
                        </div>

                        {/* Toggles */}
                        <div className="section-label">Layers</div>
                        <div className="toggle-group">
                            <div
                                className={`toggle-item ${showShops ? 'active' : ''}`}
                                onClick={() => setShowShops(!showShops)}
                            >
                                <div className="toggle-left">🛒 Shops</div>
                                <div className="toggle-switch"><div className="toggle-knob" /></div>
                            </div>
                            <div
                                className={`toggle-item ${showRiders ? 'active' : ''}`}
                                onClick={() => setShowRiders(!showRiders)}
                            >
                                <div className="toggle-left">🏍️ Riders</div>
                                <div className="toggle-switch"><div className="toggle-knob" /></div>
                            </div>
                        </div>
                    </div>

                    <div className="sidebar-footer">
                        <div className="live-indicator">
                            <div className="live-dot" />
                            LIVE
                        </div>
                        <span>MapTiler · OSM</span>
                    </div>
                </aside>

                {/* Map */}
                <div className="map-area">
                    <div id="map-container" ref={mapRef} />
                    <div className="map-overlay-badge">🗺 Chattogram · 22.3569°N 91.7832°E</div>
                </div>
            </div>
        </>
    );
}