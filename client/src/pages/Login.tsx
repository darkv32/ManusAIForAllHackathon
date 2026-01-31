/**
 * Login Page
 * Secure authentication for Matsu Matcha Dashboard
 * Default credentials: admin / admin
 */

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, Eye, EyeOff, Lock, Shield, User } from 'lucide-react';
import { useState } from 'react';
import { useLocation } from 'wouter';

interface LoginProps {
  onLogin: (username: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay for security
    await new Promise(resolve => setTimeout(resolve, 500));

    // Default admin credentials
    // In production, this should be validated server-side with hashed passwords
    if (username === 'admin' && password === 'admin') {
      // Store session
      sessionStorage.setItem('matsu_auth', JSON.stringify({
        username,
        loginTime: Date.now(),
        expiresAt: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
      }));
      onLogin(username);
      setLocation('/');
    } else {
      setError('Invalid username or password');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[oklch(0.97_0.01_85)] to-[oklch(0.94_0.02_145)] p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, oklch(0.35 0.12 145) 1px, transparent 1px),
                           radial-gradient(circle at 75% 75%, oklch(0.35 0.12 145) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <Card className="w-full max-w-md relative z-10 shadow-xl border-[oklch(0.88_0.02_145)]">
        <CardHeader className="text-center space-y-4 pb-2">
          {/* Logo */}
          <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-[oklch(0.35_0.12_145)] to-[oklch(0.45_0.10_145)] flex items-center justify-center shadow-lg">
            <Shield className="w-10 h-10 text-white" />
          </div>
          
          <div>
            <CardTitle className="text-2xl font-display text-[oklch(0.25_0.02_45)]">
              Matsu Matcha
            </CardTitle>
            <CardDescription className="text-[oklch(0.50_0.02_45)]">
              AI Inventory & Profitability Dashboard
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Security Notice */}
          <div className="bg-[oklch(0.35_0.12_145/0.08)] border border-[oklch(0.35_0.12_145/0.2)] rounded-lg p-3 flex items-start gap-3">
            <Lock className="w-5 h-5 text-[oklch(0.35_0.12_145)] mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-[oklch(0.35_0.12_145)]">Secure Access Required</p>
              <p className="text-[oklch(0.50_0.02_45)] text-xs mt-1">
                This dashboard contains confidential business data. Unauthorized access is prohibited.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[oklch(0.35_0.02_45)]">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.50_0.02_45)]" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 border-[oklch(0.88_0.02_145)] focus:border-[oklch(0.35_0.12_145)] focus:ring-[oklch(0.35_0.12_145)]"
                  required
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[oklch(0.35_0.02_45)]">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[oklch(0.50_0.02_45)]" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 border-[oklch(0.88_0.02_145)] focus:border-[oklch(0.35_0.12_145)] focus:ring-[oklch(0.35_0.12_145)]"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[oklch(0.50_0.02_45)] hover:text-[oklch(0.35_0.02_45)]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[oklch(0.35_0.12_145)] hover:bg-[oklch(0.30_0.12_145)] text-white font-medium py-2.5"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          {/* Session Info */}
          <div className="text-center text-xs text-[oklch(0.60_0.02_45)] border-t border-[oklch(0.92_0.01_85)] pt-4">
            <p>Sessions expire after 8 hours of inactivity</p>
            <p className="mt-1">For access issues, contact your administrator</p>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-4 text-center text-xs text-[oklch(0.50_0.02_45)]">
        <p>© 2026 Matsu Matcha. All rights reserved.</p>
      </div>
    </div>
  );
}
