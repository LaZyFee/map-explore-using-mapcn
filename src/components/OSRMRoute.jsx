"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import {
    Map as MapComponent,
    MapMarker,
    MarkerContent,
    MapRoute,
    MarkerLabel,
    useMap,
    MapControls,
} from "@/components/ui/map";
import { Loader2, Clock, Route, Navigation, MapPin, Plus, X, Car, Bike, Footprints } from "lucide-react";

// Transport modes with OSRM profiles
const TRANSPORT_MODES = [
    { id: "driving", label: "Drive", Icon: Car, profile: "driving", color: "#34d399", name: "Car" },
    { id: "cycling", label: "Bike", Icon: Bike, profile: "cycling", color: "#60a5fa", name: "Bike" },
    { id: "walking", label: "Walk", Icon: Footprints, profile: "foot", color: "#f472b6", name: "Foot" },
];

// Cache with explicit clearing when needed
const routeCache = new Map();

function formatDuration(seconds) {
    const mins = Math.round(seconds / 60);
    if (mins < 60) return `${mins} min`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return `${h}h ${m}m`;
}

function formatDistance(meters) {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
}

async function fetchRoutes(waypoints, profile, alternatives = true) {
    const coordStr = waypoints.map(w => `${w.lng},${w.lat}`).join(";");
    const key = `${profile}::${coordStr}`;

    // Clear cache for this key if we want fresh routes
    if (routeCache.has(key) && alternatives) {
        // Still return cached but we'll fetch fresh in background
        // For now, let's just use cache
    }

    if (routeCache.has(key)) return routeCache.get(key);

    try {
        // Add alternatives=true to get multiple route options
        // Also add steps=true for more detailed navigation
        const url = `https://router.project-osrm.org/route/v1/${profile}/${coordStr}` +
            `?overview=full&geometries=geojson&alternatives=${alternatives}&steps=true`;

        console.log(`Fetching ${profile} route:`, url);

        const res = await fetch(url);
        const data = await res.json();

        if (data.routes?.length > 0) {
            const routes = data.routes.map(r => ({
                coordinates: r.geometry.coordinates,
                duration: r.duration,
                distance: r.distance,
                weight: r.weight,
                weight_name: r.weight_name,
                legs: r.legs,
            }));

            console.log(`${profile} routes found:`, routes.length);
            routeCache.set(key, routes);
            return routes;
        } else if (data.code === "NoRoute") {
            console.warn(`No route found for ${profile} between these points`);
            return null;
        }
    } catch (e) {
        console.error(`OSRM fetch failed for ${profile}:`, e);
    }
    return null;
}

// MapClickHandler component remains the same
function MapClickHandler({ onMapClick, enabled }) {
    const { map, isLoaded } = useMap();

    useEffect(() => {
        if (!map || !isLoaded) return;
        map.getCanvas().style.cursor = enabled ? "crosshair" : "";
        return () => { map.getCanvas().style.cursor = ""; };
    }, [map, isLoaded, enabled]);

    useEffect(() => {
        if (!map || !isLoaded || !enabled) return;
        const handler = (e) =>
            onMapClick?.({ lngLat: { lng: e.lngLat.lng, lat: e.lngLat.lat } });
        map.on("click", handler);
        return () => map.off("click", handler);
    }, [map, isLoaded, onMapClick, enabled]);

    return null;
}

// Main Component
export function OsrmRouteExample({ center }) {
    const [userLocation, setUserLocation] = useState(null);
    const [destination, setDestination] = useState(null);
    const [intermediates, setIntermediates] = useState([]);

    const [routesByMode, setRoutesByMode] = useState({});
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isNavigating, setIsNavigating] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const [mapCenter, setMapCenter] = useState(center);
    const [mapZoom] = useState(13);
    const [clickMode, setClickMode] = useState("destination");
    const [transportId, setTransportId] = useState("driving");
    const [showAlternatives, setShowAlternatives] = useState(true);

    const navigationInterval = useRef(null);
    const fetchToken = useRef(0);

    const currentMode = TRANSPORT_MODES.find(m => m.id === transportId);
    const activeColor = currentMode.color;
    const routes = routesByMode[transportId] ?? [];

    // Geolocation
    useEffect(() => {
        if (!("geolocation" in navigator)) return;
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const loc = { lng: pos.coords.longitude, lat: pos.coords.latitude, name: "You" };
                setUserLocation(loc);
                setMapCenter([loc.lng, loc.lat]);
            },
            () => {
                // Default location (example: San Francisco for better route variety)
                const defaultLoc = { lng: -122.4194, lat: 37.7749, name: "SF" };
                setUserLocation(defaultLoc);
                setMapCenter([defaultLoc.lng, defaultLoc.lat]);
            }
        );
    }, []);

    // Route fetching with proper waypoint handling
    const waypointSig = userLocation && destination
        ? [userLocation, ...intermediates, destination].map(w => `${w.lng},${w.lat}`).join("|")
        : "";

    useEffect(() => {
        if (!waypointSig || !userLocation || !destination) return;

        const token = ++fetchToken.current;
        const fullWaypoints = [userLocation, ...intermediates, destination];

        // Only show loading if we don't have cached routes for this mode
        if (!routesByMode[transportId]) {
            setIsLoading(true);
        }

        fetchRoutes(fullWaypoints, currentMode.profile, showAlternatives).then(newRoutes => {
            if (token !== fetchToken.current) return;

            if (newRoutes && newRoutes.length > 0) {
                setRoutesByMode(prev => ({
                    ...prev,
                    [transportId]: newRoutes
                }));
                setSelectedIndex(0);
            } else {
                console.warn(`No routes found for ${currentMode.profile}`);
                setRoutesByMode(prev => ({
                    ...prev,
                    [transportId]: []
                }));
            }
            setIsLoading(false);
        }).catch(err => {
            console.error("Route fetch error:", err);
            setIsLoading(false);
        });

    }, [waypointSig, transportId, showAlternatives]);

    // Map click handler
    const handleMapClick = useCallback((e) => {
        if (isNavigating) return;
        const { lng, lat } = e.lngLat;
        if (clickMode === "destination") {
            setDestination({ lng, lat, name: "Destination" });
            setIntermediates([]);
            setRoutesByMode({});
            setClickMode(null);
        } else if (clickMode === "waypoint") {
            setIntermediates(prev => [...prev, { lng, lat, name: `Stop ${prev.length + 1}` }]);
            setRoutesByMode({});
        }
    }, [isNavigating, clickMode]);

    // Transport mode switch with forced refresh
    const handleModeSwitch = async (id) => {
        if (id === transportId) return;

        setTransportId(id);
        setSelectedIndex(0);

        // If we don't have routes for this mode, fetch them immediately
        if (!routesByMode[id] && userLocation && destination) {
            const fullWaypoints = [userLocation, ...intermediates, destination];
            const newRoutes = await fetchRoutes(fullWaypoints, TRANSPORT_MODES.find(m => m.id === id).profile, showAlternatives);
            if (newRoutes) {
                setRoutesByMode(prev => ({ ...prev, [id]: newRoutes }));
            }
        }
    };

    // Navigation functions
    const startNavigation = () => {
        const sel = routes[selectedIndex];
        if (!sel || sel.coordinates.length === 0) return;
        setIsNavigating(true);
        setClickMode(null);
        setCurrentStep(0);
        navigationInterval.current = setInterval(() => {
            setCurrentStep(prev => {
                if (prev >= sel.coordinates.length - 1) {
                    clearInterval(navigationInterval.current);
                    setIsNavigating(false);
                    return prev;
                }
                return prev + 1;
            });
        }, 100);
    };

    const stopNavigation = () => {
        clearInterval(navigationInterval.current);
        navigationInterval.current = null;
        setIsNavigating(false);
    };

    const resetRoute = () => {
        stopNavigation();
        setDestination(null);
        setIntermediates([]);
        setRoutesByMode({});
        setSelectedIndex(0);
        setCurrentStep(0);
        setClickMode("destination");
        if (userLocation) setMapCenter([userLocation.lng, userLocation.lat]);
    };

    const selectedRoute = routes[selectedIndex];
    const currentPosition = selectedRoute && isNavigating
        ? selectedRoute.coordinates[Math.min(currentStep, selectedRoute.coordinates.length - 1)]
        : null;

    useEffect(() => {
        if (currentPosition && isNavigating) {
            setMapCenter([currentPosition[0], currentPosition[1]]);
        }
    }, [currentPosition, isNavigating]);

    // Find fastest route
    const fastestIndex = routes.length > 1
        ? routes.reduce((fastestIdx, route, currentIdx) =>
            route.distance < routes[fastestIdx].distance ? currentIdx : fastestIdx, 0)
        : -1;

    const sortedForRender = routes
        .map((route, index) => ({ route, index }))
        .sort((a, b) => {
            if (a.index === selectedIndex) return 1;
            if (b.index === selectedIndex) return -1;
            return 0;
        });

    const hintText = isNavigating ? null
        : clickMode === "destination" ? "Click the map to set your destination"
            : clickMode === "waypoint" ? "Click the map to add a stop"
                : null;

    return (
        <div className="h-125 w-full relative font-sans">
            <MapComponent center={mapCenter} zoom={mapZoom}>
                <MapClickHandler
                    onMapClick={handleMapClick}
                    enabled={!isNavigating && clickMode !== null}
                />

                {/* Route lines */}
                {sortedForRender.map(({ route, index }) => {
                    const isSelected = index === selectedIndex;
                    return (
                        <MapRoute
                            key={`${transportId}-${index}-${route.distance}`}
                            coordinates={route.coordinates}
                            color={isSelected ? activeColor : "#374151"}
                            width={isSelected ? 5 : 4}
                            opacity={isSelected ? 1 : 0.45}
                            onClick={() => !isNavigating && setSelectedIndex(index)}
                        />
                    );
                })}

                {/* Navigation dot */}
                {currentPosition && (
                    <MapMarker longitude={currentPosition[0]} latitude={currentPosition[1]}>
                        <MarkerContent>
                            <div
                                className="size-4 rounded-full border-2 border-white shadow-lg animate-pulse"
                                style={{ backgroundColor: activeColor }}
                            />
                        </MarkerContent>
                    </MapMarker>
                )}

                {/* Origin */}
                {userLocation && (
                    <MapMarker longitude={userLocation.lng} latitude={userLocation.lat}>
                        <MarkerContent>
                            <div className="size-4 rounded-full bg-emerald-400 border-2 border-zinc-900 shadow-lg" />
                            <MarkerLabel position="top">{userLocation.name}</MarkerLabel>
                        </MarkerContent>
                    </MapMarker>
                )}

                {/* Destination */}
                {destination && (
                    <MapMarker longitude={destination.lng} latitude={destination.lat}>
                        <MarkerContent>
                            <div className="size-4 rounded-full bg-rose-500 border-2 border-zinc-900 shadow-lg" />
                            <MarkerLabel position="bottom">Destination</MarkerLabel>
                        </MarkerContent>
                    </MapMarker>
                )}

                {/* Intermediate stops */}
                {intermediates.map((wp, idx) => (
                    <MapMarker key={idx} longitude={wp.lng} latitude={wp.lat}>
                        <MarkerContent>
                            <div
                                className="size-5 rounded-full bg-violet-500 border-2 border-zinc-900 shadow-lg cursor-pointer flex items-center justify-center text-white text-[10px] font-bold"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIntermediates(p => p.filter((_, i) => i !== idx));
                                    setRoutesByMode({});
                                }}
                            >
                                {idx + 1}
                            </div>
                            <MarkerLabel position="top">{wp.name}</MarkerLabel>
                        </MarkerContent>
                    </MapMarker>
                ))}
                <MapControls
                    position="bottom-right"
                    showZoom
                    showCompass
                    showLocate
                    showFullscreen
                />
            </MapComponent>

            {/* Transport mode bar */}
            {!isNavigating && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-zinc-900/95 border border-zinc-700/80 rounded-xl p-1 shadow-lg backdrop-blur z-10">
                    {TRANSPORT_MODES.map(({ id, label, Icon, color }) => {
                        const isActive = id === transportId;
                        return (
                            <button
                                key={id}
                                onClick={() => handleModeSwitch(id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isActive ? "text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-200"
                                    }`}
                                style={isActive ? { backgroundColor: color } : {}}
                            >
                                <Icon className="size-3.5" />
                                {label}
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Left panel */}
            <div className="absolute top-14 left-3 flex flex-col gap-2 max-w-65">
                {hintText && (
                    <div className="flex items-center gap-2 bg-zinc-900/95 border border-zinc-700/80 text-zinc-300 text-xs px-3 py-2 rounded-lg backdrop-blur shadow-lg">
                        <MapPin className="size-3 shrink-0" style={{ color: activeColor }} />
                        {hintText}
                    </div>
                )}

                {destination && !isNavigating && (
                    <div className="flex gap-1.5 flex-wrap">
                        <button
                            onClick={() => setClickMode(p => p === "destination" ? null : "destination")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${clickMode === "destination"
                                ? "bg-rose-500/20 border-rose-500/70 text-rose-300"
                                : "bg-zinc-900/90 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                                }`}
                        >
                            <MapPin className="size-3" />
                            {clickMode === "destination" ? "Picking…" : "Change dest."}
                        </button>
                        <button
                            onClick={() => setClickMode(p => p === "waypoint" ? null : "waypoint")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${clickMode === "waypoint"
                                ? "bg-violet-500/20 border-violet-500/70 text-violet-300"
                                : "bg-zinc-900/90 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200"
                                }`}
                        >
                            <Plus className="size-3" />
                            {clickMode === "waypoint" ? "Done" : "Add stop"}
                        </button>
                    </div>
                )}

                {/* Route alternatives */}
                {/* Route information - Always show when routes exist */}
                {routes.length > 0 && !isNavigating && (
                    <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                                {routes.length === 1 ? "Route Details" : `${routes.length} Route Options`}
                            </span>
                            {routes.length > 1 && (
                                <button
                                    onClick={() => setShowAlternatives(!showAlternatives)}
                                    className="text-[10px] text-zinc-500 hover:text-zinc-300"
                                >
                                    {showAlternatives ? "Show All" : "Show Alternatives"}
                                </button>
                            )}
                        </div>

                        {routes.map((route, index) => {
                            const isActive = index === selectedIndex;
                            const showFastest = routes.length > 1 && index === fastestIndex;

                            // If there's only one route and it's not selected, skip rendering other options
                            if (routes.length === 1 && !isActive) return null;

                            return (
                                <button
                                    key={index}
                                    onClick={() => routes.length > 1 && setSelectedIndex(index)}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-xs transition-all ${isActive
                                        ? "text-zinc-100"
                                        : routes.length > 1
                                            ? "bg-zinc-900/90 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200 cursor-pointer"
                                            : "bg-zinc-900/90 border-zinc-700 text-zinc-400 cursor-default"
                                        }`}
                                    style={isActive ? {
                                        backgroundColor: `${activeColor}18`,
                                        borderColor: `${activeColor}80`,
                                    } : {}}
                                >
                                    <div className="flex items-center gap-1.5 font-semibold shrink-0">
                                        <Clock className="size-3" />
                                        {formatDuration(route.duration)}
                                    </div>
                                    <div className="flex items-center gap-1 opacity-70 shrink-0">
                                        <Route className="size-3" />
                                        {formatDistance(route.distance)}
                                    </div>
                                    <div className="ml-auto flex gap-1">
                                        {showFastest && (
                                            <span
                                                className="px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap border"
                                                style={{
                                                    backgroundColor: `${activeColor}25`,
                                                    color: activeColor,
                                                    borderColor: `${activeColor}50`,
                                                }}
                                            >
                                                Fastest
                                            </span>
                                        )}
                                        {routes.length === 1 && (
                                            <span
                                                className="px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap"
                                                style={{
                                                    backgroundColor: `${activeColor}20`,
                                                    color: activeColor,
                                                }}
                                            >
                                                {currentMode.label}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Right panel */}
            <div className="absolute top-14 right-3 flex flex-col gap-2 min-w-37">
                {routes.length > 0 && (
                    <div className="bg-zinc-900/95 border border-zinc-700/80 rounded-lg shadow-lg p-3 backdrop-blur">
                        {!isNavigating ? (
                            <button
                                onClick={startNavigation}
                                className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg text-white text-sm font-semibold transition-all hover:brightness-110"
                                style={{ backgroundColor: activeColor }}
                            >
                                <Navigation className="size-4" />
                                Start {currentMode.name} Navigation
                            </button>
                        ) : (
                            <button
                                onClick={stopNavigation}
                                className="flex items-center justify-center gap-2 w-full px-4 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/60 text-rose-300 text-sm font-semibold transition-colors"
                            >
                                <X className="size-4" />
                                Stop Navigation
                            </button>
                        )}
                    </div>
                )}

                {destination && !isNavigating && (
                    <div className="bg-red-500/50 border border-zinc-700/80 rounded-lg p-2 backdrop-blur">
                        <button
                            onClick={resetRoute}
                            className="flex items-center justify-center w-full px-3 py-1.5 rounded-md bg-red-500 text-white cursor-pointer text-xs font-medium transition-colors"
                        >
                            Reset Route
                        </button>
                    </div>
                )}

                {intermediates.length > 0 && !isNavigating && (
                    <div className="bg-zinc-900/95 border border-zinc-700/80 rounded-lg p-3 backdrop-blur">
                        <p className="text-[10px] text-zinc-500 uppercase tracking-widest mb-2 font-mono">Stops</p>
                        <div className="flex flex-col gap-1.5">
                            {intermediates.map((wp, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-xs">
                                    <span className="size-4 rounded-full bg-violet-500/20 border border-violet-500/60 text-violet-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                                        {idx + 1}
                                    </span>
                                    <span className="flex-1 truncate text-zinc-400">{wp.name}</span>
                                    <button
                                        onClick={() => {
                                            setIntermediates(p => p.filter((_, i) => i !== idx));
                                            setRoutesByMode({});
                                        }}
                                        className="text-zinc-600 hover:text-rose-400 transition-colors"
                                    >
                                        <X className="size-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {isNavigating && selectedRoute && (
                    <div className="bg-zinc-900/95 border border-zinc-700/80 rounded-lg p-3 backdrop-blur">
                        <div className="space-y-2.5">
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Distance left</p>
                                <p className="text-lg font-bold text-zinc-100 leading-tight">
                                    {formatDistance(
                                        selectedRoute.distance *
                                        (1 - currentStep / selectedRoute.coordinates.length)
                                    )}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Time left</p>
                                <p className="text-lg font-bold text-zinc-100 leading-tight">
                                    {formatDuration(
                                        selectedRoute.duration *
                                        (1 - currentStep / selectedRoute.coordinates.length)
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2.5 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2.5 shadow-xl">
                        <Loader2 className="size-4 animate-spin" style={{ color: activeColor }} />
                        <span className="text-zinc-300 text-sm font-medium">
                            Finding {currentMode.name} routes…
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}