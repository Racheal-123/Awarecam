import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, AlertTriangle, Shield, Clock, CheckCircle } from 'lucide-react';
import { formatDistanceToNow, differenceInHours } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const mockTickets = [
    { id: 'tkt_001', orgName: 'Innovate Corp', title: 'Cannot connect new IP camera', category: 'technical', priority: 'high', status: 'open', created_at: new Date(Date.now() - 3600000 * 2), last_message_at: new Date(Date.now() - 3600000), agent: null },
    { id: 'tkt_002', orgName: 'HealthWell Clinic', title: 'Billing discrepancy on last invoice', category: 'billing', priority: 'medium', status: 'in_progress', created_at: new Date(Date.now() - 3600000 * 8), last_message_at: new Date(Date.now() - 3600000 * 3), agent: 'Alex Ray' },
    { id: 'tkt_003', orgName: 'Sunrise Retail', title: 'Feature Request: Add support for thermal cameras', category: 'feature_request', priority: 'low', status: 'open', created_at: new Date(Date.now() - 3600000 * 24), last_message_at: new Date(Date.now() - 3600000 * 24), agent: null },
    { id: 'tkt_004', orgName: 'Dynamic Logistics', title: 'URGENT: All camera feeds are down across our main warehouse', category: 'technical', priority: 'urgent', status: 'open', created_at: new Date(Date.now() - 3600000 * 1), last_message_at: new Date(Date.now() - 3600000 * 1), agent: null },
    { id: 'tkt_005', orgName: 'Secure Warehousing', title: 'AI agent is misclassifying forklifts as people', category: 'bug_report', priority: 'high', status: 'in_progress', created_at: new Date(Date.now() - 3600000 * 16), last_message_at: new Date(Date.now() - 3600000 * 4), agent: 'Jordan Patel' },
    { id: 'tkt_006', orgName: 'Old Town Cafe', title: 'Question about setting up motion detection zones', category: 'account_setup', priority: 'medium', status: 'waiting_customer', created_at: new Date(Date.now() - 3600000 * 48), last_message_at: new Date(Date.now() - 3600000 * 20), agent: 'Casey Morgan' },
];

export default function TicketQueue() {
    const [tickets, setTickets] = useState(mockTickets);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ priority: 'all', status: 'all', agent: 'all' });

    const filteredTickets = useMemo(() => {
        return tickets.filter(ticket => {
            const searchMatch = searchTerm === '' ||
                ticket.orgName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                ticket.id.toLowerCase().includes(searchTerm.toLowerCase());
            
            const priorityMatch = filters.priority === 'all' || ticket.priority === filters.priority;
            const statusMatch = filters.status === 'all' || ticket.status === filters.status;
            const agentMatch = filters.agent === 'all' || ticket.agent === filters.agent;

            return searchMatch && priorityMatch && statusMatch && agentMatch;
        });
    }, [tickets, searchTerm, filters]);

    const handleFilterChange = (type, value) => {
        setFilters(prev => ({ ...prev, [type]: value }));
    };

    const priorityConfig = {
        low: 'bg-slate-100 text-slate-700',
        medium: 'bg-blue-100 text-blue-700',
        high: 'bg-orange-100 text-orange-700',
        urgent: 'bg-red-100 text-red-700',
    };

    const statusConfig = {
        open: 'bg-blue-100 text-blue-700',
        in_progress: 'bg-yellow-100 text-yellow-700',
        waiting_customer: 'bg-purple-100 text-purple-700',
    };

    const getSlaStatus = (ticket) => {
        const ageInHours = differenceInHours(new Date(), ticket.created_at);
        if (ticket.priority === 'urgent' && ageInHours > 4) return { text: 'Overdue', color: 'text-red-600', icon: AlertTriangle };
        if (ticket.priority === 'high' && ageInHours > 24) return { text: 'Overdue', color: 'text-red-600', icon: AlertTriangle };
        if (ticket.priority === 'urgent' && ageInHours > 2) return { text: 'At Risk', color: 'text-orange-600', icon: Shield };
        if (ticket.priority === 'high' && ageInHours > 18) return { text: 'At Risk', color: 'text-orange-600', icon: Shield };
        return { text: 'On Time', color: 'text-green-600', icon: CheckCircle };
    };

    return (
        <Card>
            <CardHeader>
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                    <div>
                        <CardTitle>Ticket Queue</CardTitle>
                        <CardDescription>View, manage, and assign all incoming support requests.</CardDescription>
                    </div>
                     <div className="flex flex-col md:flex-row gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input placeholder="Search tickets..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                        </div>
                        <Select value={filters.status} onValueChange={v => handleFilterChange('status', v)}>
                            <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Filter Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="open">Open</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="waiting_customer">Waiting for Customer</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filters.priority} onValueChange={v => handleFilterChange('priority', v)}>
                            <SelectTrigger className="w-full md:w-40"><SelectValue placeholder="Filter Priority" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priorities</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                            </SelectContent>
                        </Select>
                     </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Customer / Title</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Update</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Agent</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">SLA</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-slate-200">
                            {filteredTickets.map(ticket => {
                                const Sla = getSlaStatus(ticket);
                                return (
                                <tr key={ticket.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Link to={createPageUrl(`AdminTicketDetails?id=${ticket.id}`)} className="font-medium text-blue-600 hover:underline">{ticket.title}</Link>
                                        <div className="text-sm text-slate-500">{ticket.orgName} &bull; #{ticket.id}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap"><Badge className={`${priorityConfig[ticket.priority]} capitalize`}>{ticket.priority}</Badge></td>
                                    <td className="px-6 py-4 whitespace-nowrap"><Badge className={`${statusConfig[ticket.status]} capitalize`}>{ticket.status.replace('_', ' ')}</Badge></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{formatDistanceToNow(ticket.last_message_at, { addSuffix: true })}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-800">{ticket.agent || <span className="text-slate-400">Unassigned</span>}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className={`flex items-center gap-2 text-sm ${Sla.color}`}>
                                            <Sla.icon className="w-4 h-4" />
                                            {Sla.text}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild><Link to={createPageUrl(`AdminTicketDetails?id=${ticket.id}`)}>View Ticket</Link></DropdownMenuItem>
                                                <DropdownMenuItem>Assign Agent</DropdownMenuItem>
                                                <DropdownMenuItem>Change Status</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}