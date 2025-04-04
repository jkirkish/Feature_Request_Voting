import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { FeatureRequestCard } from '@/components/feature-request-card';
import { LoadingCard } from '@/components/ui/loading';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { FeatureStatus, FeatureRequest, Vote, Prisma } from '@prisma/client';

interface FeatureListProps {
  status?: FeatureStatus | 'ALL';
  sortBy?: 'votes' | 'newest' | 'oldest';
}

type FeatureWithVotes = FeatureRequest & {
  votes: Vote[];
  user: {
    name: string | null;
  } | null;
};

class FeatureListError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FeatureListError';
  }
}

async function getFeatureRequests(userId?: string, filters?: FeatureListProps) {
  try {
    const where =
      filters?.status && filters.status !== 'ALL' ? { status: filters.status } : undefined;

    const orderBy: Prisma.FeatureRequestOrderByWithRelationInput[] =
      filters?.sortBy === 'newest'
        ? [{ createdAt: 'desc' }]
        : filters?.sortBy === 'oldest'
        ? [{ createdAt: 'asc' }]
        : [{ votes: { _count: 'desc' } }];

    const requests = await prisma.featureRequest.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
          },
        },
        votes: {
          where: userId ? { userId } : undefined,
        },
      },
      orderBy,
    });

    return requests;
  } catch (error) {
    console.error('Error fetching feature requests:', error);
    throw new FeatureListError('Failed to load feature requests');
  }
}

function FeatureListContent() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <LoadingCard key={i} />
      ))}
    </div>
  );
}

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export default async function FeatureList({ status, sortBy }: FeatureListProps) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as SessionUser;
    const featureRequests = await getFeatureRequests(user?.id, { status, sortBy });

    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {featureRequests.map(feature => (
          <FeatureRequestCard
            key={feature.id}
            feature={feature}
            onVote={async () => {}}
            onRemoveVote={async () => {}}
            onUpdateStatus={async () => {}}
            currentUser={user || { id: '' }}
          />
        ))}
      </div>
    );
  } catch (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error instanceof Error ? error.message : 'Failed to load feature requests'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export function FeatureListWithSuspense({ status, sortBy }: FeatureListProps) {
  return (
    <Suspense fallback={<FeatureListContent />}>
      <FeatureList status={status} sortBy={sortBy} />
    </Suspense>
  );
}
