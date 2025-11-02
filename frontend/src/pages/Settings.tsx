import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { X, ExternalLink, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [telegramChatId, setTelegramChatId] = useState('');
  const [telegramLink, setTelegramLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const profile = await apiClient.getProfile();
      setSkills(profile.skills || []);
      setTelegramChatId(profile.telegram_chat_id || '');
    } catch (error) {
      console.error('Failed to load profile', error);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleSaveSkills = async () => {
    setLoading(true);
    try {
      await apiClient.updateSkills(skills);
      toast.success('Skills updated successfully');
    } catch (error) {
      toast.error('Failed to update skills');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTelegramChatId = async () => {
    setLoading(true);
    try {
      await apiClient.updateTelegramChatId(telegramChatId);
      toast.success('Telegram Chat ID updated successfully');
    } catch (error) {
      toast.error('Failed to update Telegram Chat ID');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTelegramLink = async () => {
    setLinkLoading(true);
    try {
      const response = await apiClient.getTelegramLink();
      setTelegramLink(response.link);
      toast.success('Telegram link generated! Click to connect.');
    } catch (error) {
      toast.error('Failed to generate Telegram link');
    } finally {
      setLinkLoading(false);
    }
  };

  const handleDeleteTelegramChatId = async () => {
    if (!confirm('Are you sure you want to disconnect Telegram? You will no longer receive notifications.')) {
      return;
    }
    
    setLoading(true);
    try {
      await apiClient.updateTelegramChatId('');
      setTelegramChatId('');
      toast.success('Telegram disconnected successfully');
    } catch (error) {
      toast.error('Failed to disconnect Telegram');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your profile and preferences</p>
          </div>

          <div className="bg-card border border-border rounded-xl p-6 card-glow space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Skills</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Add your skills to help match job opportunities
              </p>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a skill (e.g., React, Python)"
                    value={newSkill}
                    onChange={(e) => setNewSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                  />
                  <Button onClick={addSkill}>Add</Button>
                </div>

                {skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-sm py-1 px-3">
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                <Button onClick={handleSaveSkills} disabled={loading} className="w-full">
                  {loading ? 'Saving...' : 'Save Skills'}
                </Button>
              </div>
            </div>
          </div>

                    <div className="bg-card border border-border rounded-xl p-6 card-glow">
            <h2 className="text-xl font-bold mb-4">Telegram Notifications</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Connect your Telegram account to receive instant job notifications.
            </p>
            
            <div className="space-y-4">
              {telegramChatId ? (
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <div className="flex-1">
                      <p className="font-medium text-green-500">Telegram Connected</p>
                      <p className="text-sm text-muted-foreground">Chat ID: {telegramChatId}</p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={handleGenerateTelegramLink}
                      disabled={linkLoading}
                    >
                      {linkLoading ? 'Generating...' : 'Reconnect'}
                    </Button>
                  </div>
                  
                  <div className="space-y-3 pt-2">
                    <Label htmlFor="telegramChatIdUpdate">Update Chat ID</Label>
                    <div className="flex gap-2">
                      <Input
                        id="telegramChatIdUpdate"
                        placeholder="Enter new Telegram Chat ID"
                        value={telegramChatId}
                        onChange={(e) => setTelegramChatId(e.target.value)}
                      />
                      <Button 
                        onClick={handleSaveTelegramChatId} 
                        disabled={loading}
                        variant="outline"
                      >
                        {loading ? 'Saving...' : 'Update'}
                      </Button>
                    </div>
                    <Button 
                      onClick={handleDeleteTelegramChatId} 
                      disabled={loading}
                      variant="destructive"
                      className="w-full"
                    >
                      {loading ? 'Disconnecting...' : 'Disconnect Telegram'}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm font-medium mb-2">📱 How to connect:</p>
                    <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                      <li>Click the "Connect Telegram" button below</li>
                      <li>You'll be redirected to our Telegram bot</li>
                      <li>Click "Start" or send any message</li>
                      <li>Your account will be automatically linked!</li>
                    </ol>
                  </div>

                  {telegramLink ? (
                    <Button 
                      className="w-full" 
                      onClick={() => window.open(telegramLink, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Open Telegram Bot
                    </Button>
                  ) : (
                    <Button 
                      className="w-full"
                      onClick={handleGenerateTelegramLink}
                      disabled={linkLoading}
                    >
                      {linkLoading ? 'Generating...' : 'Connect Telegram'}
                    </Button>
                  )}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Or enter manually
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="telegramChatId">Telegram Chat ID</Label>
                      <Input
                        id="telegramChatId"
                        placeholder="Enter your Telegram Chat ID"
                        value={telegramChatId}
                        onChange={(e) => setTelegramChatId(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        Get your Chat ID from <a href="https://t.me/userinfobot" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@userinfobot</a> on Telegram
                      </p>
                    </div>
                    <Button 
                      onClick={handleSaveTelegramChatId} 
                      disabled={loading || !telegramChatId.trim()}
                      variant="outline"
                      className="w-full"
                    >
                      {loading ? 'Saving...' : 'Save Chat ID'}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
