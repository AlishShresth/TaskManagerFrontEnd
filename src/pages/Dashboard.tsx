import { useState, useEffect } from "react";
import api from "../services/api";
import { type Task } from "../types/task";
import { type Project } from "../types/project";
import TaskCard from "../components/TaskCard";

interface TaskResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Task[];
}

interface ProjectResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Project[];
}

export default function Dashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [taskResponse, projectsResponse] = await Promise.all([
          api.get<TaskResponse>("/tasks/"),
          api.get<ProjectResponse>('/projects/'),
        ]);
        setTasks(taskResponse.data.results);
        setProjects(projectsResponse.data.results);
      } catch (error: any) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading...</div>
  if (error) return <div className="text-center mt-10 text-red-500">{error}</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Projects</h2>
        {projects.length === 0 ? (
          <p className="text-gray-600">No projects found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div key={project.id} className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold">{project.name}</h3>
                <p className="text-sm text-gray-600">{project.description || 'No description'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h2 className="text-2xl font-semibold mb-4">Your Tasks</h2>
        {tasks.length === 0 ? (
          <p className="text-gray-600">No tasks found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}