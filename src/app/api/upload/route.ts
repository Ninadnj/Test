import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export async function POST(req: Request) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const formData = await req.formData();
        const file = formData.get("file") as File;
        const isAvatarStr = formData.get("isAvatar") as string;
        const isAvatar = isAvatarStr === "true";

        if (!file) {
            return new NextResponse("No file received", { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        // Create random filename
        const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`;

        // Ensure uploads directory exists
        const uploadsDir = join(process.cwd(), "public/uploads");
        await mkdir(uploadsDir, { recursive: true }).catch(() => { });

        // Write file
        const path = join(uploadsDir, filename);
        await writeFile(path, buffer);

        const publicUrl = `/uploads/${filename}`;

        // Update Database
        if (isAvatar) {
            await prisma.user.update({
                where: { id: session.user.id },
                data: { avatar: publicUrl }
            });
        }

        // Add into Photo Gallery
        const photo = await prisma.photo.create({
            data: {
                userId: session.user.id,
                url: publicUrl,
                isAvatar: isAvatar
            }
        });

        return NextResponse.json({ url: publicUrl, photo });
    } catch (error) {
        console.error("UPLOAD_ERROR", error);
        return new NextResponse("Error uploading file", { status: 500 });
    }
}
