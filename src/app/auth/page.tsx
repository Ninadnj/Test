"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Flame, Eye, EyeOff, Loader2 } from "lucide-react";

// ─── SVG brand icons ─────────────────────────────────────────────────────────
function GoogleIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853" />
            <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
        </svg>
    );
}

function FacebookIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#1877F2">
            <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.025 1.792-4.696 4.533-4.696 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.267h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
        </svg>
    );
}

function TikTokIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.68a8.181 8.181 0 004.78 1.52V6.73a4.85 4.85 0 01-1.01-.04z" />
        </svg>
    );
}

export default function AuthPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [socialLoading, setSocialLoading] = useState<string | null>(null);
    const [tab, setTab] = useState<"login" | "register">("login");
    const [showPassword, setShowPassword] = useState(false);

    // Login State
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Register State
    const [regName, setRegName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");

    const handleSocialLogin = async (provider: "google" | "facebook" | "tiktok") => {
        setSocialLoading(provider);
        await signIn(provider, { callbackUrl: "/search" });
        setSocialLoading(null);
    };

    const onLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await signIn("credentials", {
            email: loginEmail,
            password: loginPassword,
            redirect: false,
        });
        if (res?.error) {
            toast.error("არასწორი ელ-ფოსტა ან პაროლი.");
        } else {
            toast.success("მოგესალმებათ!");
            router.push("/search");
            router.refresh();
        }
        setLoading(false);
    };

    const onRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: regName, email: regEmail, password: regPassword }),
            });
            if (!res.ok) throw new Error(await res.text());
            toast.success("ანგარიში შეიქმნა!");

            const signInResult = await signIn("credentials", {
                email: regEmail,
                password: regPassword,
                redirect: false,
            });
            if (signInResult?.ok) {
                router.push("/onboarding");
            } else {
                setTab("login");
                setLoginEmail(regEmail);
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "დაფიქსირდა შეცდომა.";
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const socialButtons = [
        {
            id: "google" as const,
            label: "Google-ით გაგრძელება",
            icon: <GoogleIcon />,
            style: { background: "#fff", color: "#1f1f1f", border: "1px solid #dadce0" }
        },
        {
            id: "facebook" as const,
            label: "Facebook-ით გაგრძელება",
            icon: <FacebookIcon />,
            style: { background: "#1877F2", color: "#fff", border: "1px solid #1877F2" }
        },
        {
            id: "tiktok" as const,
            label: "TikTok-ით გაგრძელება",
            icon: <TikTokIcon />,
            style: { background: "#010101", color: "#fff", border: "1px solid #2a2a2a" }
        },
    ];

    return (
        <div className="min-h-screen flex" style={{ background: "var(--background)" }}>
            {/* ── LEFT: Brand Panel ── */}
            <div
                className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden p-14"
                style={{ background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)" }}
            >
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--rose-accent)" }}>
                        <Flame className="w-4 h-4 text-white fill-white" />
                    </div>
                    <span className="text-base font-bold tracking-tight" style={{ color: "var(--foreground)" }}>Kave</span>
                </div>

                {/* Hero typography */}
                <div className="space-y-8 animate-fade-up">
                    <div className="w-10 h-px" style={{ background: "var(--rose-accent)" }} />
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[3px]" style={{ color: "var(--rose-accent)" }}>
                            ქართული გაცნობა
                        </p>
                        <h1 className="text-[52px] font-black leading-[1.0] tracking-tighter" style={{ color: "var(--foreground)" }}>
                            ახალი<br />
                            კავ<span style={{ color: "var(--rose-accent)" }}>შირები.</span>
                        </h1>
                    </div>
                    <p className="text-sm leading-relaxed max-w-[240px]" style={{ color: "var(--muted-foreground)" }}>
                        ათასობით რეალური ადამიანი. ნახე, დაუკავშირდი, გაიცანი.
                    </p>
                    <div className="flex flex-col gap-4">
                        {[
                            { stat: "15,000+", label: "დარეგისტრირებული" },
                            { stat: "2,000+", label: "შეხვედრა" },
                        ].map(({ stat, label }) => (
                            <div key={label} className="flex items-baseline gap-3">
                                <span className="text-xl font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>{stat}</span>
                                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-xs" style={{ color: "var(--border)" }}>© 2024 Kave. ყველა უფლება დაცულია.</p>
            </div>

            {/* ── RIGHT: Auth Form ── */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-16 relative">
                {/* Mobile logo */}
                <div className="lg:hidden flex items-center gap-3 mb-10">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: "var(--rose-accent)" }}>
                        <Flame className="w-5 h-5 text-white fill-white" />
                    </div>
                    <span className="text-xl font-bold text-white">Kave</span>
                </div>

                <div className="w-full max-w-sm animate-fade-up">
                    {/* Heading */}
                    <div className="mb-6">
                        <h2 className="text-3xl font-extrabold tracking-tight">
                            {tab === "login" ? "მოგესალმებათ" : "ახალი ანგარიში"}
                        </h2>
                        <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                            {tab === "login" ? "შეხვედით თქვენს ანგარიშზე" : "შექმენი ახალი ანგარიში"}
                        </p>
                    </div>

                    {/* ── Social Login Buttons ── */}
                    <div className="flex flex-col gap-2.5 mb-6">
                        {socialButtons.map(({ id, label, icon, style }) => (
                            <button
                                key={id}
                                onClick={() => handleSocialLogin(id)}
                                disabled={socialLoading !== null}
                                className="relative w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center gap-3 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
                                style={style}
                            >
                                {socialLoading === id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    icon
                                )}
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Divider */}
                    <div className="flex items-center gap-3 mb-6">
                        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                        <span className="text-xs font-medium" style={{ color: "var(--muted-foreground)" }}>
                            ან ელ-ფოსტით
                        </span>
                        <div className="flex-1 h-px" style={{ background: "var(--border)" }} />
                    </div>

                    {/* Email/Password Tabs */}
                    <div className="flex rounded-xl p-1 mb-6" style={{ background: "var(--surface)" }}>
                        {(["login", "register"] as const).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200"
                                style={{
                                    background: tab === t ? "var(--card)" : "transparent",
                                    color: tab === t ? "var(--foreground)" : "var(--muted-foreground)",
                                    boxShadow: tab === t ? "0 2px 8px rgba(0,0,0,0.3)" : "none",
                                }}
                            >
                                {t === "login" ? "შესვლა" : "რეგისტრაცია"}
                            </button>
                        ))}
                    </div>

                    {/* Login Form */}
                    {tab === "login" && (
                        <form onSubmit={onLogin} className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                                    ელ-ფოსტა
                                </label>
                                <input
                                    type="email"
                                    id="login-email"
                                    value={loginEmail}
                                    onChange={e => setLoginEmail(e.target.value)}
                                    placeholder="mail@example.com"
                                    required
                                    className="cs-input w-full h-12 px-4 text-sm rounded-xl"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="login-password" className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                                    პაროლი
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="login-password"
                                        value={loginPassword}
                                        onChange={e => setLoginPassword(e.target.value)}
                                        required
                                        className="cs-input w-full h-12 px-4 pr-12 text-sm rounded-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "პაროლის დამალვა" : "პაროლის ჩვენება"}
                                        className="absolute right-4 top-1/2 -translate-y-1/2"
                                        style={{ color: "var(--muted-foreground)" }}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-rose w-full h-12 rounded-xl text-sm flex items-center justify-center gap-2 mt-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>შესვლა</span>}
                            </button>
                        </form>
                    )}

                    {/* Register Form */}
                    {tab === "register" && (
                        <form onSubmit={onRegister} className="space-y-4">
                            <div className="space-y-1.5">
                                <label htmlFor="reg-name" className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                                    სახელი
                                </label>
                                <input
                                    type="text"
                                    id="reg-name"
                                    value={regName}
                                    onChange={e => setRegName(e.target.value)}
                                    placeholder="მაგ. გიორგი"
                                    required
                                    className="cs-input w-full h-12 px-4 text-sm rounded-xl"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="reg-email" className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                                    ელ-ფოსტა
                                </label>
                                <input
                                    type="email"
                                    id="reg-email"
                                    value={regEmail}
                                    onChange={e => setRegEmail(e.target.value)}
                                    placeholder="mail@example.com"
                                    required
                                    className="cs-input w-full h-12 px-4 text-sm rounded-xl"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label htmlFor="reg-password" className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
                                    პაროლი
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        id="reg-password"
                                        value={regPassword}
                                        onChange={e => setRegPassword(e.target.value)}
                                        required
                                        className="cs-input w-full h-12 px-4 pr-12 text-sm rounded-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "პაროლის დამალვა" : "პაროლის ჩვენება"}
                                        className="absolute right-4 top-1/2 -translate-y-1/2"
                                        style={{ color: "var(--muted-foreground)" }}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-rose w-full h-12 rounded-xl text-sm flex items-center justify-center gap-2 mt-2"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>ანგარიშის შექმნა</span>}
                            </button>
                        </form>
                    )}

                    <p className="text-center text-xs mt-6" style={{ color: "#3a3a50" }}>
                        რეგისტრაციით ეთანხმებით ჩვენს პირობებს
                    </p>
                </div>
            </div>
        </div>
    );
}
