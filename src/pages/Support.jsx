
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Headphones, Search, MessageSquare, Clock, CheckCircle, BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import { SupportTicket } from '@/api/entities';
import { User } from '@/api/entities';
import CreateTicketForm from '@/components/support/CreateTicketForm';

export default function SupportPage() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [stats, setStats] = useState({ open: 0, resolved: 0, waiting: 0 });

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        setLoading(true);
        try {
            const user = await User.me();
            const userTickets = await SupportTicket.filter({ user_id: user.id }, '-updated_date');
            setTickets(userTickets);
            calculateStats(userTickets);
        } catch (error) {
            console.error("Failed to load support tickets:", error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStats = (allTickets) => {
        setStats({
            open: allTickets.filter(t => t.status === 'open' || t.status === 'in_progress').length,
            resolved: allTickets.filter(t => t.status === 'resolved' || t.status === 'closed').length,
            waiting: allTickets.filter(t => t.status === 'waiting_customer').length,
        });
    };
    
    const handleTicketCreated = () => {
        setShowCreateModal(false);
        loadTickets();
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Headphones className="w-8 h-8 text-blue-600" />
                        Support Center
                    </h1>
                    <p className="text-slate-600 mt-1">Get help, report issues, and track your requests.</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)} className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-5 h-5 mr-2" />
                    Create New Ticket
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Open Tickets" value={stats.open} icon={MessageSquare} color="orange" />
                <StatCard title="Waiting for You" value={stats.waiting} icon={Clock} color="blue" />
                <StatCard title="Resolved Tickets" value={stats.resolved} icon={CheckCircle} color="green" />
            </div>
            
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Your Tickets</CardTitle>
                        <CardDescription>A list of all support tickets you have submitted.</CardDescription>
                    </div>
                    <Link to={createPageUrl('KnowledgeBase')}>
                        <Button variant="outline">
                            <BookOpen className="w-4 h-4 mr-2" />
                            Visit Knowledge Base
                        </Button>
                    </Link>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="text-center py-8">Loading tickets...</div>
                    ) : tickets.length > 0 ? (
                        <div className="space-y-4">
                            {tickets.map(ticket => (
                                <TicketCard key={ticket.id} ticket={ticket} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-lg">
                            <Headphones className="mx-auto h-12 w-12 text-slate-300" />
                            <h3 className="mt-4 text-lg font-medium text-slate-800">No tickets found</h3>
                            <p className="mt-1 text-sm text-slate-500">Get started by creating your first support ticket.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {showCreateModal && <CreateTicketForm onClose={() => setShowCreateModal(false)} onTicketCreated={handleTicketCreated} />}
        </div>
    );
}

const StatCard = ({ title, value, icon: Icon, color }) => (
    <Card className={`border-${color}-200 bg-gradient-to-br from-${color}-50 to-white`}>
        <CardContent className="p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className={`text-sm font-medium text-${color}-700`}>{title}</p>
                    <p className="text-3xl font-bold text-slate-900">{value}</p>
                </div>
                <Icon className={`w-8 h-8 text-${color}-500`} />
            </div>
        </CardContent>
    </Card>
);

const TicketCard = ({ ticket }) => {
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
        resolved: 'bg-green-100 text-green-700',
        closed: 'bg-slate-100 text-slate-700',
    };

    return (
        <Link to={createPageUrl(`TicketDetails?id=${ticket.id}`)}>
            <motion.div
                whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
                className="block p-5 rounded-lg border bg-white hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
                <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                             <Badge className={statusConfig[ticket.status]}>{ticket.status.replace('_', ' ')}</Badge>
                             <h3 className="text-lg font-semibold text-slate-900 hover:text-blue-600">{ticket.title}</h3>
                        </div>
                        <p className="text-sm text-slate-600 line-clamp-2">{ticket.description}</p>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-start md:items-end gap-2 text-sm">
                         <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="capitalize">{ticket.category}</Badge>
                            <Badge className={`capitalize ${priorityConfig[ticket.priority]}`}>{ticket.priority}</Badge>
                         </div>
                        <div className="text-slate-500">
                            #{ticket.ticket_number} &bull; Updated {formatDistanceToNow(new Date(ticket.updated_date), { addSuffix: true })}
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
};
