import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, X } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
    { id: 'Basic', name: 'Basic Plan', price: '$12,000/year', mrr: 1000 },
    { id: 'Professional', name: 'Professional Plan', price: '$18,000/year', mrr: 1500 },
    { id: 'Enterprise', name: 'Enterprise Plan', price: '$25,000/year', mrr: 2083 },
];

export default function ChangePlanModal({ subscription, onClose, onConfirm }) {
    const [selectedPlan, setSelectedPlan] = useState(subscription.plan);

    const handleConfirm = () => {
        onConfirm(subscription.id, selectedPlan);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-lg shadow-2xl w-full max-w-lg"
            >
                <CardHeader className="flex flex-row items-start justify-between">
                    <div>
                        <CardTitle>Change Subscription Plan</CardTitle>
                        <CardDescription>for {subscription.orgName}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center justify-center gap-4">
                        <div className="text-center p-4 border rounded-lg w-1/2">
                            <p className="text-sm text-slate-500">Current Plan</p>
                            <p className="font-bold text-lg text-slate-800">{subscription.plan}</p>
                        </div>
                        <ArrowRight className="w-6 h-6 text-slate-400" />
                        <div className="text-center p-4 border rounded-lg w-1/2 bg-blue-50 border-blue-200">
                             <p className="text-sm text-blue-600">New Plan</p>
                            <p className="font-bold text-lg text-blue-800">{selectedPlan}</p>
                        </div>
                    </div>
                    <div>
                        <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select new plan" />
                            </SelectTrigger>
                            <SelectContent>
                                {plans.map(plan => (
                                    <SelectItem key={plan.id} value={plan.id}>
                                        {plan.name} ({plan.price})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleConfirm} disabled={selectedPlan === subscription.plan}>
                            Confirm Plan Change
                        </Button>
                    </div>
                </CardContent>
            </motion.div>
        </div>
    );
}