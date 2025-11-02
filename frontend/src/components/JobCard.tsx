import { ExternalLink, MapPin, Calendar, Edit, Trash2, CheckCircle } from 'lucide-react';
import { Job } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (id: string) => void;
}

export function JobCard({ job, onEdit, onDelete }: JobCardProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-6 hover-lift animate-fade-in">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">{job.title}</h3>
          <p className="text-lg text-muted-foreground mb-3">{job.company}</p>
          
          <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
            {job.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{job.location}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{format(new Date(job.date_added), 'MMM dd, yyyy')}</span>
            </div>
          </div>
        </div>
        
        {job.applied && (
          <Badge className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Applied
          </Badge>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{job.description}</p>

      {job.skills_matched.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills_matched.map((skill) => (
            <Badge key={skill} variant="secondary" className="text-xs">
              {skill}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          asChild
          className="flex-1"
        >
          <a href={job.link} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            View Job
          </a>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(job)}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(job._id)}
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
