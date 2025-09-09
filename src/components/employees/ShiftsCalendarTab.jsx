import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, startOfWeek, addDays, subDays } from 'date-fns';

export default function ShiftsCalendarTab({ employees, shifts }) {
  const [week, setWeek] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));

  const nextWeek = () => setWeek(addDays(week, 7));
  const prevWeek = () => setWeek(subDays(week, 7));

  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(week, i));

  const getShiftForEmployeeAndDay = (employeeId, day) => {
    return shifts.find(shift => 
      shift.employee_id === employeeId && 
      format(new Date(shift.start_at), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd')
    );
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>Shifts & Availability</CardTitle>
                <CardDescription>Weekly schedule for all employees.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={prevWeek}><ChevronLeft className="w-4 h-4"/></Button>
                <span className="font-semibold text-slate-700 w-48 text-center">{format(week, 'MMMM yyyy')}</span>
                <Button variant="outline" size="icon" onClick={nextWeek}><ChevronRight className="w-4 h-4"/></Button>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-slate-50">
                        <th className="p-3 text-left font-semibold text-slate-600 w-1/4">Employee</th>
                        {weekDays.map(day => (
                            <th key={day} className="p-3 text-center font-semibold text-slate-600">
                                <div className="flex flex-col items-center">
                                    <span>{format(day, 'EEE')}</span>
                                    <span className="text-xl font-bold">{format(day, 'd')}</span>
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {employees.map(employee => (
                         <tr key={employee.id} className="border-b">
                            <td className="p-3">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={employee.photo_url} />
                                        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span className="font-medium">{employee.name}</span>
                                </div>
                            </td>
                            {weekDays.map(day => {
                                const shift = getShiftForEmployeeAndDay(employee.id, day);
                                return (
                                    <td key={day} className="p-2 align-top h-24">
                                        {shift ? (
                                            <div className="bg-blue-100 text-blue-800 rounded-lg p-2 text-sm">
                                                <p className="font-bold">{format(new Date(shift.start_at), 'h:mm a')} - {format(new Date(shift.end_at), 'h:mm a')}</p>
                                                <p className="text-xs">{shift.status}</p>
                                            </div>
                                        ) : (
                                            <div className="text-center text-slate-400 text-sm">Off</div>
                                        )}
                                    </td>
                                )
                            })}
                         </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </CardContent>
    </Card>
  );
}