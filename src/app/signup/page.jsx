'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Auth } from 'aws-amplify';
import { useRouter } from 'next/navigation';

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const router = useRouter();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await Auth.signUp({
        username: email,
        password,
        attributes: { email },
      });
      setShowConfirmation(true); // Show the confirmation code input
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await Auth.confirmSignUp(email, confirmationCode);
      // After confirmation, automatically sign the user in
      await Auth.signIn(email, password);
      router.push('/'); // Redirect to dashboard
    } catch (err) {
      setError(err.message || 'Invalid code or error confirming sign up.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <Image src="/lg-logo.png" alt="Loadguard Logo" width={48} height={48} className="mx-auto" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Create your account</h1>
        </div>
        
        {!showConfirmation ? (
          <form onSubmit={handleSignUp} className="space-y-6">
            {/* Email and Password inputs are the same as the login form */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
              <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
              <button type="submit" disabled={isLoading} className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleConfirmSignUp} className="space-y-6">
            <p className="text-sm text-center">A confirmation code has been sent to {email}.</p>
            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700">Confirmation Code</label>
              <input id="code" type="text" required value={confirmationCode} onChange={(e) => setConfirmationCode(e.target.value)} className="w-full px-3 py-2 mt-1 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500" />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div>
              <button type="submit" disabled={isLoading} className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300">
                {isLoading ? 'Confirming...' : 'Confirm and Sign In'}
              </button>
            </div>
          </form>
        )}
        <p className="text-sm text-center text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
