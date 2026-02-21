"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import Image from "next/image";
import { Flame, ArrowRight, Check } from "lucide-react";

const STEPS = ["ფოტო", "პროფილი", "გამართვა"] as const;

export default function OnboardingPage() {
    const router = useRouter();
    const { update } = useSession();

    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);

    // Step 1 — Avatar upload (skip allowed)
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);

    // Step 2 — Profile info
    const [name, setName] = useState("");
    const [bio, setBio] = useState("");

    // Step 3 — Details
    const [age, setAge] = useState("");
    const [city, setCity] = useState("");
    const [gender, setGender] = useState<"male" | "female" | "other" | "">("");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setAvatarFile(file);
        setAvatarPreview(URL.createObjectURL(file));
    };

    const finish = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            if (name) formData.append("name", name);
            if (bio) formData.append("bio", bio);
            if (age) formData.append("age", age);
            if (city) formData.append("city", city);
            if (gender) formData.append("gender", gender);
            if (avatarFile) formData.append("avatar", avatarFile);

            const res = await fetch("/api/profile", { method: "PATCH", body: formData });
            if (!res.ok) throw new Error();

            await update(); // refresh session
            toast.success("პროფილი შეიქმნა!");
            router.push("/search");
        } catch {
            toast.error("შეცდომა. სცადეთ თავიდან.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className="min-h-screen flex items-center justify-center p-4"
            style={{ background: "var(--background)" }}
        >
            <div className="w-full max-w-md">
                {/* Brand */}
                <div className="flex items-center gap-2 justify-center mb-10">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "var(--rose-accent)" }}>
                        <Flame className="w-4 h-4 text-white fill-white" />
                    </div>
                    <span className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Kave</span>
                </div>

                {/* Step indicators */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    {STEPS.map((label, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div
                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300"
                                style={{
                                    background: i < step ? "var(--rose-accent)" : i === step ? "var(--rose-accent)" : "var(--surface)",
                                    color: i <= step ? "white" : "var(--muted-foreground)",
                                }}
                            >
                                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
                            </div>
                            <span className="text-xs font-medium hidden sm:block" style={{ color: i <= step ? "var(--foreground)" : "var(--muted-foreground)" }}>
                                {label}
                            </span>
                            {i < STEPS.length - 1 && (
                                <div className="w-8 h-px mx-1" style={{ background: i < step ? "var(--rose-accent)" : "var(--border)" }} />
                            )}
                        </div>
                    ))}
                </div>

                {/* Card */}
                <div className="rounded-2xl p-8" style={{ background: "var(--card)", border: "1px solid var(--border)" }}>

                    {/* ── STEP 0: PHOTO ── */}
                    {step === 0 && (
                        <div className="flex flex-col items-center gap-6">
                            <div>
                                <h2 className="text-2xl font-extrabold text-center" style={{ color: "var(--foreground)" }}>
                                    ფოტოს ატვირთვა
                                </h2>
                                <p className="text-sm text-center mt-1" style={{ color: "var(--muted-foreground)" }}>
                                    პროფილის ფოტო ზრდის მოწონებების რაოდენობას
                                </p>
                            </div>

                            <label className="cursor-pointer group">
                                <div
                                    className="w-36 h-36 rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-200"
                                    style={{
                                        background: "var(--surface)",
                                        border: "2px dashed var(--border)"
                                    }}
                                >
                                    {avatarPreview ? (
                                        <Image src={avatarPreview} alt="Preview of your avatar" fill sizes="144px" className="object-cover" />
                                    ) : (
                                        <div className="text-center p-4">
                                            <div className="text-3xl mb-1" style={{ color: "var(--muted-foreground)" }}>+</div>
                                            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>ატვირთვა</p>
                                        </div>
                                    )}
                                </div>
                                <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                            </label>

                            <div className="w-full flex flex-col gap-2">
                                <button className="btn-rose w-full py-3 rounded-xl font-semibold" onClick={() => setStep(1)}>
                                    გაგრძელება
                                </button>
                                <button
                                    className="w-full py-2.5 text-sm text-center transition-opacity hover:opacity-100"
                                    style={{ color: "var(--muted-foreground)", opacity: 0.6 }}
                                    onClick={() => setStep(1)}
                                >
                                    გამოტოვება
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── STEP 1: NAME + BIO ── */}
                    {step === 1 && (
                        <div className="flex flex-col gap-5">
                            <div>
                                <h2 className="text-2xl font-extrabold" style={{ color: "var(--foreground)" }}>
                                    თქვენს შესახებ
                                </h2>
                                <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                                    გეტყოდით ცოტა თქვენს შესახებ
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                                    სახელი
                                </label>
                                <input
                                    className="cs-input w-full px-4 py-3 rounded-xl"
                                    placeholder="თქვენი სახელი"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                                    თქვენს შესახებ
                                </label>
                                <textarea
                                    className="cs-input w-full px-4 py-3 rounded-xl resize-none"
                                    placeholder="მოკლე ინფო თქვენს შესახებ..."
                                    rows={3}
                                    value={bio}
                                    onChange={e => setBio(e.target.value)}
                                />
                            </div>

                            <button className="btn-rose w-full py-3 rounded-xl font-semibold" onClick={() => setStep(2)}>
                                გაგრძელება
                            </button>
                        </div>
                    )}

                    {/* ── STEP 2: AGE + CITY + GENDER ── */}
                    {step === 2 && (
                        <div className="flex flex-col gap-5">
                            <div>
                                <h2 className="text-2xl font-extrabold" style={{ color: "var(--foreground)" }}>
                                    დეტალები
                                </h2>
                                <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                                    ეს ინფო გამოჩნდება პროფილზე
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                                        ასაკი
                                    </label>
                                    <input
                                        className="cs-input w-full px-4 py-3 rounded-xl"
                                        type="number"
                                        placeholder="25"
                                        min={18}
                                        max={99}
                                        value={age}
                                        onChange={e => setAge(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                                        ქალაქი
                                    </label>
                                    <input
                                        className="cs-input w-full px-4 py-3 rounded-xl"
                                        placeholder="თბილისი"
                                        value={city}
                                        onChange={e => setCity(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold mb-2 uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                                    სქესი
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {([["male", "კაცი"], ["female", "ქალი"], ["other", "სხვა"]] as const).map(([val, label]) => (
                                        <button
                                            key={val}
                                            onClick={() => setGender(val)}
                                            className="py-2.5 rounded-xl text-sm font-semibold transition-all duration-200"
                                            style={{
                                                background: gender === val ? "var(--rose-accent)" : "var(--surface)",
                                                color: gender === val ? "white" : "var(--muted-foreground)",
                                                border: `1px solid ${gender === val ? "var(--rose-accent)" : "var(--border)"}`,
                                            }}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                className="btn-rose w-full py-3 rounded-xl font-semibold flex items-center justify-center gap-2"
                                onClick={finish}
                                disabled={loading}
                            >
                                {loading ? (
                                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>პროფილის შექმნა</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>

                <p className="text-center text-xs mt-6" style={{ color: "var(--muted-foreground)" }}>
                    ყველა ველი არჩევითია — შეგიძლიათ მოგვიანებით შეავსოთ
                </p>
            </div>
        </div>
    );
}
