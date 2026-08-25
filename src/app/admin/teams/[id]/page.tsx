import { notFound } from 'next/navigation';
import { isValidObjectId } from 'mongoose';
import connectDB from '@/lib/db';
import Team from '@/models/Team';
import TeamEditor, { type SerializedTeam } from '@/components/admin/TeamEditor';
import { toPlain } from '@/lib/serialize';

export const dynamic = 'force-dynamic';

export default async function EditTeamPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    if (!isValidObjectId(id)) notFound();

    await connectDB();
    const team = await Team.findById(id).lean();
    if (!team) notFound();

    return <TeamEditor initial={toPlain<SerializedTeam>(team)} />;
}
