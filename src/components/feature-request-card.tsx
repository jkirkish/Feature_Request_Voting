'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';
import { FeatureStatus } from '@prisma/client';

interface FeatureRequestCardProps {
  id: string;
  title: string;
  description: string;
  status: FeatureStatus;
  voteCount: number;
  createdAt: string;
  creator: {
    name: string | null;
  };
  hasVoted: boolean;
  onVote: (id: string) => Promise<void>;
  onRemoveVote: (id: string) => Promise<void>;
  onUpdateStatus: (id: string, status: FeatureStatus) => Promise<void>;
  isAdmin?: boolean;
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
  id,
  title,
  description,
  status,
  voteCount,
  createdAt,
  creator,
  hasVoted,
  onVote,
  onRemoveVote,
  onUpdateStatus,
  isAdmin = false,
}: FeatureRequestCardProps) {
  const { data: session } = useSession();
  const [isVoting, setIsVoting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleVote = async () => {
    if (!session) return;
    setIsVoting(true);
    try {
      if (hasVoted) {
        await onRemoveVote(id);
      } else {
        await onVote(id);
      }
    } finally {
      setIsVoting(false);
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as FeatureStatus;
    setIsUpdating(true);
    try {
      await onUpdateStatus(id, newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <p className="mt-1 text-sm text-gray-600">
            Posted by {creator.name || 'Anonymous'}{' '}
            {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </p>
        </div>
        {isAdmin ? (
          <select
            value={status}
            onChange={handleStatusChange}
            disabled={isUpdating}
            className={`rounded-md border-gray-300 py-1 pl-2 pr-8 text-sm font-medium focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 ${
              isUpdating ? 'opacity-50' : ''
            }`}
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status]}`}
          >
            {status.replace('_', ' ')}
          </span>
        )}
      </div>
      <p className="mt-2 text-gray-700">{description}</p>
      <div className="mt-4 flex items-center justify-between">
        <button
          onClick={handleVote}
          disabled={!session || isVoting}
          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md ${
            hasVoted
              ? 'bg-primary-100 text-primary-700 hover:bg-primary-200'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50`}
        >
          {isVoting ? 'Processing...' : hasVoted ? 'Remove Vote' : 'Vote'}
        </button>
        <span className="text-sm text-gray-600">
          {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
        </span>
      </div>
    </div>
  );
}
