import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Search, 
  Eye, 
  RefreshCcw, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Users,
  Building,
  PlayCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import { Organization } from '@/api/entities';

export default function AdminOnboarding() {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const orgData = await Organization.list('-created_date');
      setOrganizations(orgData);
    } catch (error) {
      console.error("Failed to load onboarding data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResetOnboarding = async (orgId) => {
    if (window.confirm('Are you sure you want to reset this organization\'s onboarding progress?')) {
      try {
        await Organization.update(orgId, {
          onboarding_completed: false,
          onboarding_step: 1,
          onboarding_progress: {
            current_step: 1,
            completed_steps: [],
            step_data: {}
          }
        });
        loadData(); // Refresh data
        alert('Onboarding has been reset successfully.');
      } catch (error) {
        console.error('Error resetting onboarding:', error);
        alert('Failed to reset onboarding.');
      }
    }
  };

  const filteredOrganizations = organizations.filter(org =>
    org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    org.industry_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate stats
  const completedOnboarding = organizations.filter(org => org.onboarding_completed).length;
  const inProgressOnboarding = organizations.filter(org => org.onboarding_step && org.onboarding_step < 5).length;
  const notStartedOnboarding = organizations.filter(org => !org.onboarding_step || org.onboarding_step === 1).length;
  const averageCompletionRate = organizations.length > 0 ? Math.round((completedOnboarding / organizations.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-purple-600" />
            Onboarding Management
          </h1>
          <p className="text-slate-600 mt-1">Monitor and manage customer onboarding progress across all organizations.</p>
        </div>
        <Link to={createPageUrl('Welcome')}>
          <Button>
            <PlayCircle className="w-4 h-4 mr-2" />
            Preview Onboarding Flow
          </Button>
        </Link>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="organizations">Organization Status</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StatCard
              title="Completed Onboarding"
              value={completedOnboarding}
              icon={CheckCircle}
              color="green"
              description={`${averageCompletionRate}% completion rate`}
            />
            <StatCard
              title="In Progress"
              value={inProgressOnboarding}
              icon={Clock}
              color="blue"
              description="Currently onboarding"
            />
            <StatCard
              title="Not Started"
              value={notStartedOnboarding}
              icon={AlertTriangle}
              color="orange"
              description="Need attention"
            />
            <StatCard
              title="Total Organizations"
              value={organizations.length}
              icon={Building}
              color="purple"
              description="All registered"
            />
          </div>

          {/* Recent Onboarding Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Onboarding Activity</CardTitle>
              <CardDescription>Latest changes in onboarding status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {organizations.slice(0, 5).map(org => (
                  <div key={org.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{org.name}</p>
                        <p className="text-sm text-slate-500 capitalize">{org.industry_type}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {org.onboarding_completed ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Step {org.onboarding_step || 1} of 5
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="organizations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization Onboarding Status</CardTitle>
              <CardDescription>Detailed view of each organization's onboarding progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Search organizations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Organization</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Current Step</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Last Activity</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {filteredOrganizations.map(org => (
                      <tr key={org.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="font-medium text-slate-900">{org.name}</div>
                          <div className="text-sm text-slate-500 capitalize">{org.industry_type}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {org.onboarding_completed ? (
                            <Badge className="bg-green-100 text-green-800">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-800">
                              <Clock className="w-3 h-3 mr-1" />
                              In Progress
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {org.onboarding_completed ? 'All Steps Complete' : `Step ${org.onboarding_step || 1} of 5`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                          {org.updated_date ? new Date(org.updated_date).toLocaleDateString() : 'No activity'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                          <Link to={`${createPageUrl('Welcome')}?org_id=${org.id}`}>
                            <Button variant="outline" size="sm">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleResetOnboarding(org.id)}
                          >
                            <RefreshCcw className="w-4 h-4 mr-1" />
                            Reset
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Onboarding Analytics</CardTitle>
              <CardDescription>Insights into the onboarding process performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Completion Rate by Industry</h3>
                  <div className="space-y-3">
                    {['warehouse', 'manufacturing', 'retail', 'healthcare'].map(industry => {
                      const industryOrgs = organizations.filter(org => org.industry_type === industry);
                      const completed = industryOrgs.filter(org => org.onboarding_completed).length;
                      const rate = industryOrgs.length > 0 ? Math.round((completed / industryOrgs.length) * 100) : 0;
                      
                      return (
                        <div key={industry} className="flex items-center justify-between">
                          <span className="capitalize text-sm font-medium">{industry}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${rate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-slate-600 w-12">{rate}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Step Completion Analysis</h3>
                  <div className="space-y-3">
                    {[1, 2, 3, 4, 5].map(step => {
                      const completedStep = organizations.filter(org => 
                        org.onboarding_completed || (org.onboarding_step && org.onboarding_step > step)
                      ).length;
                      const rate = organizations.length > 0 ? Math.round((completedStep / organizations.length) * 100) : 0;
                      
                      return (
                        <div key={step} className="flex items-center justify-between">
                          <span className="text-sm font-medium">Step {step}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${rate}%` }}
                              ></div>
                            </div>
                            <span className="text-sm text-slate-600 w-12">{rate}%</span>
                          </div>
                        </div>
                      );
                    })}
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

const StatCard = ({ title, value, icon: Icon, color, description }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-600">{title}</p>
          <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </CardContent>
  </Card>
);