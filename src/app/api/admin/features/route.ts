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

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    await checkAdmin(session?.user as SessionUser);

    const features = await prisma.featureRequest.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        votes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(features);
  } catch (error) {
    console.error('Error fetching features:', error);
    const status = error.message === 'Unauthorized' ? 401 : 
                  error.message === 'Not an admin' ? 403 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to fetch features' },
      { status }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    await checkAdmin(session?.user as SessionUser);

    // Delete all votes first
    await prisma.vote.deleteMany();
    
    // Then delete all features
    await prisma.featureRequest.deleteMany();

    return NextResponse.json({ message: 'All features deleted successfully' });
  } catch (error) {
    console.error('Error deleting features:', error);
    const status = error.message === 'Unauthorized' ? 401 : 
                  error.message === 'Not an admin' ? 403 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to delete features' },
      { status }
    );
  }
} 