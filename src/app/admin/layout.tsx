import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import AdminNav from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
        redirect("/login?callbackUrl=/admin");
    }

    return (
        <div className="modernist min-h-screen" style={{ background: 'var(--color-neutral-200)' }}>
            <div className="admin-nav">
                <Link href="/admin" className="admin-nav-brand flex items-center" aria-label="KHealth — начало">
                    <h3alth-logo mode="both" height="34" idle-every="6" />
                </Link>
                <AdminNav />
                <div className="ml-auto flex items-center gap-3 py-2">
                    <span className="text-muted hidden sm:inline" style={{ fontSize: 12 }}>{session.user.email}</span>
                    <form
                        action={async () => {
                            "use server";
                            await signOut({ redirectTo: "/login" });
                        }}
                    >
                        <button type="submit" className="btn btn-secondary" style={{ padding: '5px 12px', fontSize: 13 }}>
                            Изход
                        </button>
                    </form>
                </div>
            </div>
            <div className="mx-auto max-w-[1200px] px-4 py-6 lg:px-6">
                {children}
            </div>
        </div>
    );
}
