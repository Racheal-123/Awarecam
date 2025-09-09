import React from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, Edit, Sparkles } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function TaskCard({ task, employee, index, onTaskClick, onTaskEdit }) {
    const priorityColors = {
        critical: 'bg-red-100 text-red-800 border-red-200',
        high: 'bg-orange-100 text-orange-800 border-orange-200',
        medium: 'bg-blue-100 text-blue-800 border-blue-200',
        low: 'bg-slate-100 text-slate-800 border-slate-200',
    };

    return (
        <Draggable draggableId={task.id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="mb-4"
                >
                    <Card
                        className="bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 cursor-pointer border-slate-200"
                        onClick={() => onTaskClick(task)}
                    >
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start">
                                <p className="font-semibold text-slate-800 pr-2">{task.title}</p>
                                <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0" onClick={(e) => { e.stopPropagation(); onTaskEdit(task); }}>
                                    <Edit className="w-3.5 h-3.5 text-slate-400"/>
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                                {task.validation_method === 'ai_auto' && (
                                    <Badge className="bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1">
                                        <Sparkles className="w-3 h-3" /> AI
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center justify-between mt-4">
                                {employee ? (
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-6 h-6">
                                            <AvatarImage src={employee.photo_url} />
                                            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-xs text-slate-600">{employee.name}</span>
                                    </div>
                                ) : <div />}
                                {task.due_date && (
                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                        <Clock className="w-3 h-3" />
                                        <span>{formatDistanceToNow(new Date(task.due_date), { addSuffix: true })}</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </Draggable>
    );
}