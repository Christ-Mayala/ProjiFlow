import { Project } from '../lib/supabase';
import { Calendar, MoreVertical, PlayCircle, PauseCircle, CheckCircle, FileText } from 'lucide-react';
import { useState } from 'react';
import ProjectDetails from './ProjectDetails';

interface ProjectCardProps {
  project: Project;
  onUpdate: () => void;
}

export default function ProjectCard({ project, onUpdate }: ProjectCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const statusConfig = {
    planning: {
      label: 'Planification',
      color: 'bg-slate-100 text-slate-700',
      icon: FileText
    },
    active: {
      label: 'Actif',
      color: 'bg-green-100 text-green-700',
      icon: PlayCircle
    },
    on_hold: {
      label: 'En Pause',
      color: 'bg-amber-100 text-amber-700',
      icon: PauseCircle
    },
    completed: {
      label: 'Terminé',
      color: 'bg-emerald-100 text-emerald-700',
      icon: CheckCircle
    }
  };

  const status = statusConfig[project.status];
  const StatusIcon = status.icon;

  return (
    <>
      <div
        className="bg-gradient-to-br from-white to-slate-50 rounded-xl p-6 border border-slate-200 hover:shadow-lg transition-all cursor-pointer hover:scale-[1.02]"
        onClick={() => setShowDetails(true)}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 mb-2">{project.name}</h3>
            <p className="text-sm text-slate-600 line-clamp-2">{project.description || 'Aucune description'}</p>
          </div>
          <button className="p-1 hover:bg-slate-200 rounded transition-colors">
            <MoreVertical className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <div className="flex items-center gap-2 mb-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${status.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {status.label}
          </span>
        </div>

        {(project.start_date || project.end_date) && (
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Calendar className="w-4 h-4" />
            <span>
              {project.start_date && new Date(project.start_date).toLocaleDateString('fr-FR')}
              {project.start_date && project.end_date && ' - '}
              {project.end_date && new Date(project.end_date).toLocaleDateString('fr-FR')}
            </span>
          </div>
        )}
      </div>

      {showDetails && (
        <ProjectDetails
          project={project}
          onClose={() => setShowDetails(false)}
          onUpdate={() => {
            onUpdate();
            setShowDetails(false);
          }}
        />
      )}
    </>
  );
}
