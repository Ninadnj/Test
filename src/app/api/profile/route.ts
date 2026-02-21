import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";

export async function PUT(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { name, nickname, bio, city, age, gender } = body;

        const updatedUser = await prisma.user.update({
            where: { id: session.user.id },
            data: {
                name: name || undefined,
                nickname: nickname || null,
                bio: bio || null,
                city: city || null,
                age: age ? parseInt(age, 10) : null,
                gender: gender || null,
            }
        });

        return NextResponse.json(updatedUser);
    } catch (error: unknown) {
        console.error("PROFILE_UPDATE_ERROR", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
