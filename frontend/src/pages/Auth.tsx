import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Briefcase } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    telegramChatId: '',
  });

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.username, formData.password);
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        await signup(formData.username, formData.email, formData.password, formData.telegramChatId);
        toast.success('Account created! Please login.');
        setIsLogin(true);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <Briefcase className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold gradient-text mb-2">AutoTrackr</h1>
          <p className="text-muted-foreground">Track your job applications effortlessly</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 card-glow animate-slide-in">
          <div className="flex gap-2 mb-6">
            <Button
              variant={isLogin ? 'default' : 'outline'}
              onClick={() => setIsLogin(true)}
              className="flex-1"
            >
              Login
            </Button>
            <Button
              variant={!isLogin ? 'default' : 'outline'}
              onClick={() => setIsLogin(false)}
              className="flex-1"
            >
              Sign Up
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telegram">Telegram Chat ID (Optional)</Label>
                  <Input
                    id="telegram"
                    value={formData.telegramChatId}
                    onChange={(e) => setFormData({ ...formData, telegramChatId: e.target.value })}
                    placeholder="For notifications"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Create Account'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
