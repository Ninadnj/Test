import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET() {
    try {
        const session = await auth();
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const myId = session.user.id;

        const [unreadMessages, newLikes, newMatches, newViews] = await Promise.all([
            prisma.message.count({ where: { receiverId: myId, isRead: false } }),
            prisma.like.count({ where: { receiverId: myId, isSeen: false } }),
            prisma.match.count({
                where: {
                    OR: [
                        { user1Id: myId, isSeen: false },
                        { user2Id: myId, isSeen: false }
                    ]
                }
            }),
            prisma.profileView.count({ where: { viewedId: myId, isSeen: false } })
        ]);

        return NextResponse.json({
            messages: unreadMessages,
            likes: newLikes,
            matches: newMatches,
            views: newViews,
            total: unreadMessages + newLikes + newMatches + newViews
        });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });
        const { type } = await req.json();
        const myId = session.user.id;

        if (type === "LIKE") await prisma.like.updateMany({ where: { receiverId: myId, isSeen: false }, data: { isSeen: true } });
        if (type === "MATCH") await prisma.match.updateMany({
            where: { OR: [{ user1Id: myId }, { user2Id: myId }], isSeen: false },
            data: { isSeen: true }
        });
        if (type === "VIEW") await prisma.profileView.updateMany({ where: { viewedId: myId, isSeen: false }, data: { isSeen: true } });

        return NextResponse.json({ status: "OK" });
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (_error) {
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
