import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { TrendingUp, Award, Zap } from 'lucide-react';

export default function PerformanceTab({ employees, tasks }) {
    if (!employees || employees.length === 0) {
        return <div className="p-4 text-center text-slate-500">No employee data to display performance.</div>;
    }

    const performanceData = employees.map(emp => {
        const assignedTasks = tasks.filter(t => t.employee_id === emp.id);
        const completedTasks = assignedTasks.filter(t => t.status === 'completed' || t.status === 'verified');
        const completionRate = assignedTasks.length > 0 ? Math.round((completedTasks.length / assignedTasks.length) * 100) : 0;
        return {
            ...emp,
            tasksAssigned: assignedTasks.length,
            tasksCompleted: completedTasks.length,
            completionRate: completionRate,
        };
    }).sort((a, b) => b.completionRate - a.completionRate);

    return (
        <Card className="border-0 shadow-none">
            <CardHeader>
                <CardTitle>Team Performance</CardTitle>
                <CardDescription>Leaderboard based on task completion rates and streaks.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {performanceData.map((emp, index) => (
                        <Card key={emp.id} className="p-4 flex items-center gap-4">
                            <div className="font-bold text-lg text-slate-400 w-8 text-center">{index + 1}</div>
                            <Avatar>
                                <AvatarImage src={emp.photo_url} />
                                <AvatarFallback>{emp.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="font-semibold text-slate-800">{emp.name}</p>
                                <p className="text-sm text-slate-500">{emp.tasksCompleted} of {emp.tasksAssigned} tasks completed</p>
                            </div>
                            <div className="flex items-center gap-4">
                               {index === 0 && <Award className="w-6 h-6 text-amber-500" />}
                               {emp.completion_streak > 5 && <Zap className="w-6 h-6 text-blue-500" />}
                               <div className="text-right">
                                   <p className="font-bold text-xl text-green-600">{emp.completionRate}%</p>
                                   <p className="text-xs text-slate-500">Completion Rate</p>
                               </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}