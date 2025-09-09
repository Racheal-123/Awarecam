import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Camera, Video, Loader2, CheckCircle } from 'lucide-react';
import DeviceCameraCapture from '@/components/tasks/DeviceCameraCapture';
import { uploadFile } from '@/api/integrations';
import { toast } from 'sonner';

export default function EvidenceStepView({ step, updateStepData }) {
    const [showCamera, setShowCamera] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const evidenceType = step.step_type === 'photo_required' ? 'photo' : 'video';
    const existingEvidence = step.evidence?.find(e => e.type === evidenceType);

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (file) {
            handleUpload(file);
        }
    };
    
    const handleCaptureComplete = (file) => {
        setShowCamera(false);
        if (file) {
            handleUpload(file);
        }
    };

    const handleUpload = async (file) => {
        setIsLoading(true);
        try {
            const { file_url } = await uploadFile(file);
            const newEvidence = {
                type: evidenceType,
                value: file_url,
                timestamp: new Date().toISOString()
            };
            updateStepData({
                evidence: [newEvidence], // Replace any previous evidence for this step
                status: 'completed'
            });
            toast.success(`${evidenceType === 'photo' ? 'Photo' : 'Video'} uploaded.`);
        } catch (error) {
            toast.error("Upload failed.");
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold">{step.title}</h3>
            <p className="text-slate-600">{step.description}</p>
            
            {showCamera && (
                <DeviceCameraCapture
                    isOpen={showCamera}
                    onClose={() => setShowCamera(false)}
                    onCapture={handleCaptureComplete}
                    captureType={evidenceType}
                />
            )}
            
            <div className="p-6 border-2 border-dashed rounded-lg text-center bg-white">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-32">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-500"/>
                        <p className="mt-2">Uploading...</p>
                    </div>
                ) : existingEvidence ? (
                    <div className="space-y-3 flex flex-col items-center justify-center h-32">
                        <CheckCircle className="w-12 h-12 text-green-500" />
                        <p className="font-medium text-green-600">Evidence Uploaded!</p>
                        <a href={existingEvidence.value} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-sm">
                            View {evidenceType}
                        </a>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="flex justify-center gap-4">
                            <Button onClick={() => setShowCamera(true)} size="lg">
                                {evidenceType === 'photo' ? <Camera className="mr-2 h-5 w-5" /> : <Video className="mr-2 h-5 w-5" />}
                                Use Camera
                            </Button>
                            <Button variant="outline" size="lg" asChild>
                                <label className="cursor-pointer">
                                    <Upload className="mr-2 h-5 w-5" />
                                    Upload File
                                    <input type="file" accept={evidenceType === 'photo' ? "image/*" : "video/*"} onChange={handleFileSelect} className="hidden" />
                                </label>
                            </Button>
                        </div>
                        <p className="text-xs text-slate-500">Capture with your device or upload an existing file.</p>
                    </div>
                )}
            </div>
        </div>
    );
}