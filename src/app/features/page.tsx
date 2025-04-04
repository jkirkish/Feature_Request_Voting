'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FeatureRequestCard } from '@/components/feature-request-card';
import { FeatureFilters } from '@/components/feature-filters';
import { FeatureRequestModal } from '@/components/feature-request-modal';
import { FeatureStatus, FeatureRequest, Vote } from '@prisma/client';

type FeatureWithVotes = FeatureRequest & {
  votes: Vote[];
  user: {
    name: string | null;
  } | null;
};

type Filters = {
  status: FeatureStatus | 'ALL';
  sortBy: 'newest' | 'oldest' | 'votes';
};

export default function FeaturesPage() {
  const { data: session } = useSession();
  const [features, setFeatures] = useState<FeatureWithVotes[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    status: 'ALL',
    sortBy: 'newest',
  });

  const fetchFeatures = async () => {
    try {
      const response = await fetch('/api/features');
      if (!response.ok) {
        throw new Error('Failed to load feature requests');
      }
      const data = await response.json();
      setFeatures(data);
    } catch (err) {
      console.error('Error fetching features:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  const handleVote = async (id: string) => {
    if (!session) return;
    try {
      const response = await fetch(`/api/features/${id}/vote`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to vote');
      }
      await fetchFeatures();
    } catch (err) {
      console.error('Error voting:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleRemoveVote = async (id: string) => {
    if (!session) return;
    try {
      const response = await fetch(`/api/features/${id}/vote`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error('Failed to remove vote');
      }
      await fetchFeatures();
    } catch (err) {
      console.error('Error removing vote:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleUpdateStatus = async (id: string, status: FeatureStatus) => {
    if (!session) return;
    try {
      const response = await fetch(`/api/features/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      await fetchFeatures();
    } catch (err) {
      console.error('Error updating status:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleFilterChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handleCreateFeature = async (data: {
    title: string;
    description: string;
    justification: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    attachments?: File[];
  }) => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('justification', data.justification);
      formData.append('priority', data.priority);

      if (data.attachments) {
        data.attachments.forEach(file => {
          formData.append('attachments', file);
        });
      }

      const response = await fetch('/api/features', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create feature request');
      }

      await fetchFeatures();
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error creating feature:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const filteredAndSortedFeatures = features
    .filter(feature => filters.status === 'ALL' || feature.status === filters.status)
    .sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'votes':
          return b.votes.length - a.votes.length;
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-container">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Feature Requests</h1>
          {session && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              Submit Feature Request
            </button>
          )}
        </div>

        <FeatureFilters filters={filters} onFilterChange={handleFilterChange} />

        <div className="mt-8 space-y-6">
          {filteredAndSortedFeatures.map(feature => (
            <FeatureRequestCard
              key={feature.id}
              feature={feature}
              onVote={handleVote}
              onRemoveVote={handleRemoveVote}
              onUpdateStatus={handleUpdateStatus}
              currentUser={session?.user || { id: '' }}
            />
          ))}
        </div>

        <FeatureRequestModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateFeature}
        />
      </div>
    </div>
  );
}
