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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Add isAdmin flag to each user
    const usersWithAdminFlag = users.map(user => ({
      ...user,
      isAdmin: user.email?.endsWith('@yourcompany.com') || false,
    }));

    return NextResponse.json(usersWithAdminFlag);
  } catch (error) {
    console.error('Error fetching users:', error);
    const status = error.message === 'Unauthorized' ? 401 : 
                  error.message === 'Not an admin' ? 403 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to fetch users' },
      { status }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    await checkAdmin(session?.user as SessionUser);

    // Don't delete admin users
    await prisma.user.deleteMany({
      where: {
        NOT: {
          email: {
            endsWith: '@yourcompany.com',
          },
        },
      },
    });

    return NextResponse.json({ message: 'All non-admin users deleted successfully' });
  } catch (error) {
    console.error('Error deleting users:', error);
    const status = error.message === 'Unauthorized' ? 401 : 
                  error.message === 'Not an admin' ? 403 : 500;
    return NextResponse.json(
      { error: error.message || 'Failed to delete users' },
      { status }
    );
  }
} 