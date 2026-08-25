'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

/** Refreshes the server component data on an interval; shows last-update time. */
const AutoRefresh = ({ seconds = 30 }: { seconds?: number }) => {
    const router = useRouter();
    const [updatedAt, setUpdatedAt] = useState<string>('');

    useEffect(() => {
        const stamp = () =>
            setUpdatedAt(new Date().toLocaleTimeString('bg-BG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
        stamp();
        const timer = setInterval(() => {
            router.refresh();
            stamp();
        }, seconds * 1000);
        return () => clearInterval(timer);
    }, [router, seconds]);

    return (
        <span className="text-muted" style={{ fontSize: 14, whiteSpace: 'nowrap' }}>
            обновено {updatedAt} · на всеки {seconds} сек
        </span>
    );
};

export default AutoRefresh;
