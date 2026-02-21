"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Flame, Eye, EyeOff, Loader2 } from "lucide-react";

export default function AuthPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState<"login" | "register">("login");
    const [showPassword, setShowPassword] = useState(false);

    // Login State
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Register State
    const [regName, setRegName] = useState("");
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");

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

            // Auto sign-in after registration → go straight to onboarding
            const signInResult = await signIn("credentials", {
                email: regEmail,
                password: regPassword,
                redirect: false,
            });
            if (signInResult?.ok) {
                router.push("/onboarding");
            } else {
                // Fallback: switch to login tab so they can log in manually
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

    return (
        <div
            className="min-h-screen flex"
            style={{ background: "var(--background)" }}
        >
            {/* ── LEFT: Brand Panel — Editorial Typographic ── */}
            <div
                className="hidden lg:flex flex-col justify-between w-[45%] relative overflow-hidden p-14"
                style={{ background: "var(--sidebar)", borderRight: "1px solid var(--sidebar-border)" }}
            >
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ background: "var(--rose-accent)" }}
                    >
                        <Flame className="w-4 h-4 text-white fill-white" />
                    </div>
                    <span className="text-base font-bold tracking-tight" style={{ color: "var(--foreground)" }}>
                        Kave
                    </span>
                </div>

                {/* Hero typography — the main visual */}
                <div className="space-y-8 animate-fade-up">
                    <div
                        className="w-10 h-px"
                        style={{ background: "var(--rose-accent)" }}
                    />
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[3px]" style={{ color: "var(--rose-accent)" }}>
                            ქართული გაცნობა
                        </p>
                        <h1
                            className="text-[52px] font-black leading-[1.0] tracking-tighter"
                            style={{ color: "var(--foreground)" }}
                        >
                            ახალი<br />
                            კავ<span style={{ color: "var(--rose-accent)" }}>შირები.</span>
                        </h1>
                    </div>

                    <p className="text-sm leading-relaxed max-w-[240px]" style={{ color: "var(--muted-foreground)" }}>
                        ათასობით რეალური ადამიანი. ნახე, დაუკავშირდი, გაიცანი.
                    </p>

                    {/* Stats — minimal */}
                    <div className="flex flex-col gap-4">
                        {[
                            { stat: "15,000+", label: "დარეგისტრირებული" },
                            { stat: "2,000+", label: "შეხვედრა" },
                        ].map(({ stat, label }) => (
                            <div key={label} className="flex items-baseline gap-3">
                                <span className="text-xl font-extrabold tabular-nums" style={{ color: "var(--foreground)" }}>
                                    {stat}
                                </span>
                                <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom */}
                <p className="text-xs" style={{ color: "var(--border)" }}>
                    © 2024 Kave. ყველა უფლება დაცულია.
                </p>
            </div>

            {/* ── RIGHT: Auth Form ──────────────────────── */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-16 relative">
                {/* Mobile logo */}
                <div className="lg:hidden flex items-center gap-3 mb-10">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center"
                        style={{ background: "var(--rose-accent)" }}
                    >
                        <Flame className="w-5 h-5 text-white fill-white" />
                    </div>
                    <span className="text-xl font-bold text-white">Kave</span>
                </div>

                <div className="w-full max-w-sm animate-fade-up">
                    {/* Heading */}
                    <div className="mb-8">
                        <h2 className="text-3xl font-extrabold tracking-tight">
                            {tab === "login" ? "მოგესალმებათ" : "ახალი ანგარიში"}
                        </h2>
                        <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
                            {tab === "login"
                                ? "შეხვედით თქვენს ანგარიშზე"
                                : "შექმენი ახალი ანგარიში"
                            }
                        </p>
                    </div>

                    {/* Tabs */}
                    <div
                        className="flex rounded-xl p-1 mb-8"
                        style={{ background: "var(--surface)" }}
                    >
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
                                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
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
                                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
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
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <span>შესვლა</span>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Register Form */}
                    {tab === "register" && (
                        <form onSubmit={onRegister} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
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
                                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
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
                                <label className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--muted-foreground)" }}>
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
                                {loading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <span>ანგარიშის შექმნა</span>
                                )}
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
