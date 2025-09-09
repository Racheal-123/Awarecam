
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Eye,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Users,
  Zap,
  Video,
  Play,
  Sparkles,
  TrendingUp,
  Activity,
  Shield,
  Target,
  Settings,
  RefreshCw,
  Bell
} from 'lucide-react';
import { AITaskMonitoringSession } from '@/api/entities';
import { Task } from '@/api/entities';
import { Camera as CameraEntity } from '@/api/entities';
import { Employee } from '@/api/entities';
import AITaskRulesModal from '@/components/tasks/AITaskRulesModal';

export default function AITaskMonitorPage() {
  const [activeSessions, setActiveSessions] = useState([]);
  const [completedTasks, setCompletedTasks] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showRulesModal, setShowRulesModal] = useState(false);
  // Added for modal functionality based on outline, assuming a mock organization for demonstration
  const [organization, setOrganization] = useState({ id: 'org_123', name: 'Acme Corp' });

  useEffect(() => {
    loadData();
    // Set up real-time updates
    const interval = setInterval(loadData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      // Load mock data for demonstration
      const mockActiveSessions = [
        {
          id: '1',
          task_id: 'task_001',
          task_title: 'Empty Kitchen Garbage - Morning',
          employee_name: 'John Smith',
          camera_name: 'Kitchen Area Camera',
          zone_name: 'Kitchen Zone',
          monitoring_status: 'active',
          session_start: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          detection_events: [
            {
              timestamp: new Date(Date.now() - 300000).toISOString(),
              detected_objects: ['person', 'garbage_bag'],
              confidence_scores: { person: 0.94, garbage_bag: 0.87 },
              is_relevant: true
            }
          ],
          current_confidence: 87,
          expected_completion: new Date(Date.now() + 300000).toISOString() // 5 minutes from now
        },
        {
          id: '2',
          task_id: 'task_002',
          task_title: 'PPE Compliance Check - Manufacturing Floor',
          employee_name: 'Sarah Johnson',
          camera_name: 'Manufacturing Line 1',
          zone_name: 'Production Zone A',
          monitoring_status: 'active',
          session_start: new Date(Date.now() - 900000).toISOString(), // 15 minutes ago
          detection_events: [
            {
              timestamp: new Date(Date.now() - 120000).toISOString(),
              detected_objects: ['person', 'hard_hat', 'safety_vest'],
              confidence_scores: { person: 0.96, hard_hat: 0.92, safety_vest: 0.89 },
              is_relevant: true
            }
          ],
          current_confidence: 92,
          expected_completion: new Date(Date.now() + 600000).toISOString() // 10 minutes from now
        },
        {
          id: '3',
          task_id: 'task_003',
          task_title: 'Forklift Safety Inspection',
          employee_name: 'Mike Chen',
          camera_name: 'Warehouse Loading Dock',
          zone_name: 'Loading Dock A',
          monitoring_status: 'active',
          session_start: new Date().toISOString(),
          detection_events: [],
          current_confidence: 0,
          expected_completion: new Date(Date.now() + 1800000).toISOString() // 30 minutes from now
        }
      ];

      const mockCompletedTasks = [
        {
          id: '4',
          task_title: 'Equipment Cleaning - Conveyor Belt',
          employee_name: 'Lisa Rodriguez',
          camera_name: 'Production Line 2',
          completion_time: new Date(Date.now() - 1800000).toISOString(),
          validation_method: 'ai_auto',
          final_confidence: 94,
          evidence_clips: ['clip_001.mp4', 'clip_002.mp4']
        },
        {
          id: '5',
          task_title: 'Vehicle Departure Confirmation',
          employee_name: 'Auto-detected',
          camera_name: 'Loading Dock Camera',
          completion_time: new Date(Date.now() - 3600000).toISOString(),
          validation_method: 'ai_auto',
          final_confidence: 98,
          evidence_clips: ['clip_003.mp4']
        }
      ];

      setActiveSessions(mockActiveSessions);
      setCompletedTasks(mockCompletedTasks);
    } catch (error) {
      console.error('Error loading AI task monitoring data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureRules = () => {
    setShowRulesModal(true);
  };

  const getStatusColor = (confidence) => {
    if (confidence >= 90) return 'text-green-600 bg-green-100';
    if (confidence >= 70) return 'text-yellow-600 bg-yellow-100';
    if (confidence >= 50) return 'text-orange-600 bg-orange-100';
    return 'text-red-600 bg-red-100';
  };

  const getValidationMethodBadge = (method) => {
    switch (method) {
      case 'ai_auto':
        return <Badge className="bg-green-100 text-green-800">AI Auto-Validated</Badge>;
      case 'ai_hybrid':
        return <Badge className="bg-blue-100 text-blue-800">AI + Manual</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Manual Only</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 rounded w-80 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
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
            <Sparkles className="w-9 h-9 text-blue-600"/>
            AI Task Monitor
          </h1>
          <p className="text-slate-600 mt-2 text-lg">
            Real-time AI validation of workflow tasks across your facility
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleConfigureRules}>
            <Settings className="w-4 h-4 mr-2" />
            Configure Rules
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-sm font-medium">Active Monitoring</p>
                  <p className="text-3xl font-bold text-blue-900">{activeSessions.length}</p>
                  <p className="text-xs text-blue-600 mt-1">Tasks being validated</p>
                </div>
                <Eye className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium">Auto-Completed</p>
                  <p className="text-3xl font-bold text-green-900">{completedTasks.length}</p>
                  <p className="text-xs text-green-600 mt-1">Tasks today</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-700 text-sm font-medium">AI Accuracy</p>
                  <p className="text-3xl font-bold text-purple-900">94%</p>
                  <p className="text-xs text-purple-600 mt-1">Validation success rate</p>
                </div>
                <Target className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-700 text-sm font-medium">Time Saved</p>
                  <p className="text-3xl font-bold text-amber-900">3.2h</p>
                  <p className="text-xs text-amber-600 mt-1">Manual validation avoided</p>
                </div>
                <TrendingUp className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-md">
          <TabsTrigger value="active">Active Monitoring</TabsTrigger>
          <TabsTrigger value="completed">Completed Tasks</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Active AI Monitoring Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activeSessions.map((session) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6 border rounded-xl hover:shadow-md transition-shadow bg-gradient-to-r from-slate-50 to-blue-50"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Camera className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{session.task_title}</h4>
                          <p className="text-sm text-slate-600">
                            {session.employee_name} • {session.camera_name}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(session.current_confidence)}>
                        {session.current_confidence}% Confidence
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Monitoring Duration</p>
                        <p className="font-medium">
                          {Math.round((Date.now() - new Date(session.session_start)) / 60000)} minutes
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Detection Events</p>
                        <p className="font-medium">{session.detection_events.length} events</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Expected Completion</p>
                        <p className="font-medium">
                          {new Date(session.expected_completion).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium">Validation Progress</p>
                        <p className="text-sm text-slate-600">{session.current_confidence}%</p>
                      </div>
                      <Progress value={session.current_confidence} className="h-2" />
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-slate-600">AI actively monitoring</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <Video className="w-4 h-4 mr-2" />
                          View Live
                        </Button>
                        <Button size="sm" variant="outline">
                          Details
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="completed" className="space-y-6">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                Recently Completed Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {completedTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-6 border rounded-xl bg-gradient-to-r from-green-50 to-emerald-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <CheckCircle2 className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-900">{task.task_title}</h4>
                          <p className="text-sm text-slate-600">
                            {task.employee_name} • {task.camera_name}
                          </p>
                          <p className="text-xs text-slate-500 mt-1">
                            Completed {new Date(task.completion_time).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {getValidationMethodBadge(task.validation_method)}
                        <p className="text-sm text-green-600 font-medium mt-1">
                          {task.final_confidence}% confidence
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                        <Video className="w-4 h-4 text-slate-400" />
                        <span className="text-sm text-slate-600">
                          {task.evidence_clips.length} evidence clips saved
                        </span>
                      </div>
                      <Button size="sm" variant="outline">
                        View Evidence
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Validation Success Rate by Task Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { type: 'Garbage Collection', rate: 96, count: 24 },
                    { type: 'PPE Compliance', rate: 94, count: 18 },
                    { type: 'Equipment Cleaning', rate: 92, count: 15 },
                    { type: 'Vehicle Operations', rate: 98, count: 12 }
                  ].map((item) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{item.type}</p>
                        <p className="text-sm text-slate-600">{item.count} tasks today</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{item.rate}%</p>
                        <Progress value={item.rate} className="w-24 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle>Time Savings Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="text-center p-6 bg-blue-50 rounded-xl">
                    <TrendingUp className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                    <p className="text-3xl font-bold text-blue-900">67%</p>
                    <p className="text-blue-700">Reduction in manual validation time</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-900">23.5h</p>
                      <p className="text-sm text-green-700">Time saved this week</p>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <p className="text-2xl font-bold text-purple-900">$2,340</p>
                      <p className="text-sm text-purple-700">Cost savings</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* AI Task Rules Modal */}
      {showRulesModal && (
        <AITaskRulesModal
          onClose={() => setShowRulesModal(false)}
          organization={organization}
        />
      )}
    </div>
  );
}
