"use client";

import { useState, useEffect, useRef } from "react";
import { Map, MapControls } from "@/components/ui/map"
const styles = {
    default: undefined,
    openstreetmap: "https://tiles.openfreemap.org/styles/bright",
    openstreetmap3d: "https://tiles.openfreemap.org/styles/liberty",
};

export function CustomStyleExample({ center }) {
    const mapRef = useRef(null);
    const [style, setStyle] = useState("default");

    const selectedStyle = styles[style];
    const is3D = style === "openstreetmap3d";

    useEffect(() => {
        if (mapRef.current?.easeTo) {
            mapRef.current.easeTo({
                pitch: is3D ? 60 : 0,
                duration: 500,
            });
        }
    }, [is3D]);

    return (
        <div className="h-100 relative w-full">
            <Map
                ref={mapRef}
                center={center}
                zoom={15}
                styles={
                    selectedStyle
                        ? { light: selectedStyle, dark: selectedStyle }
                        : undefined
                }
            >
                <MapControls
                    position="bottom-right"
                    showZoom
                    showCompass
                    showLocate
                    showFullscreen
                />
            </Map>

            <div className="absolute top-2 right-2 z-10">
                <select
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    className="bg-background text-foreground border rounded-md px-2 py-1 text-sm shadow"
                >
                    <option value="default">Default (Carto)</option>
                    <option value="openstreetmap">OpenStreetMap</option>
                    <option value="openstreetmap3d">OpenStreetMap 3D</option>
                </select>
            </div>
        </div>
    );
}