import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Info, Zap, HardHat, Eye, TrendingUp, Shield, Users, DollarSign, Settings } from 'lucide-react';
import BotFlowBuilderModal from '@/components/bots/BotFlowBuilderModal';

const BOT_ICONS = {
    'safety': HardHat,
    'security': Eye,
    'operations': TrendingUp,
    'quality': Zap,
    'compliance': Shield,
    'custom': Users
};

const tierColors = {
    core: 'bg-green-100 text-green-800',
    premium: 'bg-blue-100 text-blue-800',
    enterprise: 'bg-purple-100 text-purple-800',
};

export default function BotDetailModal({ bot, onClose }) {
    const [showFlowBuilder, setShowFlowBuilder] = useState(false);
    if (!bot) return null;

    const IconComponent = BOT_ICONS[bot.category] || Zap;
    const safePrice = typeof bot.base_price_annual === 'number' ? bot.base_price_annual : 0;

    return (
        <>
            <Dialog open={true} onOpenChange={onClose}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                            <IconComponent className="w-7 h-7 text-blue-600" />
                            <span className="text-2xl font-bold">{bot.display_name}</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Left Column */}
                            <div className="space-y-4">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Bot Details</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <p className="text-sm text-slate-600">{bot.description}</p>
                                        <div className="flex flex-wrap gap-2">
                                            <Badge variant="secondary" className="capitalize">{bot.category}</Badge>
                                            <Badge className={tierColors[bot.pricing_tier]}>{bot.pricing_tier} Tier</Badge>
                                            {bot.is_beta && <Badge variant="outline" className="border-orange-400 text-orange-600">Beta</Badge>}
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Key Features</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ul className="space-y-2 text-sm">
                                            {(bot.key_features || []).map((feature, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Right Column */}
                            <div className="space-y-4">
                                <Card className="bg-slate-50">
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <DollarSign className="w-5 h-5" />
                                            Pricing
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-3xl font-bold text-slate-900">${safePrice.toLocaleString()}</p>
                                        <p className="text-slate-600">per year</p>
                                        <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">Add to Plan</Button>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Settings className="w-5 h-5" />
                                            Automation Flow
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-slate-600 mb-4">
                                            Configure how this bot triggers alerts and workflows for your organization.
                                        </p>
                                        <Button 
                                            variant="outline" 
                                            className="w-full"
                                            onClick={() => setShowFlowBuilder(true)}
                                        >
                                            Configure Bot Flow
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {showFlowBuilder && (
                <BotFlowBuilderModal
                    bot={bot}
                    onClose={() => setShowFlowBuilder(false)}
                />
            )}
        </>
    );
}