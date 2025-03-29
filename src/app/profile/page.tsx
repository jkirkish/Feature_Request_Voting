import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { User, FeatureRequest, Vote } from '@prisma/client';

class ProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProfileError';
  }
}

type UserWithRelations = User & {
  featureRequests: (FeatureRequest & {
    votes: Vote[];
  })[];
  votes: (Vote & {
    featureRequest: FeatureRequest & {
      user: {
        name: string | null;
      };
    };
  })[];
};

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

async function getUserData(userId: string): Promise<UserWithRelations> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        featureRequests: {
          include: {
            votes: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        votes: {
          include: {
            featureRequest: {
              include: {
                user: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!user) {
      throw new ProfileError('User not found');
    }

    return user as UserWithRelations;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw new ProfileError('Failed to load user data');
  }
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);
  const user = session?.user as SessionUser;

  if (!user?.id) {
    redirect('/login');
  }

  try {
    const userData = await getUserData(user.id);

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-xl font-semibold text-primary-600">
                {userData.name?.[0]?.toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{userData.name || 'Anonymous'}</h1>
              <p className="text-gray-500">{userData.email}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Feature Requests</h2>
            <div className="space-y-4">
              {userData.featureRequests.map(feature => (
                <div key={feature.id} className="bg-white shadow rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">{feature.description}</p>
                  <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                    <span>{feature.votes.length} votes</span>
                    <span>{feature.status}</span>
                  </div>
                </div>
              ))}
              {userData.featureRequests.length === 0 && (
                <p className="text-gray-500">No feature requests yet</p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Votes</h2>
            <div className="space-y-4">
              {userData.votes.map(vote => (
                <div key={vote.id} className="bg-white shadow rounded-lg p-4">
                  <h3 className="font-medium text-gray-900">{vote.featureRequest.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    by {vote.featureRequest.user.name || 'Anonymous'}
                  </p>
                  <div className="mt-2 text-sm text-gray-500">{vote.featureRequest.status}</div>
                </div>
              ))}
              {userData.votes.length === 0 && <p className="text-gray-500">No votes yet</p>}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error instanceof ProfileError ? error.message : 'Failed to load profile'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
