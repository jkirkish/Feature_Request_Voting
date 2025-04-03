'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { FeatureStatus } from '@prisma/client';
import Link from 'next/link';

type User = {
  id: string;
  name: string | null;
  email: string | null;
  isAdmin: boolean;
};

type Feature = {
  id: string;
  title: string;
  description: string;
  status: FeatureStatus;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  } | null;
};

export default function AdminPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [features, setFeatures] = useState<Feature[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminAndFetchData = async () => {
      try {
        // Check if user is admin
        const response = await fetch('/api/admin/check');
        if (!response.ok) {
          router.push('/features');
          return;
        }

        // Fetch users and features
        await Promise.all([fetchUsers(), fetchFeatures()]);
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    checkAdminAndFetchData();
  }, [router]);

  const fetchUsers = async () => {
    const response = await fetch('/api/admin/users');
    if (response.ok) {
      const data = await response.json();
      setUsers(data);
    }
  };

  const fetchFeatures = async () => {
    const response = await fetch('/api/admin/features');
    if (response.ok) {
      const data = await response.json();
      setFeatures(data);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      await fetchUsers();
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to delete user');
    }
  };

  const handleDeleteAllUsers = async () => {
    if (!confirm('Are you sure you want to delete all users? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/users', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete all users');
      }

      await fetchUsers();
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to delete all users');
    }
  };

  const handleDeleteFeature = async (featureId: string) => {
    try {
      const response = await fetch(`/api/admin/features/${featureId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete feature');
      }

      await fetchFeatures();
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to delete feature');
    }
  };

  const handleDeleteAllFeatures = async () => {
    if (!confirm('Are you sure you want to delete all features? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/features', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete all features');
      }

      await fetchFeatures();
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to delete all features');
    }
  };

  const handleUpdateFeatureStatus = async (featureId: string, status: FeatureStatus) => {
    try {
      const response = await fetch(`/api/features/${featureId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update feature status');
      }

      await fetchFeatures();
    } catch (error) {
      console.error('Error:', error);
      setError('Failed to update feature status');
    }
  };

  if (loading) {
    return (
      <div className="bg-container min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="content-overlay p-8">
            <p className="text-center">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-container min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="content-overlay p-8 mb-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex space-x-4">
              <Link href="/admin/instructions">
                <Button variant="outline" className="border-gray-300">
                  Admin Setup Instructions
                </Button>
              </Link>
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

          {/* Users Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">Users</h2>
              <Button
                onClick={handleDeleteAllUsers}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                Delete All Users
              </Button>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {users.map(user => (
                  <li key={user.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.name || 'Anonymous'}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        {user.isAdmin && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Admin
                          </span>
                        )}
                      </div>
                      <Button
                        onClick={() => handleDeleteUser(user.id)}
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Features Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-semibold text-gray-900">Features</h2>
              <Button
                onClick={handleDeleteAllFeatures}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                Delete All Features
              </Button>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {features.map(feature => (
                  <li key={feature.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 mr-4">
                        <p className="text-sm font-medium text-gray-900">{feature.title}</p>
                        <p className="text-sm text-gray-500">{feature.description}</p>
                        <p className="text-xs text-gray-400">
                          Created by {feature.user?.name || 'Anonymous'} (
                          {feature.user?.email || 'no email'})
                        </p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <select
                          value={feature.status}
                          onChange={e =>
                            handleUpdateFeatureStatus(feature.id, e.target.value as FeatureStatus)
                          }
                          className="rounded-md border-gray-300 py-1 pl-2 pr-8 text-sm font-medium focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          {Object.values(FeatureStatus).map(status => (
                            <option key={status} value={status}>
                              {status.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                        <Button
                          onClick={() => handleDeleteFeature(feature.id)}
                          variant="destructive"
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
