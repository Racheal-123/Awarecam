import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Clock, Star, Users, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SupportDashboard() {
    const stats = {
        openTickets: 84,
        avgResponseTime: '2.7h',
        avgResolutionTime: '18.2h',
        satisfactionScore: '4.8/5',
        // New advanced stats
        ticketTrends: '5% Increase',
        slaViolations: 12,
        ticketsByPriority: { urgent: 5, high: 21, medium: 43, low: 15 },
        agentPerformance: [
            { name: 'Alex Ray', tickets: 18, responseTime: '1.9h', csat: '4.9' },
            { name: 'Jordan Patel', tickets: 22, responseTime: '2.5h', csat: '4.8' },
            { name: 'Casey Morgan', tickets: 15, responseTime: '3.1h', csat: '4.7' },
        ],
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Open Tickets" value={stats.openTickets} icon={BarChart} color="blue" />
                <StatCard title="Avg First Response" value={stats.avgResponseTime} icon={Clock} color="orange" />
                <StatCard title="Avg Resolution Time" value={stats.avgResolutionTime} icon={Clock} color="purple" />
                <StatCard title="Customer Satisfaction" value={stats.satisfactionScore} icon={Star} color="green" />
                {/* New StatCards for advanced features */}
                <StatCard title="Ticket Trend" value={stats.ticketTrends} icon={TrendingUp} color="teal" />
                <StatCard title="SLA Violations" value={stats.slaViolations} icon={AlertTriangle} color="red" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Tickets by Priority</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <PriorityItem title="Urgent" count={stats.ticketsByPriority.urgent} color="bg-red-500" />
                        <PriorityItem title="High" count={stats.ticketsByPriority.high} color="bg-orange-500" />
                        <PriorityItem title="Medium" count={stats.ticketsByPriority.medium} color="bg-blue-500" />
                        <PriorityItem title="Low" count={stats.ticketsByPriority.low} color="bg-slate-400" />
                    </CardContent>
                </Card>
                
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Team Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-4">
                            {stats.agentPerformance.map(agent => (
                                <div key={agent.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                    <p className="font-medium text-slate-800">{agent.name}</p>
                                    <div className="flex items-center gap-6 text-sm">
                                        <span>{agent.tickets} tickets</span>
                                        <span>{agent.responseTime} avg resp.</span>
                                        <span className="flex items-center gap-1">{agent.csat} <Star className="w-4 h-4 text-yellow-500" /></span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

const StatCard = ({ title, value, icon: Icon, color }) => (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <Card className={`border-${color}-200`}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
                <Icon className={`h-5 w-5 text-${color}-500`} />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
            </CardContent>
        </Card>
    </motion.div>
);

const PriorityItem = ({ title, count, color }) => (
    <div className="flex items-center justify-between">
        <span className="text-sm font-medium">{title}</span>
        <span className="text-sm font-semibold">{count}</span>
    </div>
);