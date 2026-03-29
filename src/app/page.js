"use client";
import { BasicRouteExample } from "@/components/BasicRoute";
import { CustomStyleExample } from "@/components/CustomStyle";
import { MapMarkerExample } from "@/components/MapMarker";
import { MyMap } from "@/components/MyMap";
import { OsrmRouteExample } from "@/components/OSRMRoute";
import { useEffect, useState } from "react";

export default function Home() {
  const [center, setCenter] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCenter([pos.coords.longitude, pos.coords.latitude]);
      },
      () => setCenter([90.4125, 23.8103])
    );
  }, []);

  if (!center) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400 text-sm tracking-widest uppercase font-mono">
            Locating you...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-16">
      <main className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-12">

        {/* Section 1 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-emerald-400 tracking-widest uppercase">
              01
            </span>
            <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">
              Default Map
            </h2>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>
          <div className="rounded-xl overflow-hidden border border-zinc-800 shadow-2xl shadow-black/40">
            <MyMap center={center} />
          </div>
        </section>

        {/* Section 2 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-emerald-400 tracking-widest uppercase">
              02
            </span>
            <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">
              Dropdown & Map Controls
            </h2>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>
          <div className="rounded-xl overflow-hidden border border-zinc-800 shadow-2xl shadow-black/40">
            <CustomStyleExample center={center} />
          </div>
        </section>

        {/* Section 3 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-emerald-400 tracking-widest uppercase">
              03
            </span>
            <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">
              Map Markers (basic & rich popups)
            </h2>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>
          <div className="rounded-xl overflow-hidden border border-zinc-800 shadow-2xl shadow-black/40">
            <MapMarkerExample center={center} />
          </div>
        </section>

        {/* Section 4 */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-emerald-400 tracking-widest uppercase">
              04
            </span>
            <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">
              Routes
            </h2>
            <div className="flex-1 h-px bg-zinc-800" />
          </div>

          <div className="flex flex-col gap-6">
            {/* Basic Route */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-4 rounded-full bg-emerald-400/60" />
                <h3 className="text-sm font-mono text-zinc-400 tracking-wide uppercase">
                  Basic Route
                </h3>
              </div>
              <div className="rounded-xl overflow-hidden border border-zinc-800 shadow-2xl shadow-black/40">
                <BasicRouteExample center={center} />
              </div>
            </div>

            {/* OSRM Route */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1">
                <div className="w-1 h-4 rounded-full bg-emerald-400/60" />
                <h3 className="text-sm font-mono text-zinc-400 tracking-wide uppercase">
                  OSRM Route
                </h3>
              </div>
              <div className="rounded-xl overflow-hidden border border-zinc-800 shadow-2xl shadow-black/40">
                <OsrmRouteExample center={center} />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}