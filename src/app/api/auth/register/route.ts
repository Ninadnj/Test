import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
    try {
        const { email, password, name, nickname } = await req.json();

        if (!email || !password || !name) {
            return new NextResponse("Missing email, password, or name", { status: 400 });
        }

        const exists = await prisma.user.findUnique({ where: { email } });
        if (exists) {
            return new NextResponse("Email Already Exists", { status: 400 });
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await prisma.user.create({
            data: {
                email,
                name,
                nickname: nickname || undefined,
                passwordHash,
            }
        });

        return NextResponse.json({ id: user.id, email: user.email, name: user.name });
    } catch (_error) {
        console.error("REGISTRATION_ERROR", _error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
