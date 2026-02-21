import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

        const { action, targetId } = await req.json();
        const myId = session.user.id;

        if (action === "LIKE") {
            // Create Like
            const existingLike = await prisma.like.findUnique({
                where: { senderId_receiverId: { senderId: myId, receiverId: targetId } }
            });

            if (!existingLike) {
                await prisma.like.create({
                    data: { senderId: myId, receiverId: targetId }
                });

                // Check for Mutual Match
                const oppositeLike = await prisma.like.findUnique({
                    where: { senderId_receiverId: { senderId: targetId, receiverId: myId } }
                });

                if (oppositeLike) {
                    // It's a match! Create Match record
                    await prisma.match.create({
                        data: {
                            user1Id: myId < targetId ? myId : targetId,
                            user2Id: myId < targetId ? targetId : myId
                        }
                    });
                    return NextResponse.json({ status: "MATCHED" });
                }
            }
            return NextResponse.json({ status: "LIKED" });
        }

        if (action === "FAVORITE") {
            const existingHeart = await prisma.favorite.findUnique({
                where: { userId_favoriteId: { userId: myId, favoriteId: targetId } }
            });

            if (existingHeart) {
                await prisma.favorite.delete({ where: { id: existingHeart.id } });
                return NextResponse.json({ status: "UNFAVORITED" });
            } else {
                await prisma.favorite.create({ data: { userId: myId, favoriteId: targetId } });
                return NextResponse.json({ status: "FAVORITED" });
            }
        }

        return new NextResponse("Invalid action", { status: 400 });
    } catch (error) {
        console.error("INTERACTION_ERROR", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
