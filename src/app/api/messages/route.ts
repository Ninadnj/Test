import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function GET(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const { searchParams } = new URL(req.url);
        const targetUserId = searchParams.get("userId");

        if (!targetUserId) return new NextResponse("Target User ID required", { status: 400 });

        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { senderId: session.user.id, receiverId: targetUserId },
                    { senderId: targetUserId, receiverId: session.user.id }
                ]
            },
            orderBy: { createdAt: "asc" }
        });

        // Mark as read
        await prisma.message.updateMany({
            where: { senderId: targetUserId, receiverId: session.user.id, isRead: false },
            data: { isRead: true }
        });

        return NextResponse.json(messages);
    } catch (error) {
        console.error("MESSAGES_GET_ERROR", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const { receiverId, text, imageUrl } = await req.json();

        if (!receiverId) return new NextResponse("Target User ID required", { status: 400 });

        const message = await prisma.message.create({
            data: {
                senderId: session.user.id,
                receiverId,
                text,
                imageUrl,
            }
        });

        return NextResponse.json(message);
    } catch (error) {
        console.error("MESSAGE_POST_ERROR", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
