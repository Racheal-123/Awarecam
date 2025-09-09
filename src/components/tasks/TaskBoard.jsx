import React from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import TaskCard from '@/components/tasks/TaskCard';

const columns = [
  { id: 'pending', title: 'Pending' },
  { id: 'assigned', title: 'Assigned' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'completed', title: 'Completed' },
  { id: 'verified', title: 'Verified' },
  { id: 'overdue', title: 'Overdue' }
];

export default function TaskBoard({ tasks, onTaskClick, onDragEnd }) {
  const handleTaskEdit = (task) => {
    // For now, just open the task details - in a real app this would open an edit modal
    onTaskClick(task);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {columns.map(column => (
          <Droppable key={column.id} droppableId={column.id}>
            {(provided, snapshot) => (
              <Card 
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex flex-col bg-slate-100/70 border-0 shadow-lg ${snapshot.isDraggingOver ? 'bg-slate-200' : ''}`}
              >
                <CardHeader>
                  <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    <span>{column.title}</span>
                    <span className="text-sm font-medium bg-slate-200 text-slate-600 rounded-full px-2 py-0.5">
                      {tasks.filter(t => t.status === column.id).length}
                    </span>
                  </CardTitle>
                </CardHeader>
                <div className="p-4 pt-0 overflow-y-auto flex-1">
                  {tasks
                    .filter(task => task.status === column.id)
                    .map((task, index) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        employee={task.employee}
                        index={index}
                        onTaskClick={onTaskClick}
                        onTaskEdit={handleTaskEdit}
                      />
                    ))}
                  {provided.placeholder}
                </div>
              </Card>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}