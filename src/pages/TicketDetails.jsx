import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Paperclip, Send, ArrowLeft, Loader2, User, Shield, Star, RefreshCw } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useUser } from '@/layout';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

import { SupportTicket } from '@/api/entities';
import { TicketMessage } from '@/api/entities';
import { User as PlatformUser } from '@/api/entities';

export default function TicketDetailsPage() {
    const { user: currentUser } = useUser();
    const [ticket, setTicket] = useState(null);
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState({});
    const [loading, setLoading] = useState(true);
    const [newReply, setNewReply] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const ticketId = params.get('id');
        if (ticketId) {
            loadTicketData(ticketId);
        }
    }, []);

    const loadTicketData = async (ticketId) => {
        setLoading(true);
        try {
            const ticketData = await SupportTicket.get(ticketId);
            setTicket(ticketData);

            const messageData = await TicketMessage.filter({ ticket_id: ticketId }, 'created_date');
            setMessages(messageData);

            const userIds = [...new Set([ticketData.user_id, ...messageData.map(m => m.user_id)].filter(Boolean))];
            if (userIds.length > 0) {
                 const userList = await PlatformUser.list();
                 const userMap = userList.reduce((acc, u) => {
                    if (userIds.includes(u.id)) {
                        acc[u.id] = u;
                    }
                    return acc;
                 }, {});
                 setUsers(userMap);
            }
        } catch (error) {
            console.error("Failed to load ticket details:", error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleSendMessage = async () => {
        if (!newReply.trim() || !currentUser) return;
        setIsSubmitting(true);
        
        try {
            await TicketMessage.create({
                ticket_id: ticket.id,
                user_id: currentUser.id,
                content: newReply,
                is_internal: false
            });
            setNewReply('');
            loadTicketData(ticket.id);
        } catch (error) {
            console.error("Failed to send message:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleStatusUpdate = async (newStatus) => {
        setIsSubmitting(true);
        try {
            await SupportTicket.update(ticket.id, { status: newStatus });
            loadTicketData(ticket.id);
        } catch (error) {
            console.error("Failed to update status:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-6 flex justify-center items-center h-96"><Loader2 className="w-8 h-8 animate-spin" /></div>;
    }

    if (!ticket) {
        return <div className="p-6 text-center">Ticket not found.</div>;
    }
    
    const priorityConfig = {
        low: 'bg-slate-100 text-slate-700',
        medium: 'bg-blue-100 text-blue-700',
        high: 'bg-orange-100 text-orange-700',
        urgent: 'bg-red-100 text-red-700',
    };
    
    const statusConfig = {
        open: 'bg-blue-100 text-blue-700',
        in_progress: 'bg-yellow-100 text-yellow-700',
        waiting_customer: 'bg-purple-100 text-purple-700',
        resolved: 'bg-green-100 text-green-700',
        closed: 'bg-slate-100 text-slate-700',
    };
    
    return (
        <div className="p-6 space-y-6">
            <Link to={createPageUrl("Support")} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900">
                <ArrowLeft className="w-4 h-4" />
                Back to Support Center
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3">
                                        <Badge className={statusConfig[ticket.status]}>{ticket.status.replace('_', ' ')}</Badge>
                                        <Badge className={priorityConfig[ticket.priority]}>{ticket.priority}</Badge>
                                    </div>
                                    <CardTitle className="mt-2 text-2xl">{ticket.title}</CardTitle>
                                    <CardDescription className="mt-1">
                                        Ticket #{ticket.ticket_number} &bull; Created on {format(new Date(ticket.created_date), 'PPP')}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {messages.map(message => {
                                    const author = users[message.user_id];
                                    const isCustomer = author?.id === currentUser.id;
                                    return (
                                        <div key={message.id} className={`flex items-start gap-4 ${isCustomer ? 'justify-end' : ''}`}>
                                            {!isCustomer && (
                                                <Avatar>
                                                    <AvatarImage src={author?.photo_url} />
                                                    <AvatarFallback><Shield className="w-5 h-5" /></AvatarFallback>
                                                </Avatar>
                                            )}
                                            <div className={`max-w-2xl p-4 rounded-lg ${isCustomer ? 'bg-blue-600 text-white' : 'bg-slate-100'}`}>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <p className="font-semibold">{author?.full_name || 'Support Agent'}</p>
                                                    <p className="text-xs opacity-80">{format(new Date(message.created_date), 'PPp')}</p>
                                                </div>
                                                <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: message.content }}></div>
                                            </div>
                                            {isCustomer && (
                                                <Avatar>
                                                    <AvatarImage src={author?.photo_url} />
                                                    <AvatarFallback><User className="w-5 h-5" /></AvatarFallback>
                                                </Avatar>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {ticket.status === 'resolved' && (
                        <CSATSurvey ticket={ticket} onSurveySubmit={() => handleStatusUpdate('closed')} />
                    )}

                    {ticket.status !== 'closed' && ticket.status !== 'resolved' && (
                       <Card>
                            <CardHeader>
                                <CardTitle>Add a Reply</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ReactQuill 
                                    value={newReply}
                                    onChange={setNewReply}
                                    placeholder="Type your message here..."
                                    className="h-32 mb-12"
                                />
                                <div className="mt-4 flex justify-between items-center">
                                    <Button variant="outline"><Paperclip className="w-4 h-4 mr-2" /> Attach Files</Button>
                                    <Button onClick={handleSendMessage} disabled={isSubmitting || !newReply.trim()}>
                                        {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                        Send Reply
                                    </Button>
                                </div>
                            </CardContent>
                       </Card>
                    )}
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ticket Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Status</h4>
                                <Badge className={statusConfig[ticket.status]}>{ticket.status.replace('_', ' ')}</Badge>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Priority</h4>
                                <Badge className={priorityConfig[ticket.priority]}>{ticket.priority}</Badge>
                            </div>
                            <div>
                                <h4 className="font-semibold text-sm mb-1">Category</h4>
                                <Badge variant="secondary">{ticket.category}</Badge>
                            </div>
                             <div>
                                <h4 className="font-semibold text-sm mb-1">Last Update</h4>
                                <p className="text-sm">{formatDistanceToNow(new Date(ticket.updated_date), { addSuffix: true })}</p>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {ticket.status === 'closed' || ticket.status === 'resolved' ? (
                        <Button 
                            className="w-full"
                            onClick={() => handleStatusUpdate('open')}
                            disabled={isSubmitting}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Re-open Ticket
                        </Button>
                    ) : (
                         <Button 
                            className="w-full bg-green-600 hover:bg-green-700"
                            onClick={() => handleStatusUpdate('resolved')}
                            disabled={isSubmitting}
                         >
                            Mark as Resolved
                         </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

function CSATSurvey({ ticket, onSurveySubmit }) {
    const [rating, setRating] = useState(0);
    const [feedback, setFeedback] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return;
        await SupportTicket.update(ticket.id, {
            customer_satisfaction_rating: rating,
            satisfaction_feedback: feedback,
            status: 'closed'
        });
        setSubmitted(true);
        setTimeout(onSurveySubmit, 1500);
    };

    if (ticket.customer_satisfaction_rating) {
        return (
            <Card className="bg-green-50 border-green-200">
                <CardContent className="p-6 text-center">
                    <p className="font-semibold text-green-800">Thank you for your feedback!</p>
                    <div className="flex justify-center items-center gap-1 mt-2">
                        {[...Array(ticket.customer_satisfaction_rating)].map((_, i) => (
                             <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    if (submitted) {
        return (
            <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-6 text-center">
                    <p className="font-semibold text-blue-800">Thank you! Your feedback has been submitted.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>How was your support experience?</CardTitle>
                <CardDescription>Your feedback helps us improve our support.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex justify-center items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                className={`w-8 h-8 cursor-pointer ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-300'}`}
                                onClick={() => setRating(star)}
                            />
                        ))}
                    </div>
                    <Textarea 
                        placeholder="Share any additional comments (optional)..."
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                    />
                    <Button type="submit" disabled={rating === 0}>Submit Feedback</Button>
                </form>
            </CardContent>
        </Card>
    )
}