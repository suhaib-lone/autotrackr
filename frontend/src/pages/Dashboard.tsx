import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { StatCard } from '@/components/StatCard';
import { apiClient, Job } from '@/lib/api';
import { Briefcase, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadJobs();
  }, []);

  const loadJobs = async () => {
    try {
      const data = await apiClient.getJobs();
      setJobs(data);
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.applied).length,
    pending: jobs.filter(j => !j.applied).length,
    thisWeek: jobs.filter(j => {
      const jobDate = new Date(j.date_added);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return jobDate >= weekAgo;
    }).length,
  };

  const chartData = jobs.reduce((acc: any[], job) => {
    const month = new Date(job.date_added).toLocaleDateString('en-US', { month: 'short' });
    const existing = acc.find(item => item.month === month);
    if (existing) {
      existing.jobs += 1;
    } else {
      acc.push({ month, jobs: 1 });
    }
    return acc;
  }, []);

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Track your job application progress</p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-glow text-muted-foreground">Loading...</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="Total Jobs"
                  value={stats.total}
                  icon={Briefcase}
                  trend={{ value: 12, isPositive: true }}
                />
                <StatCard
                  title="Applied"
                  value={stats.applied}
                  icon={CheckCircle}
                />
                <StatCard
                  title="Pending"
                  value={stats.pending}
                  icon={Clock}
                />
                <StatCard
                  title="This Week"
                  value={stats.thisWeek}
                  icon={TrendingUp}
                  trend={{ value: 8, isPositive: true }}
                />
              </div>

              <div className="bg-card border border-border rounded-xl p-6 card-glow">
                <h2 className="text-xl font-bold mb-6">Jobs Added Over Time</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                    <YAxis stroke="hsl(var(--muted-foreground))" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="jobs" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-card border border-border rounded-xl p-6 card-glow">
                <h2 className="text-xl font-bold mb-4">Recent Jobs</h2>
                <div className="space-y-3">
                  {jobs.slice(0, 5).map((job) => (
                    <div
                      key={job._id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                    >
                      <div>
                        <h3 className="font-semibold">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                      </div>
                      {job.applied && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
