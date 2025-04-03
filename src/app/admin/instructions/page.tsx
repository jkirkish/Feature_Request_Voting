'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

export default function AdminInstructionsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/admin/check');
        if (!response.ok) {
          router.push('/features');
          return;
        }
      } catch (error) {
        console.error('Error:', error);
        setError('Failed to verify admin status');
      } finally {
        setLoading(false);
      }
    };

    checkAdmin();
  }, [router]);

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
            <h1 className="text-3xl font-bold text-gray-900">Admin Setup Instructions</h1>
            <div className="flex space-x-4">
              <Link href="/admin">
                <Button variant="outline" className="border-gray-300">
                  Back to Dashboard
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

          <div className="prose max-w-none">
            <h2>How to Set Up Admin Access</h2>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Important: Keep this information secure. Only share with trusted administrators.
                  </p>
                </div>
              </div>
            </div>

            <h3>Current Admin Setup</h3>
            <p>
              Currently, admin access is granted to users with email addresses ending in{' '}
              <code className="bg-gray-100 px-2 py-1 rounded">@yourcompany.com</code>
            </p>

            <h3>To Change Admin Access Requirements</h3>
            <ol className="list-decimal pl-6 space-y-4">
              <li>
                <p className="font-semibold">Locate the Admin Check Files:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <code className="bg-gray-100 px-2 py-1 rounded">
                      src/app/api/admin/check/route.ts
                    </code>
                  </li>
                  <li>
                    <code className="bg-gray-100 px-2 py-1 rounded">src/app/admin/page.tsx</code>
                  </li>
                  <li>
                    All files in{' '}
                    <code className="bg-gray-100 px-2 py-1 rounded">src/app/api/admin/*</code>
                  </li>
                </ul>
              </li>
              <li>
                <p className="font-semibold">Modify the Admin Check Logic:</p>
                <p>
                  Find the <code className="bg-gray-100 px-2 py-1 rounded">checkAdmin</code>{' '}
                  function and update the condition:
                </p>
                <pre className="bg-gray-800 text-white p-4 rounded-md">
                  {`async function checkAdmin(user: SessionUser | undefined) {
  if (!user?.id) {
    throw new Error('Unauthorized');
  }

  // Modify this condition to match your requirements
  const isAdmin = user.email?.endsWith('@yourcompany.com') || false;
  if (!isAdmin) {
    throw new Error('Not an admin');
  }
}`}
                </pre>
              </li>
              <li>
                <p className="font-semibold">Alternative Admin Check Methods:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Check against a list of admin emails</li>
                  <li>Add an isAdmin field to your User model in the database</li>
                  <li>Use environment variables to configure admin emails</li>
                  <li>Implement role-based access control (RBAC)</li>
                </ul>
              </li>
              <li>
                <p className="font-semibold">Security Best Practices:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Always verify admin status on both client and server side</li>
                  <li>Use secure session management</li>
                  <li>Implement rate limiting for admin endpoints</li>
                  <li>Log all admin actions for audit purposes</li>
                  <li>Regularly review and rotate admin access</li>
                </ul>
              </li>
            </ol>

            <h3>Example: Using Environment Variables</h3>
            <pre className="bg-gray-800 text-white p-4 rounded-md">
              {`// In your .env file:
ADMIN_EMAILS=admin1@company.com,admin2@company.com

// In your checkAdmin function:
const adminEmails = process.env.ADMIN_EMAILS?.split(',') || [];
const isAdmin = adminEmails.includes(user.email || '');`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
