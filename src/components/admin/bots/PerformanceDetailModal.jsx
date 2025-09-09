import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';

export default function PerformanceDetailModal({ bot, onClose }) {
    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Performance Details: {bot.display_name}</DialogTitle>
                    <DialogDescription>
                        This is a placeholder for detailed bot performance metrics.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p>In a real implementation, this modal would show charts and stats for:</p>
                    <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                        <li>Accuracy (Precision, Recall, F1-score)</li>
                        <li>Usage across organizations</li>
                        <li>Processing time</li>
                        <li>Generated alerts vs. false positives</li>
                    </ul>
                </div>
            </DialogContent>
        </Dialog>
    );
}