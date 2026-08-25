import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";

export const dynamic = "force-dynamic";

const NAV_ITEMS = [
    { href: "/admin", label: "Табло" },
    { href: "/admin/products", label: "Продукти" },
    { href: "/admin/teams", label: "Отбори" },
    { href: "/admin/forms", label: "Форми" },
    { href: "/admin/orders", label: "Поръчки" },
];

const LEGACY_ITEMS = [
    { href: "/admin/legacy", label: "Стари поръчки" },
    { href: "/admin/summary", label: "Стара справка" },
];

export default async function AdminLayout({ children }: { children: ReactNode }) {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
        redirect("/login?callbackUrl=/admin");
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="flex items-center justify-between px-6 py-3 bg-slate-800 text-white">
                <div className="flex items-center gap-6 overflow-x-auto">
                    <span className="text-sm font-bold whitespace-nowrap">KHealth Admin</span>
                    <nav className="flex items-center gap-4">
                        {NAV_ITEMS.map(item => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-sm text-slate-200 hover:text-yellow-400 whitespace-nowrap"
                            >
                                {item.label}
                            </Link>
                        ))}
                        <span className="text-slate-600">|</span>
                        {LEGACY_ITEMS.map(item => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="text-xs text-slate-400 hover:text-yellow-400 whitespace-nowrap"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs text-slate-300 hidden sm:inline">{session.user.email}</span>
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
            </div>
            {children}
        </div>
    );
}
