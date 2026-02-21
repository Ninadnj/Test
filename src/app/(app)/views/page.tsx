import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";
import { User, Eye } from "lucide-react";

export default async function ViewsPage() {
    const session = await auth();
    if (!session?.user?.id) return redirect("/auth");
    const myId = session.user.id;

    const views = await prisma.profileView.findMany({
        where: { viewedId: myId },
        orderBy: { createdAt: "desc" },
        take: 50,
        include: {
            viewer: {
                select: { id: true, name: true, avatar: true, city: true, age: true, isOnline: true }
            }
        }
    });

    // Deduplicate — show each viewer only once (most recent)
    const seen = new Set<string>();
    const uniqueViews = views.filter(v => {
        if (seen.has(v.viewerId)) return false;
        seen.add(v.viewerId);
        return true;
    });

    return (
        <div className="max-w-3xl mx-auto p-6 pb-24 md:pb-8">
            <div className="mb-8 animate-fade-up">
                <div className="flex items-center gap-3 mb-1">
                    <Eye className="w-6 h-6" style={{ color: "var(--rose-accent)" }} />
                    <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: "var(--foreground)" }}>
                        ვინ მნახა
                    </h1>
                </div>
                <p style={{ color: "var(--muted-foreground)" }}>
                    {uniqueViews.length > 0
                        ? `${uniqueViews.length} ადამიანმა ნახა თქვენი პროფილი`
                        : "ჯერ არავინ განიხილავს პროფილს"}
                </p>
            </div>

            {uniqueViews.length === 0 ? (
                <div
                    className="py-24 text-center rounded-2xl border-2 border-dashed"
                    style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                >
                    <Eye className="w-10 h-10 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">ჯერ არავინ არ განიხილავს</p>
                    <p className="text-sm mt-1">გაიუმჯობესე პროფილი მეტი ვიზიტორისთვის</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 animate-fade-up delay-100">
                    {uniqueViews.map((view) => {
                        const u = view.viewer;
                        return (
                            <Link
                                key={u.id}
                                href={`/profile/${u.id}`}
                                className="group flex flex-col items-center gap-3 p-4 rounded-2xl transition-all duration-200"
                                style={{ background: "var(--card)", border: "1px solid var(--border)" }}
                            >
                                <div className="relative w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0"
                                    style={{ background: "var(--surface)" }}>
                                    {u.avatar ? (
                                        <img src={u.avatar} alt={u.name ?? "User"} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <User className="w-8 h-8 opacity-30" style={{ color: "var(--muted-foreground)" }} />
                                        </div>
                                    )}
                                    {u.isOnline && (
                                        <span className="absolute bottom-1 right-1 w-3 h-3 rounded-full bg-emerald-500 border-2"
                                            style={{ borderColor: "var(--card)" }} />
                                    )}
                                </div>
                                <div className="text-center">
                                    <p className="font-semibold text-sm truncate" style={{ color: "var(--foreground)" }}>
                                        {u.name ?? "–"}
                                        {u.age ? `, ${u.age}` : ""}
                                    </p>
                                    {u.city && (
                                        <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{u.city}</p>
                                    )}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
