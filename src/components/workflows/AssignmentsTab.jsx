import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Play, Pause, Edit, Plus, Bot, AlertTriangle, Loader2 } from 'lucide-react';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { toast } from 'sonner';

import { WorkflowAssignment } from '@/api/entities';
import { AssignmentOccurrence } from '@/api/entities';
import { Task } from '@/api/entities';
import { WorkflowTemplate } from '@/api/entities';
import { Employee } from '@/api/entities';
import { EmployeeRole } from '@/api/entities';

import { useModal } from '@/components/hooks/use-modal';
import AssignmentFormModal from '@/components/workflows/AssignmentFormModal';
import { generateOccurrences } from '@/components/workflows/schedule-utils';


export default function AssignmentsTab({ organization }) {
  const [assignments, setAssignments] = useState([]);
  const [templates, setTemplates] = useState({});
  const [employees, setEmployees] = useState({});
  const [roles, setRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const { showModal } = useModal();

  const loadData = useCallback(async () => {
    if (!organization?.id) return;
    setLoading(true);
    try {
      const [assData, tplData, empData, roleData] = await Promise.all([
        WorkflowAssignment.filter({ organization_id: organization.id }),
        WorkflowTemplate.filter({ organization_id: organization.id }),
        Employee.filter({ organization_id: organization.id }),
        EmployeeRole.filter({ organization_id: organization.id }),
      ]);
      setAssignments(assData);
      setTemplates(Object.fromEntries(tplData.map(t => [t.id, t])));
      setEmployees(Object.fromEntries(empData.map(e => [e.id, e])));
      setRoles(Object.fromEntries(roleData.map(r => [r.id, r])));
    } catch (error) {
      console.error("Failed to load assignments data", error);
      toast.error("Failed to load assignments data.");
    } finally {
      setLoading(false);
    }
  }, [organization]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const handleCreate = () => {
    showModal(AssignmentFormModal, { onSave: loadData });
  };
  
  const handleEdit = (assignment) => {
    showModal(AssignmentFormModal, { assignment, onSave: loadData });
  };
  
  const handleToggleStatus = async (assignment) => {
    const newStatus = assignment.status === 'active' ? 'paused' : 'active';
    try {
      await WorkflowAssignment.update(assignment.id, { status: newStatus });
      toast.success(`Assignment ${newStatus}.`);
      loadData();
    } catch (error) {
      toast.error("Failed to update assignment status.");
    }
  };

  const handleGenerateTasks = async () => {
    setIsGenerating(true);
    toast.info("Checking for due assignments and generating tasks...");
    
    const now = new Date();
    let tasksCreatedCount = 0;

    const occurrencesFromDB = await AssignmentOccurrence.filter({
        organization_id: organization.id,
        status: 'pending'
    });
    
    // Create a Set for quick lookups of existing occurrences
    const existingOccurrences = new Set(
        occurrencesFromDB.map(o => `${o.assignment_id}-${o.scheduled_for}`)
    );

    for (const assignment of assignments) {
      if (assignment.status !== 'active') continue;
      
      // Generate next few occurrences to see if any are due
      const potentialOccurrences = generateOccurrences(assignment, 30);

      for (const scheduled_for of potentialOccurrences) {
        if (scheduled_for > now) continue;

        const occurrenceKey = `${assignment.id}-${scheduled_for.toISOString()}`;
        if (existingOccurrences.has(occurrenceKey)) continue;

        // Create Occurrence and Task
        try {
            const due_at = new Date(scheduled_for.getTime() + assignment.due_in_minutes * 60000);
            const template = templates[assignment.workflow_template_id];
            
            const newOccurrence = await AssignmentOccurrence.create({
                assignment_id: assignment.id,
                organization_id: organization.id,
                location_id: assignment.location_id,
                scheduled_for: scheduled_for.toISOString(),
                due_at: due_at.toISOString(),
                status: 'pending'
            });

            const newTask = await Task.create({
                organization_id: organization.id,
                location_id: assignment.location_id,
                workflow_template_id: assignment.workflow_template_id,
                employee_id: assignment.assignee_type === 'employee' ? assignment.assignee_id : null,
                title: template?.name || "Scheduled Task",
                description: template?.description,
                status: 'assigned',
                priority: assignment.priority,
                due_date: due_at.toISOString(),
                steps: template?.steps || [],
                assignment_occurrence_id: newOccurrence.id,
            });

            await AssignmentOccurrence.update(newOccurrence.id, { generated_task_id: newTask.id });
            tasksCreatedCount++;
        } catch (error) {
            console.error(`Failed to generate task for assignment ${assignment.id}`, error);
            toast.error(`Failed to generate task for "${templates[assignment.workflow_template_id]?.name}"`);
        }
      }
    }

    if (tasksCreatedCount > 0) {
        toast.success(`${tasksCreatedCount} new scheduled tasks have been created.`);
    } else {
        toast.info("No new tasks were due to be created.");
    }
    setIsGenerating(false);
  };
  
  const getAssigneeName = (assignment) => {
    if (assignment.assignee_type === 'employee') {
      return employees[assignment.assignee_id]?.name || 'Unknown Employee';
    }
    return roles[assignment.assignee_id]?.role_display_name || 'Unknown Role';
  };

  const getNextOccurrenceDate = (assignment) => {
      const [nextDate] = generateOccurrences(assignment, 1);
      return nextDate;
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Workflow Assignments</CardTitle>
            <CardDescription>Manage and schedule all recurring workflows for your organization.</CardDescription>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" onClick={handleGenerateTasks} disabled={isGenerating}>
                {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Bot className="w-4 h-4 mr-2"/>}
                Generate Due Tasks
            </Button>
            <Button onClick={handleCreate}>
                <Plus className="w-4 h-4 mr-2" />
                New Assignment
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="p-2 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-r-lg">
            <h4 className="font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4"/>Automation Note</h4>
            <p className="text-sm">In a live environment, tasks are generated automatically. Click "Generate Due Tasks" to simulate this process for any assignments that are scheduled to start.</p>
        </div>
        
        <Table className="mt-4">
          <TableHeader>
            <TableRow>
              <TableHead>Workflow</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Next Due</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto my-8" /></TableCell></TableRow>
            ) : assignments.map(assignment => {
                const nextDate = getNextOccurrenceDate(assignment);
                return (
                    <TableRow key={assignment.id}>
                        <TableCell className="font-medium">{templates[assignment.workflow_template_id]?.name || 'Unknown Workflow'}</TableCell>
                        <TableCell>{getAssigneeName(assignment)}</TableCell>
                        <TableCell className="capitalize">{assignment.schedule_type.replace('_', ' ')}</TableCell>
                        <TableCell>
                            {nextDate ? formatDistanceToNowStrict(nextDate, { addSuffix: true }) : 'N/A'}
                        </TableCell>
                        <TableCell>
                            <Badge variant={assignment.status === 'active' ? 'default' : 'secondary'} className={assignment.status === 'active' ? 'bg-green-100 text-green-800' : ''}>
                                {assignment.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="w-4 h-4" /></Button></DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    <DropdownMenuItem onClick={() => handleEdit(assignment)}><Edit className="w-4 h-4 mr-2"/>Edit</DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleToggleStatus(assignment)}>
                                        {assignment.status === 'active' ? <><Pause className="w-4 h-4 mr-2"/>Pause</> : <><Play className="w-4 h-4 mr-2"/>Resume</>}
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </TableCell>
                    </TableRow>
                )
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}