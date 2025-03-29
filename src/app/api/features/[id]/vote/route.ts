import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const featureId = params.id;

    // Check if user has already voted
    const existingVote = await prisma.vote.findFirst({
      where: {
        userId: user.id,
        featureRequestId: featureId,
      },
    });

    if (existingVote) {
      return NextResponse.json(
        { error: 'Already voted on this feature' },
        { status: 400 }
      );
    }

    const vote = await prisma.vote.create({
      data: {
        userId: user.id,
        featureRequestId: featureId,
      },
    });

    return NextResponse.json(vote, { status: 201 });
  } catch (error) {
    console.error('Error adding vote:', error);
    return NextResponse.json(
      { error: 'Failed to add vote' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const featureId = params.id;

    // Delete the user's vote
    await prisma.vote.deleteMany({
      where: {
        userId: user.id,
        featureRequestId: featureId,
      },
    });

    return NextResponse.json({ message: 'Vote removed successfully' });
  } catch (error) {
    console.error('Error removing vote:', error);
    return NextResponse.json(
      { error: 'Failed to remove vote' },
      { status: 500 }
    );
  }
} 