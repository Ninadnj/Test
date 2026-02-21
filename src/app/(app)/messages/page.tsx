import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { User, CheckCheck, Clock, MessageCircle } from "lucide-react";

export default async function InboxPage() {
    const session = await auth();
    if (!session?.user?.id) return redirect("/auth");
    const myId = session.user.id;

    const messages = await prisma.message.findMany({
        where: { OR: [{ senderId: myId }, { receiverId: myId }] },
        orderBy: { createdAt: "desc" },
        include: {
            sender: { select: { id: true, name: true, avatar: true, isOnline: true } },
            receiver: { select: { id: true, name: true, avatar: true, isOnline: true } }
        }
    });

    // Group into conversations by the other user, keep only the latest message
    const conversationsMap = new Map<string, { user: typeof messages[0]["sender"]; lastMessage: typeof messages[0]; unreadCount: number }>();

    messages.forEach(msg => {
        const other = msg.senderId === myId ? msg.receiver : msg.sender;
        if (!conversationsMap.has(other.id)) {
            conversationsMap.set(other.id, {
                user: other,
                lastMessage: msg,
                unreadCount: (msg.receiverId === myId && !msg.isRead) ? 1 : 0
            });
        } else if (msg.receiverId === myId && !msg.isRead) {
            conversationsMap.get(other.id)!.unreadCount += 1;
        }
    });

    const conversations = Array.from(conversationsMap.values());

    return (
        <div className="max-w-3xl mx-auto p-4 md:p-6 pb-24 md:pb-8">
            <div className="mb-8 animate-fade-up">
                <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--foreground)" }}>
                    შეტყობინებები
                </h1>
                <p className="mt-1" style={{ color: "var(--muted-foreground)" }}>თქვენი ჩატები და საუბრები</p>
            </div>

            <div
                className="rounded-2xl overflow-hidden animate-fade-up delay-100"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
                {conversations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-16 text-center">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                            style={{ background: "var(--surface)" }}
                        >
                            <MessageCircle className="w-7 h-7" style={{ color: "var(--muted-foreground)" }} />
                        </div>
                        <h3 className="text-lg font-bold mb-2" style={{ color: "var(--foreground)" }}>
                            შეტყობინება არ არის
                        </h3>
                        <p className="text-sm mb-6" style={{ color: "var(--muted-foreground)" }}>
                            მოძებნეთ მომხმარებლები და გაუგზავნეთ პირველი შეტყობინება
                        </p>
                        <Link href="/search" className="btn-rose px-5 py-2.5 rounded-xl text-sm font-semibold">
                            ხალხის ძიება
                        </Link>
                    </div>
                ) : (
                    <ul className="divide-y" style={{ borderColor: "var(--border)" }}>
                        {conversations.map((conv) => {
                            const { user, lastMessage, unreadCount } = conv;
                            const isMe = lastMessage.senderId === myId;

                            return (
                                <li key={user.id}>
                                    <Link
                                        href={`/messages/${user.id}`}
                                        className="flex items-center gap-4 p-4 transition-colors duration-150 group"
                                        style={{ background: "transparent" }}
                                    >
                                        {/* Avatar */}
                                        <div className="relative flex-shrink-0">
                                            <div
                                                className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden"
                                                style={{ background: "var(--surface)" }}
                                            >
                                                {user.avatar ? (
                                                    <Image src={user.avatar} alt={user.name ?? "User"} fill sizes="56px" className="object-cover" />
                                                ) : (
                                                    <User className="h-6 w-6" style={{ color: "var(--muted-foreground)" }} />
                                                )}
                                            </div>
                                            {user.isOnline && (
                                                <span
                                                    className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2"
                                                    style={{ borderColor: "var(--card)" }}
                                                />
                                            )}
                                        </div>

                                        {/* Text area */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <h3
                                                    className="font-bold truncate pr-4 text-sm"
                                                    style={{ color: unreadCount > 0 ? "var(--foreground)" : "var(--foreground)", opacity: unreadCount > 0 ? 1 : 0.8 }}
                                                >
                                                    {user.name}
                                                </h3>
                                                <span className="text-xs flex items-center gap-1 flex-shrink-0" style={{ color: "var(--muted-foreground)" }}>
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(lastMessage.createdAt).toLocaleDateString("ka-GE")}
                                                </span>
                                            </div>
                                            <div className="flex gap-2 items-center">
                                                {isMe && (
                                                    <CheckCheck
                                                        className="h-4 w-4 flex-shrink-0"
                                                        style={{ color: lastMessage.isRead ? "var(--rose-accent)" : "var(--muted-foreground)" }}
                                                    />
                                                )}
                                                <p
                                                    className="text-sm truncate"
                                                    style={{
                                                        color: unreadCount > 0 ? "var(--foreground)" : "var(--muted-foreground)",
                                                        fontWeight: unreadCount > 0 ? 500 : 400,
                                                    }}
                                                >
                                                    {lastMessage.text || "გაიგზავნა ფოტო"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Unread badge */}
                                        {unreadCount > 0 && (
                                            <div
                                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                                style={{ background: "var(--rose-accent)" }}
                                            >
                                                {unreadCount}
                                            </div>
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
