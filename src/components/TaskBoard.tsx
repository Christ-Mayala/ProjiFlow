import { useState, useEffect } from 'react';
import { supabase, Task, Sprint } from '../lib/supabase';
import { Plus, Clock, User, Calendar, AlertCircle } from 'lucide-react';
import CreateTaskModal from './CreateTaskModal';
import TaskCard from './TaskCard';

interface TaskBoardProps {
  projectId: string;
}

export default function TaskBoard({ projectId }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedSprint, setSelectedSprint] = useState<string>('all');

  useEffect(() => {
    fetchData();
  }, [projectId, selectedSprint]);

  async function fetchData() {
    setLoading(true);

    const sprintsQuery = supabase
      .from('sprints')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    let tasksQuery = supabase
      .from('tasks')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (selectedSprint && selectedSprint !== 'all') {
      tasksQuery = tasksQuery.eq('sprint_id', selectedSprint);
    }

    const [sprintsResult, tasksResult] = await Promise.all([
      sprintsQuery,
      tasksQuery
    ]);

    if (!sprintsResult.error && sprintsResult.data) {
      setSprints(sprintsResult.data);
    }

    if (!tasksResult.error && tasksResult.data) {
      setTasks(tasksResult.data);
    }

    setLoading(false);
  }

  function handleTaskCreated() {
    fetchData();
    setShowCreateModal(false);
  }

  const columns = [
    { id: 'todo', label: 'À Faire', color: 'bg-slate-100' },
    { id: 'in_progress', label: 'En Cours', color: 'bg-blue-100' },
    { id: 'review', label: 'En Revue', color: 'bg-amber-100' },
    { id: 'done', label: 'Terminé', color: 'bg-green-100' }
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-bold text-slate-900">Tableau des Tâches</h3>
          <select
            value={selectedSprint}
            onChange={(e) => setSelectedSprint(e.target.value)}
            className="px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les sprints</option>
            {sprints.map(sprint => (
              <option key={sprint.id} value={sprint.id}>{sprint.name}</option>
            ))}
          </select>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus className="w-5 h-5" />
          Nouvelle Tâche
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map(column => {
            const columnTasks = tasks.filter(task => task.status === column.id);

            return (
              <div key={column.id} className="flex flex-col">
                <div className={`${column.color} px-4 py-3 rounded-t-lg`}>
                  <h4 className="font-semibold text-slate-900">
                    {column.label}
                    <span className="ml-2 text-sm font-normal text-slate-600">
                      ({columnTasks.length})
                    </span>
                  </h4>
                </div>

                <div className="bg-slate-50 rounded-b-lg p-3 min-h-[400px] space-y-3">
                  {columnTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 text-slate-400">
                      <AlertCircle className="w-8 h-8 mb-2" />
                      <p className="text-sm">Aucune tâche</p>
                    </div>
                  ) : (
                    columnTasks.map(task => (
                      <TaskCard key={task.id} task={task} onUpdate={fetchData} />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showCreateModal && (
        <CreateTaskModal
          projectId={projectId}
          sprints={sprints}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleTaskCreated}
        />
      )}
    </div>
  );
}
