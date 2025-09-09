import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star, Zap, Gem, ShieldCheck, Cpu, HardHat, Package, Server, LifeBuoy, Users, Code, Building } from 'lucide-react';

import { SubscriptionPlan } from '@/api/entities';
import { AddOnProduct } from '@/api/entities';
import { Organization } from '@/api/entities';
import { User } from '@/api/entities';

const PlanCard = ({ plan, isCurrent, onSelectPlan }) => {
  const isEnterprise = plan.name === 'enterprise';
  const isProfessional = plan.name === 'professional';

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="h-full"
    >
      <Card className={`flex flex-col h-full shadow-lg ${isProfessional ? 'border-2 border-blue-600' : ''}`}>
        <CardHeader className="pb-4">
          {isProfessional && (
            <Badge className="w-fit bg-blue-600 text-white font-semibold">Recommended</Badge>
          )}
          <CardTitle className="text-2xl font-bold pt-2">{plan.display_name.split('-')[0].trim()}</CardTitle>
          <CardDescription>{plan.description}</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col justify-between">
          <div>
            <div className="mb-6">
              <p className="text-4xl font-extrabold text-slate-900">${plan.base_price.toLocaleString()}</p>
              <p className="text-slate-600">per year</p>
              {!isEnterprise && <p className="text-sm text-slate-500">${(plan.base_price / 12).toLocaleString()}/month billed annually</p>}
            </div>
            <ul className="space-y-3 text-slate-700">
              {plan.features_included.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-1 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-8">
            <Button 
              onClick={() => onSelectPlan(plan.name)}
              className={`w-full text-lg py-6 ${isCurrent ? 'bg-slate-200 text-slate-600 cursor-not-allowed' : isProfessional ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-800 hover:bg-slate-900'}`}
              disabled={isCurrent}
            >
              {isCurrent ? 'Current Plan' : isEnterprise ? 'Contact Sales' : 'Select Plan'}
            </Button>
            {isProfessional && !isCurrent && (
              <p className="text-center text-sm text-green-600 font-semibold mt-2">Save $6,000 vs separate add-ons</p>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const AddOnCard = ({ addon }) => {
    const icons = {
        ai_agent: Cpu,
        storage: Server,
        support: LifeBuoy,
        custom_development: Code,
        cameras: Building,
    };
    const Icon = icons[addon.category] || Zap;

    return (
        <Card className="shadow-lg">
            <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900">{addon.name}</h4>
                        <p className="text-sm text-slate-600">{addon.description}</p>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                     <p className="font-bold text-blue-700">
                        ${addon.price.toLocaleString()}/{addon.billing_interval}
                     </p>
                    <Button variant="outline" size="sm">Add to Plan</Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default function BillingPlansPage() {
  const [plans, setPlans] = useState([]);
  const [addons, setAddons] = useState([]);
  const [currentOrgPlan, setCurrentOrgPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [planData, addOnData, orgData] = await Promise.all([
          SubscriptionPlan.list('sort_order'),
          AddOnProduct.list('sort_order'),
          Organization.list(),
        ]);
        
        setPlans(planData);
        setAddons(addOnData);

        if (orgData.length > 0) {
          setCurrentOrgPlan(orgData[0].subscription_plan);
        }
      } catch (error) {
        console.error("Failed to fetch billing data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePlanSelection = (planName) => {
    // This would trigger an upgrade/downgrade workflow
    console.log(`Plan selected: ${planName}`);
  };
  
  const categorizedAddons = addons.reduce((acc, addon) => {
      (acc[addon.category] = acc[addon.category] || []).push(addon);
      return acc;
  }, {});

  if (loading) {
    return <div className="text-center p-10">Loading plans...</div>;
  }

  return (
    <div className="bg-slate-50">
      <div className="container mx-auto py-16 px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Transform Your Operations with AI-Powered Video Intelligence
          </h1>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Choose the perfect plan to enhance security, streamline workflows, and unlock powerful insights for your business.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
          {plans.map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isCurrent={plan.name === currentOrgPlan}
              onSelectPlan={handlePlanSelection}
            />
          ))}
        </div>

        {/* Add-on Marketplace */}
        <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Enhance Your Plan with Add-Ons</h2>
            <p className="text-md text-slate-600">Customize your AwareCam experience with powerful agents and services.</p>
        </div>
        
        <div className="space-y-12">
            {Object.entries(categorizedAddons).map(([category, addons]) => (
                <div key={category}>
                    <h3 className="text-2xl font-bold text-slate-800 capitalize mb-6 border-b pb-2">{category.replace('_', ' ')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {addons.map(addon => <AddOnCard key={addon.id} addon={addon} />)}
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}