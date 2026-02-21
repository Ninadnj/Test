"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Heart, Star, MessageCircle } from "lucide-react";

interface InteractionProps {
    targetId: string;
    initialLiked: boolean;
    initialFavorited: boolean;
}

export function InteractionButtons({ targetId, initialLiked, initialFavorited }: InteractionProps) {
    const router = useRouter();
    const [liked, setLiked] = useState(initialLiked);
    const [favorited, setFavorited] = useState(initialFavorited);
    const [loading, setLoading] = useState(false);

    const handleAction = async (action: "LIKE" | "FAVORITE") => {
        setLoading(true);
        try {
            const res = await fetch("/api/interactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action, targetId })
            });

            if (!res.ok) throw new Error("შეცდომა");

            const data = await res.json();

            if (action === "LIKE") {
                setLiked(true);
                if (data.status === "MATCHED") {
                    toast.success("გილოცავთ! თქვენ დაგემთხვათ სიმპათია! 💖", { duration: 5000 });
                } else {
                    toast.success("მოწონება გაიგზავნა!");
                }
            }

            if (action === "FAVORITE") {
                setFavorited(data.status === "FAVORITED");
                toast.info(data.status === "FAVORITED" ? "დაემატა ფავორიტებში" : "წაიშალა ფავორიტებიდან");
            }

            router.refresh();
        } catch (_error) {
            toast.error("მოქმედება ვერ შესრულდა");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4 sm:mt-0">
            <Button
                onClick={() => router.push(`/messages/${targetId}`)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full px-6"
            >
                <MessageCircle className="mr-2 h-4 w-4" />
                მიწერა
            </Button>

            <Button
                disabled={liked || loading}
                onClick={() => handleAction("LIKE")}
                variant={liked ? "secondary" : "outline"}
                className={`rounded-full px-4 ${liked ? "bg-pink-900/40 text-pink-400 border-pink-900/50" : "border-slate-700 text-slate-300 hover:text-pink-400 hover:border-pink-500 hover:bg-slate-900"}`}
            >
                <Heart className={`mr-2 h-4 w-4 ${liked ? "fill-pink-500/50" : ""}`} />
                {liked ? "მოწონებული" : "მოწონება"}
            </Button>

            <Button
                disabled={loading}
                onClick={() => handleAction("FAVORITE")}
                variant="outline"
                className={`rounded-full w-10 p-0 ${favorited ? "border-amber-500/50 bg-amber-500/10 text-amber-500" : "border-slate-700 text-slate-300 hover:text-amber-400 hover:border-amber-500 hover:bg-slate-900"}`}
            >
                <Star className={`h-4 w-4 ${favorited ? "fill-amber-500" : ""}`} />
                <span className="sr-only">ფავორიტებში დამატება</span>
            </Button>
        </div>
    );
}
