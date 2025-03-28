'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FeatureRequestModal } from '@/components/feature-request-modal';
import { FeatureFilters } from '@/components/feature-filters';
import { useRouter } from 'next/navigation';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { FeatureStatus, FeatureRequest, Vote } from '@prisma/client';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { FeatureRequestCard } from '@/components/feature-request-card';

type FeatureWithVotes = FeatureRequest & {
  votes: Vote[];
  creator: {
    name: string | null;
  };
};

type SessionUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

class FeatureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FeatureError';
  }
}

export default function FeaturesPage() {
  const { data: session } = useSession();
  const user = session?.user as SessionUser;
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [features, setFeatures] = useState<FeatureWithVotes[]>([]);
  const [filters, setFilters] = useState<{
    status: FeatureStatus | 'ALL';
    sortBy: 'votes' | 'newest' | 'oldest';
  }>({
    status: 'ALL',
    sortBy: 'votes',
  });

  useEffect(() => {
    fetchFeatures();
  }, [filters]);

  const fetchFeatures = async () => {
    try {
      const response = await fetch(
        `/api/features?status=${filters.status}&sortBy=${filters.sortBy}`
      );
      if (!response.ok) {
        throw new FeatureError('Failed to load feature requests');
      }
      const data = await response.json();
      setFeatures(data);
    } catch (error) {
      console.error('Error fetching features:', error);
      setError(error instanceof Error ? error.message : 'Failed to load feature requests');
    }
  };

  const handleCreateFeature = async (data: { title: string; description: string }) => {
    try {
      setError(null);
      const response = await fetch('/api/features', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new FeatureError(error.error || 'Failed to create feature request');
      }

      setIsModalOpen(false);
      fetchFeatures();
    } catch (error) {
      console.error('Error creating feature:', error);
      setError(error instanceof Error ? error.message : 'Failed to create feature request');
    }
  };

  const handleVote = async (id: string) => {
    try {
      const response = await fetch(`/api/features/${id}/vote`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new FeatureError('Failed to vote');
      }

      fetchFeatures();
    } catch (error) {
      console.error('Error voting:', error);
      setError(error instanceof Error ? error.message : 'Failed to vote');
    }
  };

  const handleRemoveVote = async (id: string) => {
    try {
      const response = await fetch(`/api/features/${id}/vote`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new FeatureError('Failed to remove vote');
      }

      fetchFeatures();
    } catch (error) {
      console.error('Error removing vote:', error);
      setError(error instanceof Error ? error.message : 'Failed to remove vote');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Feature Requests</h1>
        <div className="flex gap-4">
          <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
            Submit Feature Request
          </Button>
          <Button
            onClick={() => signOut({ callbackUrl: '/' })}
            variant="outline"
            className="border-red-500 text-red-500 hover:bg-red-50"
          >
            Logout
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <ExclamationTriangleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <FeatureFilters onFilterChange={setFilters} />

      {features.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No feature requests have been added yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map(feature => (
            <FeatureRequestCard
              key={feature.id}
              id={feature.id}
              title={feature.title}
              description={feature.description}
              status={feature.status}
              voteCount={feature.votes.length}
              createdAt={feature.createdAt.toISOString()}
              creator={feature.creator}
              hasVoted={feature.votes.some(vote => vote.userId === user?.id)}
              onVote={handleVote}
              onRemoveVote={handleRemoveVote}
            />
          ))}
        </div>
      )}

      <FeatureRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateFeature}
      />
    </div>
  );
}
