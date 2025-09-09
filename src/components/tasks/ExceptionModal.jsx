import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { AlertTriangle, Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { TaskException } from '@/api/entities';
import { uploadFile } from '@/api/integrations';

export default function ExceptionModal({ task, step, onClose, onExceptionCreated }) {
    const [formData, setFormData] = useState({
        exception_type: '',
        severity: 'medium',
        description: '',
        resolution_required: true,
    });
    const [photoFile, setPhotoFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const exceptionTypes = [
        { value: 'equipment_failure', label: 'Equipment Failure' },
        { value: 'safety_concern', label: 'Safety Concern' },
        { value: 'missing_materials', label: 'Missing Materials' },
        { value: 'access_denied', label: 'Access Denied' },
        { value: 'weather_delay', label: 'Weather Delay' },
        { value: 'other', label: 'Other' }
    ];

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handlePhotoCapture = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('File size must be less than 5MB');
            return;
        }

        setPhotoFile(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.exception_type || !formData.description.trim()) {
            toast.error('Please fill in all required fields');
            return;
        }

        setIsSubmitting(true);
        
        try {
            let photoUrl = null;
            
            // Upload photo if provided
            if (photoFile) {
                setUploading(true);
                const uploadResult = await uploadFile(photoFile);
                photoUrl = uploadResult.file_url;
                setUploading(false);
            }

            // Create the exception
            const exception = await TaskException.create({
                task_id: task.id,
                organization_id: task.organization_id,
                step_id: step?.id || null,
                exception_type: formData.exception_type,
                severity: formData.severity,
                description: formData.description.trim(),
                photo_url: photoUrl,
                resolution_required: formData.resolution_required,
                created_by: 'current_user' // This should be the actual user ID
            });

            toast.success('Exception reported successfully');
            
            if (onExceptionCreated) {
                onExceptionCreated(exception);
            }
            
            onClose();
        } catch (error) {
            console.error('Failed to create exception:', error);
            toast.error('Failed to report exception');
        } finally {
            setIsSubmitting(false);
            setUploading(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        Report Exception
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="p-3 bg-slate-50 rounded-lg">
                        <p className="font-medium">Task: {task.title}</p>
                        {step && <p className="text-sm text-slate-600">Step: {step.title}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <Label htmlFor="exception_type">Exception Type *</Label>
                            <Select
                                value={formData.exception_type}
                                onValueChange={(value) => handleInputChange('exception_type', value)}
                                required
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select exception type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {exceptionTypes.map(type => (
                                        <SelectItem key={type.value} value={type.value}>
                                            {type.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-1">
                            <Label htmlFor="severity">Severity</Label>
                            <Select
                                value={formData.severity}
                                onValueChange={(value) => handleInputChange('severity', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="low">Low</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="high">High</SelectItem>
                                    <SelectItem value="critical">Critical</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="description">Description *</Label>
                        <Textarea
                            id="description"
                            placeholder="Describe what went wrong and any relevant details..."
                            value={formData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            rows={4}
                            required
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="photo">Photo Evidence (Optional)</Label>
                        <div className="flex items-center gap-4">
                            <Input
                                id="photo"
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoCapture}
                                className="flex-1"
                            />
                            <div className="flex items-center gap-2">
                                <Camera className="w-4 h-4 text-slate-500" />
                                <span className="text-sm text-slate-500">
                                    {photoFile ? photoFile.name : 'No photo selected'}
                                </span>
                            </div>
                        </div>
                        {uploading && (
                            <div className="flex items-center gap-2 text-sm text-blue-600">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Uploading photo...
                            </div>
                        )}
                    </div>

                    <div className="flex items-center space-x-2 p-3 bg-amber-50 rounded-lg">
                        <Switch
                            id="resolution_required"
                            checked={formData.resolution_required}
                            onCheckedChange={(checked) => handleInputChange('resolution_required', checked)}
                        />
                        <Label htmlFor="resolution_required" className="text-sm">
                            This exception must be resolved before task completion
                        </Label>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={isSubmitting || uploading}
                            className="bg-amber-600 hover:bg-amber-700"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Reporting...
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Report Exception
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}