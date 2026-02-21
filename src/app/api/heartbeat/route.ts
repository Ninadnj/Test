import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { NextResponse } from "next/server";

// Called every 30s by the client heartbeat component
// Sets isOnline=true and updates lastSeen timestamp for the logged-in user
export async function POST() {
    const session = await auth();
    if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

    await prisma.user.update({
        where: { id: session.user.id },
        data: { isOnline: true, lastSeen: new Date() }
    });

    return NextResponse.json({ ok: true });
}
