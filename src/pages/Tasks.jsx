import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, List, LayoutGrid, Users, CheckCircle, AlertTriangle, FileDown, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { Task } from '@/api/entities';
import { Employee } from '@/api/entities';
import { WorkflowTemplate } from '@/api/entities';
import { EmployeeRole } from '@/api/entities';
import { useLocationContext } from '@/components/shared/LocationContext';
import { User } from '@/api/entities';
import { toast } from 'sonner';

import TaskBoard from '@/components/tasks/TaskBoard';
import TaskList from '@/components/tasks/TaskList';
import TaskDetails from '@/components/tasks/TaskDetails';
import SelectTemplateModal from '@/components/tasks/SelectTemplateModal';
import TaskForm from '@/components/tasks/TaskForm';

// Helper to export data to CSV
const exportToCsv = (filename, rows) => {
    if (!rows || !rows.length) {
        return;
    }
    const separator = ',';
    const keys = Object.keys(rows[0]);
    const csvContent =
        keys.join(separator) +
        '\n' +
        rows.map(row => {
            return keys.map(k => {
                let cell = row[k] === null || row[k] === undefined ? '' : row[k];
                cell = cell instanceof Date
                    ? cell.toLocaleString()
                    : cell.toString().replace(/"/g, '""');
                if (cell.search(/("|,|\n)/g) >= 0) {
                    cell = `"${cell}"`;
                }
                return cell;
            }).join(separator);
        }).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};


export default function TasksPage() {
    const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'
    const [tasks, setTasks] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [workflows, setWorkflows] = useState([]);
    const [employeeRoles, setEmployeeRoles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showTaskForm, setShowTaskForm] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    const [searchTerm, setSearchTerm] = useState('');
    
    const { getLocationFilter } = useLocationContext();

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const locationFilter = getLocationFilter();
            const [taskData, employeeData, workflowData, roleData] = await Promise.all([
                Task.filter(locationFilter),
                Employee.filter(locationFilter),
                WorkflowTemplate.list(),
                EmployeeRole.list()
            ]);

            const tasksWithDetails = taskData.map(task => ({
                ...task,
                employee: employeeData.find(e => e.id === task.employee_id),
                workflow: workflowData.find(w => w.id === task.workflow_template_id),
            }));

            setTasks(tasksWithDetails);
            setEmployees(employeeData);
            setWorkflows(workflowData);
            setEmployeeRoles(roleData);
        } catch (error) {
            console.error('Error loading task data:', error);
        } finally {
            setLoading(false);
        }
    }, [getLocationFilter]);

    useEffect(() => {
        loadData();
    }, [loadData]);
    
    const handleDragEnd = async (result) => {
        const { destination, source, draggableId } = result;
        if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
            return;
        }
        
        const task = tasks.find(t => t.id === draggableId);
        if (task && task.status !== destination.droppableId) {
            const updatedTasks = tasks.map(t => 
                t.id === draggableId ? { ...t, status: destination.droppableId } : t
            );
            setTasks(updatedTasks);
            await Task.update(draggableId, { status: destination.droppableId });
        }
    };

    const handleCreateFromTemplate = (template) => {
        setSelectedTemplate(template);
        setShowCreateModal(false);
        setShowTaskForm(true);
    };

    const handleTaskSubmit = async (taskData) => {
        try {
            await Task.create(taskData);
            toast.success("Task created successfully!");
            setShowTaskForm(false);
            setSelectedTemplate(null);
            loadData();
        } catch (error) {
            console.error("Failed to create task:", error);
            toast.error("An error occurred while creating the task.");
        }
    };

    const handleFormComplete = () => {
        setShowTaskForm(false);
        setSelectedTemplate(null);
        loadData();
    };

    const filteredTasks = tasks.filter(task => 
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.employee?.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getStats = () => ({
        total: tasks.length,
        completed: tasks.filter(t => t.status === 'completed' || t.status === 'verified').length,
        overdue: tasks.filter(t => t.status === 'overdue' || (t.due_date && new Date(t.due_date) < new Date())).length,
    });

    const stats = getStats();
    
    const handleExport = () => {
        const dataToExport = filteredTasks.map(task => ({
            ID: task.id,
            Title: task.title,
            Status: task.status,
            Priority: task.priority,
            DueDate: task.due_date ? format(new Date(task.due_date), 'yyyy-MM-dd') : '',
            Employee: task.employee?.name || 'Unassigned',
            Workflow: task.workflow?.name || 'Manual',
            Location: task.location_id,
        }));
        exportToCsv('tasks_export.csv', dataToExport);
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Task Management</h1>
                    <p className="text-slate-600 mt-2">Oversee, assign, and track all operational tasks.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" onClick={handleExport}><FileDown className="w-4 h-4 mr-2" /> Export CSV</Button>
                    <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="w-5 h-5 mr-2" /> New Task
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="text-blue-500" /> Total Tasks</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{stats.total}</CardContent></Card>
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><CheckCircle className="text-green-500" /> Completed</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{stats.completed}</CardContent></Card>
                <Card><CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="text-red-500" /> Overdue</CardTitle></CardHeader><CardContent className="text-3xl font-bold">{stats.overdue}</CardContent></Card>
            </div>
            
            <Card>
                <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="relative flex-1 w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"/>
                        <Input placeholder="Search by task or employee..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10"/>
                    </div>
                    <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-lg">
                        <Button variant={viewMode === 'board' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('board')} className="flex items-center gap-1"><LayoutGrid className="w-4 h-4"/> Board</Button>
                        <Button variant={viewMode === 'list' ? 'primary' : 'ghost'} size="sm" onClick={() => setViewMode('list')} className="flex items-center gap-1"><List className="w-4 h-4"/> List</Button>
                    </div>
                </CardContent>
            </Card>

            <AnimatePresence mode="wait">
                <motion.div
                    key={viewMode}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                >
                    {loading ? (
                        <p>Loading tasks...</p>
                    ) : viewMode === 'board' ? (
                        <TaskBoard tasks={filteredTasks} onTaskClick={setSelectedTask} onDragEnd={handleDragEnd} />
                    ) : (
                        <TaskList tasks={filteredTasks} onTaskClick={setSelectedTask} />
                    )}
                </motion.div>
            </AnimatePresence>

            {selectedTask && (
                <TaskDetails
                    task={selectedTask}
                    employee={employees.find(e => e.id === selectedTask.employee_id)}
                    workflow={workflows.find(w => w.id === selectedTask.workflow_template_id)}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={loadData}
                />
            )}
            
            {showCreateModal && (
                <SelectTemplateModal
                    templates={workflows}
                    onSelect={handleCreateFromTemplate}
                    onClose={() => setShowCreateModal(false)}
                    onManualCreate={() => { setShowCreateModal(false); setShowTaskForm(true); setSelectedTemplate(null); }}
                />
            )}
            
            {showTaskForm && (
                <TaskForm
                    workflowTemplate={selectedTemplate}
                    onComplete={handleTaskSubmit}
                    onCancel={() => { setShowTaskForm(false); setSelectedTemplate(null); }}
                />
            )}
        </div>
    );
}