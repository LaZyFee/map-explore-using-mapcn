"use client";

import { Map, MapControls } from "@/components/ui/map";
import { Card } from "@/components/ui/card";

export function MyMap({ center }) {
    
    if (!center) {
        return (
            <Card className="h-80 flex items-center justify-center">
                Loading map...
            </Card>
        );
    }

    return (
        <Card className="h-80 p-0 overflow-hidden">
            <Map center={center} zoom={11}>
                <MapControls />
            </Map>
        </Card>
    );
}