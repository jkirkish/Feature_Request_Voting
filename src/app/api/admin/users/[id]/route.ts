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

    const userToDelete = await prisma.user.findUnique({
      where: { id: params.id },
      select: { email: true },
    });

    // Don't allow deleting admin users
    if (userToDelete?.email?.endsWith('@yourcompany.com')) {
      return NextResponse.json(
        { error: 'Cannot delete admin users' },
        { status: 403 }
      );
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete user';
    const status = errorMessage === 'Unauthorized' ? 401 : 
                  errorMessage === 'Not an admin' ? 403 : 500;
    return NextResponse.json(
      { error: errorMessage },
      { status }
    );
  }
} 