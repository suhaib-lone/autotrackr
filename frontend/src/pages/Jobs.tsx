import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/Sidebar';
import { JobCard } from '@/components/JobCard';
import { JobDialog } from '@/components/JobDialog';
import { apiClient, Job, JobCreate } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, Briefcase } from 'lucide-react';
import { toast } from 'sonner';

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | undefined>();

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    const filtered = jobs.filter(job =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredJobs(filtered);
  }, [searchQuery, jobs]);

  const loadJobs = async () => {
    try {
      const data = await apiClient.getJobs();
      setJobs(data);
      setFilteredJobs(data);
    } catch (error) {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (jobData: JobCreate) => {
    try {
      if (editingJob) {
        await apiClient.updateJob(editingJob._id, jobData);
        toast.success('Job updated successfully');
      } else {
        await apiClient.createJob(jobData);
        toast.success('Job added successfully');
      }
      loadJobs();
      setEditingJob(undefined);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save job');
      throw error;
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    
    try {
      await apiClient.deleteJob(id);
      toast.success('Job deleted');
      loadJobs();
    } catch (error) {
      toast.error('Failed to delete job');
    }
  };

  const openEditDialog = (job: Job) => {
    setEditingJob(job);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingJob(undefined);
  };

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">Jobs</h1>
              <p className="text-muted-foreground">Manage your job applications</p>
            </div>
            <Button onClick={() => setDialogOpen(true)} size="lg">
              <Plus className="w-5 h-5 mr-2" />
              Add Job
            </Button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search jobs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-glow text-muted-foreground">Loading jobs...</div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="text-center py-12 bg-card border border-border rounded-xl">
              <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? 'Try a different search term' : 'Add your first job to get started'}
              </p>
              {!searchQuery && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Job
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredJobs.map((job) => (
                <JobCard
                  key={job._id}
                  job={job}
                  onEdit={openEditDialog}
                  onDelete={handleDeleteJob}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <JobDialog
        open={dialogOpen}
        onClose={closeDialog}
        onSave={handleSaveJob}
        job={editingJob}
      />
    </div>
  );
}
