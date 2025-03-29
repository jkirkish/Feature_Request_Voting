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

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    const feature = await prisma.featureRequest.create({
      data: {
        title,
        description,
        status: 'OPEN',
        userId: user.id,
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(feature, { status: 201 });
  } catch (error) {
    console.error('Error creating feature:', error);
    return NextResponse.json(
      { error: 'Failed to create feature request' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const features = await prisma.featureRequest.findMany({
      include: {
        user: {
          select: {
            name: true,
          },
        },
        votes: true,
      },
      orderBy: {
        votes: {
          _count: 'desc',
        },
      },
    });

    return NextResponse.json(features);
  } catch (error) {
    console.error('Error fetching features:', error);
    return NextResponse.json(
      { error: 'Failed to fetch feature requests' },
      { status: 500 }
    );
  }
} 