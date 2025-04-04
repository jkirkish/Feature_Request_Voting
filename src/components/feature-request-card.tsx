'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { FeatureStatus, FeatureRequest, Vote } from '@prisma/client';

type FeatureWithVotes = FeatureRequest & {
  votes: Vote[];
  user: {
    name: string | null;
  } | null;
};

interface FeatureRequestCardProps {
  feature: FeatureWithVotes;
  onVote: (id: string) => Promise<void>;
  onRemoveVote: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, status: FeatureStatus) => Promise<void>;
  currentUser: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

const statusColors = {
  OPEN: 'bg-green-100 text-green-800',
  PLANNED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-gray-100 text-gray-800',
};

const statusOptions: { value: FeatureStatus; label: string }[] = [
  { value: 'OPEN', label: 'Open' },
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

export function FeatureRequestCard({
  feature,
  onVote,
  onRemoveVote,
  onUpdateStatus,
  currentUser,
}: FeatureRequestCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const isAdmin = currentUser?.email?.endsWith('@yourcompany.com') || false;
  const hasVoted = feature.votes.some(vote => vote.userId === currentUser?.id);

  const handleVote = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      if (hasVoted) {
        await onRemoveVote(feature.id);
      } else {
        await onVote(feature.id);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      await onUpdateStatus(feature.id, e.target.value as FeatureStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{feature.title}</h3>
        <span
          className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[feature.status]}`}
        >
          {feature.status.replace('_', ' ')}
        </span>
      </div>
      <p className="text-gray-600 mb-4">{feature.description}</p>
      <div className="flex items-center justify-between text-sm text-gray-500">
        <div>
          <span>By {feature.user?.name || 'Anonymous'}</span>
          <span className="mx-2">•</span>
          <span>{formatDistanceToNow(new Date(feature.createdAt), { addSuffix: true })}</span>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleVote}
            disabled={isUpdating}
            className={`flex items-center space-x-1 ${
              hasVoted ? 'text-blue-600' : 'text-gray-500'
            } hover:text-blue-700 disabled:opacity-50`}
          >
            <svg
              className="w-5 h-5"
              fill={hasVoted ? 'currentColor' : 'none'}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 15l7-7 7 7"
              />
            </svg>
            <span>{feature.votes.length}</span>
          </button>
          {isAdmin && (
            <select
              value={feature.status}
              onChange={handleStatusChange}
              disabled={isUpdating}
              className="text-sm border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
