
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CreditCard, 
  DollarSign, 
  TrendingUp,
  Building2,
  Zap,
  BookOpen
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Organization } from '@/api/entities';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import SubscriptionManagement from '@/components/admin/billing/SubscriptionManagement';

export default function AdminBilling() {
  const [activeTab, setActiveTab] = useState('overview');
  
  useEffect(() => {
    // Check URL params for tab selection
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-green-600" />
            Billing & Revenue
          </h1>
          <p className="text-slate-600 mt-1">Monitor subscription revenue and manage customer subscriptions.</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="mt-6">
          <BillingOverview />
        </TabsContent>
        <TabsContent value="subscriptions" className="mt-6">
          <SubscriptionManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}


function BillingOverview() {
  const [billingData, setBillingData] = useState({
    monthlyRevenue: 0,
    annualRevenue: 0,
    totalCustomers: 0,
    workflowRevenue: 0
  });
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBillingData();
  }, []);

  const loadBillingData = async () => {
    try {
      const orgs = await Organization.list();
      setOrganizations(orgs);

      const monthlyRevenue = orgs.reduce((sum, org) => sum + (org.monthly_revenue || 0), 0);
      const workflowRevenue = orgs
        .filter(org => org.workflow_addon_enabled)
        .reduce((sum, org) => sum + (org.workflow_addon_price || 0), 0);

      setBillingData({
        monthlyRevenue: monthlyRevenue + workflowRevenue,
        annualRevenue: (monthlyRevenue + workflowRevenue) * 12,
        totalCustomers: orgs.length,
        workflowRevenue
      });
    } catch (error) {
      console.error('Error loading billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscriptionColors = {
    trial: 'bg-blue-100 text-blue-800',
    basic: 'bg-green-100 text-green-800',
    professional: 'bg-purple-100 text-purple-800',
    enterprise: 'bg-orange-100 text-orange-800'
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading billing data...</div>;
  }

  return (
    <div className="space-y-8">
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Monthly Revenue" value={`$${billingData.monthlyRevenue.toLocaleString()}`} icon={DollarSign} color="green" />
        <StatCard title="Annual Revenue (ARR)" value={`$${billingData.annualRevenue.toLocaleString()}`} icon={TrendingUp} color="purple" />
        <StatCard title="Paying Customers" value={billingData.totalCustomers} icon={Building2} color="blue" />
        <StatCard title="Workflow Add-on MRR" value={`$${billingData.workflowRevenue.toLocaleString()}`} icon={Zap} color="orange" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Customer Billing Overview</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {organizations.map((org) => (
            <div key={org.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-slate-900">{org.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={subscriptionColors[org.subscription_plan]}>{org.subscription_plan}</Badge>
                  {org.workflow_addon_enabled && (
                    <Badge className="bg-purple-100 text-purple-800">
                      <Zap className="w-3 h-3 mr-1" /> Workflow
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-sm text-slate-500">Monthly</p>
                  <p className="font-semibold text-slate-900">
                    ${((org.monthly_revenue || 0) + (org.workflow_addon_enabled ? (org.workflow_addon_price || 0) : 0)).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

const StatCard = ({ title, value, icon: Icon, color }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className={`text-3xl font-bold text-slate-900`}>{value}</p>
          </div>
          <div className={`w-12 h-12 bg-${color}-100 rounded-xl flex items-center justify-center`}>
            <Icon className={`w-6 h-6 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);
