
import React, { useState, useEffect, useCallback } from 'react';
import { User } from '@/api/entities'; // Assuming User.me() throws an error with status 401 for unauthenticated users
import { Organization } from '@/api/entities';
import { createPageUrl } from '@/utils';
import ConversationalOnboardingWizard from '@/components/onboarding/ConversationalOnboardingWizard';

// Dummy SignInModal Component
// In a real application, this would likely be in its own file and handle actual authentication logic (e.g., via an API service).
function SignInModal({ onClose, onSignInSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signInError, setSignInError] = useState(null);
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSignInError(null);
    setIsSigningIn(true);
    try {
      // Simulate an authentication API call.
      // In a real application, this would call your actual authentication service (e.g., Auth.signIn(email, password)).
      // For this example, we'll simulate a success after a delay and 'persist' a mock token.
      await new Promise((res, rej) => setTimeout(() => {
        if (email === 'test@example.com' && password === 'password') {
          // Simulate setting an authentication token/cookie that User.me() would then detect.
          // For demonstration, we'll use localStorage. This is not a secure way to store tokens in production.
          localStorage.setItem('mock_auth_token', 'valid_user_session_abc'); 
          res();
        } else {
          rej(new Error('Invalid email or password. Please try test@example.com / password.'));
        }
      }, 700));

      onSignInSuccess(); // Notify parent of successful sign-in
      onClose(); // Close the modal
    } catch (err) {
      setSignInError(err.message || 'Failed to sign in.');
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md relative">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Sign In</h2>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-light">&times;</button>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {signInError && (
            <p className="text-red-500 text-sm text-center">{signInError}</p>
          )}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
            disabled={isSigningIn}
          >
            {isSigningIn ? (
              <span className="w-5 h-5 border-2 border-white border-t-blue-300 rounded-full animate-spin"></span>
            ) : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function WelcomePage() {
  const [user, setUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSignInModal, setShowSignInModal] = useState(false);

  const loadInitialData = useCallback(async () => {
    setLoading(true);
    setError(null); // Clear any previous general errors
    try {
      // Get current user. User.me() is expected to return the user if authenticated,
      // or throw an error (e.g., with status 401) if unauthenticated.
      const currentUser = await User.me();
      setUser(currentUser);
      
      // If a user is successfully loaded, hide the sign-in modal
      setShowSignInModal(false); 

      // Get organization if user has one
      if (currentUser?.organization_id) {
        try {
          const orgs = await Organization.filter({ id: currentUser.organization_id });
          if (orgs.length > 0) {
            setOrganization(orgs[0]);
          }
        } catch (orgError) {
          console.warn('Failed to load organization:', orgError);
          // Don't set a critical error here; an organization might be created during onboarding.
        }
      }
      
    } catch (err) {
      console.error('Error loading initial data:', err);
      // Check if the error indicates an unauthenticated state (e.g., HTTP 401)
      if (err.status === 401 || err.message === 'Unauthenticated') { // Assuming err.status or err.message can signal an auth error
        setUser(null); // Explicitly ensure user state is null
        setShowSignInModal(true); // Trigger the sign-in modal
        // Do not set a general `error` message for unauthenticated status, as the modal handles this
      } else {
        // For other types of errors, set a general error message
        setError('Failed to load your account data. Please try refreshing the page.');
      }
    } finally {
      setLoading(false);
    }
  }, []); // Dependencies removed as per outline, as it no longer depends on propUser

  useEffect(() => {
    // Attempt to load initial user data when the component mounts
    loadInitialData();
  }, [loadInitialData]);

  const handleOnSignInSuccess = () => {
    // After a successful sign-in, re-attempt to load initial data to get the authenticated user
    loadInitialData();
  };

  const handleOnboardingComplete = async (processedData) => {
    try {
      let targetOrganization = organization;
      
      // Create organization if it doesn't exist
      if (!targetOrganization) {
        const organizationData = {
          name: `${user.full_name}'s Organization`,
          ...processedData.organizationData,
          onboarding_completed: true,
          onboarding_step: 9
        };
        
        targetOrganization = await Organization.create(organizationData);
        
        // Link user to organization and mark onboarding as complete
        await User.update(user.id, { 
          organization_id: targetOrganization.id,
          onboarding_completed: true
        });
        
      } else {
        // Update existing organization
        await Organization.update(targetOrganization.id, {
          ...processedData.organizationData,
          onboarding_completed: true,
          onboarding_step: 9
        });
        
        // Mark user onboarding as complete
        await User.update(user.id, { onboarding_completed: true });
      }

      // Create location if provided
      if (processedData.locationData) {
        try {
          // Dynamically import Location entity as it might not be frequently used
          const { Location } = await import('@/api/entities');
          await Location.create({
            ...processedData.locationData,
            organization_id: targetOrganization.id
          });
        } catch (locationError) {
          console.warn('Failed to create location:', locationError);
          // Do not block onboarding completion if location creation fails
        }
      }
      
      // Force a complete page reload to refresh auth state and navigate to Dashboard
      window.location.href = createPageUrl('Dashboard');
      
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      setError('Failed to complete setup. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-600">Loading your personalized setup...</p>
        </div>
      </div>
    );
  }

  if (error) { // This state is for general application errors, not unauthenticated status
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="max-w-md text-center">
          <div className="text-red-500 mb-4 text-6xl">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Setup Error</h2>
          <p className="text-slate-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  // If there's no user (meaning not authenticated) and loading is complete,
  // display the landing page with a prompt to sign in.
  if (!user && !loading && !error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
        <div className="text-center space-y-6">
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
            Welcome to Our Platform!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Get started by signing in to set up your account and begin your journey with us.
          </p>
          <button
            onClick={() => setShowSignInModal(true)}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition duration-300 ease-in-out text-xl font-semibold"
          >
            Sign In to Get Started
          </button>
        </div>

        {showSignInModal && (
          <SignInModal
            onClose={() => setShowSignInModal(false)}
            onSignInSuccess={handleOnSignInSuccess}
          />
        )}
      </div>
    );
  }

  // If a user is successfully loaded and authenticated, proceed to the onboarding wizard
  return (
    <ConversationalOnboardingWizard
      user={user}
      organization={organization}
      onComplete={handleOnboardingComplete}
    />
  );
}
