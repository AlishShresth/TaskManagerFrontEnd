import { type Task } from "../types/task";

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition">
      <h3 className="text-lg font-semibold text-gray-800">{task.title}</h3>
      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
      <div className="mt-2 text-sm">
        <p><span className="font-medium">Status:</span> {task.status?.name || 'None'}</p>
        <p><span className="font-medium">Priority:</span> {task.priority}</p>
        <p><span className="font-medium">Assigned to:</span> {task.assigned_to?.email || 'Unassigned'}</p>
        <p><span className="font-medium">Deadline:</span> {task.deadline || 'Not set'}</p>
      </div>
    </div>
  );
}