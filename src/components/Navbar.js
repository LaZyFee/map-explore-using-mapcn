'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

const links = [
    { label: 'page-1', href: '/', isRoute: true },
    { label: 'Page-2', href: '/map' },
]

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        onScroll()
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800/60'
                : 'bg-transparent'
                }`}
        >
            <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">

                {/* Logo */}
                <Link href="/" className="flex items-center gap-2.5 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform duration-200" />
                    <span className="text-xs font-mono font-medium text-zinc-300 tracking-[0.2em] uppercase group-hover:text-white transition-colors duration-200">
                        Map Explorer
                    </span>
                </Link>

                {/* Links */}
                <div className="flex items-center gap-6">
                    {links.map((l) => {
                        const cls = 'text-xs font-mono tracking-[0.15em] uppercase text-zinc-500 hover:text-zinc-100 transition-colors duration-200'
                        return l.isRoute
                            ? <Link key={l.href} href={l.href} className={cls}>{l.label}</Link>
                            : <a key={l.href} href={l.href} className={cls}>{l.label}</a>
                    })}

                    {/* Accent divider + CTA */}
                    <span className="w-px h-3.5 bg-zinc-700" />
                    <a
                        href="#explore"
                        className="text-xs font-mono tracking-[0.15em] uppercase text-emerald-400 hover:text-emerald-300 transition-colors duration-200"
                    >
                        Explore →
                    </a>
                </div>
            </div>

            {/* Bottom hairline — only visible when scrolled */}
            <div className={`absolute bottom-0 inset-x-0 h-px bg-linear-to-r from-transparent via-emerald-400/20 to-transparent transition-opacity duration-300 ${scrolled ? 'opacity-100' : 'opacity-0'}`} />
        </nav>
    )
}