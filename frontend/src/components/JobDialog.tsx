import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Job, JobCreate } from '@/lib/api';

interface JobDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (job: JobCreate) => Promise<void>;
  job?: Job;
}

export function JobDialog({ open, onClose, onSave, job }: JobDialogProps) {
  const [formData, setFormData] = useState<JobCreate>({
    title: '',
    company: '',
    location: '',
    description: '',
    link: '',
    applied: false,
    skills_matched: [],
    source: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        company: job.company,
        location: job.location || '',
        description: job.description,
        link: job.link,
        applied: job.applied,
        skills_matched: job.skills_matched,
        source: job.source || '',
      });
    } else {
      setFormData({
        title: '',
        company: '',
        location: '',
        description: '',
        link: '',
        applied: false,
        skills_matched: [],
        source: '',
      });
    }
  }, [job, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving job:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{job ? 'Edit Job' : 'Add New Job'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Senior Frontend Developer"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company *</Label>
            <Input
              id="company"
              value={formData.company}
              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
              placeholder="Tech Corp Inc."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Remote / San Francisco, CA"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Job Link *</Label>
            <Input
              id="link"
              type="url"
              value={formData.link}
              onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              placeholder="https://company.com/careers/job-123"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter job description..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              placeholder="LinkedIn, Indeed, etc."
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <Label htmlFor="applied">Applied</Label>
            <Switch
              id="applied"
              checked={formData.applied}
              onCheckedChange={(checked) => setFormData({ ...formData, applied: checked })}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Saving...' : job ? 'Update Job' : 'Add Job'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
