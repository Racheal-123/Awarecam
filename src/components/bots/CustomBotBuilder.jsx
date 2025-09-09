
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Sparkles, Bot, Send, Loader2 } from 'lucide-react';
import { useUser } from '@/pages/Layout';
import { CustomAgentBuilderSession } from '@/api/entities';

export default function CustomBotBuilder({ onClose }) {
    const { user, organization } = useUser();
    const [sessionName, setSessionName] = useState('');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!sessionName || !description) return;

        setIsSubmitting(true);
        try {
            await CustomAgentBuilderSession.create({
                organization_id: organization.id,
                created_by_user_id: user.id,
                session_name: sessionName,
                agent_description: description,
                session_status: 'in_progress',
                creation_method: 'conversational',
            });
            // In a real app, you might show a success message or navigate.
            onClose();
        } catch (error) {
            console.error('Failed to submit custom bot request:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-600" />
                        Request a Custom AI Bot
                    </DialogTitle>
                    <DialogDescription>
                        Describe the bot you need, and our team will get back to you with a proposal.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="session_name">Bot Name</Label>
                            <Input
                                id="session_name"
                                value={sessionName}
                                onChange={(e) => setSessionName(e.target.value)}
                                placeholder="e.g., Forklift Safety Bot"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Describe what the bot should do</Label>
                            <Textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Example: 'I want a bot that detects when a person is too close to a moving forklift and sends an alert.'"
                                className="h-32"
                                required
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Send className="mr-2 h-4 w-4" />
                            )}
                            Submit Request
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
