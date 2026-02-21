"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type ProfileUser = {
    name: string | null;
    nickname: string | null;
    bio: string | null;
    city: string | null;
    age: number | null;
    gender: string | null;
};

export function ProfileEditForm({ user }: { user: ProfileUser }) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        name: user?.name || "",
        nickname: user?.nickname || "",
        bio: user?.bio || "",
        city: user?.city || "",
        age: user?.age ? String(user.age) : "",
        gender: user?.gender || "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/profile", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...formData,
                    age: formData.age ? parseInt(formData.age, 10) : null
                })
            });

            if (!res.ok) throw new Error("შეცდომა შენახვისას");

            toast.success("პროფილი წარმატებით განახლდა");
            setOpen(false);
            router.refresh(); // Refresh server component data
        } catch (_error) {
            toast.error("ვერ მოხერხდა განახლება. სცადეთ მოგვიანებით.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
                    რედაქტირება
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-slate-900 text-slate-50 border-slate-800">
                <DialogHeader>
                    <DialogTitle>პროფილის რედაქტირება</DialogTitle>
                    <DialogDescription className="text-slate-400">
                        შეცვალეთ თქვენი მონაცემები საჯარო პროფილისთვის.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">სახელი</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} className="col-span-3 bg-slate-800 border-slate-700" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="nickname" className="text-right">ნიკი</Label>
                        <Input id="nickname" name="nickname" value={formData.nickname} onChange={handleChange} className="col-span-3 bg-slate-800 border-slate-700" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bio" className="text-right">ჩემზე</Label>
                        <Input id="bio" name="bio" value={formData.bio} onChange={handleChange} className="col-span-3 bg-slate-800 border-slate-700" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="city" className="text-right">ქალაქი</Label>
                        <Input id="city" name="city" value={formData.city} onChange={handleChange} className="col-span-3 bg-slate-800 border-slate-700" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="age" className="text-right">ასაკი</Label>
                        <Input id="age" name="age" type="number" value={formData.age} onChange={handleChange} className="col-span-3 bg-slate-800 border-slate-700" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="gender" className="text-right">სქესი</Label>
                        <select
                            id="gender"
                            name="gender"
                            value={formData.gender}
                            onChange={handleChange}
                            className="col-span-3 bg-slate-800 border-slate-700 text-sm rounded-md h-10 px-3 flex items-center"
                        >
                            <option value="">აირჩიეთ...</option>
                            <option value="male">მამრობითი</option>
                            <option value="female">მდედრობითი</option>
                        </select>
                    </div>
                    <DialogFooter>
                        <Button disabled={loading} type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                            {loading ? "ინახება..." : "შენახვა"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
