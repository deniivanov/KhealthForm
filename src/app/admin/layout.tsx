import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import AdminNav from "@/components/admin/AdminNav";
import AdminMobileMenu from "@/components/admin/AdminMobileMenu";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
        redirect("/login?callbackUrl=/admin");
    }

    const signOutForm = (
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
    );

    return (
        <div className="modernist min-h-screen" style={{ background: 'var(--color-neutral-200)' }}>
            <div className="admin-nav">
                <Link href="/admin" className="admin-nav-brand flex items-center" aria-label="KHealth — начало">
                    <h3alth-logo mode="both" height="34" idle-every="6" />
                </Link>

                {/* Desktop nav */}
                <div className="hidden lg:contents">
                    <AdminNav />
                </div>
                <div className="ml-auto hidden lg:flex items-center gap-3 py-2">
                    <span className="text-muted" style={{ fontSize: 12 }}>{session.user.email}</span>
                    {signOutForm}
                </div>

                {/* Mobile: hamburger */}
                <div className="ml-auto lg:hidden py-2">
                    <AdminMobileMenu
                        footer={
                            <div className="flex items-center justify-between gap-3">
                                <span className="text-muted" style={{ fontSize: 13 }}>{session.user.email}</span>
                                {signOutForm}
                            </div>
                        }
                    />
                </div>
            </div>
            <div className="mx-auto max-w-[1200px] px-4 py-6 lg:px-6">
                {children}
            </div>
        </div>
    );
}
