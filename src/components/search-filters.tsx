"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SearchFilters() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [gender, setGender] = useState(searchParams.get("gender") || "");
    const [city, setCity] = useState(searchParams.get("city") || "");
    const [minAge, setMinAge] = useState(searchParams.get("minAge") || "");
    const [maxAge, setMaxAge] = useState(searchParams.get("maxAge") || "");

    // Debounced navigation
    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = new URLSearchParams();
            if (gender) params.set("gender", gender);
            if (city) params.set("city", city);
            if (minAge) params.set("minAge", minAge);
            if (maxAge) params.set("maxAge", maxAge);

            router.push(`/search?${params.toString()}`);
        }, 500);

        return () => clearTimeout(timeout);
    }, [gender, city, minAge, maxAge, router]);

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 mb-8 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[150px]">
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">სქესი</label>
                <select
                    className="w-full bg-slate-800 border-slate-700 rounded-md h-10 px-3 text-sm text-white"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                >
                    <option value="">ყველა</option>
                    <option value="female">ქალი</option>
                    <option value="male">კაცი</option>
                </select>
            </div>

            <div className="flex-1 min-w-[150px]">
                <label className="text-xs font-medium text-slate-400 mb-1.5 block">ქალაქი</label>
                <Input
                    placeholder="მაგ. თბილისი"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                />
            </div>

            <div className="min-w-[140px] flex gap-2">
                <div className="flex-1">
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block">ასაკიდან</label>
                    <Input
                        type="number"
                        placeholder="18"
                        value={minAge}
                        onChange={(e) => setMinAge(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white"
                    />
                </div>
                <div className="flex-1">
                    <label className="text-xs font-medium text-slate-400 mb-1.5 block">ასაკამდე</label>
                    <Input
                        type="number"
                        placeholder="99"
                        value={maxAge}
                        onChange={(e) => setMaxAge(e.target.value)}
                        className="bg-slate-800 border-slate-700 text-white"
                    />
                </div>
            </div>

            <div>
                <Button
                    variant="outline"
                    className="border-slate-700 text-slate-300"
                    onClick={() => {
                        setGender(""); setCity(""); setMinAge(""); setMaxAge("");
                        router.push('/search');
                    }}
                >
                    გასუფთავება
                </Button>
            </div>
        </div>
    );
}
