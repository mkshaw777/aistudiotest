import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import BrandHeader from '../components/BrandHeader';
import BrandFooter from '../components/BrandFooter';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Terminal, Info } from 'lucide-react';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    const result = await login(email, password);
    if (!result.success) {
      setError(result.error || 'Login failed.');
      setIsLoading(false);
    }
    // On success, the AuthContext and App component will handle rendering the dashboard
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <BrandHeader />
      <main className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>Enter your email below to login to your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@mkmarketing.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                {error && (
                   <Alert variant="destructive">
                     <Terminal className="h-4 w-4" />
                     <AlertTitle>Login Error</AlertTitle>
                     <AlertDescription>{error}</AlertDescription>
                   </Alert>
                )}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? 'Logging in...' : 'Login'}
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
             <div className="text-xs text-slate-500 bg-slate-100 p-3 rounded-md w-full flex gap-2 items-start">
                <Info className="h-4 w-4 mt-0.5 shrink-0 text-mk-blue-primary" />
                <div>
                    <p className="font-semibold">Default Admin Credentials:</p>
                    <p>Email: admin@mkmarketing.com</p>
                    <p>Password: admin123</p>
                </div>
             </div>
          </CardFooter>
        </Card>
      </main>
      <BrandFooter />
    </div>
  );
};

export default Auth;