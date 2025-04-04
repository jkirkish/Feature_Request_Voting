'use client';

import { useState } from 'react';
import { FeatureStatus } from '@prisma/client';

interface FeatureFiltersProps {
  filters: {
    status: FeatureStatus | 'ALL';
    sortBy: 'votes' | 'newest' | 'oldest';
  };
  onFilterChange: (filters: {
    status: FeatureStatus | 'ALL';
    sortBy: 'votes' | 'newest' | 'oldest';
  }) => void;
}

export function FeatureFilters({ filters, onFilterChange }: FeatureFiltersProps) {
  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as FeatureStatus | 'ALL';
    onFilterChange({ ...filters, status: newStatus });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSortBy = e.target.value as 'votes' | 'newest' | 'oldest';
    onFilterChange({ ...filters, sortBy: newSortBy });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <div className="flex-1">
        <label htmlFor="status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="status"
          value={filters.status}
          onChange={handleStatusChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="ALL">All Statuses</option>
          <option value="OPEN">Open</option>
          <option value="PLANNED">Planned</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>
      <div className="flex-1">
        <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
          Sort By
        </label>
        <select
          id="sort"
          value={filters.sortBy}
          onChange={handleSortChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
        >
          <option value="votes">Most Votes</option>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
    </div>
  );
}
