import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { ProfileEditForm } from "@/components/profile-edit-form";
import { AvatarUploadTrigger } from "@/components/avatar-upload-dialog";
import { PhotoGallery } from "@/components/photo-gallery";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) return redirect("/auth");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      photos: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!dbUser) return redirect("/auth");

  return (
    <div className="max-w-3xl mx-auto p-6 pb-20 md:pb-6">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white">ჩემი პროფილი</h1>
        <ProfileEditForm user={dbUser} />
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 flex flex-col items-center sm:flex-row sm:items-start gap-6 shadow-xl relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full blur-3xl pointer-events-none" style={{ background: "rgba(244,63,94,0.06)" }} />

        <AvatarUploadTrigger currentAvatar={dbUser?.avatar || null} />

        <div className="flex-1 text-center sm:text-left space-y-2 z-10 w-full">
          <h2 className="text-2xl font-bold text-white flex flex-wrap items-center justify-center sm:justify-start gap-2">
            {dbUser?.name || "მომხმარებელი"}
            {dbUser?.vipStatus && <span className="bg-amber-500 text-amber-950 text-xs font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider mt-1 sm:mt-0">VIP</span>}
          </h2>
          {dbUser?.nickname && <p className="text-slate-400">@{dbUser.nickname}</p>}
          <p style={{ color: "var(--rose-accent)" }} className="font-medium text-sm">
            {dbUser?.email}
          </p>

          <div className="pt-4 flex flex-wrap gap-2 justify-center sm:justify-start">
            <span className="px-3 py-1 bg-slate-800/80 border border-slate-700/50 rounded-md text-xs text-slate-300">
              ასაკი: <strong className="text-white">{dbUser?.age || "—"}</strong>
            </span>
            <span className="px-3 py-1 bg-slate-800/80 border border-slate-700/50 rounded-md text-xs text-slate-300">
              ქალაქი: <strong className="text-white">{dbUser?.city || "—"}</strong>
            </span>
            <span className="px-3 py-1 bg-slate-800/80 border border-slate-700/50 rounded-md text-xs text-slate-300">
              სქესი: <strong className="text-white">{dbUser?.gender === 'male' ? 'კაცი' : dbUser?.gender === 'female' ? 'ქალი' : '—'}</strong>
            </span>
          </div>

          <div className="mt-6 p-4 bg-slate-950/50 rounded-md border border-slate-800/50 text-slate-300 text-sm italic w-full">
            {dbUser?.bio || "თქვენზე ინფორმაცია არ არის დამატებული."}
          </div>
        </div>
      </div>

      {dbUser && <PhotoGallery photos={dbUser.photos} />}
    </div>
  );
}
