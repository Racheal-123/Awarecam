import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { X, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const availableAddons = [
    { id: 'analytics', name: 'Advanced Analytics', description: 'Unlock deep insights into your operations.' },
    { id: 'support', name: 'Priority Support', description: 'Get 24/7 priority access to our support team.' },
    { id: 'storage', name: 'Extended Cloud Storage', description: 'Increase video retention period to 90 days.' },
    { id: 'compliance', name: 'Compliance Pack', description: 'Tools for HIPAA and GDPR compliance.' },
];

export default function ManageAddonsModal({ subscription, onClose, onConfirm }) {
    const initialAddonsState = useMemo(() => {
        const active = {};
        for (let i = 0; i < availableAddons.length; i++) {
            active[availableAddons[i].id] = i < subscription.addons;
        }
        return active;
    }, [subscription.addons]);

    const [activeAddons, setActiveAddons] = useState(initialAddonsState);

    const handleToggle = (addonId) => {
        setActiveAddons(prev => ({...prev, [addonId]: !prev[addonId]}));
    };

    const handleConfirm = () => {
        const newAddonsCount = Object.values(activeAddons).filter(Boolean).length;
        onConfirm(subscription.id, newAddonsCount);
    };
    
    const newCount = Object.values(activeAddons).filter(Boolean).length;

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
                        <CardTitle>Manage Add-ons</CardTitle>
                        <CardDescription>for {subscription.orgName}</CardDescription>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
                </CardHeader>
                <CardContent className="p-6">
                    <div className="space-y-4">
                        {availableAddons.map(addon => (
                            <div key={addon.id} className="flex items-center justify-between p-4 rounded-lg border">
                                <div className="flex items-center gap-3">
                                    <Zap className="w-5 h-5 text-purple-500" />
                                    <div>
                                        <Label htmlFor={addon.id} className="font-medium">{addon.name}</Label>
                                        <p className="text-xs text-slate-500">{addon.description}</p>
                                    </div>
                                </div>
                                <Switch
                                    id={addon.id}
                                    checked={activeAddons[addon.id]}
                                    onCheckedChange={() => handleToggle(addon.id)}
                                />
                            </div>
                        ))}
                    </div>
                     <div className="text-center mt-6 text-slate-600">
                        Total Add-ons: <span className="font-bold">{newCount}</span>
                    </div>
                    <div className="flex justify-end gap-3 pt-6">
                        <Button variant="outline" onClick={onClose}>Cancel</Button>
                        <Button onClick={handleConfirm}>
                            Save Changes
                        </Button>
                    </div>
                </CardContent>
            </motion.div>
        </div>
    );
}