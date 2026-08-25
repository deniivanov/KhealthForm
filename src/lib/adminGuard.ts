import { auth } from '@/auth';

/**
 * Server-side guard for admin server actions and route handlers.
 * Throws when the caller has no admin session.
 */
export async function requireAdmin() {
    const session = await auth();
    if (!session?.user || session.user.role !== 'admin') {
        throw new Error('Unauthorized');
    }
    return session;
}
