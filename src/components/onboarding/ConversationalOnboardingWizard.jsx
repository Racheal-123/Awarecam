
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  ArrowLeft,
  Bot,
  CheckCircle,
  Building2,
  MapPin,
  Camera,
  Users,
  Workflow,
  Bell,
  Play,
  Sparkles,
  Shield,
  Eye,
  Zap,
  Award
} from 'lucide-react';
import { Organization } from '@/api/entities';
import { User as UserEntity } from '@/api/entities';
import { Location } from '@/api/entities';
import { toast } from 'sonner';

// Conversational flow definition - each step is a single question
const CONVERSATION_FLOW = [
  {
    id: 'welcome',
    type: 'info',
    question: "👋 Welcome to AwareCam!",
    subtitle: "I'm here to help you set up your video intelligence platform. This will take about 5 minutes.",
    progress: 5
  },
  {
    id: 'industry',
    type: 'single_choice',
    question: "What type of business are you setting up?",
    subtitle: "This helps me recommend the best features for you.",
    options: [
      { id: 'manufacturing', label: '🏭 Manufacturing', subtitle: 'Factories, production lines' },
      { id: 'warehouse', label: '📦 Warehouse & Logistics', subtitle: 'Distribution, fulfillment' },
      { id: 'retail', label: '🛍️ Retail', subtitle: 'Stores, shopping centers' },
      { id: 'healthcare', label: '🏥 Healthcare', subtitle: 'Hospitals, clinics' },
      { id: 'office', label: '🏢 Office & Corporate', subtitle: 'Business offices' },
      { id: 'education', label: '📚 Education', subtitle: 'Schools, universities' },
      { id: 'hospitality', label: '🏨 Hospitality', subtitle: 'Hotels, restaurants' },
      { id: 'construction', label: '🚧 Construction', subtitle: 'Job sites, equipment' },
      { id: 'other', label: '✨ Other', subtitle: 'Tell us more later' }
    ],
    progress: 15
  },
  {
    id: 'priorities',
    type: 'multi_choice',
    question: "What are your main goals with AwareCam?",
    subtitle: "Select all that apply - this helps me prioritize features for you.",
    options: [
      { id: 'safety', label: '🛡️ Safety & Compliance', subtitle: 'PPE, incident prevention' },
      { id: 'security', label: '👁️ Security & Theft Prevention', subtitle: 'Intrusion, asset protection' },
      { id: 'operations', label: '⚡ Operational Efficiency', subtitle: 'Workflow optimization' },
      { id: 'quality', label: '🏆 Quality Control', subtitle: 'Process monitoring' }
    ],
    progress: 25
  },
  {
    id: 'org_size',
    type: 'single_choice',
    question: "How many people work at your organization?",
    subtitle: "This helps me suggest the right plan and features.",
    options: [
      { id: '1-10', label: '👥 1-10 employees', subtitle: 'Small business' },
      { id: '11-50', label: '👨‍👩‍👧‍👦 11-50 employees', subtitle: 'Growing team' },
      { id: '51-200', label: '🏢 51-200 employees', subtitle: 'Mid-size company' },
      { id: '200+', label: '🏭 200+ employees', subtitle: 'Large organization' }
    ],
    progress: 35
  },
  {
    id: 'location_name',
    type: 'text_input',
    question: "What should I call your main location?",
    subtitle: "For example: 'Downtown Warehouse' or 'Corporate HQ'",
    placeholder: "Main Location",
    progress: 45
  },
  {
    id: 'camera_approach',
    type: 'single_choice',
    question: "How would you like to connect your cameras?",
    subtitle: "Don't worry - you can always add more cameras later.",
    options: [
      { id: 'existing', label: '📹 Connect existing cameras', subtitle: 'I have RTSP/IP cameras' },
      { id: 'device', label: '📱 Use my device camera', subtitle: 'Phone, tablet, or laptop' },
      { id: 'demo', label: '🎬 Start with demo feeds', subtitle: 'See how it works first' },
      { id: 'skip', label: '⏭️ Skip for now', subtitle: 'Set up cameras later' }
    ],
    progress: 60
  },
  {
    id: 'plan_choice',
    type: 'single_choice',
    question: "Which plan fits your needs?",
    subtitle: "You can upgrade or change plans anytime.",
    options: [
      { 
        id: 'starter', 
        label: '🚀 Starter - $99/mo', 
        subtitle: 'Up to 5 cameras, basic AI, email alerts',
        details: ['5 cameras max', 'Basic detection', '7-day storage', 'Email alerts']
      },
      { 
        id: 'pro', 
        label: '💼 Professional - $299/mo', 
        subtitle: 'Up to 25 cameras, workflows, advanced AI',
        details: ['25 cameras max', 'Advanced AI agents', '30-day storage', 'Workflow automation', 'Multi-channel alerts'],
        recommended: true
      },
      { 
        id: 'enterprise', 
        label: '🏢 Enterprise - Custom', 
        subtitle: 'Unlimited cameras, custom features',
        details: ['Unlimited cameras', 'Custom AI training', 'Unlimited storage', 'Dedicated support']
      }
    ],
    progress: 75
  },
  {
    id: 'notification_style',
    type: 'single_choice',
    question: "How would you like to receive alerts?",
    subtitle: "You can add more notification channels later.",
    options: [
      { id: 'email', label: '✉️ Email notifications', subtitle: 'Send alerts to your inbox' },
      { id: 'multi', label: '📱 Email + SMS', subtitle: 'Get notified multiple ways' },
      { id: 'advanced', label: '🔗 Advanced setup', subtitle: 'Slack, webhooks, etc.' },
      { id: 'minimal', label: '🔕 Minimal notifications', subtitle: 'Only critical alerts' }
    ],
    progress: 85
  },
  {
    id: 'completion',
    type: 'completion',
    question: "🎉 You're all set!",
    subtitle: "Your AwareCam platform is ready. Let me show you around!",
    progress: 100
  }
];

export default function ConversationalOnboardingWizard({ user, organization, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showingFeedback, setShowingFeedback] = useState(false);
  const inputRef = useRef(null);

  // Safely get current question with bounds checking
  const currentQuestion = CONVERSATION_FLOW[currentStep] || CONVERSATION_FLOW[0];

  const saveProgress = useCallback(async () => {
    if (!organization?.id) return;
    
    try {
      await Organization.update(organization.id, {
        onboarding_progress: {
          current_step: currentStep,
          answers: answers,
          last_updated: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error('Failed to save progress:', error);
    }
  }, [organization?.id, currentStep, answers]);

  useEffect(() => {
    // Focus text input when it appears
    if (currentQuestion?.type === 'text_input' && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }

    // Auto-save progress
    if (organization?.id && currentStep > 0) {
      saveProgress();
    }
  }, [currentStep, currentQuestion?.type, organization?.id, saveProgress]);

  const handleAnswer = async (answerId, customValue = null) => {
    if (!currentQuestion) return;
    
    const isWelcomeStep = currentQuestion.id === 'welcome';

    // For all steps except 'welcome', save the answer.
    if (!isWelcomeStep) {
        const newAnswers = {
          ...answers,
          [currentQuestion.id]: customValue || answerId
        };
        setAnswers(newAnswers);
    }
    
    // For regular steps, show feedback. For welcome, just continue.
    if (!isWelcomeStep) {
        setShowingFeedback(true);
        setTimeout(() => {
          setShowingFeedback(false);
          // Move to next question after feedback
          setTimeout(() => {
            if (currentStep < CONVERSATION_FLOW.length - 1) {
              setCurrentStep(prev => prev + 1);
              setTextInput(''); // Clear text input for next question
            }
          }, 300);
        }, 2500); // Increased from 800ms to 2500ms (2.5 seconds)
    } else {
        // Just move to the next step directly for the welcome step.
        if (currentStep < CONVERSATION_FLOW.length - 1) {
            setCurrentStep(prev => prev + 1);
        }
    }
  };

  const handleTextSubmit = (e) => {
    if (e) e.preventDefault();
    if (!textInput.trim()) return;
    
    handleAnswer(textInput.trim(), textInput.trim());
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
      setShowingFeedback(false);
    }
  };

  const handleComplete = async () => {
    setIsProcessing(true);
    try {
      // Process all answers and create necessary records
      const processedData = await processOnboardingAnswers(answers, user, organization);
      
      // Complete onboarding
      if (organization?.id) {
        await Organization.update(organization.id, {
          ...processedData.organizationData,
          onboarding_completed: true,
          onboarding_step: CONVERSATION_FLOW.length
        });
      }

      onComplete(processedData);
    } catch (error) {
      console.error('Failed to complete onboarding:', error);
      toast.error('Failed to complete setup. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getFeedbackMessage = () => {
    if (!currentQuestion) return "Thanks! Let's keep going.";
    
    const question = currentQuestion;
    const answer = answers[question.id];

    const feedbacks = {
      industry: `Great! ${getIndustryEmoji(answer)} businesses often see huge value from video intelligence.`,
      priorities: `Perfect! I'll focus on ${answer?.length || 1} key area${answer?.length > 1 ? 's' : ''} for you.`,
      org_size: `Got it! I'll recommend features that work well for ${answer} teams.`,
      location_name: `Nice! "${answer}" sounds like an important location.`,
      camera_approach: getCameraFeedback(answer),
      plan_choice: getPlanFeedback(answer),
      notification_style: `Perfect! I'll set up ${getNotificationFeedback(answer)} for you.`
    };

    return feedbacks[question.id] || "Thanks! Let's keep going.";
  };

  const getIndustryEmoji = (industry) => {
    const emojis = {
      manufacturing: '🏭', warehouse: '📦', retail: '🛍️', healthcare: '🏥',
      office: '🏢', education: '📚', hospitality: '🏨', construction: '🚧'
    };
    return emojis[industry] || '✨';
  };

  const getCameraFeedback = (approach) => {
    const feedbacks = {
      existing: 'Excellent! I\'ll help you connect your cameras in just a moment.',
      device: 'Smart choice! Your device camera is a great way to get started.',
      demo: 'Perfect! Demo feeds are a great way to explore the platform.',
      skip: 'No problem! You can add cameras anytime from your dashboard.'
    };
    return feedbacks[approach] || 'Great choice!';
  };

  const getPlanFeedback = (plan) => {
    const feedbacks = {
      starter: 'Perfect for getting started! You can always upgrade as you grow.',
      pro: 'Excellent choice! The Pro plan gives you powerful automation tools.',
      enterprise: 'Perfect for large-scale operations! We\'ll get you set up with custom features.'
    };
    return feedbacks[plan] || 'Great choice!';
  };

  const getNotificationFeedback = (style) => {
    const feedbacks = {
      email: 'email notifications',
      multi: 'email and SMS notifications',
      advanced: 'advanced notification channels',
      minimal: 'minimal, focused notifications'
    };
    return feedbacks[style] || 'notifications';
  };

  // Early return if no questions available (catastrophic failure scenario)
  if (!currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="text-red-500 mb-4 text-6xl">⚠️</div>
          <h2 className="text-xl font-bold mb-2 text-white">Setup Error</h2>
          <p className="text-slate-400 mb-4">Unable to load onboarding questions.</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex flex-col">
      {/* Progress Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-slate-700">
                Step {currentStep + 1} of {CONVERSATION_FLOW.length}
              </span>
            </div>
            {currentStep > 0 && !showingFeedback && (
              <Button variant="ghost" size="sm" onClick={handleBack}>
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
          </div>
          <Progress value={currentQuestion.progress || 0} className="h-2" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            {showingFeedback ? (
              <FeedbackSlide 
                key="feedback"
                message={getFeedbackMessage()} 
                answers={answers}
                question={currentQuestion}
              />
            ) : (
              <QuestionSlide
                key={currentStep}
                question={currentQuestion}
                onAnswer={handleAnswer}
                onTextSubmit={handleTextSubmit}
                textInput={textInput}
                setTextInput={setTextInput}
                inputRef={inputRef}
                answers={answers}
                onComplete={handleComplete}
                isProcessing={isProcessing}
              />
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Feedback slide component
function FeedbackSlide({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="text-center"
    >
      <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardContent className="p-12">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            {message}
          </h2>
          
          <div className="flex justify-center">
            <div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Main question slide component
function QuestionSlide({ 
  question, 
  onAnswer, 
  onTextSubmit, 
  textInput, 
  setTextInput, 
  inputRef, 
  answers,
  onComplete,
  isProcessing 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="text-center"
    >
      <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm">
        <CardContent className="p-8 md:p-12">
          {/* Question Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
              {question.question}
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              {question.subtitle}
            </p>
          </div>

          {/* Question Content */}
          {question.type === 'info' && <InfoContent onAnswer={onAnswer} />}
          {question.type === 'single_choice' && (
            <SingleChoiceContent 
              options={question.options} 
              onAnswer={onAnswer}
              selectedAnswer={answers[question.id]}
            />
          )}
          {question.type === 'multi_choice' && (
            <MultiChoiceContent 
              options={question.options} 
              onAnswer={onAnswer}
              selectedAnswers={answers[question.id] || []}
            />
          )}
          {question.type === 'text_input' && (
            <TextInputContent 
              placeholder={question.placeholder}
              value={textInput}
              onChange={setTextInput}
              onSubmit={onTextSubmit}
              inputRef={inputRef}
            />
          )}
          {question.type === 'completion' && (
            <CompletionContent 
              onComplete={onComplete}
              isProcessing={isProcessing}
              answers={answers}
            />
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Info content (welcome screen)
function InfoContent({ onAnswer }) {
  return (
    <div className="space-y-8">
      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
        <Sparkles className="w-10 h-10 text-white" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
        <div className="text-center">
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-slate-700">Business Setup</span>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Camera className="w-6 h-6 text-purple-600" />
          </div>
          <span className="text-sm font-medium text-slate-700">Camera Integration</span>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <span className="text-sm font-medium text-slate-700">Team Access</span>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Bell className="w-6 h-6 text-orange-600" />
          </div>
          <span className="text-sm font-medium text-slate-700">Smart Alerts</span>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="pt-6"
      >
        <Button
          onClick={() => onAnswer('continue')}
          className="w-full md:w-auto px-10 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-lg font-semibold"
        >
          Let's Get Started
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </motion.div>
    </div>
  );
}

// Single choice content
function SingleChoiceContent({ options, onAnswer, selectedAnswer }) {
  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {options.map((option, index) => (
        <motion.button
          key={option.id}
          onClick={() => onAnswer(option.id)}
          className={`w-full p-6 rounded-2xl border-2 transition-all duration-200 text-left group hover:shadow-lg ${
            selectedAnswer === option.id
              ? 'border-blue-500 bg-blue-50 shadow-md'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
                {option.label}
              </h3>
              {option.subtitle && (
                <p className="text-sm text-slate-600">{option.subtitle}</p>
              )}
              {option.details && (
                <ul className="mt-3 space-y-1">
                  {option.details.map((detail, idx) => (
                    <li key={idx} className="text-xs text-slate-500 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                      {detail}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {option.recommended && (
              <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">
                Recommended
              </Badge>
            )}
            <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-500 ml-4 transition-colors" />
          </div>
        </motion.button>
      ))}
    </div>
  );
}

// Multi choice content
function MultiChoiceContent({ options, onAnswer, selectedAnswers }) {
  const [localSelected, setLocalSelected] = useState(selectedAnswers);

  const toggleSelection = (optionId) => {
    const newSelected = localSelected.includes(optionId)
      ? localSelected.filter(id => id !== optionId)
      : [...localSelected, optionId];
    setLocalSelected(newSelected);
  };

  const handleContinue = () => {
    if (localSelected.length > 0) {
      onAnswer(localSelected, localSelected);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="space-y-4">
        {options.map((option, index) => (
          <motion.button
            key={option.id}
            onClick={() => toggleSelection(option.id)}
            className={`w-full p-6 rounded-2xl border-2 transition-all duration-200 text-left group hover:shadow-lg ${
              localSelected.includes(option.id)
                ? 'border-blue-500 bg-blue-50 shadow-md'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1"> {/* Added this div for text content */}
                <h3 className="text-lg font-semibold text-slate-900 mb-1 group-hover:text-blue-700 transition-colors">
                  {option.label}
                </h3>
                {option.subtitle && (
                  <p className="text-sm text-slate-600">{option.subtitle}</p>
                )}
              </div>
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                localSelected.includes(option.id)
                  ? 'border-blue-500 bg-blue-500'
                  : 'border-slate-300 bg-white'
              }`}>
                {localSelected.includes(option.id) && (
                  <CheckCircle className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {localSelected.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4"
        >
          <Button
            onClick={handleContinue}
            className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-lg font-semibold"
          >
            Continue with {localSelected.length} selection{localSelected.length > 1 ? 's' : ''}
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}

// Text input content
function TextInputContent({ placeholder, value, onChange, onSubmit, inputRef }) {
  return (
    <form onSubmit={onSubmit} className="max-w-lg mx-auto">
      <div className="relative">
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="h-16 text-xl px-6 rounded-2xl border-2 border-slate-200 focus:border-blue-500 text-center"
          autoComplete="off"
        />
        <motion.button
          type="submit"
          disabled={!value.trim()}
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
            value.trim() 
              ? 'bg-blue-500 text-white hover:bg-blue-600 cursor-pointer' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
          whileHover={value.trim() ? { scale: 1.05 } : {}}
          whileTap={value.trim() ? { scale: 0.95 } : {}}
        >
          <ArrowRight className="w-5 h-5" />
        </motion.button>
      </div>
      
      {value.trim() && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-center"
        >
          <p className="text-sm text-slate-500">Press Enter or click → to continue</p>
        </motion.div>
      )}
    </form>
  );
}

// Completion content
function CompletionContent({ onComplete, isProcessing, answers }) {
  return (
    <div className="space-y-8">
      <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-lg">
        <CheckCircle className="w-10 h-10 text-white" />
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Here's what I've set up for you:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-blue-600" />
            </div>
            <span className="text-slate-700">
              {answers.industry} business profile
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-4 h-4 text-green-600" />
            </div>
            <span className="text-slate-700">
              "{answers.location_name}" location
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-purple-600" />
            </div>
            <span className="text-slate-700">
              {answers.plan_choice} plan
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Bell className="w-4 h-4 text-orange-600" />
            </div>
            <span className="text-slate-700">
              {answers.notification_style} alerts
            </span>
          </div>
        </div>
      </div>

      <Button
        onClick={onComplete}
        disabled={isProcessing}
        className="w-full h-16 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xl font-semibold"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-3" />
            Setting up your platform...
          </>
        ) : (
          <>
            <Play className="w-6 h-6 mr-3" />
            Take me to my dashboard!
          </>
        )}
      </Button>
    </div>
  );
}

// Helper function to process onboarding answers
async function processOnboardingAnswers(answers, user, organization) {
  // Process and structure the answers into the format expected by the system
  const organizationData = {
    industry_type: answers.industry,
    employee_count_range: answers.org_size,
    subscription_plan: answers.plan_choice,
    primary_risks: answers.priorities || [],
    onboarding_answers: answers
  };

  const locationData = answers.location_name ? {
    name: answers.location_name,
    organization_id: organization?.id,
    country: 'US' // Default, can be enhanced later
  } : null;

  return {
    organizationData,
    locationData,
    answers
  };
}
