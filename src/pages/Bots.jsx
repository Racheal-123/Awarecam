import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Zap,
  Search,
  Users,
  Shield,
  HardHat,
  Sparkles,
  Eye,
  TrendingUp,
  Info
} from 'lucide-react';

import { AIAgent } from '@/api/entities';
import BotDetailModal from '@/components/bots/BotDetailModal';
import CustomBotBuilder from '@/components/bots/CustomBotBuilder';

const BOT_ICONS = {
  'safety': HardHat,
  'security': Eye,
  'operations': TrendingUp,
  'quality': Sparkles,
  'compliance': Shield,
  'custom': Users
};

const CATEGORIES = ['all', 'safety', 'security', 'operations', 'quality', 'compliance'];

export default function BotsPage() {
  const [bots, setBots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedBot, setSelectedBot] = useState(null);
  const [showBotBuilder, setShowBotBuilder] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const botData = await AIAgent.list('-created_date');
      
      const safeBots = botData.map(bot => ({
        ...bot,
        display_name: bot.display_name || 'Unnamed Bot',
        description: bot.description || 'No description available',
        category: bot.category || 'custom',
        base_price_annual: bot.base_price_annual || 0,
        pricing_tier: bot.pricing_tier || 'core',
        industry_focus: Array.isArray(bot.industry_focus) ? bot.industry_focus : []
      }));
      
      setBots(safeBots);
    } catch (error) {
      console.error('Error loading bot data:', error);
      if (error.message.includes('429')) {
        console.log('Rate limited, will retry in 2 seconds...');
        setTimeout(() => loadData(), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredBots = bots.filter(bot => {
    const safeDisplayName = (bot.display_name || '').toLowerCase();
    const safeDescription = (bot.description || '').toLowerCase();
    const safeSearchTerm = (searchTerm || '').toLowerCase();

    const matchesSearch = safeDisplayName.includes(safeSearchTerm) ||
                         safeDescription.includes(safeSearchTerm);
    
    const matchesCategory = selectedCategory === 'all' || bot.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLearnMore = (bot) => {
    setSelectedBot(bot);
  };

  const handleCreateBot = () => {
    setShowBotBuilder(true);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-slate-200 rounded w-80"></div>
          <div className="h-16 bg-slate-200 rounded-xl"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-64 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 flex items-center gap-3">
              <Zap className="w-9 h-9 text-blue-600"/>
              AI Bot Marketplace
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            Enhance your video intelligence with specialized AI capabilities.
          </p>
        </div>
        <Button
          onClick={handleCreateBot}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Request Custom Bot
        </Button>
      </div>

      {/* Filters */}
      <Card className="shadow-lg border-0">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search bots by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category)}
                  className="capitalize rounded-full"
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bot Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBots.map((bot, index) => (
          <BotCard
            key={bot.id}
            bot={bot}
            index={index}
            onLearnMore={handleLearnMore}
          />
        ))}
      </div>

      {filteredBots.length === 0 && !loading && (
        <div className="text-center py-12">
          <Zap className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No bots found</h3>
          <p className="text-slate-500">Try adjusting your search or category filters.</p>
        </div>
      )}

      {/* Modals */}
      {selectedBot && (
        <BotDetailModal
          bot={selectedBot}
          onClose={() => setSelectedBot(null)}
        />
      )}

      {showBotBuilder && (
        <CustomBotBuilder onClose={() => setShowBotBuilder(false)} />
      )}
    </div>
  );
}

function BotCard({ bot, index, onLearnMore }) {
  const IconComponent = BOT_ICONS[bot.category] || Zap;
  const tierColors = {
    core: 'border-green-500 bg-green-50 text-green-700',
    premium: 'border-blue-500 bg-blue-50 text-blue-700',
    enterprise: 'border-purple-500 bg-purple-50 text-purple-700',
  };

  const safePrice = typeof bot.base_price_annual === 'number' ? bot.base_price_annual : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="h-full"
    >
      <Card className="border-2 border-slate-200 shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${tierColors[bot.pricing_tier] || tierColors.core}`}>
              <IconComponent className="w-8 h-8" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900">{bot.display_name}</CardTitle>
              <Badge variant="secondary" className="capitalize mt-1">{bot.category}</Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
          <p className="text-sm text-slate-600 flex-grow">{bot.description}</p>

          <div>
            <div className="text-center my-4">
              <p className="text-slate-500 text-sm">Starts at</p>
              <p className="text-2xl font-bold text-slate-900">
                ${safePrice.toLocaleString()}<span className="text-base font-normal">/year</span>
              </p>
            </div>

            <Button
              size="lg"
              onClick={() => onLearnMore(bot)}
              className="w-full"
            >
              <Info className="w-4 h-4 mr-2" />
              Learn More
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}