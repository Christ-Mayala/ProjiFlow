import { useState, useEffect } from 'react';
import { supabase, Task, TaskComment } from '../lib/supabase';
import { X, Trash2, MessageSquare, Send } from 'lucide-react';

interface TaskDetailsModalProps {
  task: Task;
  onClose: () => void;
  onUpdate: () => void;
}

export default function TaskDetailsModal({ task, onClose, onUpdate }: TaskDetailsModalProps) {
  const [editedTask, setEditedTask] = useState(task);
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [author, setAuthor] = useState('');

  useEffect(() => {
    fetchComments();
  }, [task.id]);

  async function fetchComments() {
    const { data } = await supabase
      .from('task_comments')
      .select('*')
      .eq('task_id', task.id)
      .order('created_at', { ascending: true });

    if (data) {
      setComments(data);
    }
  }

  async function handleUpdate() {
    setLoading(true);
    const { error } = await supabase
      .from('tasks')
      .update({
        title: editedTask.title,
        description: editedTask.description,
        status: editedTask.status,
        priority: editedTask.priority,
        assigned_to: editedTask.assigned_to,
        estimated_hours: editedTask.estimated_hours,
        actual_hours: editedTask.actual_hours,
        due_date: editedTask.due_date,
        updated_at: new Date().toISOString()
      })
      .eq('id', task.id);

    setLoading(false);

    if (!error) {
      onUpdate();
    }
  }

  async function handleDelete() {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', task.id);

    if (!error) {
      onUpdate();
    }
  }

  async function handleAddComment() {
    if (!newComment.trim() || !author.trim()) return;

    const { error } = await supabase
      .from('task_comments')
      .insert([{
        task_id: task.id,
        comment: newComment.trim(),
        author: author.trim()
      }]);

    if (!error) {
      setNewComment('');
      fetchComments();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white border-b border-slate-200 p-6 rounded-t-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">Détails de la Tâche</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDelete}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Titre
            </label>
            <input
              type="text"
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={editedTask.description}
              onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-24 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Statut
              </label>
              <select
                value={editedTask.status}
                onChange={(e) => setEditedTask({ ...editedTask, status: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="todo">À Faire</option>
                <option value="in_progress">En Cours</option>
                <option value="review">En Revue</option>
                <option value="done">Terminé</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Priorité
              </label>
              <select
                value={editedTask.priority}
                onChange={(e) => setEditedTask({ ...editedTask, priority: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="low">Basse</option>
                <option value="medium">Moyenne</option>
                <option value="high">Haute</option>
                <option value="critical">Critique</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Assigné à
            </label>
            <input
              type="text"
              value={editedTask.assigned_to}
              onChange={(e) => setEditedTask({ ...editedTask, assigned_to: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Heures estimées
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={editedTask.estimated_hours}
                onChange={(e) => setEditedTask({ ...editedTask, estimated_hours: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Heures réelles
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                value={editedTask.actual_hours}
                onChange={(e) => setEditedTask({ ...editedTask, actual_hours: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Date d'échéance
              </label>
              <input
                type="date"
                value={editedTask.due_date || ''}
                onChange={(e) => setEditedTask({ ...editedTask, due_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-slate-600" />
              <h3 className="font-semibold text-slate-900">Commentaires ({comments.length})</h3>
            </div>

            <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
              {comments.map(comment => (
                <div key={comment.id} className="bg-slate-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-900">{comment.author}</span>
                    <span className="text-xs text-slate-500">
                      {new Date(comment.created_at).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700">{comment.comment}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Votre nom"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button
                  onClick={handleAddComment}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleUpdate}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
