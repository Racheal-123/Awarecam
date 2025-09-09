import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    ArrowLeft, Loader2, User, Shield, Paperclip, Send, Clock, UserCheck, Building, DollarSign,
    Camera, Server, Cpu, CheckCircle, AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format, formatDistanceToNow } from 'date-fns';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

// Mock Data
const mockTicket = {
    id: 'tkt_004',
    ticket_number: 'TKT-2024-004',
    title: 'URGENT: All camera feeds are down across our main warehouse',
    description: 'We have lost video feed for all 25 cameras at our primary logistics center. This is a critical failure impacting our entire operation. We need immediate assistance to restore service. We have already tried rebooting the main gateway to no avail.',
    priority: 'urgent',
    status: 'open',
    category: 'technical',
    created_date: new Date(Date.now() - 3600000 * 1).toISOString(),
    updated_date: new Date(Date.now() - 3600000 * 1).toISOString(),
    user: { id: 'usr_01', name: 'John Carter', email: 'john.carter@dynamiclog.com' },
    agent: null,
    organization: {
        id: 'org_dyn',
        name: 'Dynamic Logistics',
        plan: 'Enterprise',
        billingStatus: 'Current',
        mrr: 2500,
        usage: {
            cameras: { used: 25, limit: 100 },
            storage: { used: 18, limit: 20 },
            ai: { used: 4800, limit: 5000 }
        }
    }
};

const mockMessages = [
    { id: 1, userId: 'usr_01', userName: 'John Carter', isAgent: false, content: 'We have lost video feed for all 25 cameras...', timestamp: new Date(Date.now() - 3600000 * 1).toISOString(), type: 'customer' },
];

const mockAgents = [
    { id: 'agt_01', name: 'Alex Ray' },
    { id: 'agt_02', name: 'Jordan Patel' },
    { id: 'agt_03', name: 'Casey Morgan' },
];

export default function AdminTicketDetails() {
    const [ticket, setTicket] = useState(mockTicket);
    const [messages, setMessages] = useState(mockMessages);
    const [newReply, setNewReply] = useState('');
    const [note, setNote] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpdate = (field, value) => {
        setTicket(prev => ({ ...prev, [field]: value }));
        // In a real app, this would trigger a DB update.
    };
    
    const handleAddReply = (type) => {
        const content = type === 'reply' ? newReply : note;
        if (!content.trim()) return;

        const newMessage = {
            id: messages.length + 1,
            userId: 'current_admin_id',
            userName: 'Support Agent',
            isAgent: true,
            content,
            timestamp: new Date().toISOString(),
            type: type === 'reply' ? 'agent' : 'internal',
        };

        setMessages(prev => [...prev, newMessage]);
        if (type === 'reply') setNewReply('');
        if (type === 'note') setNote('');
    };

    return (
        <div className="p-6 space-y-6">
            <Link to={createPageUrl("AdminSupport")} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                <ArrowLeft className="w-4 h-4" />
                Back to Ticket Queue
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    <TicketHeader ticket={ticket} onUpdate={handleUpdate} agents={mockAgents} />
                    <MessageThread messages={messages} />
                    <ResponseComposer 
                        newReply={newReply} setNewReply={setNewReply}
                        note={note} setNote={setNote}
                        onAddReply={handleAddReply}
                    />
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    <CustomerContextPanel organization={ticket.organization} />
                </div>
            </div>
        </div>
    );
}

function TicketHeader({ ticket, onUpdate, agents }) {
    const priorityConfig = {
        low: 'border-slate-300 bg-slate-50 text-slate-700',
        medium: 'border-blue-300 bg-blue-50 text-blue-700',
        high: 'border-orange-300 bg-orange-50 text-orange-700',
        urgent: 'border-red-300 bg-red-50 text-red-700',
    };
    const statusConfig = {
        open: 'border-blue-300 bg-blue-50 text-blue-700',
        in_progress: 'border-yellow-300 bg-yellow-50 text-yellow-700',
        waiting_customer: 'border-purple-300 bg-purple-50 text-purple-700',
        resolved: 'border-green-300 bg-green-50 text-green-700',
        closed: 'border-slate-300 bg-slate-50 text-slate-700',
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardDescription>#{ticket.ticket_number}</CardDescription>
                        <CardTitle className="text-2xl mt-1">{ticket.title}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                         <Select value={ticket.priority} onValueChange={v => onUpdate('priority', v)}>
                            <SelectTrigger className={`w-32 font-semibold ${priorityConfig[ticket.priority]}`}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={ticket.status} onValueChange={v => onUpdate('status', v)}>
                            <SelectTrigger className={`w-40 font-semibold ${statusConfig[ticket.status]}`}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="waiting_customer">Waiting for Customer</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                 <div className="text-sm text-slate-500 pt-2 border-t mt-4">
                    Created by {ticket.user.name} &bull; {formatDistanceToNow(new Date(ticket.created_date), { addSuffix: true })}
                </div>
            </CardHeader>
        </Card>
    );
}

function MessageThread({ messages }) {
    return (
        <Card>
            <CardContent className="p-6 space-y-6">
                {messages.map(msg => (
                    <div key={msg.id} className={`flex items-start gap-4 ${msg.isAgent ? 'flex-row-reverse' : ''}`}>
                        <Avatar>
                            <AvatarFallback>{msg.userName.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className={`p-4 rounded-lg w-full max-w-2xl ${msg.type === 'internal' ? 'bg-amber-100 border border-amber-200' : msg.isAgent ? 'bg-slate-100' : 'bg-blue-50'}`}>
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-semibold">{msg.userName} {msg.type === 'internal' && <span className="text-amber-700 text-xs font-normal">(Internal Note)</span>}</span>
                                <span className="text-xs text-slate-500">{formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}</span>
                            </div>
                            <p className="text-slate-800 whitespace-pre-wrap">{msg.content}</p>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

function ResponseComposer({ newReply, setNewReply, note, setNote, onAddReply }) {
    return (
         <Card>
            <Tabs defaultValue="reply">
                <CardHeader>
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="reply">Reply to Customer</TabsTrigger>
                        <TabsTrigger value="note">Add Internal Note</TabsTrigger>
                    </TabsList>
                </CardHeader>
                <CardContent>
                    <TabsContent value="reply">
                         <ReactQuill value={newReply} onChange={setNewReply} className="h-40 mb-12" />
                         <div className="flex justify-end mt-4">
                            <Button onClick={() => onAddReply('reply')}><Send className="w-4 h-4 mr-2" />Send Reply</Button>
                         </div>
                    </TabsContent>
                    <TabsContent value="note">
                         <Textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Type an internal note for your team..." className="h-40"/>
                         <div className="flex justify-end mt-4">
                            <Button onClick={() => onAddReply('note')} variant="secondary">Add Note</Button>
                         </div>
                    </TabsContent>
                </CardContent>
            </Tabs>
         </Card>
    );
}

function CustomerContextPanel({ organization }) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Building className="w-5 h-5" /> Organization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="font-semibold text-lg">{organization.name}</div>
                    <p><Badge variant="secondary">{organization.plan}</Badge></p>
                    <p><span className="font-medium">Billing:</span> {organization.billingStatus}</p>
                    <p><span className="font-medium">MRR:</span> ${organization.mrr.toLocaleString()}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Server className="w-5 h-5" /> Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <UsageBar label="Cameras" used={organization.usage.cameras.used} limit={organization.usage.cameras.limit} />
                    <UsageBar label="Storage" used={organization.usage.storage.used} limit={organization.usage.storage.limit} unit="TB" />
                    <UsageBar label="AI Credits" used={organization.usage.ai.used} limit={organization.usage.ai.limit} />
                </CardContent>
            </Card>
        </div>
    );
}

const UsageBar = ({ label, used, limit, unit = '' }) => {
    const percentage = limit > 0 ? (used / limit) * 100 : 0;
    const color = percentage > 90 ? 'bg-red-500' : percentage > 75 ? 'bg-orange-500' : 'bg-blue-500';
    return (
        <div>
            <div className="flex justify-between mb-1">
                <span className="font-medium">{label}</span>
                <span className="text-slate-500">{used}{unit} / {limit}{unit}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    )
};