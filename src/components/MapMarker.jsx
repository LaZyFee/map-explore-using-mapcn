"use client";

import {
    Map,
    MapMarker,
    MarkerContent,
    MarkerLabel,
    MarkerPopup,
    MarkerTooltip,
} from "@/components/ui/map";
import { Button } from "@/components/ui/button";
import { Star, Navigation, Clock, ExternalLink } from "lucide-react";
import Image from "next/image";

export function MapMarkerExample({ center }) {
    if (!center) {
        return (
            <div className="h-125 flex items-center justify-center">
                Loading map...
            </div>
        );
    }

    const [lng, lat] = center;

    const places = [
        {
            id: 1,
            name: "Nearby Restaurant",
            label: "Food",
            category: "Restaurant",
            rating: 4.5,
            reviews: 1200,
            hours: "10:00 AM - 10:00 PM",
            image:
                "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=300&h=200&fit=crop",
            lng: lng + 0.001,
            lat: lat + 0.01,
        },
        {
            id: 2,
            name: "Local Market",
            label: "Market",
            category: "Shopping",
            rating: 4.3,
            reviews: 800,
            hours: "9:00 AM - 9:00 PM",
            image:
                "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=200&fit=crop",
            lng: lng - 0.01,
            lat: lat - 0.005,
        },
        {
            id: 3,
            name: "Coffee Shop",
            label: "Cafe",
            category: "Cafe",
            rating: 4.7,
            reviews: 540,
            hours: "7:00 AM - 11:00 PM",
            image:
                "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&h=200&fit=crop",
            lng: lng + 0.005,
            lat: lat - 0.01,
        },
        {
            id: 4,
            name: "Empire State Building",
            lng: lng + 0.01,
            lat: lat - 0.001,
        },
        {
            id: 5,
            name: "Central Park",
            lng: lng - 0.01,
            lat: lat - 0.01,
        },
        {
            id: 6,
            name: "Times Square",
            lng: lng - 0.008,
            lat: lat + 0.001,
        },

    ];

    return (
        <div className="h-125 w-full">
            <Map center={center} zoom={13}>
                {places.map((place, index) => {
                    if (place.lng == null || place.lat == null) return null;

                    const isRich = place.image;

                    return (
                        <MapMarker
                            key={place.id}
                            longitude={place.lng}
                            latitude={place.lat}
                        >
                            <MarkerContent>
                                <div
                                    className={`rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform ${isRich
                                        ? "size-5 bg-rose-500"
                                        : "size-4 bg-primary"
                                        }`}
                                />

                                {/* LABEL (always visible for rich markers) */}
                                {isRich && (
                                    <MarkerLabel position="bottom">
                                        {place.label}
                                    </MarkerLabel>
                                )}
                            </MarkerContent>

                            {/* TOOLTIP (hover) */}
                            {!isRich && (
                                <MarkerTooltip>{place.name}</MarkerTooltip>
                            )}

                            {/* POPUP (click) */}
                            <MarkerPopup className={isRich ? "p-0 w-62" : ""}>
                                {isRich ? (
                                    <>
                                        <div className="relative h-32 overflow-hidden rounded-t-md">
                                            <Image
                                                fill
                                                src={place.image}
                                                alt={place.name}
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>

                                        <div className="space-y-2 p-3">
                                            <div>
                                                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                    {place.category}
                                                </span>
                                                <h3 className="font-semibold leading-tight">
                                                    {place.name}
                                                </h3>
                                            </div>

                                            <div className="flex items-center gap-1 text-sm">
                                                <Star className="size-3.5 fill-amber-400 text-amber-400" />
                                                <span className="font-medium">{place.rating}</span>
                                                <span className="text-muted-foreground">
                                                    ({place.reviews.toLocaleString()})
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                                <Clock className="size-3.5" />
                                                <span>{place.hours}</span>
                                            </div>

                                            <div className="flex gap-2 pt-1">
                                                <Button size="sm" className="flex-1 h-8">
                                                    <Navigation className="size-3.5 mr-1.5" />
                                                    Directions
                                                </Button>
                                                <Button size="sm" variant="outline" className="h-8">
                                                    <ExternalLink className="size-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-1">
                                        <p className="font-medium">{place.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {place.lat}, {place.lng}
                                        </p>
                                    </div>
                                )}
                            </MarkerPopup>
                        </MapMarker>
                    );
                })}
            </Map>
        </div>
    );
}