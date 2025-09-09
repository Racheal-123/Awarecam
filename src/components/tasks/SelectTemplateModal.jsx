
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, ClipboardCheck, Search, Sparkles } from 'lucide-react';
import { WorkflowTemplate } from '@/api/entities';

export default function SelectTemplateModal({ onSelect, onCancel, onManualCreate }) {
  const [templates, setTemplates] = useState([]);
  const [filteredTemplates, setFilteredTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function loadTemplates() {
      try {
        const activeTemplates = await WorkflowTemplate.filter({ is_active: true });
        setTemplates(activeTemplates);
        setFilteredTemplates(activeTemplates);
      } catch (error) {
        console.error("Failed to load workflow templates:", error);
      } finally {
        setLoading(false);
      }
    }
    loadTemplates();
  }, []);

  useEffect(() => {
    const filtered = templates.filter(t =>
      t.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredTemplates(filtered);
  }, [searchTerm, templates]);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-4xl"
      >
        <Card className="max-h-[90vh] flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-2xl font-bold">Create a New Task</CardTitle>
                <p className="text-slate-500">Start with a template or create a blank task.</p>
              </div>
              <Button variant="ghost" size="icon" onClick={onCancel}>
                <X />
              </Button>
            </div>
            <div className="relative pt-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto space-y-4">
            {loading ? (
              <p>Loading templates...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card 
                    className="flex flex-col items-center justify-center text-center p-6 border-2 border-dashed hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer"
                    onClick={onManualCreate}
                >
                    <Sparkles className="w-10 h-10 text-blue-500 mb-3"/>
                    <h3 className="font-semibold text-lg text-slate-800">Blank Task</h3>
                    <p className="text-sm text-slate-500">Create a one-off custom task.</p>
                </Card>
                {filteredTemplates.map(template => (
                  <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => onSelect(template)}>
                    <CardHeader>
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <Badge variant="outline" className="capitalize w-fit">{template.template_category}</Badge>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-slate-600 line-clamp-2">{template.description}</p>
                      <div className="flex items-center gap-2 mt-4 text-sm text-slate-500">
                        <ClipboardCheck className="w-4 h-4" />
                        <span>{template.steps?.length || 0} steps</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {filteredTemplates.length === 0 && !loading && searchTerm && (
                <p className="text-center text-slate-500 py-8">No templates match your search.</p>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
