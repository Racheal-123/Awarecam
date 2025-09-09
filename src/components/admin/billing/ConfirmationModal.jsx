import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { X, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ConfirmationModal({ title, description, confirmText = "Confirm", variant = "default", onConfirm, onClose }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-lg shadow-2xl w-full max-w-md"
            >
                <Card className="border-0">
                    <CardHeader className="text-center">
                        <div className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center ${variant === 'destructive' ? 'bg-red-100' : 'bg-blue-100'}`}>
                            <AlertTriangle className={`w-6 h-6 ${variant === 'destructive' ? 'text-red-600' : 'text-blue-600'}`} />
                        </div>
                        <CardTitle className="mt-4">{title}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-center">
                        <CardDescription>{description}</CardDescription>
                        <div className="flex justify-center gap-4 mt-6">
                            <Button variant="outline" onClick={onClose} className="w-full">
                                Cancel
                            </Button>
                            <Button
                                variant={variant}
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className="w-full"
                            >
                                {confirmText}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}