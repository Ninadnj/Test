import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { UserCard } from "@/components/user-card";
import { SearchFilters } from "@/components/search-filters";

export default async function SearchPage({
    searchParams,
}: {
    searchParams: Promise<{ gender?: string; city?: string; minAge?: string; maxAge?: string }>;
}) {
    const session = await auth();
    const params = await searchParams;

    const whereClause: Record<string, unknown> = {
        id: { not: session?.user?.id }
    };

    if (params.gender) whereClause.gender = params.gender;
    if (params.city) whereClause.city = { contains: params.city };
    if (params.minAge || params.maxAge) {
        const ageFilter: Record<string, number> = {};
        if (params.minAge) ageFilter.gte = parseInt(params.minAge);
        if (params.maxAge) ageFilter.lte = parseInt(params.maxAge);
        whereClause.age = ageFilter;
    }

    const users = await prisma.user.findMany({
        where: whereClause,
        orderBy: [
            { vipStatus: "desc" },
            { lastSeen: "desc" },
            { createdAt: "desc" }
        ],
        take: 50
    });

    const online = users.filter(u => u.isOnline);
    const offline = users.filter(u => !u.isOnline);

    return (
        <div className="p-6 pb-24 md:pb-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="mb-8 animate-fade-up">
                <p
                    className="text-xs font-semibold uppercase tracking-[3px] mb-1"
                    style={{ color: "var(--rose-accent)" }}
                >
                    KAVE
                </p>
                <h1
                    className="text-4xl font-extrabold tracking-tight"
                    style={{ color: "var(--foreground)" }}
                >
                    ადამიანები
                </h1>
                {users.length > 0 && (
                    <p className="mt-1 text-sm tabular-nums" style={{ color: "var(--muted-foreground)" }}>
                        {users.length} შედეგი{online.length > 0 && ` · ${online.length} ონლაინ`}
                    </p>
                )}
            </div>

            <SearchFilters />

            {users.length === 0 ? (
                <div
                    className="mt-8 py-24 text-center rounded-xl border-2 border-dashed animate-fade-up"
                    style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}
                >
                    <p className="font-medium">შედეგები ვერ მოიძებნა</p>
                    <p className="text-sm mt-1">შეცვალეთ ფილტრები</p>
                </div>
            ) : (
                <div className="mt-6 space-y-8 animate-fade-up delay-100">
                    {/* Online users — highlighted section */}
                    {online.length > 0 && (
                        <section>
                            <div className="flex items-center gap-3 mb-3">
                                <span className="flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                                </span>
                                <h2 className="text-xs font-bold uppercase tracking-[2px]" style={{ color: "var(--muted-foreground)" }}>
                                    ახლა ონლაინ
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {online.map(user => <UserCard key={user.id} user={user} />)}
                            </div>
                        </section>
                    )}

                    {/* All / offline users */}
                    {offline.length > 0 && (
                        <section>
                            {online.length > 0 && (
                                <h2 className="text-xs font-bold uppercase tracking-[2px] mb-3" style={{ color: "var(--muted-foreground)" }}>
                                    სხვა პროფილები
                                </h2>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                {offline.map(user => <UserCard key={user.id} user={user} />)}
                            </div>
                        </section>
                    )}
                </div>
            )}
        </div>
    );
}
