/*
  # ProjiFlow - Project Management System Schema

  ## Overview
  Complete database schema for ProjiFlow project management application with support for:
  - Projects and task management
  - Sprint/delivery stream tracking
  - Progress monitoring and reporting
  
  ## New Tables
  
  ### 1. `projects`
    - `id` (uuid, primary key)
    - `name` (text) - Project name
    - `description` (text) - Project description
    - `status` (text) - Status: planning, active, on_hold, completed
    - `start_date` (date) - Project start date
    - `end_date` (date) - Project end date
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp
  
  ### 2. `sprints`
    - `id` (uuid, primary key)
    - `project_id` (uuid, foreign key) - Reference to projects
    - `name` (text) - Sprint/delivery stream name
    - `description` (text) - Sprint description
    - `start_date` (date) - Sprint start date
    - `end_date` (date) - Sprint end date
    - `status` (text) - Status: planned, active, completed
    - `created_at` (timestamptz) - Creation timestamp
  
  ### 3. `tasks`
    - `id` (uuid, primary key)
    - `project_id` (uuid, foreign key) - Reference to projects
    - `sprint_id` (uuid, foreign key, nullable) - Reference to sprints
    - `title` (text) - Task title
    - `description` (text) - Task description
    - `status` (text) - Status: todo, in_progress, review, done
    - `priority` (text) - Priority: low, medium, high, critical
    - `estimated_hours` (numeric) - Estimated hours
    - `actual_hours` (numeric) - Actual hours spent
    - `assigned_to` (text) - Assignee name
    - `due_date` (date) - Task due date
    - `created_at` (timestamptz) - Creation timestamp
    - `updated_at` (timestamptz) - Last update timestamp
  
  ### 4. `task_comments`
    - `id` (uuid, primary key)
    - `task_id` (uuid, foreign key) - Reference to tasks
    - `comment` (text) - Comment text
    - `author` (text) - Comment author
    - `created_at` (timestamptz) - Creation timestamp
  
  ## Security
  - Enable RLS on all tables
  - Add policies for public access (since no auth is implemented yet)
  
  ## Indexes
  - Add indexes on foreign keys for better query performance
  - Add indexes on status fields for filtering
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'planning' CHECK (status IN ('planning', 'active', 'on_hold', 'completed')),
  start_date date,
  end_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sprints table
CREATE TABLE IF NOT EXISTS sprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text DEFAULT '',
  start_date date NOT NULL,
  end_date date NOT NULL,
  status text DEFAULT 'planned' CHECK (status IN ('planned', 'active', 'completed')),
  created_at timestamptz DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  sprint_id uuid REFERENCES sprints(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'review', 'done')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  estimated_hours numeric DEFAULT 0,
  actual_hours numeric DEFAULT 0,
  assigned_to text DEFAULT '',
  due_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create task_comments table
CREATE TABLE IF NOT EXISTS task_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  comment text NOT NULL,
  author text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sprints_project_id ON sprints(project_id);
CREATE INDEX IF NOT EXISTS idx_sprints_status ON sprints(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_sprint_id ON tasks(sprint_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_task_comments_task_id ON task_comments(task_id);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sprints ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (no auth required for now)
CREATE POLICY "Allow public read access to projects"
  ON projects FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to projects"
  ON projects FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update to projects"
  ON projects FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to projects"
  ON projects FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to sprints"
  ON sprints FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to sprints"
  ON sprints FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update to sprints"
  ON sprints FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to sprints"
  ON sprints FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to tasks"
  ON tasks FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to tasks"
  ON tasks FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update to tasks"
  ON tasks FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete to tasks"
  ON tasks FOR DELETE
  TO anon
  USING (true);

CREATE POLICY "Allow public read access to task_comments"
  ON task_comments FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert to task_comments"
  ON task_comments FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public delete to task_comments"
  ON task_comments FOR DELETE
  TO anon
  USING (true);