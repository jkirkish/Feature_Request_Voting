import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { writeFile } from 'fs/promises';
import { join } from 'path';

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

    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const justification = formData.get('justification') as string;
    const priority = formData.get('priority') as 'LOW' | 'MEDIUM' | 'HIGH';
    const attachments = formData.getAll('attachments') as File[];

    if (!title || !description || !justification || !priority) {
      return NextResponse.json(
        { error: 'Title, description, justification, and priority are required' },
        { status: 400 }
      );
    }

    // Handle file uploads
    const attachmentUrls: string[] = [];
    if (attachments.length > 0) {
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      await Promise.all(
        attachments.map(async (file) => {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = join(uploadDir, fileName);
          await writeFile(filePath, buffer);
          attachmentUrls.push(`/uploads/${fileName}`);
        })
      );
    }

    const feature = await prisma.featureRequest.create({
      data: {
        title,
        description,
        justification,
        priority,
        status: 'OPEN',
        userId: user.id,
        attachments: JSON.stringify(attachmentUrls),
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

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;
    
    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the URL parameters
    const { searchParams } = new URL(request.url);
    const sortBy = searchParams.get('sortBy') || 'votes';
    const status = searchParams.get('status');

    // Define the where clause for status filtering
    const where = status && status !== 'ALL' ? { status: status as any } : undefined;

    // Define the orderBy clause based on sortBy parameter
    let orderBy: Prisma.FeatureRequestOrderByWithRelationInput[] = [];
    
    switch (sortBy) {
      case 'newest':
        orderBy = [{ createdAt: 'desc' }];
        break;
      case 'oldest':
        orderBy = [{ createdAt: 'asc' }];
        break;
      case 'votes':
      default:
        orderBy = [{ votes: { _count: 'desc' } }, { createdAt: 'desc' }];
        break;
    }

    const features = await prisma.featureRequest.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
          },
        },
        votes: true,
      },
      orderBy,
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