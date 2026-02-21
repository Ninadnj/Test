import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import ChatThread from "@/components/chat-thread";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function DirectMessagePage({ params }: { params: { id: string } }) {
    const session = await auth();
    if (!session?.user?.id) return redirect("/auth");

    if (session.user.id === params.id) return redirect("/messages"); // Can't chat yourself

    const targetUser = await prisma.user.findUnique({
        where: { id: params.id },
        select: { id: true, name: true, avatar: true, isOnline: true }
    });

    if (!targetUser) {
        return (
            <div className="p-10 text-center">
                მომხმარებელი ვერ მოიძებნა
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col sm:p-4 pb-20 md:pb-6 relative">
            <div className="hidden sm:flex items-center mb-4">
                <Link href="/messages" className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                    <span className="font-medium text-sm">უკან დაბრუნება</span>
                </Link>
            </div>

            <div className="flex-1 h-full sm:h-auto">
                <ChatThread targetUserId={targetUser.id} targetUser={targetUser} />
            </div>
        </div>
    );
}
