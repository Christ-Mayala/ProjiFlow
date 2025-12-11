import { useState, useEffect } from 'react';
import { supabase, Task, Sprint } from '../lib/supabase';
import { BarChart3, TrendingUp, Clock, Users, AlertTriangle, CheckCircle, Target } from 'lucide-react';

interface ProjectReportsProps {
  projectId: string;
}

interface TaskStats {
  total: number;
  todo: number;
  inProgress: number;
  review: number;
  done: number;
  byPriority: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
}

interface TimeStats {
  totalEstimated: number;
  totalActual: number;
  variance: number;
  efficiency: number;
}

export default function ProjectReports({ projectId }: ProjectReportsProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [taskStats, setTaskStats] = useState<TaskStats>({
    total: 0,
    todo: 0,
    inProgress: 0,
    review: 0,
    done: 0,
    byPriority: { low: 0, medium: 0, high: 0, critical: 0 }
  });
  const [timeStats, setTimeStats] = useState<TimeStats>({
    totalEstimated: 0,
    totalActual: 0,
    variance: 0,
    efficiency: 0
  });

  useEffect(() => {
    fetchData();
  }, [projectId]);

  async function fetchData() {
    setLoading(true);

    const [tasksResult, sprintsResult] = await Promise.all([
      supabase.from('tasks').select('*').eq('project_id', projectId),
      supabase.from('sprints').select('*').eq('project_id', projectId)
    ]);

    if (!tasksResult.error && tasksResult.data) {
      setTasks(tasksResult.data);
      calculateStats(tasksResult.data);
    }

    if (!sprintsResult.error && sprintsResult.data) {
      setSprints(sprintsResult.data);
    }

    setLoading(false);
  }

  function calculateStats(taskList: Task[]) {
    const stats: TaskStats = {
      total: taskList.length,
      todo: taskList.filter(t => t.status === 'todo').length,
      inProgress: taskList.filter(t => t.status === 'in_progress').length,
      review: taskList.filter(t => t.status === 'review').length,
      done: taskList.filter(t => t.status === 'done').length,
      byPriority: {
        low: taskList.filter(t => t.priority === 'low').length,
        medium: taskList.filter(t => t.priority === 'medium').length,
        high: taskList.filter(t => t.priority === 'high').length,
        critical: taskList.filter(t => t.priority === 'critical').length
      }
    };

    const totalEstimated = taskList.reduce((sum, t) => sum + t.estimated_hours, 0);
    const totalActual = taskList.reduce((sum, t) => sum + t.actual_hours, 0);
    const variance = totalEstimated > 0 ? ((totalActual - totalEstimated) / totalEstimated) * 100 : 0;
    const efficiency = totalActual > 0 ? (totalEstimated / totalActual) * 100 : 100;

    setTaskStats(stats);
    setTimeStats({
      totalEstimated,
      totalActual,
      variance,
      efficiency
    });
  }

  const completionRate = taskStats.total > 0 ? Math.round((taskStats.done / taskStats.total) * 100) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-bold text-slate-900">Rapports et Statistiques</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between mb-3">
            <Target className="w-8 h-8 text-blue-600" />
            <span className="text-3xl font-bold text-blue-900">{taskStats.total}</span>
          </div>
          <p className="text-sm font-medium text-blue-900">Total Tâches</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="w-8 h-8 text-green-600" />
            <span className="text-3xl font-bold text-green-900">{taskStats.done}</span>
          </div>
          <p className="text-sm font-medium text-green-900">Tâches Terminées</p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-6 border border-amber-200">
          <div className="flex items-center justify-between mb-3">
            <TrendingUp className="w-8 h-8 text-amber-600" />
            <span className="text-3xl font-bold text-amber-900">{completionRate}%</span>
          </div>
          <p className="text-sm font-medium text-amber-900">Taux de Complétion</p>
        </div>

        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
          <div className="flex items-center justify-between mb-3">
            <Users className="w-8 h-8 text-slate-600" />
            <span className="text-3xl font-bold text-slate-900">{sprints.length}</span>
          </div>
          <p className="text-sm font-medium text-slate-900">Sprints Créés</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            Répartition par Statut
          </h4>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">À Faire</span>
                <span className="text-sm font-bold text-slate-900">{taskStats.todo}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-slate-500 h-2 rounded-full transition-all"
                  style={{ width: `${taskStats.total > 0 ? (taskStats.todo / taskStats.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">En Cours</span>
                <span className="text-sm font-bold text-slate-900">{taskStats.inProgress}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${taskStats.total > 0 ? (taskStats.inProgress / taskStats.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">En Revue</span>
                <span className="text-sm font-bold text-slate-900">{taskStats.review}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{ width: `${taskStats.total > 0 ? (taskStats.review / taskStats.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">Terminé</span>
                <span className="text-sm font-bold text-slate-900">{taskStats.done}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full transition-all"
                  style={{ width: `${taskStats.total > 0 ? (taskStats.done / taskStats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
          <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Répartition par Priorité
          </h4>
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">Critique</span>
                <span className="text-sm font-bold text-red-700">{taskStats.byPriority.critical}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-red-500 h-2 rounded-full transition-all"
                  style={{ width: `${taskStats.total > 0 ? (taskStats.byPriority.critical / taskStats.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">Haute</span>
                <span className="text-sm font-bold text-amber-700">{taskStats.byPriority.high}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all"
                  style={{ width: `${taskStats.total > 0 ? (taskStats.byPriority.high / taskStats.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">Moyenne</span>
                <span className="text-sm font-bold text-blue-700">{taskStats.byPriority.medium}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${taskStats.total > 0 ? (taskStats.byPriority.medium / taskStats.total) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-slate-700">Basse</span>
                <span className="text-sm font-bold text-slate-700">{taskStats.byPriority.low}</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className="bg-slate-500 h-2 rounded-full transition-all"
                  style={{ width: `${taskStats.total > 0 ? (taskStats.byPriority.low / taskStats.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600" />
          Analyse du Temps
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700 mb-1">Heures Estimées</p>
            <p className="text-2xl font-bold text-blue-900">{timeStats.totalEstimated.toFixed(1)}h</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-700 mb-1">Heures Réelles</p>
            <p className="text-2xl font-bold text-green-900">{timeStats.totalActual.toFixed(1)}h</p>
          </div>

          <div className={`rounded-lg p-4 border ${timeStats.variance > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
            <p className={`text-sm mb-1 ${timeStats.variance > 0 ? 'text-red-700' : 'text-green-700'}`}>Variance</p>
            <p className={`text-2xl font-bold ${timeStats.variance > 0 ? 'text-red-900' : 'text-green-900'}`}>
              {timeStats.variance > 0 ? '+' : ''}{timeStats.variance.toFixed(1)}%
            </p>
          </div>

          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <p className="text-sm text-amber-700 mb-1">Efficacité</p>
            <p className="text-2xl font-bold text-amber-900">{timeStats.efficiency.toFixed(0)}%</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm">
        <h4 className="font-bold text-slate-900 mb-4">Vue d'ensemble des Sprints</h4>
        {sprints.length === 0 ? (
          <p className="text-slate-600 text-center py-8">Aucun sprint créé pour le moment</p>
        ) : (
          <div className="space-y-3">
            {sprints.map(sprint => {
              const sprintTasks = tasks.filter(t => t.sprint_id === sprint.id);
              const completedSprintTasks = sprintTasks.filter(t => t.status === 'done').length;
              const sprintProgress = sprintTasks.length > 0 ? (completedSprintTasks / sprintTasks.length) * 100 : 0;

              return (
                <div key={sprint.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{sprint.name}</p>
                    <p className="text-sm text-slate-600">
                      {completedSprintTasks} / {sprintTasks.length} tâches terminées
                    </p>
                  </div>
                  <div className="w-48">
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${sprintProgress}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right min-w-[60px]">
                    <span className="text-lg font-bold text-slate-900">{sprintProgress.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
