
import React, { useState, useEffect } from 'react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter, DrawerClose } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'; // Added Alert components
import { X, ArrowLeft, ArrowRight, CheckCircle, AlertTriangle, MessageSquare } from 'lucide-react'; // Updated icons
import { motion, AnimatePresence } from 'framer-motion'; // Added motion and AnimatePresence
import { toast } from 'sonner';

import { Task } from '@/api/entities'; // Changed TaskEntity to Task
import { User } from '@/api/entities'; // Added User entity import
import { uploadFile } from '@/api/integrations'; // Added uploadFile import

import ChecklistStepView from '@/components/tasks/task-runner/ChecklistStepView';
import EvidenceStepView from '@/components/tasks/task-runner/EvidenceStepView';
import SignatureStepView from '@/components/tasks/task-runner/SignatureStepView';
import AIValidationStepView from '@/components/tasks/task-runner/AIValidationStepView';
import ExceptionModal from '@/components/tasks/ExceptionModal'; // Added ExceptionModal import

export default function TaskRunner({ isOpen, task, onClose, onUpdate }) { // Reordered props
    const [taskData, setTaskData] = useState(null); // Renamed currentTask to taskData
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false); // Added isSubmitting state
    const [showExceptionModal, setShowExceptionModal] = useState(false); // Added showExceptionModal state

    useEffect(() => {
        if (task) {
            const initialTaskData = {
                ...task,
                steps: task.steps || [], // Ensure steps is an array
                history: task.history || [] // Ensure history is an array
            };
            setTaskData(initialTaskData);
            // Find first non-completed step
            const firstPendingStep = (initialTaskData.steps || []).findIndex(s => s.status !== 'completed');
            setCurrentStepIndex(firstPendingStep >= 0 ? firstPendingStep : 0);
        }
    }, [task, isOpen]);

    // Renamed logHistory to recordHistory and modified its behavior to update state directly
    const recordHistory = async (action, details = {}) => {
        const newHistoryEntry = {
            timestamp: new Date().toISOString(),
            user_id: User.getCurrentUser()?.id, // Get user ID from User entity
            action,
            details
        };
        setTaskData(prev => ({
            ...prev,
            history: [...(prev.history || []), newHistoryEntry]
        }));
    };

    // Renamed updateStepData to handleStepUpdate and modified its behavior
    const handleStepUpdate = (stepIndex, updatedStepData) => {
        setTaskData(prev => {
            const newSteps = [...(prev.steps || [])];
            newSteps[stepIndex] = { ...newSteps[stepIndex], ...updatedStepData, status: 'completed' }; // Set status to completed
            recordHistory(`Step ${stepIndex + 1} ('${newSteps[stepIndex].title}') completed`, updatedStepData);
            return { ...prev, steps: newSteps };
        });
    };

    const handleNext = () => {
        const steps = taskData.steps || [];
        if (currentStepIndex < steps.length - 1) {
            setCurrentStepIndex(prev => prev + 1); // Use functional update
        }
    };

    const handlePrev = () => {
        if (currentStepIndex > 0) {
            setCurrentStepIndex(prev => prev - 1); // Use functional update
        }
    };

    const handleCompleteTask = async () => {
        setIsSubmitting(true);
        try {
            await recordHistory('Task marked as complete'); // Record completion in history
            // Wait for state update to settle if needed, or directly use current taskData for update
            // However, due to async nature, it's safer to grab the latest state or ensure history is committed
            // For now, let's assume `recordHistory` updates the state reliably before the next line runs in a real async scenario
            // Or ideally, `Task.update` would receive the history directly or fetch it.
            // For simplicity and matching the outline's intent (history updated via recordHistory),
            // we'll rely on taskData having the latest history.

            // Get the latest taskData after history update
            const latestTaskData = {
                ...taskData, // Use current taskData, recordHistory updates it
                status: 'completed',
                completed_at: new Date().toISOString(),
                // History is already updated by recordHistory call
            };
            await Task.update(latestTaskData.id, {
                status: latestTaskData.status,
                completed_at: latestTaskData.completed_at,
                history: latestTaskData.history, // Pass the updated history
                steps: latestTaskData.steps // Also ensure steps are persisted
            });
            toast.success("Task completed successfully!");
            onUpdate();
            onClose();
        } catch (error) {
            toast.error("Failed to complete task.");
            console.error("Failed to complete task:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleExceptionCreated = async (exceptionDetails) => {
        setShowExceptionModal(false);
        if (taskData) {
            await recordHistory('Task exception reported', exceptionDetails);
            toast.success("Exception reported successfully.");
            // Optionally, update task status to 'exception' or similar if business logic dictates
            // For now, just logging it.
            onUpdate(); // Trigger a refresh of the task list if needed
        }
    };

    if (!isOpen || !taskData) return null;

    const steps = taskData.steps || [];
    const currentStep = steps[currentStepIndex];
    // Progress calculation changed to current step based
    const progress = steps.length > 0 ? (((currentStepIndex) / steps.length) * 100) : 0;
    const currentProgress = (currentStepIndex + 1) / steps.length * 100;

    // All mandatory steps check
    const allMandatoryStepsCompleted = steps
        .filter(step => step.is_mandatory)
        .every(step => step.status === 'completed');

    const renderStepContent = () => {
        if (!currentStep) return null;

        const commonProps = {
            key: currentStep.id || currentStepIndex, // Use step ID for key if available, fallback to index
            step: currentStep,
            updateStepData: (data) => handleStepUpdate(currentStepIndex, data), // Pass handleStepUpdate
        };

        const stepComponent = (() => {
            switch (currentStep.step_type) {
                case 'checklist':
                    return <ChecklistStepView {...commonProps} />;
                case 'photo_required':
                case 'video_required':
                    return <EvidenceStepView {...commonProps} />;
                case 'signature_required':
                    return <SignatureStepView {...commonProps} />;
                case 'camera_validation':
                    return <AIValidationStepView {...commonProps} />;
                default:
                    return (
                        <Alert>
                            <AlertTriangle className="h-4 w-4" />
                            <AlertTitle>Unsupported Step Type</AlertTitle>
                            <AlertDescription>
                                Step type '{currentStep.step_type}' not supported yet.
                            </AlertDescription>
                        </Alert>
                    );
            }
        })();

        return (
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
            >
                {stepComponent}
            </motion.div>
        );
    };

    return (
        <>
            <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
                <DrawerContent className="h-full flex flex-col"> {/* Changed to h-full */}
                    <DrawerHeader className="text-left flex-shrink-0">
                        <div className="flex items-center justify-between">
                            <DrawerTitle>{taskData.title}</DrawerTitle>
                            <DrawerClose asChild><Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button></DrawerClose>
                        </div>
                        <DrawerDescription>
                            Executing Task ({currentStepIndex + 1} of {steps.length}): {currentStep?.title}
                        </DrawerDescription>
                        <div className="flex items-center gap-2 pt-2">
                            <Progress value={currentProgress} className="w-full" />
                            <span className="text-xs text-slate-500 whitespace-nowrap">{Math.round(currentProgress)}%</span>
                        </div>
                    </DrawerHeader>

                    <div className="flex-1 overflow-y-auto p-4 bg-slate-50">
                        <AnimatePresence mode="wait"> {/* Added AnimatePresence */}
                            {renderStepContent()}
                        </AnimatePresence>
                    </div>

                    <DrawerFooter className="border-t flex-shrink-0 bg-white">
                        <div className="flex items-center justify-between w-full">
                            <Button variant="outline" onClick={() => setShowExceptionModal(true)}>
                                <AlertTriangle className="w-4 h-4 mr-2" /> Report Exception
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="secondary" onClick={handlePrev} disabled={currentStepIndex === 0}>
                                    <ArrowLeft className="w-4 h-4 mr-2" /> Prev
                                </Button>
                                {currentStepIndex < steps.length - 1 ? (
                                    <Button onClick={handleNext}>
                                        Next <ArrowRight className="w-4 h-4 ml-2" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleCompleteTask}
                                        disabled={!allMandatoryStepsCompleted || isSubmitting}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        {isSubmitting ? 'Completing...' : 'Complete Task'}
                                    </Button>
                                )}
                            </div>
                        </div>
                        {!allMandatoryStepsCompleted && currentStepIndex === steps.length - 1 && (
                            <p className="text-xs text-center text-amber-600 mt-2">
                                All mandatory steps must be completed before finishing the task.
                            </p>
                        )}
                    </DrawerFooter>
                </DrawerContent>
            </Drawer>

            {showExceptionModal && (
                <ExceptionModal
                    task={taskData}
                    step={currentStep}
                    onClose={() => setShowExceptionModal(false)}
                    onExceptionCreated={handleExceptionCreated}
                />
            )}
        </>
    );
}
