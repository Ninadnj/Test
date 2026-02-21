"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Image as ImageIcon, Smile } from "lucide-react";

type TargetUser = { avatar: string | null; name: string | null; isOnline: boolean };
type Message = { id: string; senderId: string; receiverId: string; text: string; createdAt: string };

export default function ChatThread({ targetUserId, targetUser }: { targetUserId: string, targetUser: TargetUser }) {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>([]);
    const [text, setText] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const fetchMessages = useCallback(async () => {
        const res = await fetch(`/api/messages?userId=${targetUserId}`);
        if (res.ok) {
            const data = await res.json() as Message[];
            setMessages(data);
        }
    }, [targetUserId]);

    // Poll for new messages every 3 seconds
    useEffect(() => {
        let active = true;
        const poll = async () => {
            const res = await fetch(`/api/messages?userId=${targetUserId}`);
            if (res.ok && active) {
                const data = await res.json() as Message[];
                setMessages(data);
            }
        };
        void poll();
        const interval = setInterval(() => { void poll(); }, 3000);
        return () => {
            active = false;
            clearInterval(interval);
        };
    }, [targetUserId]);

    useEffect(() => {
        // Scroll to bottom when messages change
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMsg = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;

        // Optimistic UI update
        const tempMsg = {
            id: "temp-" + Date.now(),
            senderId: session?.user?.id ?? "",
            receiverId: targetUserId,
            text: text,
            createdAt: new Date().toISOString()
        };
        setMessages(prev => [...prev, tempMsg]);
        setText("");

        try {
            await fetch("/api/messages", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ receiverId: targetUserId, text: text })
            });
            fetchMessages(); // re-fetch to get actual ID and read status
        } catch (_error) {
            // silently ignore send errors; messages will re-sync on next poll
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] md:h-[calc(100vh-theme(spacing.8))] bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="h-16 border-b border-slate-800 flex items-center px-4 bg-slate-950 flex-shrink-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden font-bold flex items-center justify-center relative">
                        {targetUser?.avatar
                            ? <Image src={targetUser.avatar} alt={`${targetUser?.name || 'User'} avatar`} fill sizes="40px" className="object-cover" />
                            : targetUser?.name?.[0]}
                    </div>
                    <div>
                        <h3 className="font-bold text-white text-sm">{targetUser?.name || "მომხმარებელი"}</h3>
                        <p className="text-xs text-slate-500">{targetUser?.isOnline ? "ონლაინ" : "გასულია"}</p>
                    </div>
                </div>
            </div>

            {/* Message Feed */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                {messages.map((msg: Message) => {
                    const isMe = msg.senderId === session?.user?.id;
                    return (
                        <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                            <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${isMe
                                ? "bg-indigo-600 text-white rounded-br-sm"
                                : "bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-sm"
                                }`}>
                                {msg.text}
                                <div className={`text-[10px] mt-1 text-right ${isMe ? "text-indigo-200" : "text-slate-500"}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString('ka-GE', { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Compose */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex-shrink-0">
                <form onSubmit={sendMsg} className="flex items-center gap-2">
                    <button type="button" className="p-2 text-slate-500 hover:text-slate-300 transition shrink-0">
                        <ImageIcon className="w-5 h-5" />
                    </button>
                    <button type="button" className="p-2 text-slate-500 hover:text-slate-300 transition shrink-0">
                        <Smile className="w-5 h-5" />
                    </button>
                    <Input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="წერე აქ..."
                        className="flex-1 bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 rounded-full px-4 h-10"
                    />
                    <Button type="submit" size="icon" className="rounded-full bg-indigo-600 hover:bg-indigo-700 h-10 w-10 shrink-0">
                        <Send className="w-4 h-4" />
                    </Button>
                </form>
            </div>
        </div>
    );
}
