import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { InteractionButtons } from "@/components/interaction-buttons";
import Image from "next/image";
import { MapPin, Calendar } from "lucide-react";

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await auth();
    if (!session?.user?.id) return redirect("/auth");

    const { id: profileId } = await params;
    const myId = session.user.id;

    if (myId === profileId) return redirect("/profile");

    const dbUser = await prisma.user.findUnique({
        where: { id: profileId },
        include: {
            photos: { orderBy: { createdAt: "desc" } },
            favorites: { where: { userId: myId } },
            receivedLikes: { where: { senderId: myId } }
        }
    });

    if (!dbUser) return (
        <div className="p-10 text-center" style={{ color: "var(--muted-foreground)" }}>
            მომხმარებელი არ მოიძებნა.
        </div>
    );

    // Record profile view without blocking render
    prisma.profileView.upsert({
        where: { viewerId_viewedId: { viewerId: myId, viewedId: profileId } },
        create: { viewerId: myId, viewedId: profileId },
        update: { createdAt: new Date() }
    }).catch(() => { });

    const hasLiked = dbUser.receivedLikes.length > 0;
    const hasFavorited = dbUser.favorites.length > 0;
    const galleryPhotos = dbUser.photos.filter((p) => !p.isAvatar);

    return (
        <div className="max-w-4xl mx-auto p-6 pb-24 md:pb-8">
            {/* Profile Header Card */}
            <div
                className="rounded-2xl p-6 flex flex-col items-center sm:flex-row sm:items-start gap-8 mb-8"
                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
            >
                {/* Avatar */}
                <div
                    className="h-40 w-40 rounded-2xl overflow-hidden flex-shrink-0"
                    style={{ background: "var(--surface)", border: "2px solid var(--border)" }}
                >
                    {dbUser.avatar ? (
                        <Image
                            src={dbUser.avatar}
                            alt={`${dbUser.name ?? "User"} avatar`}
                            fill
                            sizes="160px"
                            className="object-cover"
                        />
                    ) : (
                        <div
                            className="h-full w-full flex items-center justify-center text-sm"
                            style={{ color: "var(--muted-foreground)" }}
                        >
                            ფოტო არ არის
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 text-center sm:text-left space-y-4 w-full">
                    <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4">
                        <div>
                            <h2
                                className="text-3xl font-extrabold flex flex-wrap items-center justify-center sm:justify-start gap-2"
                                style={{ color: "var(--foreground)" }}
                            >
                                {dbUser.name}
                                {dbUser.vipStatus && (
                                    <span className="vip-badge text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                                        VIP
                                    </span>
                                )}
                            </h2>
                            {dbUser.nickname && (
                                <p className="text-sm mt-0.5" style={{ color: "var(--rose-accent)" }}>
                                    @{dbUser.nickname}
                                </p>
                            )}
                            <div className="mt-2">
                                {dbUser.isOnline ? (
                                    <span
                                        className="text-xs px-2.5 py-1 rounded-full font-semibold"
                                        style={{
                                            background: "rgba(52,211,153,0.12)",
                                            color: "#34D399",
                                            border: "1px solid rgba(52,211,153,0.25)"
                                        }}
                                    >
                                        ონლაინ
                                    </span>
                                ) : (
                                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                        ბოლოს: {dbUser.lastSeen.toLocaleDateString("ka-GE")}
                                    </span>
                                )}
                            </div>
                        </div>

                        <InteractionButtons
                            targetId={profileId}
                            initialLiked={hasLiked}
                            initialFavorited={hasFavorited}
                        />
                    </div>

                    {/* Metadata pills */}
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                        {dbUser.age && (
                            <span
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
                                style={{
                                    background: "var(--surface)",
                                    color: "var(--foreground)",
                                    border: "1px solid var(--border)"
                                }}
                            >
                                <Calendar className="w-3.5 h-3.5" style={{ color: "var(--rose-accent)" }} />
                                {dbUser.age} წელი
                            </span>
                        )}
                        {dbUser.city && (
                            <span
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium"
                                style={{
                                    background: "var(--surface)",
                                    color: "var(--foreground)",
                                    border: "1px solid var(--border)"
                                }}
                            >
                                <MapPin className="w-3.5 h-3.5" style={{ color: "var(--rose-accent)" }} />
                                {dbUser.city}
                            </span>
                        )}
                    </div>

                    {/* Bio */}
                    {dbUser.bio && (
                        <div
                            className="p-4 rounded-xl text-sm leading-relaxed"
                            style={{
                                background: "var(--surface)",
                                color: "var(--muted-foreground)",
                                borderLeft: "3px solid var(--rose-accent)"
                            }}
                        >
                            {dbUser.bio}
                        </div>
                    )}
                </div>
            </div>

            {/* Gallery */}
            {galleryPhotos.length > 0 && (
                <div>
                    <h3 className="text-lg font-bold mb-4" style={{ color: "var(--foreground)" }}>
                        გალერეა
                    </h3>
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                        {galleryPhotos.map((photo) => (
                            <div
                                key={photo.id}
                                className="relative aspect-square rounded-xl overflow-hidden group"
                                style={{ background: "var(--surface)" }}
                            >
                                <Image
                                    src={photo.url}
                                    alt="Gallery photo"
                                    fill
                                    sizes="(max-width: 640px) 33vw, (max-width: 768px) 25vw, 20vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-110 cursor-pointer"
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
