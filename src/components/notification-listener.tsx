"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { usePathname } from "next/navigation";

export function NotificationListener() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const [prevCounts, setPrevCounts] = useState({ messages: 0, likes: 0, matches: 0, views: 0 });

    useEffect(() => {
        if (!session?.user) return;

        const checkNotifications = async () => {
            try {
                const res = await fetch("/api/notifications");
                if (!res.ok) return;
                const data = await res.json();

                // Notify Message
                if (data.messages > prevCounts.messages && !pathname.startsWith("/messages")) {
                    toast("ახალი შეტყობინება", { description: "გაქვთ ახალი წაუკითხავი შეტყობინება", action: { label: "ნახვა", onClick: () => window.location.href = "/messages" } });
                }

                // Notify Like
                if (data.likes > prevCounts.likes) {
                    toast.success("ახალი მოწონება", { description: "ვინმეს მოეწონეთ თქვენი პროფილი", duration: 5000 });
                    // Optional: Optimistic mark as seen logic could go here
                }

                // Notify Match
                if (data.matches > prevCounts.matches) {
                    toast("ახალი Match!", { description: "ვიღაცასაც მოეწონეთ ორმხრივად", style: { backgroundColor: "#F43F5E", color: "white" }, duration: 8000 });
                }

                setPrevCounts(data);
            } catch (_err) { }
        };

        // Initial check
        checkNotifications();

        // Poll every 10 seconds
        const interval = setInterval(checkNotifications, 10000);
        return () => clearInterval(interval);
    }, [session, prevCounts, pathname]);

    return null; // Silent global listener
}
