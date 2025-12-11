import { useState, useEffect } from 'react';
import { supabase, Sprint, Task } from '../lib/supabase';
import { Plus, Calendar, TrendingUp, Clock, CheckCircle2, PlayCircle } from 'lucide-react';
import CreateSprintModal from './CreateSprintModal';

interface SprintManagementProps {
  projectId: string;
}

export default function SprintManagement({ projectId }: SprintManagementProps) {
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchData();
  }, [projectId]);

  async function fetchData() {
    setLoading(true);

    const [sprintsResult, tasksResult] = await Promise.all([
      supabase
        .from('sprints')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false }),
      supabase
        .from('tasks')
        .select('*')
        .eq('project_id', projectId)
    ]);

    if (!sprintsResult.error && sprintsResult.data) {
      setSprints(sprintsResult.data);
    }

    if (!tasksResult.error && tasksResult.data) {
      setTasks(tasksResult.data);
    }

    setLoading(false);
  }

  function handleSprintCreated() {
    fetchData();
    setShowCreateModal(false);
  }

  function getSprintStats(sprintId: string) {
    const sprintTasks = tasks.filter(t => t.sprint_id === sprintId);
    const completedTasks = sprintTasks.filter(t => t.status === 'done').length;
    const totalTasks = sprintTasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return { completedTasks, totalTasks, progress };
  }

  const statusConfig = {
    planned: {
      label: 'Planifié',
      color: 'bg-slate-100 text-slate-700 border-slate-300',
      icon: Clock
    },
    active: {
      label: 'Actif',
      color: 'bg-green-100 text-green-700 border-green-300',
      icon: PlayCircle
    },
    completed: {
      label: 'Terminé',
      color: 'bg-blue-100 text-blue-700 border-blue-300',
      icon: CheckCircle2
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-slate-900">Gestion des Sprints / Delivery Streams</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouveau Sprint
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : sprints.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
          <TrendingUp className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 mb-4">Aucun sprint pour le moment</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-5 h-5" />
            Créer votre premier sprint
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sprints.map(sprint => {
            const stats = getSprintStats(sprint.id);
            const status = statusConfig[sprint.status];
            const StatusIcon = status.icon;
            const startDate = new Date(sprint.start_date);
            const endDate = new Date(sprint.end_date);
            const today = new Date();
            const isOverdue = endDate < today && sprint.status !== 'completed';

            return (
              <div
                key={sprint.id}
                className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-lg font-bold text-slate-900">{sprint.name}</h4>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${status.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {status.label}
                      </span>
                      {isOverdue && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 border border-red-300">
                          En retard
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-600">{sprint.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                    <Calendar className="w-5 h-5 text-slate-600" />
                    <div>
                      <p className="text-xs text-slate-600">Dates</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {startDate.toLocaleDateString('fr-FR')} - {endDate.toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-xs text-slate-600">Tâches terminées</p>
                      <p className="text-sm font-semibold text-slate-900">
                        {stats.completedTasks} / {stats.totalTasks}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-3">
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-xs text-slate-600">Progression</p>
                      <p className="text-sm font-semibold text-slate-900">{stats.progress}%</p>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateSprintModal
          projectId={projectId}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleSprintCreated}
        />
      )}
    </div>
  );
}
