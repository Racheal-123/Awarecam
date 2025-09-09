import React, { useState } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from 'date-fns';
import { Clock, User, Shield, Video, Image as ImageIcon, PenSquare, Paperclip, QrCode, Play, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

import TaskRunner from '@/components/tasks/TaskRunner';
import ApprovalPanel from '@/components/tasks/ApprovalPanel';
import ExceptionModal from '@/components/tasks/ExceptionModal';
import { TaskException } from '@/api/entities';
import { User as UserEntity } from '@/api/entities';

export default function TaskDetails({ task, employee, workflow, onClose, onUpdate, currentUser, userRole }) {
    const [showRunner, setShowRunner] = useState(false);
    const [showExceptionModal, setShowExceptionModal] = useState(false);
    const [exceptions, setExceptions] = useState([]);
    const [exceptionsLoading, setExceptionsLoading] = useState(true);

    React.useEffect(() => {
        if (task?.id) {
            loadExceptions();
        }
    }, [task?.id]);

    const loadExceptions = async () => {
        if (!task?.id) return;
        try {
            const taskExceptions = await TaskException.filter({ task_id: task.id });
            setExceptions(taskExceptions);
        } catch (error) {
            console.error('Failed to load exceptions:', error);
        } finally {
            setExceptionsLoading(false);
        }
    };

    if (!task) return null;
    
    const isExecutable = task.status === 'assigned' || task.status === 'in_progress' || task.status === 'pending';
    const canApprove = userRole && (userRole.role_name === 'manager' || userRole.role_name === 'organization_admin' || userRole.role_name === 'supervisor');
    const hasUnresolvedExceptions = exceptions.some(ex => ex.resolution_required && !ex.resolved);

    const getEvidenceIcon = (type) => {
        switch (type) {
            case 'photo': return <ImageIcon className="w-4 h-4 text-blue-600" />;
            case 'video': return <Video className="w-4 h-4 text-rose-600" />;
            case 'signature': return <PenSquare className="w-4 h-4 text-amber-600" />;
            case 'checklist_item': return null;
            default: return <Paperclip className="w-4 h-4 text-slate-500" />;
        }
    };

    const getExceptionIcon = (type) => {
        switch (type) {
            case 'safety_concern': return <AlertTriangle className="w-4 h-4 text-red-600" />;
            case 'equipment_failure': return <Shield className="w-4 h-4 text-orange-600" />;
            default: return <AlertTriangle className="w-4 h-4 text-amber-600" />;
        }
    };

    const handleCloseRunner = () => {
        setShowRunner(false);
        if (onUpdate) {
            onUpdate();
        }
    };

    const handleApprovalChange = (newStatus, approval) => {
        // Handle approval status change
        if (onUpdate) {
            onUpdate();
        }
    };

    const handleExceptionCreated = (exception) => {
        setExceptions(prev => [...prev, exception]);
        if (onUpdate) {
            onUpdate();
        }
    };

    return (
        <>
            <Drawer open={!!task && !showRunner} onOpenChange={(open) => !open && onClose()}>
                <DrawerContent className="max-h-[90vh]">
                    <DrawerHeader className="flex-shrink-0">
                        <DrawerTitle className="flex items-center gap-2">
                            {task.title}
                            {hasUnresolvedExceptions && (
                                <Badge className="bg-red-100 text-red-800">
                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                    Has Exceptions
                                </Badge>
                            )}
                        </DrawerTitle>
                        <DrawerDescription>
                            Assigned to: {employee?.name || 'Unassigned'}
                            {task.due_date && ` • Due: ${format(new Date(task.due_date), 'PPp')}`}
                        </DrawerDescription>
                    </DrawerHeader>
                    
                    <div className="p-4 flex-1 overflow-y-auto">
                        <Tabs defaultValue="details">
                            <TabsList className="grid w-full grid-cols-4">
                                <TabsTrigger value="details">Details</TabsTrigger>
                                <TabsTrigger value="evidence">Evidence</TabsTrigger>
                                <TabsTrigger value="exceptions" className="relative">
                                    Exceptions
                                    {exceptions.length > 0 && (
                                        <Badge className="ml-1 h-5 w-5 p-0 text-xs bg-red-500">{exceptions.length}</Badge>
                                    )}
                                </TabsTrigger>
                                <TabsTrigger value="validation">QR Code</TabsTrigger>
                            </TabsList>

                            <TabsContent value="details" className="pt-4">
                                <div className="space-y-4">
                                    <p className="text-slate-700">{task.description || "No description provided."}</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><Badge>{task.status}</Badge></div>
                                        <div>Priority: <Badge variant="outline">{task.priority}</Badge></div>
                                        <div>Workflow: {workflow?.name || 'Manual Task'}</div>
                                    </div>

                                    {/* Approval Panel */}
                                    {task.requires_approval && (
                                        <ApprovalPanel
                                            task={task}
                                            currentUser={currentUser}
                                            canApprove={canApprove}
                                            onApprovalChange={handleApprovalChange}
                                        />
                                    )}

                                    <h4 className="font-semibold pt-4 border-t flex items-center justify-between">
                                        Steps
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowExceptionModal(true)}
                                            className="text-amber-600 border-amber-200 hover:bg-amber-50"
                                        >
                                            <AlertTriangle className="w-4 h-4 mr-2" />
                                            Report Exception
                                        </Button>
                                    </h4>
                                    <ul className="space-y-2">
                                        {task.steps?.map((step, i) => (
                                            <li key={i} className="flex items-center gap-2 p-2 bg-slate-50 rounded-md">
                                                <Shield className="w-4 h-4 text-slate-400 flex-shrink-0" />
                                                <span className="flex-1">{step.title}</span>
                                                <Badge variant={step.status === 'completed' ? 'default' : 'secondary'} className={step.status === 'completed' ? 'bg-green-100 text-green-800' : ''}>{step.status}</Badge>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </TabsContent>

                            <TabsContent value="evidence" className="pt-4">
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="font-semibold mb-2">Collected Evidence</h4>
                                        <div className="space-y-2">
                                            {task.steps?.flatMap(s => s.evidence?.filter(e => e.type !== 'checklist_item')).map((e, i) => e && (
                                                <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded-md">
                                                    <div className="flex items-center gap-2">
                                                        {getEvidenceIcon(e.type)}
                                                        <span className="font-medium capitalize">{e.type}: </span>
                                                        <a href={e.value} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate max-w-xs">{e.value}</a>
                                                    </div>
                                                    <span className="text-xs text-slate-500">{format(new Date(e.timestamp), 'p')}</span>
                                                </div>
                                            ))}
                                            {task.steps?.flatMap(s => s.evidence?.filter(e => e.type !== 'checklist_item')).length === 0 && <p className="text-slate-500 text-sm">No evidence files collected yet.</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">History Log</h4>
                                        <div className="space-y-1 max-h-60 overflow-y-auto p-2 border rounded-md bg-slate-50">
                                            {task.history?.slice().reverse().map((h, i) => (
                                                <div key={i} className="flex items-start gap-2 text-sm">
                                                    <Clock className="w-3 h-3 text-slate-400 mt-1 flex-shrink-0"/>
                                                    <p>
                                                        <span className="text-slate-500">{format(new Date(h.timestamp), 'PPp')}:</span>
                                                        <span className="font-medium ml-1">{h.action}</span>
                                                    </p>
                                                </div>
                                            ))}
                                            {!task.history?.length && <p className="text-slate-500 text-sm">No history yet.</p>}
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>

                            <TabsContent value="exceptions" className="pt-4">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-semibold">Task Exceptions</h4>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowExceptionModal(true)}
                                            className="text-amber-600 border-amber-200 hover:bg-amber-50"
                                        >
                                            <AlertTriangle className="w-4 h-4 mr-2" />
                                            Report New Exception
                                        </Button>
                                    </div>

                                    {exceptionsLoading ? (
                                        <div className="text-center py-8">Loading exceptions...</div>
                                    ) : exceptions.length === 0 ? (
                                        <div className="text-center py-8 text-slate-500">
                                            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                                            <p>No exceptions reported for this task</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {exceptions.map((exception, i) => (
                                                <div key={exception.id} className="p-4 border rounded-lg bg-white">
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {getExceptionIcon(exception.exception_type)}
                                                            <div>
                                                                <h5 className="font-medium capitalize">
                                                                    {exception.exception_type.replace('_', ' ')}
                                                                </h5>
                                                                <Badge className={
                                                                    exception.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                                                    exception.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                                                                    exception.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                                    'bg-blue-100 text-blue-800'
                                                                }>
                                                                    {exception.severity}
                                                                </Badge>
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-xs text-slate-500">
                                                                {format(new Date(exception.created_date), 'PPp')}
                                                            </p>
                                                            {exception.resolved ? (
                                                                <Badge className="bg-green-100 text-green-800">
                                                                    <CheckCircle className="w-3 h-3 mr-1" />
                                                                    Resolved
                                                                </Badge>
                                                            ) : exception.resolution_required ? (
                                                                <Badge className="bg-red-100 text-red-800">
                                                                    <XCircle className="w-3 h-3 mr-1" />
                                                                    Needs Resolution
                                                                </Badge>
                                                            ) : null}
                                                        </div>
                                                    </div>
                                                    <p className="mt-2 text-sm text-slate-700">{exception.description}</p>
                                                    {exception.photo_url && (
                                                        <div className="mt-2">
                                                            <img
                                                                src={exception.photo_url}
                                                                alt="Exception evidence"
                                                                className="max-w-full h-32 object-cover rounded border"
                                                            />
                                                        </div>
                                                    )}
                                                    {exception.resolution_notes && (
                                                        <div className="mt-2 p-2 bg-green-50 rounded border">
                                                            <p className="text-sm">
                                                                <strong>Resolution:</strong> {exception.resolution_notes}
                                                            </p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="validation" className="pt-4 text-center">
                                <div className="p-8 border-2 border-dashed rounded-lg">
                                    <QrCode className="mx-auto h-24 w-24 text-gray-400"/>
                                    <h3 className="mt-4 text-lg font-medium text-gray-900">QR Code Validation</h3>
                                    <p className="mt-1 text-sm text-gray-500">Display a QR code for a user to scan to start or validate this task. Feature coming soon.</p>
                                    <p className="font-mono bg-slate-100 p-2 rounded-md mt-4">{task.qr_token || 'No token generated'}</p>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                    
                    <DrawerFooter className="border-t flex-shrink-0">
                        {isExecutable && (
                            <Button 
                                onClick={() => setShowRunner(true)}
                                disabled={hasUnresolvedExceptions}
                            >
                                <Play className="w-4 h-4 mr-2"/>
                                {task.status === 'in_progress' ? 'Continue Task' : 'Start Task'}
                            </Button>
                        )}
                        {hasUnresolvedExceptions && (
                            <p className="text-sm text-red-600 text-center">
                                <AlertTriangle className="w-4 h-4 inline mr-1" />
                                Cannot continue until exceptions are resolved
                            </p>
                        )}
                        <DrawerClose asChild><Button variant="outline">Close</Button></DrawerClose>
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>
            
            {task && (
                <TaskRunner
                    isOpen={showRunner}
                    task={task}
                    onClose={handleCloseRunner}
                    onUpdate={onUpdate}
                />
            )}

            {showExceptionModal && (
                <ExceptionModal
                    task={task}
                    step={null}
                    onClose={() => setShowExceptionModal(false)}
                    onExceptionCreated={handleExceptionCreated}
                />
            )}
        </>
    );
}