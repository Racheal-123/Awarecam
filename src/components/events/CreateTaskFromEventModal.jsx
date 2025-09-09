import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from 'lucide-react';

import { Employee } from '@/api/entities';
import { Task } from '@/api/entities';

export default function CreateTaskFromEventModal({ event, onClose, onTaskCreated }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [taskData, setTaskData] = useState({
    title: `Respond to: ${event.event_type.replace('_', ' ')} at ${event.camera_name}`,
    description: event.description,
    priority: event.severity,
    employee_id: '',
    notes: `Generated from Event ID: ${event.id}`
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeeList = await Employee.list();
        setEmployees(employeeList);
      } catch (error) {
        console.error("Failed to fetch employees", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmployees();
  }, []);
  
  const handleChange = (field, value) => {
    setTaskData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const newTask = await Task.create({
        ...taskData,
        organization_id: event.organization_id, // assuming event has org id
        status: 'assigned',
        due_date: new Date(Date.now() + 60 * 60 * 1000).toISOString() // due in 1 hour
      });
      onTaskCreated(event.id, newTask.id);
    } catch (error) {
      console.error("Failed to create task", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Task from Event</DialogTitle>
          <DialogDescription>
            Assign a task to a team member to resolve this event.
          </DialogDescription>
        </DialogHeader>
        
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="title">Task Title</Label>
              <Input id="title" value={taskData.title} onChange={(e) => handleChange('title', e.target.value)} />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" value={taskData.description} onChange={(e) => handleChange('description', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={taskData.priority} onValueChange={(val) => handleChange('priority', val)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="employee">Assign To</Label>
                <Select onValueChange={(val) => handleChange('employee_id', val)}>
                  <SelectTrigger><SelectValue placeholder="Select an employee" /></SelectTrigger>
                  <SelectContent>
                    {employees.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
             <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={taskData.notes} onChange={(e) => handleChange('notes', e.target.value)} />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || isSubmitting || !taskData.employee_id} className="bg-blue-600 hover:bg-blue-700">
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Assign Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}