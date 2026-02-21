import Link from "next/link";
import Image from "next/image";
import { User as UserIcon, MapPin } from "lucide-react";

interface UserCardUser {
    id: string;
    name: string | null;
    avatar: string | null;
    age: number | null;
    city: string | null;
    isOnline: boolean;
    vipStatus: boolean;
    gender: string | null;
}

export function UserCard({ user }: { user: UserCardUser }) {
    return (
        <Link href={`/profile/${user.id}`} className="group block user-card-link">
            <article className="user-card relative overflow-hidden rounded-xl flex flex-row h-28">

                {/* Photo — left panel, fixed width, sharp crop */}
                <div className="relative w-24 flex-shrink-0 overflow-hidden">
                    {user.avatar ? (
                        <Image
                            src={user.avatar}
                            alt={user.name ?? "User"}
                            fill
                            sizes="96px"
                            className="object-cover object-center transition-transform duration-700 group-hover:scale-110"
                        />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center user-card-placeholder">
                            <UserIcon className="w-8 h-8 opacity-15" />
                        </div>
                    )}
                    {/* Thin rose left accent line */}
                    <div className="absolute left-0 inset-y-0 w-0.5 z-10" style={{ background: "var(--rose-accent)" }} />
                </div>

                {/* Text content — right panel */}
                <div className="flex-1 flex flex-col justify-between p-4 min-w-0">
                    <div>
                        <div className="flex items-start justify-between gap-2">
                            <h3
                                className="font-bold text-sm leading-tight truncate transition-colors duration-200"
                                style={{ color: "var(--foreground)" }}
                            >
                                {user.name ?? "–"}
                                {user.age && (
                                    <span className="font-normal ml-1.5" style={{ color: "var(--muted-foreground)" }}>
                                        {user.age}
                                    </span>
                                )}
                            </h3>
                            {user.vipStatus && (
                                <span className="vip-badge text-[8px] font-black uppercase tracking-[1.5px] px-1.5 py-0.5 rounded flex-shrink-0">
                                    VIP
                                </span>
                            )}
                        </div>

                        {user.gender && (
                            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                                {user.gender === "male" ? "კაცი" : user.gender === "female" ? "ქალი" : "სხვა"}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {user.isOnline ? (
                            <div className="flex items-center gap-1.5">
                                <span className="relative flex h-1.5 w-1.5">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-emerald-400" />
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                                </span>
                                <span className="text-xs font-semibold text-emerald-400">ონლაინ</span>
                            </div>
                        ) : user.city ? (
                            <div className="flex items-center gap-1" style={{ color: "var(--muted-foreground)" }}>
                                <MapPin className="w-3 h-3 flex-shrink-0" />
                                <span className="text-xs truncate">{user.city}</span>
                            </div>
                        ) : null}
                    </div>
                </div>
            </article>
        </Link>
    );
}
