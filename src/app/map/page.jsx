import MapLeafletWrapper from '@/components/MapLeafletWrapper';
import MapMaplibreWrapper from '@/components/MapMaplibreWrapper';
import MapMaptilerWrapper from '@/components/MapMaptilerWrapper';

export default function MapPage() {
    return (
        <div className="min-h-screen bg-zinc-950 text-white pt-16">

            {/* Content */}
            <main className="max-w-5xl mx-auto px-6 py-10 flex flex-col gap-12">

                {/* Section 1 — MapTiler */}
                <section className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-emerald-400 tracking-widest uppercase">01</span>
                        <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">MapTiler</h2>
                        <div className="flex-1 h-px bg-zinc-800" />
                    </div>
                    <div className="rounded-xl overflow-hidden border border-zinc-800 shadow-2xl shadow-black/40">
                        <MapMaptilerWrapper />
                    </div>
                </section>

                {/* Section 2 — MapLibre */}
                <section className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-emerald-400 tracking-widest uppercase">02</span>
                        <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">MapLibre</h2>
                        <div className="flex-1 h-px bg-zinc-800" />
                    </div>
                    <div className="rounded-xl overflow-hidden border border-zinc-800 shadow-2xl shadow-black/40">
                        <MapMaplibreWrapper />
                    </div>
                </section>

                {/* Section 3 — Leaflet */}
                <section className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-emerald-400 tracking-widest uppercase">03</span>
                        <h2 className="text-lg font-semibold text-zinc-100 tracking-tight">Leaflet</h2>
                        <div className="flex-1 h-px bg-zinc-800" />
                    </div>
                    <div className="rounded-xl overflow-hidden border border-zinc-800 shadow-2xl shadow-black/40">
                        <MapLeafletWrapper />
                    </div>
                </section>

            </main>
        </div>
    );
}