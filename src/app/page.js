// This page uses form inputs, so it must be a client component.
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

// A simple icon for the back button
const ArrowLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Attempting to log in with:', { email, password });
    // This is where you would integrate with AWS Cognito
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 antialiased px-4 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl mx-auto text-center">
        
        {/* "Back to our site" button */}
        <Link href="https://www.loadguard.io" className="text-sm text-gray-500 hover:text-gray-700 hover:underline hover:italic font-semibold flex items-center justify-center mb-4 transition-colors">
          <ArrowLeftIcon />
          Back to our site
        </Link>

        <div className="relative mt-4 bg-white shadow-lg sm:rounded-lg text-left">
          <div className="h-2 bg-red-500 rounded-t-md"></div>
          <div className="py-8 px-8">
            
            <div className="flex items-center mb-6">
              <Image 
                src="/lg-logo.png" 
                alt="Loadguard Logo" 
                width={40} 
                height={40}
              />
              <div className="ml-4">
                <h1 className="text-2xl font-semibold">Member Login</h1>
                <p className="text-gray-500 text-sm">Access your dashboard</p>
              </div>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block font-semibold text-sm mb-2" htmlFor="email">
                  Email Address
                </label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  type="email" 
                  id="email"
                  placeholder="you@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>

              <div className="mb-6">
                <label className="block font-semibold text-sm mb-2" htmlFor="password">
                  Password
                </label>
                <input 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  type="password" 
                  id="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>

              <button 
                type="submit" 
                className="w-full bg-red-500 text-white font-bold py-2 px-4 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              >
                Login
              </button>
            </form>
            
            <div className="text-center mt-6">
              <a href="#" className="text-sm text-black-500 hover:underline">
                Forgot your password?
              </a>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
