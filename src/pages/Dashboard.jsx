import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Camera,
  Shield,
  Users,
  Activity,
  TrendingUp,
  Eye,
  BarChart3,
  Zap,
  Image,
  Library,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { User } from '@/api/entities';
import { Camera as CameraEntity } from '@/api/entities';
import { Event } from '@/api/entities';
import { Task } from '@/api/entities';
import { createPageUrl } from '@/utils';
import { format, subDays, startOfDay } from 'date-fns';

const SHARED_DEMO_EVENTS = [
    { 
        id: 'evt1', 
        camera_id: 'demo-store-entrance', 
        camera_name: 'Demo - Store Entrance',
        event_type: 'person_detected', 
        severity: 'medium', 
        confidence: 0.94, 
        description: 'Customer entered store', 
        thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
        status: 'new',
        location: 'Building A - Main Floor',
        created_date: new Date(Date.now() - 1000 * 60).toISOString(),
    },
    { 
        id: 'evt2', 
        camera_id: 'demo-store-entrance', 
        camera_name: 'Demo - Store Entrance',
        event_type: 'safety_violation', 
        severity: 'high', 
        confidence: 0.89, 
        description: 'Spill detected in entrance area', 
        thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
        status: 'new',
        location: 'Building A - Main Floor',
        created_date: new Date(Date.now() - 1000 * 120).toISOString(),
    },
    { 
        id: 'evt3', 
        camera_id: 'demo-checkout-area', 
        camera_name: 'Demo - Checkout Area',
        event_type: 'vehicle_detected', 
        severity: 'low', 
        confidence: 0.76, 
        description: 'Delivery truck approaching', 
        thumbnail_url: 'https://storage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
        status: 'new',
        location: 'Main Floor',
        created_date: new Date(Date.now() - 1000 * 180).toISOString(),
    },
];

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    activeCameras: 0,
    todayEvents: 0,
    compliancePercentage: 0,
    overdueTasks: 0
  });
  const [recentEvents, setRecentEvents] = useState([]);
  const [cameras, setCameras] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = useCallback(async () => {
    try {
      const userData = await User.me();
      setUser(userData);

      const [cameraData, eventData, taskData] = await Promise.all([
        CameraEntity.list(),
        Event.list('-created_date', 50),
        Task.list()
      ]);
      
      const today = startOfDay(new Date());
      const completedTasks = taskData.filter(t => t.completed_at && new Date(t.completed_at) >= today);
      const totalDueTasks = taskData.filter(t => t.due_date && new Date(t.due_date) >= today);
      const compliance = totalDueTasks.length > 0 ? (completedTasks.length / totalDueTasks.length) * 100 : 100;

      setStats({
        activeCameras: cameraData.filter(c => c.status === 'active').length,
        todayEvents: eventData.filter(e => new Date(e.created_date) >= today).length,
        compliancePercentage: Math.round(compliance),
        overdueTasks: taskData.filter(t => t.status === 'overdue' || (t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed')).length
      });

      const eventsToShow = eventData.length > 0 ? eventData : SHARED_DEMO_EVENTS;
      setRecentEvents(eventsToShow.slice(0, 5).map(event => ({
        ...event,
        time: formatTimeAgo(event.created_date),
      })));

      setCameras(cameraData.slice(0, 4));

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fallback to demo data
      setStats({ activeCameras: 4, todayEvents: 3, compliancePercentage: 88, overdueTasks: 2 });
      setRecentEvents(SHARED_DEMO_EVENTS.slice(0, 5).map(event => ({ ...event, time: formatTimeAgo(event.created_date)})));
      setCameras([
        { id: 1, name: 'Main Entrance Cam', status: 'active', location: 'Lobby' },
        { id: 2, name: 'Warehouse Cam', status: 'active', location: 'Dock A' },
        { id: 3, name: 'Lobby Cam', status: 'inactive', location: 'Lobby' },
        { id: 4, name: 'Parking Lot Cam', status: 'active', location: 'North Lot' }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const formatTimeAgo = (dateString) => {
    const now = new Date();
    const eventDate = new Date(dateString);
    const diffMs = now.getTime() - eventDate.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };
  
  const severityColors = {
    critical: 'bg-red-100 text-red-800 border-red-200',
    high: 'bg-orange-100 text-orange-800 border-orange-200',
    medium: 'bg-blue-100 text-blue-800 border-blue-200',
    low: 'bg-slate-100 text-slate-700 border-slate-200'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-50 min-h-full max-w-full">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 truncate">Welcome back, {user?.full_name?.split(' ')[0] || 'User'}</h1>
          <p className="text-slate-600 mt-2">Here's your operational overview for today.</p>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <Button onClick={() => window.location.href = createPageUrl('Live')} className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg w-full sm:w-auto"><Eye className="w-4 h-4 mr-2" /> Live View</Button>
            <Button onClick={() => window.location.href = createPageUrl('Tasks')} variant="outline" className="w-full sm:w-auto"><ClipboardCheck className="w-4 h-4 mr-2" /> View Tasks</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100"><CardContent className="p-4 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-blue-700 text-sm font-medium">Active Cameras</p><p className="text-2xl sm:text-3xl font-bold text-blue-900">{stats.activeCameras}</p></div><Camera className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" /></div></CardContent></Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100"><CardContent className="p-4 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-purple-700 text-sm font-medium">Today's Events</p><p className="text-2xl sm:text-3xl font-bold text-purple-900">{stats.todayEvents}</p></div><Activity className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" /></div></CardContent></Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100"><CardContent className="p-4 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-green-700 text-sm font-medium">Compliance Score</p><p className="text-2xl sm:text-3xl font-bold text-green-900">{stats.compliancePercentage}%</p></div><Shield className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" /></div></CardContent></Card>
        <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100"><CardContent className="p-4 sm:p-6"><div className="flex items-center justify-between"><div><p className="text-red-700 text-sm font-medium">Overdue Tasks</p><p className="text-2xl sm:text-3xl font-bold text-red-900">{stats.overdueTasks}</p></div><AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-red-600" /></div></CardContent></Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 rounded-xl border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><Zap className="text-blue-500" /> Recent Events</CardTitle><Button variant="ghost" size="sm" onClick={() => window.location.href = createPageUrl('Events')}>View All</Button></CardHeader>
            <CardContent className="space-y-4">
              {recentEvents.map(event => (
                <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 cursor-pointer" onClick={() => window.location.href = createPageUrl('Events')}>
                  <div className="relative flex-shrink-0">
                    {event.thumbnail_url ? <img src={event.thumbnail_url} alt="Event" className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg object-cover"/> : <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-200 rounded-lg flex items-center justify-center"><Image className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-slate-900 truncate text-sm sm:text-base">{event.description}</h4>
                    <p className="text-xs sm:text-sm text-slate-600 truncate">{event.camera_name} • {event.time}</p>
                  </div>
                  <Badge className={`${severityColors[event.severity]} flex-shrink-0 text-xs`}>{event.severity}</Badge>
                </motion.div>
              ))}
            </CardContent>
        </Card>

        <Card className="rounded-xl border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><Camera className="text-blue-500" /> Camera Status</CardTitle><Button variant="ghost" size="sm" onClick={() => window.location.href = createPageUrl('Cameras')}>Manage</Button></CardHeader>
            <CardContent className="space-y-3">
              {cameras.map(camera => (
                <motion.div key={camera.id} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-sm text-slate-900 truncate">{camera.name}</h4>
                    <p className="text-xs text-slate-500 truncate">{camera.location}</p>
                  </div>
                  <Badge variant={camera.status === 'active' ? 'default' : 'destructive'} className={`${camera.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'} text-xs flex-shrink-0`}>{camera.status}</Badge>
                </motion.div>
              ))}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}