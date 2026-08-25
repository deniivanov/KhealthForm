import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
        redirect("/login?callbackUrl=/admin/summary");
    }

    return (
        <div>
            <div className="flex items-center justify-between px-6 py-3 bg-slate-800 text-white">
                <span className="text-sm font-medium">Админ панел — {session.user.email}</span>
                <form
                    action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/login" });
                    }}
                >
                    <button type="submit" className="text-sm font-bold bg-yellow-400 text-slate-800 px-4 py-1.5 rounded-lg hover:bg-yellow-500">
                        Изход
                    </button>
                </form>
            </div>
            {children}
        </div>
    );
}
