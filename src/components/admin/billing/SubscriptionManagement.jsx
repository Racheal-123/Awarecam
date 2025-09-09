
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator }
    from '@/components/ui/dropdown-menu';
import { Search, MoreHorizontal, FileDown, Briefcase, Users, DollarSign, CheckCircle, Clock, XCircle, PauseCircle } from 'lucide-react';
import { format, addDays } from 'date-fns';
import SubscriptionDetailsModal from '@/components/admin/billing/SubscriptionDetailsModal';
import ChangePlanModal from '@/components/admin/billing/ChangePlanModal';
import ManageAddonsModal from '@/components/admin/billing/ManageAddonsModal';
import ConfirmationModal from '@/components/admin/billing/ConfirmationModal';
import { motion } from 'framer-motion';

// Mock Data
const mockSubscriptions = [
    { id: 1, orgName: 'Innovate Corp', contactEmail: 'billing@innovate.com', industry: 'Tech', employeeCount: 150, signupDate: '2023-01-15', plan: 'Professional', status: 'Active', nextBilling: '2025-01-15', mrr: 1500, addons: 2, paymentMethod: { type: 'Visa', last4: '4242' }, usage: { cameras: { used: 45, limit: 50 }, storage: { used: 8, limit: 10 }, ai: { used: 1800, limit: 2000 } } },
    { id: 2, orgName: 'HealthWell Clinic', contactEmail: 'accounts@healthwell.com', industry: 'Healthcare', employeeCount: 75, signupDate: '2023-03-22', plan: 'Enterprise', status: 'Active', nextBilling: '2025-03-22', mrr: 2083, addons: 4, paymentMethod: { type: 'Amex', last4: '1001' }, usage: { cameras: { used: 90, limit: 100 }, storage: { used: 15, limit: 20 }, ai: { used: 4500, limit: 5000 } } },
    { id: 3, orgName: 'Sunrise Retail', contactEmail: 'payments@sunretail.com', industry: 'Retail', employeeCount: 300, signupDate: '2024-05-10', plan: 'Basic', status: 'Trial', nextBilling: '2024-06-09', mrr: 0, addons: 0, trialEnd: '2024-06-09', paymentMethod: { type: 'Mastercard', last4: '5555' }, usage: { cameras: { used: 8, limit: 10 }, storage: { used: 1, limit: 2 }, ai: { used: 250, limit: 500 } } },
    { id: 4, orgName: 'Dynamic Logistics', contactEmail: 'finance@dynamiclog.com', industry: 'Logistics', employeeCount: 500, signupDate: '2022-11-01', plan: 'Enterprise', status: 'Past Due', nextBilling: '2024-05-01', mrr: 2083, addons: 1, paymentMethod: { type: 'Visa', last4: '8989' }, usage: { cameras: { used: 120, limit: 100 }, storage: { used: 22, limit: 20 }, ai: { used: 6000, limit: 5000 } } },
    { id: 5, orgName: 'Old Town Cafe', contactEmail: 'owner@oldtown.com', industry: 'Hospitality', employeeCount: 20, signupDate: '2023-08-19', plan: 'Basic', status: 'Canceled', nextBilling: 'N/A', mrr: 0, addons: 0, paymentMethod: { type: 'Visa', last4: '7654' }, usage: { cameras: { used: 0, limit: 10 }, storage: { used: 0, limit: 2 }, ai: { used: 0, limit: 500 } } },
    { id: 6, orgName: 'Secure Warehousing', contactEmail: 'ops@securewh.com', industry: 'Manufacturing', employeeCount: 220, signupDate: '2023-02-11', plan: 'Professional', status: 'Active', nextBilling: '2025-02-11', mrr: 1500, addons: 1, paymentMethod: { type: 'Visa', last4: '1121' }, usage: { cameras: { used: 30, limit: 50 }, storage: { used: 5, limit: 10 }, ai: { used: 1200, limit: 2000 } } },
];

export default function SubscriptionManagement() {
    const [subscriptions, setSubscriptions] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({ plan: 'all', status: 'all' });
    const [selectedSubscription, setSelectedSubscription] = useState(null);
    
    // State for action modals
    const [changingPlanSub, setChangingPlanSub] = useState(null);
    const [managingAddonsSub, setManagingAddonsSub] = useState(null);
    const [confirmation, setConfirmation] = useState({ isOpen: false, title: '', description: '', onConfirm: null, confirmText: 'Confirm', variant: 'default' });

    useEffect(() => {
        setSubscriptions(mockSubscriptions);
    }, []);

    const filteredSubscriptions = useMemo(() => {
        return subscriptions.filter(sub => {
            const searchMatch = searchTerm === '' ||
                sub.orgName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sub.contactEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                sub.plan.toLowerCase().includes(searchTerm.toLowerCase());
            
            const planMatch = filters.plan === 'all' || sub.plan === filters.plan;
            const statusMatch = filters.status === 'all' || sub.status === filters.status;

            return searchMatch && planMatch && statusMatch;
        });
    }, [subscriptions, searchTerm, filters]);

    const handleFilterChange = (type, value) => {
        setFilters(prev => ({ ...prev, [type]: value }));
    };

    const exportToCSV = (subs) => {
        if (!subs.length) {
            alert("No data available to export.");
            return;
        }

        const headers = [
            "Organization Name",
            "Contact Email",
            "Plan",
            "Status",
            "Next Billing Date",
            "MRR ($)",
            "Add-on Count"
        ];

        const rows = subs.map(sub => [
            `"${sub.orgName.replace(/"/g, '""')}"`, // Handle quotes in org name
            sub.contactEmail,
            sub.plan,
            sub.status,
            sub.nextBilling !== 'N/A' ? format(new Date(sub.nextBilling), 'yyyy-MM-dd') : 'N/A',
            sub.mrr,
            sub.addons
        ].join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        const url = URL.createObjectURL(blob);
        const today = new Date().toISOString().split('T')[0];

        link.setAttribute("href", url);
        link.setAttribute("download", `subscriptions-report-${today}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const totalMRR = useMemo(() => filteredSubscriptions.reduce((acc, sub) => acc + sub.mrr, 0), [filteredSubscriptions]);
    const activeSubscriptions = useMemo(() => filteredSubscriptions.filter(s => s.status === 'Active').length, [filteredSubscriptions]);
    const trialCustomers = useMemo(() => filteredSubscriptions.filter(s => s.status === 'Trial').length, [filteredSubscriptions]);

    const statusConfig = {
        Active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
        Trial: { color: 'bg-blue-100 text-blue-800', icon: Clock },
        'Past Due': { color: 'bg-red-100 text-red-800', icon: XCircle },
        Canceled: { color: 'bg-slate-100 text-slate-700', icon: PauseCircle },
        Paused: { color: 'bg-yellow-100 text-yellow-800', icon: PauseCircle },
    };

    const planConfig = {
        Basic: { price: '$12k/yr', mrr: 1000 },
        Professional: { price: '$18k/yr', mrr: 1500 },
        Enterprise: { price: '$25k/yr', mrr: 2083 },
    }

    const handleAction = (action, sub) => {
        switch (action) {
            case 'view_details':
            case 'view_billing_history':
                setSelectedSubscription(sub);
                break;
            case 'change_plan':
                setChangingPlanSub(sub);
                break;
            case 'manage_addons':
                setManagingAddonsSub(sub);
                break;
            case 'extend_trial':
                setConfirmation({
                    isOpen: true,
                    title: 'Extend Trial Period',
                    description: `Are you sure you want to extend the trial for ${sub.orgName} by 14 days?`,
                    onConfirm: () => confirmExtendTrial(sub.id),
                    confirmText: 'Extend Trial',
                    variant: 'default'
                });
                break;
            case 'pause_billing':
                setConfirmation({
                    isOpen: true,
                    title: 'Pause Billing',
                    description: `Are you sure you want to pause billing for ${sub.orgName}? They will retain access but won't be billed.`,
                    onConfirm: () => confirmUpdateStatus(sub.id, 'Paused'),
                    confirmText: 'Pause Billing',
                    variant: 'default'
                });
                break;
            case 'cancel_subscription':
                setConfirmation({
                    isOpen: true,
                    title: 'Cancel Subscription',
                    description: `This will cancel the subscription for ${sub.orgName} at the end of the current billing period. This action cannot be undone.`,
                    onConfirm: () => confirmUpdateStatus(sub.id, 'Canceled'),
                    confirmText: 'Yes, Cancel Subscription',
                    variant: 'destructive'
                });
                break;
            default:
                break;
        }
    };
    
    const confirmUpdateStatus = (subId, newStatus) => {
        setSubscriptions(subs => subs.map(s => {
            if (s.id === subId) {
                const updates = { status: newStatus };
                if (newStatus === 'Canceled' || newStatus === 'Paused') {
                    updates.mrr = 0;
                    updates.nextBilling = 'N/A';
                }
                return { ...s, ...updates };
            }
            return s;
        }));
        setConfirmation({ isOpen: false, title: '', description: '', onConfirm: null, confirmText: 'Confirm', variant: 'default' });
        alert(`Subscription for organization ID ${subId} has been ${newStatus.toLowerCase()}.`);
    };

    const confirmExtendTrial = (subId) => {
        setSubscriptions(subs => subs.map(s => {
            if (s.id === subId) {
                const newTrialEnd = addDays(new Date(s.trialEnd), 14);
                return { ...s, trialEnd: newTrialEnd.toISOString().split('T')[0], nextBilling: newTrialEnd.toISOString().split('T')[0] };
            }
            return s;
        }));
        setConfirmation({ isOpen: false, title: '', description: '', onConfirm: null, confirmText: 'Confirm', variant: 'default' });
        alert(`Trial for organization ID ${subId} has been extended by 14 days.`);
    };

    const confirmChangePlan = (subId, newPlan) => {
        setSubscriptions(subs => subs.map(s => {
            if (s.id === subId) {
                 const planDetails = {
                    Basic: { mrr: 1000 },
                    Professional: { mrr: 1500 },
                    Enterprise: { mrr: 2083 },
                 };
                return { ...s, plan: newPlan, mrr: planDetails[newPlan].mrr };
            }
            return s;
        }));
        setChangingPlanSub(null);
        alert(`Plan for organization ID ${subId} changed to ${newPlan}.`);
    }

    const confirmManageAddons = (subId, newAddonsCount) => {
        setSubscriptions(subs => subs.map(s => {
            if (s.id === subId) {
                return { ...s, addons: newAddonsCount };
            }
            return s;
        }));
        setManagingAddonsSub(null);
        alert(`Add-ons updated for organization ID ${subId}.`);
    }


    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={DollarSign} title="Total MRR" value={`$${totalMRR.toLocaleString()}`} />
                <StatCard icon={Briefcase} title="Active Subscriptions" value={activeSubscriptions} />
                <StatCard icon={Users} title="Trial Customers" value={trialCustomers} />
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle>All Subscriptions</CardTitle>
                    <CardDescription>Search, filter, and manage all customer subscriptions.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input 
                                placeholder="Search by organization, email, or plan..."
                                className="pl-10"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={filters.plan} onValueChange={(v) => handleFilterChange('plan', v)}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Filter by Plan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Plans</SelectItem>
                                <SelectItem value="Basic">Basic</SelectItem>
                                <SelectItem value="Professional">Professional</SelectItem>
                                <SelectItem value="Enterprise">Enterprise</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={filters.status} onValueChange={(v) => handleFilterChange('status', v)}>
                            <SelectTrigger className="w-full md:w-48">
                                <SelectValue placeholder="Filter by Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Trial">Trial</SelectItem>
                                <SelectItem value="Past Due">Past Due</SelectItem>
                                <SelectItem value="Canceled">Canceled</SelectItem>
                                <SelectItem value="Paused">Paused</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={() => exportToCSV(filteredSubscriptions)}>
                            <FileDown className="w-4 h-4 mr-2" />
                            Export Report
                        </Button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Organization</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Plan</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Next Billing</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">MRR</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Add-ons</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {filteredSubscriptions.map(sub => {
                                    const StatusIcon = statusConfig[sub.status]?.icon || CheckCircle;
                                    return (
                                    <tr key={sub.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button onClick={() => handleAction('view_details', sub)} className="font-medium text-blue-600 hover:underline">{sub.orgName}</button>
                                            <div className="text-sm text-slate-500">{sub.contactEmail}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="font-medium text-slate-800">{sub.plan}</div>
                                            <div className="text-sm text-slate-500">{planConfig[sub.plan].price}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <Badge className={statusConfig[sub.status]?.color || 'bg-gray-100 text-gray-800'}>
                                                <StatusIcon className="w-3 h-3 mr-1.5" />
                                                {sub.status}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                                            {sub.nextBilling !== 'N/A' ? format(new Date(sub.nextBilling), 'MMM d, yyyy') : 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-800">${sub.mrr.toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-slate-600">{sub.addons}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleAction('view_details', sub)}>View Details</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAction('change_plan', sub)}>Change Plan</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAction('manage_addons', sub)}>Manage Add-ons</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleAction('extend_trial', sub)} disabled={sub.status !== 'Trial'}>Extend Trial</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAction('pause_billing', sub)} disabled={sub.status === 'Paused' || sub.status === 'Canceled'}>Pause Billing</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleAction('cancel_subscription', sub)} className="text-red-600 focus:text-red-600" disabled={sub.status === 'Canceled'}>Cancel Subscription</DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem onClick={() => handleAction('view_billing_history', sub)}>View Billing History</DropdownMenuItem>
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

            {selectedSubscription && (
                <SubscriptionDetailsModal
                    subscription={selectedSubscription}
                    onClose={() => setSelectedSubscription(null)}
                />
            )}
            
            {changingPlanSub && (
                <ChangePlanModal
                    subscription={changingPlanSub}
                    onClose={() => setChangingPlanSub(null)}
                    onConfirm={confirmChangePlan}
                />
            )}

            {managingAddonsSub && (
                <ManageAddonsModal
                    subscription={managingAddonsSub}
                    onClose={() => setManagingAddonsSub(null)}
                    onConfirm={confirmManageAddons}
                />
            )}
            
            {confirmation.isOpen && (
                <ConfirmationModal
                    title={confirmation.title}
                    description={confirmation.description}
                    onClose={() => setConfirmation({ isOpen: false, title: '', description: '', onConfirm: null, confirmText: 'Confirm', variant: 'default' })}
                    onConfirm={confirmation.onConfirm}
                    confirmText={confirmation.confirmText}
                    variant={confirmation.variant}
                />
            )}
        </div>
    );
}

const StatCard = ({ icon: Icon, title, value }) => (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
                <Icon className="h-5 w-5 text-slate-400" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold text-slate-900">{value}</div>
            </CardContent>
        </Card>
    </motion.div>
);
