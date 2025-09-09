import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { CheckCircle, XCircle, Clock, AlertTriangle, User, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { TaskApproval } from '@/api/entities';
import { User as UserEntity } from '@/api/entities';

export default function ApprovalPanel({ task, onApprovalChange, currentUser, canApprove = false }) {
    const [approval, setApproval] = useState(null);
    const [approver, setApprover] = useState(null);
    const [notes, setNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadApprovalData();
    }, [task?.id]);

    const loadApprovalData = async () => {
        if (!task?.id) return;
        try {
            const approvals = await TaskApproval.filter({ task_id: task.id });
            if (approvals.length > 0) {
                const approval = approvals[0];
                setApproval(approval);
                
                if (approval.approver_id) {
                    const approverUser = await UserEntity.get(approval.approver_id);
                    setApprover(approverUser);
                }
            }
        } catch (error) {
            console.error('Failed to load approval data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApproval = async (decision) => {
        if (!approval) return;
        setIsSubmitting(true);
        
        try {
            const updatedApproval = await TaskApproval.update(approval.id, {
                status: decision,
                approver_id: currentUser.id,
                approved_at: new Date().toISOString(),
                notes: notes.trim() || null
            });

            // Update the task status based on approval decision
            const newTaskStatus = decision === 'approved' ? 'completed' : 'rejected';
            // Note: This would typically be handled by the parent component
            if (onApprovalChange) {
                onApprovalChange(newTaskStatus, updatedApproval);
            }

            toast.success(`Task ${decision} successfully`);
            await loadApprovalData();
            setNotes('');
        } catch (error) {
            console.error('Failed to process approval:', error);
            toast.error('Failed to process approval');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6">
                    <div className="animate-pulse flex space-x-4">
                        <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                        <div className="flex-1 space-y-2">
                            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!approval) {
        return null; // Task doesn't require approval
    }

    const getStatusIcon = () => {
        switch (approval.status) {
            case 'approved':
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case 'rejected':
                return <XCircle className="w-5 h-5 text-red-600" />;
            default:
                return <Clock className="w-5 h-5 text-amber-600" />;
        }
    };

    const getStatusColor = () => {
        switch (approval.status) {
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-amber-100 text-amber-800';
        }
    };

    const isOverdue = approval.status === 'required' && 
        new Date() > new Date(new Date(task.created_date).getTime() + (approval.timeout_minutes * 60 * 1000));

    return (
        <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    {getStatusIcon()}
                    Supervisor Approval
                    <Badge className={getStatusColor()}>
                        {approval.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    {isOverdue && (
                        <Badge className="bg-red-100 text-red-800 ml-2">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Overdue
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="text-sm text-slate-600">
                    <p>Required approval level: <span className="font-medium capitalize">{approval.required_role}</span></p>
                    {approval.escalation_level > 0 && (
                        <p className="text-amber-600">
                            <AlertTriangle className="w-4 h-4 inline mr-1" />
                            Escalated {approval.escalation_level} time(s)
                        </p>
                    )}
                </div>

                {approval.status !== 'required' && approver && (
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <Avatar>
                            <AvatarContent src={approver.photo_url} />
                            <AvatarFallback>
                                <User className="w-4 h-4" />
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-medium">{approver.full_name}</p>
                            <p className="text-sm text-slate-600">
                                {approval.status === 'approved' ? 'Approved' : 'Rejected'} on{' '}
                                {format(new Date(approval.approved_at), 'PPp')}
                            </p>
                            {approval.notes && (
                                <div className="mt-2 p-2 bg-white rounded border">
                                    <div className="flex items-start gap-2">
                                        <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5" />
                                        <p className="text-sm">{approval.notes}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {approval.status === 'required' && canApprove && (
                    <div className="space-y-4 p-4 bg-blue-50 rounded-lg border">
                        <div>
                            <label className="text-sm font-medium text-slate-700 mb-2 block">
                                Approval Notes (Optional)
                            </label>
                            <Textarea
                                placeholder="Add any comments about this task approval..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                rows={3}
                            />
                        </div>
                        <div className="flex gap-3">
                            <Button
                                onClick={() => handleApproval('approved')}
                                disabled={isSubmitting}
                                className="bg-green-600 hover:bg-green-700 flex-1"
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approve Task
                            </Button>
                            <Button
                                onClick={() => handleApproval('rejected')}
                                disabled={isSubmitting}
                                variant="destructive"
                                className="flex-1"
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Reject Task
                            </Button>
                        </div>
                    </div>
                )}

                {approval.status === 'required' && !canApprove && (
                    <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <p className="text-amber-800 text-sm">
                            <Clock className="w-4 h-4 inline mr-2" />
                            This task is awaiting approval from a {approval.required_role}. 
                            You don't have permission to approve this task.
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}