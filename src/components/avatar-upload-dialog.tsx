"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { Camera } from "lucide-react";

export function AvatarUploadTrigger({ currentAvatar }: { currentAvatar: string | null }) {
    const router = useRouter();
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("isAvatar", "true");

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("ატვირთვა ვერ მოხერხდა");

            toast.success("ავატარი წარმატებით განახლდა");
            router.refresh();
        } catch (error) {
            toast.error("ვერ მოხერხდა ფოტოს ატვირთვა");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="relative h-32 w-32 rounded-full bg-slate-800 border-4 border-slate-950 shadow-xl overflow-hidden flex-shrink-0 z-10 group cursor-pointer">
            {currentAvatar ? (
                <Image src={currentAvatar} alt="Your current avatar" fill sizes="128px" className="object-cover" />
            ) : (
                <div className="h-full w-full flex items-center justify-center text-slate-500 text-sm">
                    არაა ატვირთული
                </div>
            )}

            <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer">
                {uploading ? (
                    <span className="text-xs">იტვირთება...</span>
                ) : (
                    <>
                        <Camera className="h-6 w-6 mb-1" />
                        <span className="text-[10px] uppercase font-bold tracking-wider">შეცვლა</span>
                    </>
                )}
                <input
                    type="file"
                    accept="image/*"
                    aria-label="ავატარის შეცვლა"
                    className="hidden"
                    disabled={uploading}
                    onChange={handleFileChange}
                />
            </label>
        </div>
    );
}
