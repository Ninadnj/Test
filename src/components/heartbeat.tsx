"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";

// Silent background component — fires heartbeat every 30s to keep isOnline accurate
export function Heartbeat() {
    const { data: session } = useSession();

    useEffect(() => {
        if (!session?.user) return;

        const ping = () => {
            fetch("/api/heartbeat", { method: "POST" }).catch(() => { });
        };

        // Fire immediately on mount, then every 30 seconds
        ping();
        const interval = setInterval(ping, 30_000);
        return () => clearInterval(interval);
    }, [session]);

    return null;
}
