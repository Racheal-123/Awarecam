
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  Clock, 
  User, 
  Calendar,
  AlertTriangle,
  CheckCircle,
  Play,
  Eye,
  MoreVertical
} from 'lucide-react';
import { format } from 'date-fns';

const priorityColors = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

const statusColors = {
  pending: 'bg-slate-100 text-slate-800',
  assigned: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  verified: 'bg-emerald-100 text-emerald-800',
  overdue: 'bg-red-100 text-red-800'
};

const statusIcons = {
  pending: Clock,
  assigned: User,
  in_progress: Play,
  completed: CheckCircle,
  verified: CheckCircle,
  overdue: AlertTriangle
};

export default function TaskList({ tasks, onTaskClick }) {
  if (tasks.length === 0) {
    return (
      <Card className="border-2 border-dashed border-slate-200">
        <CardContent className="text-center py-16">
          <Clock className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700">No Tasks Found</h3>
          <p className="text-slate-500 mt-2">
            Tasks will appear here once they're created from workflow templates.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task, index) => (
        <TaskListItem
          key={task.id}
          task={task}
          index={index}
          onTaskClick={onTaskClick}
        />
      ))}
    </div>
  );
}

function TaskListItem({ task, index, onTaskClick }) {
  const StatusIcon = statusIcons[task.status];
  const completedSteps = task.steps?.filter(s => s.is_completed).length || 0;
  const totalSteps = task.steps?.length || 0;
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => onTaskClick(task)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
                  <StatusIcon className="w-5 h-5 text-slate-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 text-lg">{task.title}</h3>
                  <p className="text-slate-600 text-sm">{task.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                {task.employee && (
                  <div className="flex items-center gap-2">
                    <Avatar className="w-6 h-6">
                      <AvatarFallback className="text-xs">
                        {task.employee.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{task.employee.name}</span>
                  </div>
                )}
                {task.due_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Due {format(new Date(task.due_date), 'MMM d')}</span>
                  </div>
                )}
                {task.estimated_duration && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{task.estimated_duration}min</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge className={priorityColors[task.priority]}>
                    {task.priority} priority
                  </Badge>
                  <Badge className={statusColors[task.status]}>
                    {task.status.replace('_', ' ')}
                  </Badge>
                </div>

                {totalSteps > 0 && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <span>{completedSteps}/{totalSteps} steps</span>
                    <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button variant="ghost" size="sm" className="ml-4">
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
