
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { 
  X, 
  Search, 
  Filter, 
  Download, 
  Star, 
  Clock, 
  CheckSquare,
  Shield,
  Wrench,
  Sparkles,
  Building,
  GraduationCap,
  Heart,
  TrendingUp,
  Users,
  PlayCircle,
  BookOpen,
  Zap,
  Camera,
  Target,
  Award,
  Eye,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
  PenSquare,
  PlusCircle,
  FileImage,
  Video,
  PenTool
} from 'lucide-react';

const TEMPLATE_CATEGORIES = [
  {
    id: 'safety',
    name: 'Safety & Compliance',
    icon: Shield,
    description: 'Protect your team and meet regulatory requirements',
    color: 'red',
    bgColor: 'from-red-50 to-red-100',
    borderColor: 'border-red-200',
    textColor: 'text-red-800'
  },
  {
    id: 'operations',
    name: 'Operations & Efficiency',
    icon: Zap,
    description: 'Streamline processes and boost productivity',
    color: 'blue',
    bgColor: 'from-blue-50 to-blue-100',
    borderColor: 'border-blue-200',
    textColor: 'text-blue-800'
  },
  {
    id: 'maintenance',
    name: 'Maintenance & Quality',
    icon: Wrench,
    description: 'Keep equipment running and standards high',
    color: 'green',
    bgColor: 'from-green-50 to-green-100',
    borderColor: 'border-green-200',
    textColor: 'text-green-800'
  },
  {
    id: 'emergency',
    name: 'Emergency & Security',
    icon: AlertTriangle,
    description: 'Prepare for emergencies and secure your facility',
    color: 'orange',
    bgColor: 'from-orange-50 to-orange-100',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800'
  }
];

const INDUSTRY_TEMPLATES = {
  warehouse: [
    {
      id: 'warehouse-ppe-inspection',
      name: 'Daily PPE Compliance Check',
      description: 'Automated personal protective equipment verification with AI detection.',
      category: 'safety',
      complexity: 'beginner',
      setupTime: 15,
      timeSavings: 8,
      rating: 4.9,
      deployments: 247,
      tags: ['ppe', 'safety', 'compliance', 'daily'],
      benefits: [
        'Reduces PPE violations by up to 85%',
        'Automates compliance documentation',
        'Helps prevent costly fines and incidents'
      ],
      prerequisites: ['PPE Detection Agent', '2+ cameras'],
      steps: [
        { icon: Camera, title: 'Hard Hat Detection', description: 'AI verifies all personnel in the zone are wearing hard hats.' },
        { icon: Camera, title: 'Safety Vest Verification', description: 'AI confirms high-visibility vests are worn by all team members.' },
        { icon: FileImage, title: 'Photo of Work Area', description: 'Operator takes a photo to document current site conditions.' },
        { icon: PenTool, title: 'Safety Briefing Sign-off', description: 'Supervisor signs to confirm the daily safety briefing was completed.' },
        { icon: CheckSquare, title: 'Walkway Clearance Check', description: 'Operator confirms walkways are clear of obstructions.' }
      ],
      roi: { costSavings: 25000, incidentReduction: 85, timeSavings: 32 }
    },
    {
      id: 'forklift-safety-rounds',
      name: 'Forklift Safety Inspection',
      description: 'Comprehensive daily forklift safety checks with AI proximity monitoring.',
      category: 'safety',
      complexity: 'intermediate',
      setupTime: 25,
      timeSavings: 12,
      rating: 4.8,
      deployments: 189,
      tags: ['forklift', 'equipment', 'safety', 'inspection'],
      benefits: [
        'Prevents common forklift accidents',
        'Provides real-time proximity alerts',
        'Tracks equipment status automatically'
      ],
      prerequisites: ['Forklift Detection Agent', 'Vehicle Proximity Agent', '3+ cameras'],
      steps: [
          { icon: CheckSquare, title: 'Tire & Horn Check', description: 'Operator confirms tire pressure and horn functionality.' },
          { icon: FileImage, title: 'Photo of Forklift Condition', description: 'Take a photo of the forklift from the side.' },
          { icon: Camera, title: 'Safe Parking Zone', description: 'AI verifies forklift is parked in the designated safety zone.' },
          { icon: PenTool, title: 'Operator Sign-off', description: 'Operator signs off on the pre-operation inspection.' }
      ],
      roi: { costSavings: 45000, incidentReduction: 73, timeSavings: 48 }
    },
    {
      id: 'loading-dock-efficiency',
      name: 'Loading Dock Operations',
      description: 'Streamline loading dock processes with automated truck detection and workflow.',
      category: 'operations',
      complexity: 'advanced',
      setupTime: 40,
      timeSavings: 20,
      rating: 4.7,
      deployments: 156,
      tags: ['loading dock', 'efficiency', 'trucks', 'operations'],
      benefits: [
        'Reduces truck loading time by 40%',
        'Automates truck arrival/departure alerts',
        'Integrates with inventory tracking'
      ],
      prerequisites: ['Vehicle Detection Agent', 'Zone Monitoring Agent', '4+ cameras'],
      steps: [
        { icon: Camera, title: 'Truck Arrival Detection', description: 'AI automatically detects when a truck arrives at the dock.' },
        { icon: CheckSquare, title: 'Chock Wheels & Lock', description: 'Operator confirms that wheel chocks are in place.' },
        { icon: FileImage, title: 'Photo of Sealed Cargo', description: 'Operator takes a photo of the cargo seal before opening.' },
        { icon: PenTool, title: 'Bill of Lading Signature', description: 'Driver provides signature for the bill of lading.' },
        { icon: Camera, title: 'Truck Departure Detection', description: 'AI automatically detects when the truck has left the dock.' },
      ],
      roi: { costSavings: 78000, incidentReduction: 45, timeSavings: 80 }
    }
  ],
  manufacturing: [
    {
      id: 'production-line-safety',
      name: 'Production Line Safety Check',
      description: 'Monitor production line safety with real-time worker and equipment detection',
      category: 'safety',
      complexity: 'intermediate',
      setupTime: 30,
      timeSavings: 15,
      // The original `steps` was a number. We need it to be an array for consistency
      // with how the detail view and card now handle steps. Providing an empty array
      // as no specific step data was provided for manufacturing templates in the outline.
      steps: [], 
      rating: 4.8,
      deployments: 198,
      tags: ['production', 'safety', 'equipment', 'monitoring'],
      benefits: [
        'Reduces workplace accidents by 67%',
        'Real-time equipment monitoring',
        'Automated safety compliance reporting'
      ],
      prerequisites: ['Person Detection Agent', 'Equipment Safety Agent', '5+ cameras'],
      roi: {
        costSavings: 55000,
        incidentReduction: 67,
        timeSavings: 60
      }
    }
  ]
};

const COMPLEXITY_INFO = {
  beginner: {
    color: 'bg-green-100 text-green-800',
    description: 'Easy to set up and manage',
    setupTime: '15-20 minutes'
  },
  intermediate: {
    color: 'bg-yellow-100 text-yellow-800',
    description: 'Moderate setup with advanced features',
    setupTime: '20-35 minutes'
  },
  advanced: {
    color: 'bg-orange-100 text-orange-800',
    description: 'Complex workflow with multiple integrations',
    setupTime: '35+ minutes'
  }
};

export default function TemplateLibrary({ industryType, onUseAsIs, onCustomize, onClose }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [complexityFilter, setComplexityFilter] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showTemplateDetail, setShowTemplateDetail] = useState(false);

  const industryTemplates = INDUSTRY_TEMPLATES[industryType] || [];
  const allTemplates = Object.values(INDUSTRY_TEMPLATES).flat();

  const filteredTemplates = allTemplates.filter(template => {
    const matchesSearch = !searchTerm || 
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = activeCategory === 'all' || template.category === activeCategory;
    const matchesComplexity = complexityFilter === 'all' || template.complexity === complexityFilter;
    
    return matchesSearch && matchesCategory && matchesComplexity;
  });

  const handleTemplatePreview = (template) => {
    setSelectedTemplate(template);
    setShowTemplateDetail(true);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-7xl max-h-[95vh] overflow-y-auto"
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-3">
                  <Sparkles className="w-7 h-7 text-blue-600" />
                  Workflow Template Library
                </CardTitle>
                <p className="text-slate-600 mt-1">
                  Choose from battle-tested workflows optimized for {industryType} operations
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-slate-500">
                  <span>2,847 workflows deployed</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    4.8 average rating
                  </span>
                  <span>•</span>
                  <span>340% average ROI</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search templates, benefits, or use cases..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={complexityFilter} onValueChange={setComplexityFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Complexity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Category Navigation */}
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="all">All Templates</TabsTrigger>
                {TEMPLATE_CATEGORIES.map((category) => (
                  <TabsTrigger key={category.id} value={category.id}>
                    {category.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <RecommendedTemplates 
                  templates={industryTemplates} 
                  industryType={industryType}
                  onPreview={handleTemplatePreview}
                />
              </TabsContent>

              {TEMPLATE_CATEGORIES.map((category) => (
                <TabsContent key={category.id} value={category.id} className="mt-6">
                  <CategoryTemplates 
                    category={category}
                    templates={filteredTemplates.filter(t => t.category === category.id)}
                    onPreview={handleTemplatePreview}
                  />
                </TabsContent>
              ))}
            </Tabs>

            {/* Template Grid */}
            {activeCategory === 'all' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTemplates.map((template, index) => (
                  <TemplateCard
                    key={template.id}
                    template={template}
                    index={index}
                    onPreview={() => handleTemplatePreview(template)}
                  />
                ))}
              </div>
            )}

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12">
                <Filter className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No Templates Found</h3>
                <p className="text-slate-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Template Detail Modal */}
        {showTemplateDetail && selectedTemplate && (
          <TemplateDetailModal
            template={selectedTemplate}
            onClose={() => setShowTemplateDetail(false)}
            onUseAsIs={() => {
                onUseAsIs(selectedTemplate);
                setShowTemplateDetail(false);
            }}
            onCustomize={() => {
                onCustomize(selectedTemplate);
                setShowTemplateDetail(false);
            }}
          />
        )}
      </motion.div>
    </div>
  );
}

// Recommended Templates Section
function RecommendedTemplates({ templates, industryType, onPreview }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-blue-900">Perfect for Your {industryType} Operation</h3>
        </div>
        <p className="text-blue-700 mb-4">
          These templates are specifically optimized for {industryType} facilities and address your most common challenges.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.slice(0, 6).map((template, index) => (
          <TemplateCard
            key={template.id}
            template={template}
            index={index}
            onPreview={() => onPreview(template)}
            featured={true}
          />
        ))}
      </div>
    </div>
  );
}

// Category Templates Section
function CategoryTemplates({ category, templates, onPreview }) {
  const CategoryIcon = category.icon;

  return (
    <div className="space-y-6">
      <div className={`bg-gradient-to-r ${category.bgColor} rounded-2xl p-6 border ${category.borderColor}`}>
        <div className="flex items-center gap-3 mb-4">
          <CategoryIcon className={`w-6 h-6 ${category.textColor}`} />
          <h3 className={`text-xl font-bold ${category.textColor}`}>{category.name}</h3>
        </div>
        <p className={category.textColor}>
          {category.description}
        </p>
        <p className={`text-sm ${category.textColor} mt-2 opacity-75`}>
          {templates.length} templates available
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template, index) => (
          <TemplateCard
            key={template.id}
            template={template}
            index={index}
            onPreview={() => onPreview(template)}
          />
        ))}
      </div>
    </div>
  );
}

// Template Card Component
function TemplateCard({ template, index, onPreview, featured = false }) {
  const complexityInfo = COMPLEXITY_INFO[template.complexity];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className={`h-full hover:shadow-xl transition-all duration-300 cursor-pointer group ${featured ? 'ring-2 ring-blue-200' : ''}`}>
        <CardContent className="p-6 h-full flex flex-col">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors mb-2">
                {template.name}
              </h3>
              <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                {template.description}
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className={complexityInfo.color}>
              {template.complexity}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Clock className="w-3 h-3 mr-1" />
              {template.setupTime}m setup
            </Badge>
            <Badge variant="outline" className="text-xs">
              <CheckSquare className="w-3 h-3 mr-1" />
              {template.steps ? template.steps.length : 0} steps {/* Changed to .length */}
            </Badge>
          </div>

          {/* Benefits */}
          <div className="flex-1 mb-4">
            <ul className="space-y-1">
              {template.benefits.slice(0, 3).map((benefit, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <TrendingUp className="w-3 h-3 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{template.rating}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{template.deployments} deployments</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onPreview} className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              Preview & Use
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Step Icon component
const StepIcon = ({ icon: Icon, ...props }) => {
  return Icon ? <Icon {...props} /> : null;
};


// Template Detail Modal
function TemplateDetailModal({ template, onClose, onUseAsIs, onCustomize }) {
  // const CategoryIcon = TEMPLATE_CATEGORIES.find(c => c.id === template.category)?.icon || Zap; // Not used in new modal structure
  const complexityInfo = COMPLEXITY_INFO[template.complexity];

  return (
    <Dialog open={!!template} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl p-0">
        <div className="p-6 pb-0"> {/* Adjusted padding */}
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-slate-900">{template.name}</DialogTitle>
            <DialogDescription className="text-slate-600 mt-1">{template.description}</DialogDescription>
          </DialogHeader>
        </div>

        <div className="grid md:grid-cols-3 gap-0 px-6 pb-6">
          {/* Main Content: Steps */}
          <div className="md:col-span-2 space-y-4 pr-6 border-r">
            <h3 className="font-semibold text-slate-900 text-lg flex items-center gap-2">
              <ClipboardList className="w-5 h-5" />
              Workflow Steps ({template.steps?.length || 0})
            </h3>
            <div className="space-y-3 max-h-[45vh] overflow-y-auto pr-2">
              {template.steps?.length > 0 ? (
                template.steps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-3 rounded-lg bg-slate-50 border">
                    <div className="flex-shrink-0 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 font-semibold">
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800 flex items-center gap-2">
                        <StepIcon icon={step.icon} className="w-5 h-5 text-blue-600" />
                        {step.title}
                      </p>
                      <p className="text-sm text-slate-500">{step.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-2">
                  <p className="text-sm text-slate-600">
                    This template includes a pre-defined sequence of steps including checklists, photo requirements, and AI validations to ensure the job is done right every time. You can customize these steps after adding the template.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar: Details */}
          <div className="space-y-6 md:pl-6 mt-6 md:mt-0">
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-green-900">Expected Results</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-green-700">Cost Savings:</span>
                  <span className="font-medium text-green-900">${template.roi.costSavings.toLocaleString()}/yr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Incident Reduction:</span>
                  <span className="font-medium text-green-900">{template.roi.incidentReduction}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-700">Time Savings:</span>
                  <span className="font-medium text-green-900">{template.roi.timeSavings}h/mo</span>
                </div>
              </CardContent>
            </Card>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">What You'll Accomplish</h4>
              <ul className="space-y-1.5 text-sm">
                {template.benefits.map((benefit, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckSquare className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-700">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Requirements</h4>
              <div className="flex flex-wrap gap-2">
                {template.prerequisites.map((prereq, idx) => (
                  <Badge key={idx} variant="outline" className="text-blue-700 border-blue-200">
                    {prereq}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t bg-slate-50 flex-col sm:flex-row sm:justify-end sm:space-x-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={onCustomize} variant="outline">
              <PenSquare className="w-4 h-4 mr-2" />
              Customize Template
          </Button>
          <Button onClick={onUseAsIs} className="bg-blue-600 hover:bg-blue-700">
              <PlusCircle className="w-4 h-4 mr-2" />
              Use Template As-Is
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
