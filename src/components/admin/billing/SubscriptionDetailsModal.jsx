
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, Building, Calendar, Users, DollarSign, CreditCard, Camera, Server, Cpu, Zap, Edit, Pause, Play, FileText, AlertTriangle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const getUsagePercentage = (used, limit) => {
  if (limit === 0) return 0;
  return Math.min((used / limit) * 100, 100);
};

const mockPayments = [
    { id: 1, date: '2024-05-15', description: 'Monthly Subscription Fee', amount: 1500, status: 'Paid' },
    { id: 2, date: '2024-04-15', description: 'Monthly Subscription Fee', amount: 1500, status: 'Paid' },
    { id: 3, date: '2024-03-15', description: 'Subscription + Overage Charges', amount: 1575.50, status: 'Paid' },
    { id: 4, date: '2024-02-15', description: 'Monthly Subscription Fee', amount: 1500, status: 'Paid' },
];

export default function SubscriptionDetailsModal({ subscription, onClose }) {
  if (!subscription) return null;

  const planConfig = {
    Basic: { price: 12000, color: 'bg-green-100 text-green-800' },
    Professional: { price: 18000, color: 'bg-blue-100 text-blue-800' },
    Enterprise: { price: 25000, color: 'bg-purple-100 text-purple-800' },
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3 }}
          className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-slate-50/80 backdrop-blur-sm z-10 p-6 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">{subscription.orgName}</h2>
              <p className="text-slate-500">Subscription Management</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
              <X className="w-5 h-5" />
            </Button>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Subscription Details */}
              <Card>
                <CardHeader>
                  <CardTitle>Subscription Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-start p-4 bg-slate-100 rounded-lg">
                    <div>
                      <p className="font-semibold text-lg text-slate-800">{subscription.plan} Plan</p>
                      <p className="text-2xl font-bold text-blue-600">${planConfig[subscription.plan].price.toLocaleString()}<span className="text-base font-normal text-slate-500">/year</span></p>
                    </div>
                    <Badge className={planConfig[subscription.plan].color}>{subscription.status}</Badge>
                  </div>
                  {subscription.status === 'Trial' && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg">
                       <Clock className="w-4 h-4" />
                       <span className="text-sm font-medium">Trial ends on {format(new Date(subscription.trialEnd), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  {subscription.status === 'Past Due' && (
                    <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                       <AlertTriangle className="w-4 h-4" />
                       <span className="text-sm font-medium">Payment failed. Please update payment method.</span>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /><span>Next charge: <span className="font-medium">{subscription.nextBilling !== 'N/A' ? format(new Date(subscription.nextBilling), 'MMM d, yyyy') : 'N/A'}</span></span></div>
                    <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-slate-400" /><span>MRR: <span className="font-medium">${subscription.mrr.toLocaleString()}</span></span></div>
                    <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-slate-400" /><span>Add-ons: <span className="font-medium">{subscription.addons}</span></span></div>
                    <div className="flex items-center gap-2"><CreditCard className="w-4 h-4 text-slate-400" /><span>Payment: <span className="font-medium">{subscription.paymentMethod.type} ending in {subscription.paymentMethod.last4}</span></span></div>
                  </div>
                </CardContent>
              </Card>

              {/* Usage Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Usage Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <UsageBar label="Cameras" icon={Camera} used={subscription.usage.cameras.used} limit={subscription.usage.cameras.limit} color="bg-blue-500" />
                  <UsageBar label="Storage (TB)" icon={Server} used={subscription.usage.storage.used} limit={subscription.usage.storage.limit} color="bg-green-500" />
                  <UsageBar label="AI Processing Hours" icon={Cpu} used={subscription.usage.ai.used} limit={subscription.usage.ai.limit} color="bg-purple-500" />
                </CardContent>
              </Card>
              
               {/* Payment History */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Payments</CardTitle>
                </CardHeader>
                <CardContent>
                    {mockPayments.length > 0 ? (
                      <div className="space-y-3">
                        {mockPayments.map(payment => (
                          <div key={payment.id} className="flex justify-between items-center p-3 bg-slate-100 rounded-lg">
                            <div>
                              <p className="font-medium text-slate-800">{payment.description}</p>
                              <p className="text-sm text-slate-500">{format(new Date(payment.date), 'MMM d, yyyy')}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-slate-900">${payment.amount.toFixed(2)}</p>
                              <Badge className="bg-green-100 text-green-800">{payment.status}</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-slate-500 text-center py-8">No payment history to show.</div>
                    )}
                </CardContent>
              </Card>

            </div>

            {/* Right Column - Actions & Info */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                    <Button variant="outline"><Edit className="w-4 h-4 mr-2" /> Change Plan</Button>
                    <Button variant="outline"><Zap className="w-4 h-4 mr-2" /> Add-ons</Button>
                    <Button variant="outline" disabled><Pause className="w-4 h-4 mr-2" /> Pause</Button>
                    <Button variant="outline" className="text-red-600 hover:text-red-600 hover:bg-red-50"><X className="w-4 h-4 mr-2" /> Cancel</Button>
                    <Button variant="outline" className="col-span-2"><FileText className="w-4 h-4 mr-2" /> View History</Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Organization Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2"><Building className="w-4 h-4 text-slate-400" /><span>Industry: <span className="font-medium">{subscription.industry}</span></span></div>
                  <div className="flex items-center gap-2"><Users className="w-4 h-4 text-slate-400" /><span>Employees: <span className="font-medium">{subscription.employeeCount}</span></span></div>
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-slate-400" /><span>Member since: <span className="font-medium">{format(new Date(subscription.signupDate), 'MMM d, yyyy')}</span></span></div>
                </CardContent>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

const UsageBar = ({ label, icon: Icon, used, limit, color }) => {
    const percentage = getUsagePercentage(used, limit);
    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-700 flex items-center gap-2"><Icon className="w-4 h-4 text-slate-500" /> {label}</span>
                <span className="text-sm text-slate-500">{used.toLocaleString()} / {limit.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2.5">
                <div className={`${color} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};
