'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export const NAV_ITEMS = [
    { href: '/admin', label: 'Табло', exact: true },
    { href: '/admin/products', label: 'Продукти' },
    { href: '/admin/teams', label: 'Отбори' },
    { href: '/admin/forms', label: 'Форми' },
    { href: '/admin/orders', label: 'Поръчки' },
    { href: '/admin/users', label: 'Потребители' },
    { href: '/admin/settings', label: 'Настройки' },
    { href: '/production', label: '📺 Производство' },
];

const AdminNav = () => {
    const pathname = usePathname();
    return (
        <>
            {NAV_ITEMS.map(item => {
                const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
                return (
                    <Link key={item.href} href={item.href} className="admin-nav-link" data-active={active}>
                        {item.label}
                    </Link>
                );
            })}
        </>
    );
};

export default AdminNav;
