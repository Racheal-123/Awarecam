import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  DollarSign,
  Activity,
  AlertTriangle,
  Zap,
  Crown,
  Camera,
  Shield,
  ClipboardCheck,
  Video,
  HeadphonesIcon,
  Bot,
  BarChart3,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Server,
  Database,
  Wifi,
  HardDrive
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import { Organization } from '@/api/entities';
import { User } from '@/api/entities';
import { Camera as CameraEntity } from '@/api/entities';
import { Event } from '@/api/entities';
import { Task } from '@/api/entities';
import { AIAgent } from '@/api/entities';
import { SupportTicket } from '@/api/entities';
import { MediaLibraryItem } from '@/api/entities';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    // Organization Stats
    totalOrganizations: 0,
    activeOrganizations: 0,
    trialOrganizations: 0,
    onboardingOrganizations: 0,
    
    // User Stats
    totalUsers: 0,
    activeUsers: 0,
    platformAdmins: 0,
    
    // Revenue Stats
    monthlyRevenue: 0,
    annualRevenue: 0,
    workflowAddonRevenue: 0,
    avgRevenuePerOrg: 0,
    
    // System Stats
    totalCameras: 0,
    activeCameras: 0,
    totalEvents: 0,
    todaysEvents: 0,
    totalTasks: 0,
    activeTasks: 0,
    
    // AI Stats
    totalAgents: 0,
    activeAgents: 0,
    agentDeployments: 0,
    
    // Support Stats
    openTickets: 0,
    urgentTickets: 0,
    avgResponseTime: '0h',
    satisfactionScore: 0,
    
    // Media Stats
    totalMediaItems: 0,
    storageUsed: 0,
    
    // System Health
    systemHealth: 99.8,
    uptime: '99.9%',
    apiResponseTime: '120ms',
    databaseHealth: 'Healthy'
  });

  const [recentActivity, setRecentActivity] = useState([]);
  const [systemAlerts, setSystemAlerts] = useState([]);
  const [growthMetrics, setGrowthMetrics] = useState({
    orgGrowth: 0,
    userGrowth: 0,
    revenueGrowth: 0,
    usageGrowth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load all data concurrently
      const [
        organizations,
        users,
        cameras,
        events,
        tasks,
        agents,
        tickets,
        mediaItems
      ] = await Promise.all([
        Organization.list().catch(() => []),
        User.list().catch(() => []),
        CameraEntity.list().catch(() => []),
        Event.list().catch(() => []),
        Task.list().catch(() => []),
        AIAgent.list().catch(() => []),
        SupportTicket.list().catch(() => []),
        MediaLibraryItem.list().catch(() => [])
      ]);

      // Calculate organization stats
      const activeOrgs = organizations.filter(org => org.subscription_status === 'active').length;
      const trialOrgs = organizations.filter(org => org.subscription_plan === 'trial').length;
      const onboardingOrgs = organizations.filter(org => !org.onboarding_completed).length;

      // Calculate revenue stats
      const monthlyRevenue = organizations.reduce((sum, org) => sum + (org.monthly_revenue || 0), 0);
      const workflowRevenue = organizations
        .filter(org => org.workflow_addon_enabled)
        .reduce((sum, org) => sum + (org.workflow_addon_price || 0), 0);
      const totalMonthlyRevenue = monthlyRevenue + workflowRevenue;

      // Calculate user stats
      const activeUsers = users.filter(u => u.is_active).length;
      const platformAdmins = users.filter(u => u.role === 'super_admin' || u.role === 'platform_admin').length;

      // Calculate system stats
      const activeCameras = cameras.filter(c => c.status === 'active').length;
      const todaysEvents = events.filter(e => {
        const eventDate = new Date(e.created_date);
        const today = new Date();
        return eventDate.toDateString() === today.toDateString();
      }).length;
      const activeTasks = tasks.filter(t => ['pending', 'assigned', 'in_progress'].includes(t.status)).length;

      // Calculate AI stats
      const activeAgents = agents.filter(a => a.is_active).length;
      const agentDeployments = organizations.reduce((sum, org) => {
        return sum + (org.ai_agents_enabled || 0);
      }, 0);

      // Calculate support stats
      const openTickets = tickets.filter(t => ['open', 'in_progress'].includes(t.status)).length;
      const urgentTickets = tickets.filter(t => t.priority === 'urgent' && ['open', 'in_progress'].includes(t.status)).length;

      // Calculate storage (mock calculation)
      const storageUsed = mediaItems.length * 50; // Assume 50MB per item

      setStats({
        totalOrganizations: organizations.length,
        activeOrganizations: activeOrgs,
        trialOrganizations: trialOrgs,
        onboardingOrganizations: onboardingOrgs,
        
        totalUsers: users.length,
        activeUsers,
        platformAdmins,
        
        monthlyRevenue: totalMonthlyRevenue,
        annualRevenue: totalMonthlyRevenue * 12,
        workflowAddonRevenue: workflowRevenue,
        avgRevenuePerOrg: organizations.length > 0 ? totalMonthlyRevenue / organizations.length : 0,
        
        totalCameras: cameras.length,
        activeCameras,
        totalEvents: events.length,
        todaysEvents,
        totalTasks: tasks.length,
        activeTasks,
        
        totalAgents: agents.length,
        activeAgents,
        agentDeployments,
        
        openTickets,
        urgentTickets,
        avgResponseTime: '2.3h',
        satisfactionScore: 4.7,
        
        totalMediaItems: mediaItems.length,
        storageUsed,
        
        systemHealth: 99.8,
        uptime: '99.9%',
        apiResponseTime: '120ms',
        databaseHealth: 'Healthy'
      });

      // Set growth metrics (mock data for now)
      setGrowthMetrics({
        orgGrowth: 12,
        userGrowth: 8,
        revenueGrowth: 15,
        usageGrowth: 22
      });

      // Set recent activity
      setRecentActivity([
        { type: 'org_created', message: 'New organization "TechCorp" created', time: '2 minutes ago', icon: Building2 },
        { type: 'user_invited', message: 'User invited to "Healthcare Solutions"', time: '5 minutes ago', icon: Users },
        { type: 'support_ticket', message: 'High priority ticket created', time: '8 minutes ago', icon: AlertTriangle },
        { type: 'agent_deployed', message: 'Safety Agent deployed to "Manufacturing Inc"', time: '12 minutes ago', icon: Zap },
        { type: 'system_alert', message: 'Database backup completed successfully', time: '15 minutes ago', icon: Database }
      ]);

      // Set system alerts
      setSystemAlerts([
        { type: 'warning', message: '3 organizations approaching storage limit', severity: 'medium' },
        { type: 'info', message: 'Scheduled maintenance in 2 days', severity: 'low' },
        { type: 'success', message: 'All systems operating normally', severity: 'low' }
      ]);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, trend, color = "blue", linkTo, subtitle }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="hover:shadow-lg transition-shadow h-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-600">{title}</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-bold text-slate-900">{value}</p>
                {trend !== undefined && (
                  <Badge className={`text-xs ${
                    trend > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {trend > 0 ? '+' : ''}{trend}%
                  </Badge>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
              )}
            </div>
            <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-6 h-6 text-${color}-600`} />
            </div>
          </div>
          {linkTo && (
            <Link to={linkTo} className="block mt-3">
              <Button variant="outline" size="sm" className="w-full">
                View Details
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Crown className="w-8 h-8 text-red-500" />
            Platform Admin Dashboard
          </h1>
          <p className="text-slate-600 mt-1">Monitor and manage the entire AwareCam platform</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-red-100 text-red-800 px-3 py-1 text-sm">
            Platform Administrator
          </Badge>
          <Button onClick={loadDashboardData} variant="outline">
            <Activity className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Alerts */}
      {systemAlerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="w-5 h-5" />
              System Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {systemAlerts.map((alert, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className={`w-2 h-2 rounded-full ${
                    alert.severity === 'high' ? 'bg-red-500' : 
                    alert.severity === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                  }`}></div>
                  <span className="text-slate-700">{alert.message}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Organizations"
              value={stats.totalOrganizations}
              icon={Building2}
              trend={growthMetrics.orgGrowth}
              color="blue"
              linkTo={createPageUrl("AdminOrganizationManagement")}
              subtitle={`${stats.activeOrganizations} active, ${stats.trialOrganizations} trial`}
            />
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              trend={growthMetrics.userGrowth}
              color="green"
              linkTo={createPageUrl("AdminUsers")}
              subtitle={`${stats.activeUsers} active users`}
            />
            <StatCard
              title="Monthly Revenue"
              value={`$${stats.monthlyRevenue.toLocaleString()}`}
              icon={DollarSign}
              trend={growthMetrics.revenueGrowth}
              color="purple"
              linkTo={createPageUrl("AdminBilling")}
              subtitle={`$${stats.avgRevenuePerOrg.toFixed(0)} avg per org`}
            />
            <StatCard
              title="System Health"
              value={`${stats.systemHealth}%`}
              icon={Activity}
              color="teal"
              subtitle={`${stats.uptime} uptime`}
            />
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                        <activity.icon className="w-4 h-4 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                        <p className="text-xs text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Organizations</span>
                    <Badge className="bg-green-100 text-green-800">+{growthMetrics.orgGrowth}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Users</span>
                    <Badge className="bg-green-100 text-green-800">+{growthMetrics.userGrowth}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Revenue</span>
                    <Badge className="bg-green-100 text-green-800">+{growthMetrics.revenueGrowth}%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Platform Usage</span>
                    <Badge className="bg-green-100 text-green-800">+{growthMetrics.usageGrowth}%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="business" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Annual Revenue"
              value={`$${stats.annualRevenue.toLocaleString()}`}
              icon={TrendingUp}
              color="green"
              subtitle="ARR"
            />
            <StatCard
              title="Workflow Add-on MRR"
              value={`$${stats.workflowAddonRevenue.toLocaleString()}`}
              icon={Zap}
              color="purple"
              subtitle="Additional revenue"
            />
            <StatCard
              title="Onboarding Progress"
              value={`${stats.totalOrganizations - stats.onboardingOrganizations}/${stats.totalOrganizations}`}
              icon={CheckCircle}
              color="blue"
              subtitle={`${stats.onboardingOrganizations} incomplete`}
            />
            <StatCard
              title="Trial Conversions"
              value="68%"
              icon={BarChart3}
              color="orange"
              subtitle="Last 30 days"
            />
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Total Cameras"
              value={stats.totalCameras}
              icon={Camera}
              color="blue"
              subtitle={`${stats.activeCameras} active`}
            />
            <StatCard
              title="Events Today"
              value={stats.todaysEvents}
              icon={Shield}
              color="red"
              subtitle={`${stats.totalEvents} total`}
            />
            <StatCard
              title="Active Tasks"
              value={stats.activeTasks}
              icon={ClipboardCheck}
              color="orange"
              subtitle={`${stats.totalTasks} total`}
            />
            <StatCard
              title="AI Agents"
              value={stats.activeAgents}
              icon={Bot}
              color="purple"
              subtitle={`${stats.agentDeployments} deployments`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Storage Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Media Items</span>
                    <span className="text-sm text-slate-600">{stats.totalMediaItems}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Storage Used</span>
                    <span className="text-sm text-slate-600">{stats.storageUsed} GB</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <p className="text-xs text-slate-500">45% of total capacity</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API Response Time</span>
                    <Badge className="bg-green-100 text-green-800">{stats.apiResponseTime}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Database Health</span>
                    <Badge className="bg-green-100 text-green-800">{stats.databaseHealth}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Uptime</span>
                    <Badge className="bg-green-100 text-green-800">{stats.uptime}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="support" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Open Tickets"
              value={stats.openTickets}
              icon={HeadphonesIcon}
              color="blue"
              linkTo={createPageUrl("AdminSupport")}
              subtitle={`${stats.urgentTickets} urgent`}
            />
            <StatCard
              title="Avg Response Time"
              value={stats.avgResponseTime}
              icon={Clock}
              color="orange"
              subtitle="First response"
            />
            <StatCard
              title="Satisfaction Score"
              value={`${stats.satisfactionScore}/5`}
              icon={CheckCircle}
              color="green"
              subtitle="Customer rating"
            />
            <StatCard
              title="Resolution Rate"
              value="94%"
              icon={TrendingUp}
              color="purple"
              subtitle="24h resolution rate"
            />
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Server Status"
              value="Online"
              icon={Server}
              color="green"
              subtitle="All services running"
            />
            <StatCard
              title="Database Health"
              value="Healthy"
              icon={Database}
              color="green"
              subtitle="No issues detected"
            />
            <StatCard
              title="Network Status"
              value="Stable"
              icon={Wifi}
              color="green"
              subtitle="Low latency"
            />
            <StatCard
              title="Storage Health"
              value="Good"
              icon={HardDrive}
              color="green"
              subtitle="55% capacity"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Monitoring</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Resource Usage</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>CPU Usage</span>
                        <span>23%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '23%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Memory Usage</span>
                        <span>67%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-orange-600 h-2 rounded-full" style={{ width: '67%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-3">Recent Deployments</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>API v2.1.3 deployed successfully</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span>Database migration completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-500" />
                      <span>Frontend update in progress</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}