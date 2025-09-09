import React, { useState, useEffect, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { CalendarIcon, Clock, Users, Briefcase, MapPin, Repeat, Loader2 } from 'lucide-react';
import { format, set, parseISO } from 'date-fns';
import { toast } from 'sonner';

import { WorkflowTemplate } from '@/api/entities';
import { Employee } from '@/api/entities';
import { EmployeeRole } from '@/api/entities';
import { Location } from '@/api/entities';
import { WorkflowAssignment } from '@/api/entities';
import { generateOccurrences } from '@/components/workflows/schedule-utils';
import { useUser } from '@/layout';

const weekDays = [
    { label: 'S', value: 0 }, { label: 'M', value: 1 }, { label: 'T', value: 2 },
    { label: 'W', value: 3 }, { label: 'T', value: 4 }, { label: 'F', value: 5 },
    { label: 'S', value: 6 }
];

export default function AssignmentFormModal({ assignment, onSave, onCancel }) {
  const { organization } = useUser();
  const [formData, setFormData] = useState({
    workflow_template_id: '',
    assignee_type: 'employee',
    assignee_id: '',
    location_id: null,
    schedule_type: 'daily',
    schedule_config: { time: '09:00', days: [1, 2, 3, 4, 5], day_of_month: 1 },
    start_date: new Date(),
    due_in_minutes: 60,
    priority: 'medium',
    status: 'active',
  });
  const [templates, setTemplates] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadPrerequisites() {
      if (!organization?.id) return;
      try {
        const [tplData, empData, roleData, locData] = await Promise.all([
          WorkflowTemplate.filter({ organization_id: organization.id }),
          Employee.filter({ organization_id: organization.id }),
          EmployeeRole.filter({ organization_id: organization.id }),
          Location.filter({ organization_id: organization.id }),
        ]);
        setTemplates(tplData);
        setEmployees(empData);
        setRoles(roleData);
        setLocations(locData);
        
        if (assignment) {
            setFormData({
                ...assignment,
                start_date: parseISO(assignment.start_date),
                schedule_config: assignment.schedule_config || { time: '09:00', days: [], day_of_month: 1 },
            });
        }
      } catch (error) {
        toast.error("Failed to load data for form.");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPrerequisites();
  }, [organization, assignment]);
  
  const handleSave = async () => {
    setIsSubmitting(true);
    try {
        const dataToSave = {
            ...formData,
            organization_id: organization.id,
            start_date: formData.start_date.toISOString(),
        };

        if (assignment?.id) {
            await WorkflowAssignment.update(assignment.id, dataToSave);
            toast.success("Assignment updated successfully.");
        } else {
            await WorkflowAssignment.create(dataToSave);
            toast.success("Assignment created successfully.");
        }
        onSave();
    } catch (error) {
        toast.error("Failed to save assignment.");
        console.error(error);
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const upcomingOccurrences = useMemo(() => {
    return generateOccurrences(formData);
  }, [formData]);

  const assigneeOptions = formData.assignee_type === 'employee' ? employees : roles;

  const handleDayToggle = (day) => {
    const currentDays = formData.schedule_config.days || [];
    const newDays = currentDays.includes(day) 
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day].sort((a, b) => a - b);
    
    setFormData(f => ({
      ...f, 
      schedule_config: { ...f.schedule_config, days: newDays }
    }));
  };

  if (isLoading) {
    return (
        <Dialog open onOpenChange={onCancel}>
            <DialogContent>
                <div className="flex items-center justify-center p-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                </div>
            </DialogContent>
        </Dialog>
    );
  }

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{assignment ? 'Edit' : 'Create'} Workflow Assignment</DialogTitle>
          <DialogDescription>Schedule a workflow to be assigned to an employee or role on a recurring basis.</DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label>Workflow Template</Label>
                    <Select value={formData.workflow_template_id} onValueChange={val => setFormData(f => ({ ...f, workflow_template_id: val }))}>
                        <SelectTrigger><SelectValue placeholder="Select a workflow..." /></SelectTrigger>
                        <SelectContent>{templates.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Assign To</Label>
                    <div className="flex gap-2">
                        <Select value={formData.assignee_type} onValueChange={val => setFormData(f => ({ ...f, assignee_type: val, assignee_id: '' }))}>
                            <SelectTrigger className="w-1/3"><SelectValue /></SelectTrigger>
                            <SelectContent><SelectItem value="employee"><Users className="w-4 h-4 inline mr-2"/>Employee</SelectItem><SelectItem value="role"><Briefcase className="w-4 h-4 inline mr-2"/>Role</SelectItem></SelectContent>
                        </Select>
                        <Select value={formData.assignee_id} onValueChange={val => setFormData(f => ({ ...f, assignee_id: val }))}>
                            <SelectTrigger className="w-2/3"><SelectValue placeholder={`Select a ${formData.assignee_type}...`} /></SelectTrigger>
                            <SelectContent>{assigneeOptions.map(o => <SelectItem key={o.id} value={o.id}>{o.name || o.role_display_name}</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label>Location</Label>
                    <Select value={formData.location_id || ''} onValueChange={val => setFormData(f => ({ ...f, location_id: val || null }))}>
                        <SelectTrigger><SelectValue placeholder="All Locations" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value={null}>All Locations</SelectItem>
                            {locations.map(l => <SelectItem key={l.id} value={l.id}><MapPin className="w-4 h-4 inline mr-2"/>{l.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center justify-between">
                    <Label>Status</Label>
                    <Switch checked={formData.status === 'active'} onCheckedChange={checked => setFormData(f => ({...f, status: checked ? 'active' : 'paused'}))} />
                </div>
            </div>
            <div className="space-y-4 p-4 bg-slate-50 rounded-lg">
                <h3 className="font-semibold">Scheduling</h3>
                <div className="space-y-2">
                    <Label>Recurrence</Label>
                    <Select value={formData.schedule_type} onValueChange={val => setFormData(f => ({...f, schedule_type: val}))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly</SelectItem>
                            <SelectItem value="monthly">Monthly</SelectItem>
                            <SelectItem value="one_off">One-off</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {formData.schedule_type === 'weekly' && (
                    <div className="space-y-2">
                        <Label>On Days</Label>
                        <div className="flex gap-1">
                            {weekDays.map(d => (
                                <Button
                                    key={d.value}
                                    type="button"
                                    variant={formData.schedule_config.days?.includes(d.value) ? "default" : "outline"}
                                    size="sm"
                                    className="w-9 h-9"
                                    onClick={() => handleDayToggle(d.value)}
                                >
                                    {d.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}
                {formData.schedule_type === 'monthly' && (
                     <div className="space-y-2">
                        <Label>Day of Month</Label>
                        <Input type="number" min="1" max="31" value={formData.schedule_config.day_of_month} onChange={e => setFormData(f => ({...f, schedule_config: {...f.schedule_config, day_of_month: Number(e.target.value)}}))} />
                     </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Start Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant="outline" className="w-full justify-start text-left font-normal">
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {formData.start_date ? format(formData.start_date, 'PPP') : 'Pick a date'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent><Calendar mode="single" selected={formData.start_date} onSelect={date => setFormData(f => ({...f, start_date: date}))} /></PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label>Start Time</Label>
                        <Input type="time" value={formData.schedule_config.time} onChange={e => setFormData(f => ({...f, schedule_config: {...f.schedule_config, time: e.target.value}}))} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Due Within (minutes)</Label>
                    <Input type="number" value={formData.due_in_minutes} onChange={e => setFormData(f => ({...f, due_in_minutes: Number(e.target.value)}))} />
                </div>
                <div className="space-y-2">
                    <h4 className="text-sm font-medium">Upcoming Occurrences Preview</h4>
                    <div className="space-y-1 text-sm text-slate-600 bg-white p-3 rounded-md border max-h-32 overflow-y-auto">
                        {upcomingOccurrences.length > 0 ? (
                            upcomingOccurrences.map((date, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <Repeat className="w-3 h-3 text-slate-400"/> 
                                    {format(date, 'E, MMM d, yyyy @ p')}
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500">No upcoming occurrences</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSave} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Save Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}