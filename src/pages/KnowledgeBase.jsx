import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowLeft, BookOpen, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { KnowledgeBaseArticle } from '@/api/entities';
import { motion } from 'framer-motion';

const mockArticles = [
  { id: 'kb1', title: 'How to Connect a New RTSP Camera', category: 'Camera Setup', tags: ['rtsp', 'camera', 'setup'], content: 'Step-by-step guide on adding a new RTSP camera stream to your AwareCam dashboard...' },
  { id: 'kb2', title: 'Understanding Your First Invoice', category: 'Billing', tags: ['billing', 'invoice', 'payment'], content: 'Learn how to read your invoice, understand charges, and manage payment methods...' },
  { id: 'kb3', title: 'What is an AI Agent?', category: 'AI Agents', tags: ['ai', 'agent', 'detection'], content: 'An explanation of AI agents and how they power intelligent video analysis...' },
  { id: 'kb4', title: 'Troubleshooting Camera Disconnection Issues', category: 'Troubleshooting', tags: ['camera', 'offline', 'disconnect'], content: 'Follow these steps if one of your cameras appears as offline or disconnected...' },
  { id: 'kb5', title: 'Setting Up Your Organization', category: 'Getting Started', tags: ['onboarding', 'setup', 'organization'], content: 'A guide for new organization admins to get their workspace ready for their team...' },
];

export default function KnowledgeBasePage() {
    const [articles, setArticles] = useState(mockArticles);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredArticles = articles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const articlesByCategory = filteredArticles.reduce((acc, article) => {
        if (!acc[article.category]) {
            acc[article.category] = [];
        }
        acc[article.category].push(article);
        return acc;
    }, {});

    return (
        <div className="p-6 space-y-6">
            <Link to={createPageUrl("Support")} className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4">
                <ArrowLeft className="w-4 h-4" />
                Back to Support Center
            </Link>
            
            <div className="text-center py-8">
                <BookOpen className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h1 className="text-4xl font-bold text-slate-900">Knowledge Base</h1>
                <p className="text-lg text-slate-600 mt-2">Find answers and solutions to common questions.</p>
                <div className="relative max-w-2xl mx-auto mt-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <Input 
                        placeholder="Search for articles..." 
                        className="pl-12 h-12 text-lg"
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {Object.entries(articlesByCategory).map(([category, articlesInCategory]) => (
                <motion.div key={category} initial={{ opacity: 0, y:20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <h2 className="text-2xl font-semibold text-slate-800 mb-4">{category}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {articlesInCategory.map(article => (
                            <Card key={article.id} className="hover:shadow-lg hover:-translate-y-1 transition-all">
                                <CardHeader>
                                    <CardTitle className="text-lg">{article.title}</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-slate-600 line-clamp-3">{article.content}</p>
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        {article.tags.map(tag => <Badge key={tag} variant="secondary">{tag}</Badge>)}
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}