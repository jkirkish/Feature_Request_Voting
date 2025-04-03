import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;

    if (!user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin (you can modify this based on your requirements)
    const isAdmin = user.email?.endsWith('@yourcompany.com') || false;
    if (!isAdmin) {
      return NextResponse.json({ error: 'Not an admin' }, { status: 403 });
    }

    return NextResponse.json({ isAdmin: true });
  } catch (error) {
    console.error('Error checking admin status:', error);
    return NextResponse.json(
      { error: 'Failed to check admin status' },
      { status: 500 }
    );
  }
} 