import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, Mail } from 'lucide-react';
import { User } from '@/api/entities';

export default function LandingPage() {
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    try {
      // Redirect to Google OAuth
      await User.login();
    } catch (error) {
      console.error('Sign in failed:', error);
      setIsSigningIn(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-md mx-auto shadow-2xl border-0">
        <CardContent className="p-8 text-center space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Video className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Welcome to AwareCam</h1>
            <p className="text-slate-600 text-sm">AI-Powered Video Intelligence Platform</p>
          </div>

          {/* Sign In Button */}
          <div className="space-y-4">
            <Button 
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium flex items-center justify-center gap-2 transition-all duration-200"
            >
              {isSigningIn ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Signing you in...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  Sign In to Get Started
                </>
              )}
            </Button>

            {/* Terms */}
            <p className="text-xs text-slate-500 leading-relaxed">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}