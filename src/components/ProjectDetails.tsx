import { useState } from 'react';
import { Project } from '../lib/supabase';
import { X, ListChecks, Zap, BarChart3 } from 'lucide-react';
import TaskBoard from './TaskBoard';
import SprintManagement from './SprintManagement';
import ProjectReports from './ProjectReports';

interface ProjectDetailsProps {
  project: Project;
  onClose: () => void;
  onUpdate: () => void;
}

type Tab = 'tasks' | 'sprints' | 'reports';

export default function ProjectDetails({ project, onClose, onUpdate }: ProjectDetailsProps) {
  const [activeTab, setActiveTab] = useState<Tab>('tasks');

  const tabs = [
    { id: 'tasks' as Tab, label: 'Tâches', icon: ListChecks },
    { id: 'sprints' as Tab, label: 'Sprints', icon: Zap },
    { id: 'reports' as Tab, label: 'Rapports', icon: BarChart3 }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-7xl h-[90vh] flex flex-col shadow-2xl">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 rounded-t-xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-white">{project.name}</h2>
              <p className="text-blue-100 mt-1">{project.description}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          <div className="flex gap-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-white text-blue-700'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'tasks' && <TaskBoard projectId={project.id} />}
          {activeTab === 'sprints' && <SprintManagement projectId={project.id} />}
          {activeTab === 'reports' && <ProjectReports projectId={project.id} />}
        </div>
      </div>
    </div>
  );
}
