"use client";

import {
    Map,
    MapMarker,
    MarkerContent,
    MarkerTooltip,
    MapRoute,
} from "@/components/ui/map";

export function BasicRouteExample({ center }) {
    if (!center) {
        return (
            <div className="h-100 w-full flex items-center justify-center">
                Loading map...
            </div>
        );
    }

    const [lng, lat] = center;

    //  Dynamic route based on user location
    const route = [
        [lng, lat],
        [lng + 0.01, lat + 0.01],
        [lng + 0.02, lat + 0.005],
        [lng + 0.03, lat + 0.015],
    ];

    //  Dynamic stops
    const stops = [
        { name: "Start", lng: lng, lat: lat },
        { name: "Stop 1", lng: lng + 0.01, lat: lat + 0.01 },
        { name: "Stop 2", lng: lng + 0.02, lat: lat + 0.005 },
        { name: "Stop 3", lng: lng + 0.03, lat: lat + 0.015 },
    ];

    return (
        <div className="h-100 w-full">
            <Map center={center} zoom={13}>
                <MapRoute
                    coordinates={route}
                    color="#3b82f6"
                    width={4}
                    opacity={0.8}
                />

                {stops.map((stop, index) => (
                    <MapMarker
                        key={index}
                        longitude={stop.lng}
                        latitude={stop.lat}
                    >
                        <MarkerContent>
                            <div className="size-4.5 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-semibold">
                                {index + 1}
                            </div>
                        </MarkerContent>

                        <MarkerTooltip>{stop.name}</MarkerTooltip>
                    </MapMarker>
                ))}
            </Map>
        </div>
    );
}