"use client";
import { useEffect, useRef, useState } from "react";
import * as provider from "../lib/providers/maptiler";
import { mockData } from "../lib/mockData";

export default function Map() {
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
            const nearby = provider.searchNearby(searchQuery);
            shopMarkersRef.current = provider.addMarkers(map, nearby.shops, "shop");
        }

        riderMarkersRef.current.forEach((m) => m.remove());
        riderMarkersRef.current = [];

        if (showRiders) {
            const nearby = provider.searchNearby(searchQuery);
            riderMarkersRef.current = provider.addMarkers(map, nearby.riders, "rider");
        }
    };

    useEffect(() => {
        if (!mapRef.current || mapInstance.current) return;

        const map = provider.initMap("map-container", mockData.user, 14);
        mapInstance.current = map;

        userMarkersRef.current = provider.addMarkers(map, [mockData.user], "user");
        updateMarkers();

        return () => { if (map) map.remove(); };
    }, []);

    useEffect(() => {
        if (mapInstance.current) updateMarkers();
    }, [showShops, showRiders, searchQuery]);

    const handleSearch = () => {
        setSearchQuery(searchInput);
        updateMarkers();
    };

    return <div id="map-container" ref={mapRef} style={{ position: 'absolute', inset: 0 }} />;
}