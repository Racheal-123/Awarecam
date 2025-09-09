import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { X, Save, Calendar as CalendarIcon } from 'lucide-react';
import { Employee } from '@/api/entities';
import { Organization } from '@/api/entities';
import { Task } from '@/api/entities';
import { Location } from '@/api/entities';
import { toast } from 'sonner';

export default function TaskForm({ task, workflowTemplate, onComplete, onCancel }) {
  const [taskData, setTaskData] = useState({
    title: '',
    description: '',
    status: 'pending',
    priority: 'medium',
    employee_id: '',
    location_id: '',
    due_date: null,
    steps: [],
    history: []
  });
  const [employees, setEmployees] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [employeeList, orgList, locationList] = await Promise.all([
          Employee.list(),
          Organization.list(),
          Location.list(),
        ]);
        setEmployees(employeeList);
        setOrganization(orgList.length > 0 ? orgList[0] : null);
        setLocations(locationList);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    }
    loadData();

    if (task) {
      setTaskData({ ...task, due_date: task.due_date ? new Date(task.due_date) : null });
    } else if (workflowTemplate) {
      setTaskData({
        title: workflowTemplate.name,
        description: workflowTemplate.description,
        status: 'pending',
        priority: workflowTemplate.priority || 'medium',
        employee_id: '',
        location_id: '',
        due_date: null,
        steps: (workflowTemplate.steps || []).map(s => ({ ...s, is_completed: false, status: 'pending' })),
        workflow_template_id: workflowTemplate.id,
        history: [{
          timestamp: new Date().toISOString(),
          action: `Task created from template: ${workflowTemplate.name}`
        }]
      });
    } else {
      // For blank tasks
      setTaskData({
        title: '',
        description: '',
        status: 'pending',
        priority: 'medium',
        employee_id: '',
        location_id: '',
        due_date: null,
        steps: [],
        workflow_template_id: null,
        history: [{
          timestamp: new Date().toISOString(),
          action: 'Manual task created'
        }]
      });
    }
  }, [task, workflowTemplate]);

  const handleInputChange = (field, value) => {
    setTaskData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!taskData.location_id) {
      toast.error("Please select a location for the task.");
      return;
    }
    const dataToSubmit = {
      ...taskData,
      organization_id: organization?.id,
      due_date: taskData.due_date ? taskData.due_date.toISOString() : null,
    };
    onComplete(dataToSubmit);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-2xl"
      >
        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{task ? 'Edit Task' : 'Create New Task'}</CardTitle>
                <Button variant="ghost" size="icon" type="button" onClick={onCancel}>
                  <X />
                </Button>
              </div>
              {workflowTemplate && <p className="text-sm text-slate-500">From template: {workflowTemplate.name}</p>}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={taskData.title} onChange={(e) => handleInputChange('title', e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={taskData.description} onChange={(e) => handleInputChange('description', e.target.value)} />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="employee">Assign To</Label>
                  <Select value={taskData.employee_id} onValueChange={(val) => handleInputChange('employee_id', val)}>
                    <SelectTrigger><SelectValue placeholder="Select an employee" /></SelectTrigger>
                    <SelectContent>
                      {employees.map(emp => (
                        <SelectItem key={emp.id} value={emp.id}>{emp.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={taskData.priority} onValueChange={(val) => handleInputChange('priority', val)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
               <div className="space-y-1">
                  <Label htmlFor="location">Location</Label>
                  <Select value={taskData.location_id} onValueChange={(val) => handleInputChange('location_id', val)} required>
                    <SelectTrigger><SelectValue placeholder="Select a location" /></SelectTrigger>
                    <SelectContent>
                      {locations.map(loc => (
                        <SelectItem key={loc.id} value={loc.id}>{loc.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              <div className="space-y-1">
                <Label>Due Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {taskData.due_date ? format(taskData.due_date, 'PPP') : 'Pick a date'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={taskData.due_date} onSelect={(date) => handleInputChange('due_date', date)} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
                <Button type="submit">
                  <Save className="w-4 h-4 mr-2" />
                  {task ? 'Save Changes' : 'Create Task'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </motion.div>
    </div>
  );
}