import { Task } from '../lib/supabase';
import { Clock, User, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import TaskDetailsModal from './TaskDetailsModal';

interface TaskCardProps {
  task: Task;
  onUpdate: () => void;
}

export default function TaskCard({ task, onUpdate }: TaskCardProps) {
  const [showDetails, setShowDetails] = useState(false);

  const priorityConfig = {
    low: { color: 'text-slate-600', bg: 'bg-slate-100', icon: CheckCircle },
    medium: { color: 'text-blue-600', bg: 'bg-blue-100', icon: TrendingUp },
    high: { color: 'text-amber-600', bg: 'bg-amber-100', icon: AlertCircle },
    critical: { color: 'text-red-600', bg: 'bg-red-100', icon: AlertCircle }
  };

  const priority = priorityConfig[task.priority];
  const PriorityIcon = priority.icon;

  return (
    <>
      <div
        onClick={() => setShowDetails(true)}
        className="bg-white rounded-lg p-4 shadow-sm border border-slate-200 hover:shadow-md transition-all cursor-pointer"
      >
        <h5 className="font-semibold text-slate-900 mb-2 line-clamp-2">{task.title}</h5>

        {task.description && (
          <p className="text-sm text-slate-600 mb-3 line-clamp-2">{task.description}</p>
        )}

        <div className="flex items-center gap-2 mb-2">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${priority.bg} ${priority.color}`}>
            <PriorityIcon className="w-3 h-3" />
            {task.priority === 'low' ? 'Basse' : task.priority === 'medium' ? 'Moyenne' : task.priority === 'high' ? 'Haute' : 'Critique'}
          </span>
        </div>

        <div className="space-y-1.5">
          {task.assigned_to && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <User className="w-3.5 h-3.5" />
              <span>{task.assigned_to}</span>
            </div>
          )}

          {task.due_date && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Clock className="w-3.5 h-3.5" />
              <span>{new Date(task.due_date).toLocaleDateString('fr-FR')}</span>
            </div>
          )}

          {task.estimated_hours > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-600">
              <Clock className="w-3.5 h-3.5" />
              <span>{task.estimated_hours}h estimées</span>
            </div>
          )}
        </div>
      </div>

      {showDetails && (
        <TaskDetailsModal
          task={task}
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
