"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { ImagePlus, X } from "lucide-react";

type Photo = { id: string; url: string; isAvatar: boolean };

export function PhotoGallery({ photos }: { photos: Photo[] }) {
    const router = useRouter();
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        setUploading(true);
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("isAvatar", "false"); // Just a gallery photo

        try {
            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) throw new Error("ატვირთვა ვერ მოხერხდა");

            toast.success("ფოტო დაემატა გალერეაში");
            router.refresh();
        } catch (_error) {
            toast.error("ვერ მოხერხდა ფოტოს ატვირთვა");
        } finally {
            setUploading(false);
        }
    };

    const galleryPhotos = photos.filter(p => !p.isAvatar);

    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold text-white mb-4">ფოტო გალერეა</h3>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                {/* Upload Button */}
                <label className="aspect-square rounded-lg border-2 border-dashed border-slate-700 bg-slate-900 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-500 hover:bg-slate-800 transition-colors group">
                    {uploading ? (
                        <span className="text-xs text-slate-400">იტვირთება...</span>
                    ) : (
                        <>
                            <ImagePlus className="h-8 w-8 text-slate-500 group-hover:text-indigo-400 mb-2" />
                            <span className="text-xs text-slate-500 font-medium">დამატება</span>
                        </>
                    )}
                    <input
                        type="file"
                        accept="image/*"
                        aria-label="ფოტოს ატვირთვა გალერეაში"
                        className="hidden"
                        disabled={uploading}
                        onChange={handleFileChange}
                    />
                </label>

                {/* Render Photos */}
                {galleryPhotos.map((photo) => (
                    <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group bg-slate-800">
                        <Image src={photo.url} alt="Gallery item" fill sizes="(max-width:640px) 33vw, 20vw" className="object-cover transition-transform group-hover:scale-110" />
                        <button
                            aria-label="ფოტოს წაშლა"
                            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-all text-white backdrop-blur-sm"
                            onClick={async () => {
                                // TODO: Delete API
                                toast.error("წაშლის ფუნქცია მალე დაემატება");
                            }}
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
