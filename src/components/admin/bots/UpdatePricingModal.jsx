import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AIAgent } from '@/api/entities';
import { Loader2, Save } from 'lucide-react';

export default function UpdatePricingModal({ bot, onClose, onUpdated }) {
    const [pricingTier, setPricingTier] = useState(bot.pricing_tier || 'core');
    const [basePrice, setBasePrice] = useState(bot.base_price_annual || 0);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await AIAgent.update(bot.id, {
                pricing_tier: pricingTier,
                base_price_annual: basePrice,
            });
            onUpdated();
        } catch (error) {
            console.error("Failed to update bot pricing:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update Pricing for {bot.display_name}</DialogTitle>
                    <DialogDescription>Modify the pricing tier and annual base price for this AI Bot.</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <Label htmlFor="pricing_tier">Pricing Tier</Label>
                        <Select value={pricingTier} onValueChange={setPricingTier}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="core">Core</SelectItem>
                                <SelectItem value="premium">Premium</SelectItem>
                                <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="base_price">Base Price (Annual)</Label>
                        <Input
                            id="base_price"
                            type="number"
                            value={basePrice}
                            onChange={(e) => setBasePrice(parseFloat(e.target.value) || 0)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="ghost" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}