"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Search, MessageCircle, User, LogOut, Flame, Eye, Heart } from "lucide-react";
import { NotificationListener } from "@/components/notification-listener";
import { Heartbeat } from "@/components/heartbeat";

const NAV_ITEMS = [
    { href: "/search", icon: Search, label: "ძიება" },
    { href: "/messages", icon: MessageCircle, label: "ჩატები" },
    { href: "/favorites", icon: Heart, label: "ფავორიტები" },
    { href: "/views", icon: Eye, label: "მნახავები" },
    { href: "/profile", icon: User, label: "პროფილი" },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex min-h-screen" style={{ background: "var(--background)", color: "var(--foreground)" }}>
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2 focus:rounded-lg focus:font-semibold focus:text-sm"
                style={{ background: "var(--rose-accent)", color: "white" }}
            >
                მსთევანი კონტენტი
            </a>
            <NotificationListener />
            <Heartbeat />

            {/* ──────────────────────────────
                DESKTOP SIDEBAR
            ────────────────────────────── */}
            <aside
                className="hidden md:flex flex-col w-64 min-h-screen sticky top-0 flex-shrink-0"
                style={{
                    background: "var(--sidebar)",
                    borderRight: "1px solid var(--sidebar-border)"
                }}
            >
                {/* Logo */}
                <div className="flex items-center gap-3 px-6 h-20 flex-shrink-0" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: "var(--rose-accent)" }}
                    >
                        <Flame className="w-5 h-5 text-white fill-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
                        Kave
                    </span>
                </div>

                {/* Nav */}
                <nav className="flex flex-col gap-1 p-4 flex-1">
                    {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                        const isActive = pathname.startsWith(href);
                        return (
                            <Link
                                key={href}
                                href={href}
                                className="relative flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200"
                                style={{
                                    background: isActive ? "var(--surface)" : "transparent",
                                    color: isActive ? "var(--foreground)" : "var(--sidebar-foreground)",
                                }}
                            >
                                {isActive && (
                                    <span
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 rounded-r-full"
                                        style={{ background: "var(--rose-accent)" }}
                                    />
                                )}
                                <Icon
                                    className="w-5 h-5 flex-shrink-0 transition-colors"
                                    style={{ color: isActive ? "var(--rose-accent)" : "inherit" }}
                                />
                                <span className="text-sm">{label}</span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Logout */}
                <div className="p-4" style={{ borderTop: "1px solid var(--sidebar-border)" }}>
                    <button
                        onClick={() => signOut({ callbackUrl: "/auth" })}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:opacity-100"
                        style={{ color: "#F87171", background: "transparent", opacity: 0.7 }}
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(248,113,113,0.08)"; (e.currentTarget as HTMLButtonElement).style.opacity = "1"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.opacity = "0.7"; }}
                    >
                        <LogOut className="w-5 h-5 flex-shrink-0" />
                        <span>გამოსვლა</span>
                    </button>
                </div>
            </aside>

            {/* ──────────────────────────────
                MAIN CONTENT
            ────────────────────────────── */}
            <main id="main-content" className="flex-1 min-w-0 pb-16 md:pb-0">
                {children}
            </main>

            {/* ──────────────────────────────
                MOBILE NAV — floating pill bar
            ────────────────────────────── */}
            <nav
                className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1 px-3 py-2 rounded-2xl backdrop-blur-xl shadow-2xl"
                style={{
                    background: "rgba(19, 19, 24, 0.92)",
                    border: "1px solid var(--border)",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)"
                }}
            >
                {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
                    const isActive = pathname.startsWith(href);
                    return (
                        <Link
                            key={href}
                            href={href}
                            className="flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all duration-200"
                            style={{
                                background: isActive ? "var(--surface)" : "transparent",
                                color: isActive ? "var(--rose-accent)" : "var(--muted-foreground)",
                            }}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="text-[9px] font-semibold mt-0.5 tracking-wide">{label}</span>
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
