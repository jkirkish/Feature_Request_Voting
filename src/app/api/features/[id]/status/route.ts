import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FeatureStatus } from '@prisma/client';

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you can modify this based on your requirements)
    const isAdmin = user.email?.endsWith('@yourcompany.com') || false;
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Only administrators can update feature status' },
        { status: 403 }
      );
    }

    const { status } = await request.json();

    // Validate status
    if (!Object.values(FeatureStatus).includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status value' },
        { status: 400 }
      );
    }

    const feature = await prisma.featureRequest.update({
      where: { id: params.id },
      data: { status },
      include: {
        user: {
          select: {
            name: true,
          },
        },
        votes: true,
      },
    });

    return NextResponse.json(feature);
  } catch (error) {
    console.error('Error updating feature status:', error);
    return NextResponse.json(
      { error: 'Failed to update feature status' },
      { status: 500 }
    );
  }
} 