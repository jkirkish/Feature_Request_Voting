'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppDispatch } from '@/lib/hooks';
import { setUser, setError, setLoading } from '@/lib/features/userSlice';
import type { User } from '@/lib/features/userSlice';

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [error, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setLocalError(null);
    dispatch(setLoading(true));

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        const errorMessage = 'Invalid email or password';
        setLocalError(errorMessage);
        dispatch(setError(errorMessage));
      } else {
        // Get the user data from the session
        const response = await fetch('/api/auth/session');
        const session = await response.json();

        if (session?.user) {
          // Update Redux state with user data
          const userData = session.user as User;
          dispatch(setUser(userData));
          router.push('/features');
          router.refresh();
        } else {
          const errorMessage = 'Failed to get user data';
          setLocalError(errorMessage);
          dispatch(setError(errorMessage));
        }
      }
    } catch (error) {
      const errorMessage = 'An error occurred. Please try again.';
      setLocalError(errorMessage);
      dispatch(setError(errorMessage));
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      dispatch(setLoading(true));
      const result = await signIn('google', {
        redirect: false,
      });

      if (result?.error) {
        const errorMessage = 'Failed to sign in with Google';
        setLocalError(errorMessage);
        dispatch(setError(errorMessage));
      } else {
        // Get the user data from the session
        const response = await fetch('/api/auth/session');
        const session = await response.json();

        if (session?.user) {
          const userData = session.user as User;
          dispatch(setUser(userData));
          router.push('/features');
          router.refresh();
        }
      }
    } catch (error) {
      const errorMessage = 'An error occurred during Google sign in';
      setLocalError(errorMessage);
      dispatch(setError(errorMessage));
    } finally {
      setIsLoading(false);
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"
                />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>

        <div className="text-center">
          <Link href="/register" className="font-medium text-primary-600 hover:text-primary-500">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
