import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Zap, TrendingUp, DollarSign, Activity, Edit, Trash2 } from 'lucide-react';
import { AIAgent } from '@/api/entities';
import CreateAgentTemplateModal from '@/components/admin/agents/CreateAgentTemplateModal';
import UpdatePricingModal from '@/components/admin/bots/UpdatePricingModal';
import PerformanceDetailModal from '@/components/admin/bots/PerformanceDetailModal';

export default function AdminBotsPage() {
    const [bots, setBots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showPricingModal, setShowPricingModal] = useState(false);
    const [showPerfModal, setShowPerfModal] = useState(false);
    const [selectedBot, setSelectedBot] = useState(null);

    useEffect(() => {
        loadBots();
    }, []);

    const loadBots = async () => {
        setLoading(true);
        try {
            const botData = await AIAgent.list('-created_date');
            setBots(botData);
        } catch (error) {
            console.error('Error loading AI bots:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const handleEditPricing = (bot) => {
        setSelectedBot(bot);
        setShowPricingModal(true);
    };

    const handleViewPerformance = (bot) => {
        setSelectedBot(bot);
        setShowPerfModal(true);
    };
    
    const handleBotCreated = () => {
        setShowCreateModal(false);
        loadBots();
    };

    const handlePricingUpdated = () => {
        setShowPricingModal(false);
        setSelectedBot(null);
        loadBots();
    };

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                        <Zap className="w-8 h-8 text-blue-600" />
                        AI Bot Management
                    </h1>
                    <p className="text-slate-600 mt-1">Manage AI Bot templates, pricing, and performance.</p>
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    <PlusCircle className="w-4 h-4 mr-2" />
                    Create New Bot
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All AI Bots</CardTitle>
                    <CardDescription>A complete list of all available AI Bots in the system.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Pricing Tier</TableHead>
                                <TableHead>Base Price (Annual)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">Loading bots...</TableCell>
                                </TableRow>
                            )}
                            {!loading && bots.map((bot) => (
                                <TableRow key={bot.id}>
                                    <TableCell className="font-medium">{bot.display_name}</TableCell>
                                    <TableCell><Badge variant="secondary" className="capitalize">{bot.category}</Badge></TableCell>
                                    <TableCell className="capitalize">{bot.pricing_tier}</TableCell>
                                    <TableCell>${(bot.base_price_annual || 0).toLocaleString()}</TableCell>
                                    <TableCell>
                                        <Badge variant={bot.is_active ? 'default' : 'outline'}>
                                            {bot.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleViewPerformance(bot)}>
                                                    <Activity className="w-4 h-4 mr-2" />
                                                    View Performance
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEditPricing(bot)}>
                                                    <DollarSign className="w-4 h-4 mr-2" />
                                                    Edit Pricing
                                                </DropdownMenuItem>
                                                <DropdownMenuItem>
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit Details
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600">
                                                    <Trash2 className="w-4 h-4 mr-2" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {showCreateModal && (
                <CreateAgentTemplateModal
                    onClose={() => setShowCreateModal(false)}
                    onBotCreated={handleBotCreated}
                />
            )}
            
            {showPricingModal && selectedBot && (
                <UpdatePricingModal
                    bot={selectedBot}
                    onClose={() => setShowPricingModal(false)}
                    onUpdated={handlePricingUpdated}
                />
            )}
            
            {showPerfModal && selectedBot && (
                <PerformanceDetailModal
                    bot={selectedBot}
                    onClose={() => setShowPerfModal(false)}
                />
            )}
        </div>
    );
}