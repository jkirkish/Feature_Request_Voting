import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

async function checkAdmin(user: SessionUser | undefined) {
  if (!user?.id) {
    throw new Error('Unauthorized');
  }

  const isAdmin = user.email?.endsWith('@yourcompany.com') || false;
  if (!isAdmin) {
    throw new Error('Not an admin');
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    await checkAdmin(session?.user as SessionUser);

    // Delete all votes for this feature first
    await prisma.vote.deleteMany({
      where: { featureRequestId: params.id },
    });

    // Then delete the feature
    await prisma.featureRequest.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'Feature deleted successfully' });
  } catch (error) {
    console.error('Error deleting feature:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete feature';
    const status = errorMessage === 'Unauthorized' ? 401 : 
                  errorMessage === 'Not an admin' ? 403 : 500;
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
} 