import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Loader2, FileUp } from 'lucide-react';
import { useUser } from '@/layout';

import { SupportTicket } from '@/api/entities';

export default function CreateTicketForm({ onClose, onTicketCreated }) {
    const { user, organization } = useUser();
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState('');
    const [priority, setPriority] = useState('medium');
    const [description, setDescription] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!title || !category || !description) {
            setError('Please fill out all required fields.');
            return;
        }
        setError('');
        setIsSubmitting(true);

        try {
            const ticketNumber = `TICKET-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 90000) + 10000)}`;
            await SupportTicket.create({
                organization_id: organization.id,
                user_id: user.id,
                ticket_number: ticketNumber,
                title,
                description,
                priority,
                status: 'open',
                category,
            });
            onTicketCreated();
        } catch (err) {
            console.error("Failed to create ticket:", err);
            setError('There was an error submitting your ticket. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-auto">
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-slate-900">Create a New Support Ticket</h2>
                    <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        <div>
                            <Label htmlFor="title">Title *</Label>
                            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Camera feed is not loading" required />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <Label htmlFor="category">Category *</Label>
                                <Select onValueChange={setCategory} required>
                                    <SelectTrigger><SelectValue placeholder="Select a category..." /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="technical">Technical Issue</SelectItem>
                                        <SelectItem value="billing">Billing Question</SelectItem>
                                        <SelectItem value="feature_request">Feature Request</SelectItem>
                                        <SelectItem value="bug_report">Bug Report</SelectItem>
                                        <SelectItem value="account_setup">Account Setup</SelectItem>
                                        <SelectItem value="training">Training Request</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="priority">Priority *</Label>
                                <Select value={priority} onValueChange={setPriority} required>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low - General questions</SelectItem>
                                        <SelectItem value="medium">Medium - Standard issues</SelectItem>
                                        <SelectItem value="high">High - Affecting operations</SelectItem>
                                        <SelectItem value="urgent">Urgent - System down</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="description">Description *</Label>
                            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Please provide as much detail as possible..." rows={6} required />
                        </div>
                        
                        <div>
                            <Label>Attachments (Optional)</Label>
                            <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
                                <div className="space-y-1 text-center">
                                    <FileUp className="mx-auto h-12 w-12 text-slate-400" />
                                    <p className="text-sm text-slate-600">Drag & drop files or click to upload</p>
                                    <p className="text-xs text-slate-500">PNG, JPG, GIF, PDF up to 10MB</p>
                                </div>
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-600">{error}</p>}
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>Cancel</Button>
                        <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
                            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                            Submit Ticket
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}