import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Lightbulb, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2,
  MapPin,
  Zap,
  Shield
} from "lucide-react";

const INDUSTRY_INSIGHTS = {
  retail: {
    icon: "🛒",
    title: "Retail Optimization",
    insights: [
      "Customer traffic peaks at 2-4 PM and 6-8 PM on weekdays",
      "Consider adding cameras at high-value product displays",
      "Queue detection can improve customer experience during peak hours"
    ],
    recommendations: [
      { type: "placement", text: "Add camera at jewelry/electronics section", priority: "high" },
      { type: "ai", text: "Enable customer counting for foot traffic analytics", priority: "medium" },
      { type: "zone", text: "Set up checkout zones for queue monitoring", priority: "high" }
    ]
  },
  healthcare: {
    icon: "🏥",
    title: "Healthcare Security",
    insights: [
      "Patient fall detection reduces emergency response time by 40%",
      "Medication storage areas require constant monitoring",
      "Visitor tracking helps maintain secure patient areas"
    ],
    recommendations: [
      { type: "placement", text: "Install cameras in patient corridors", priority: "critical" },
      { type: "ai", text: "Enable PPE compliance monitoring", priority: "high" },
      { type: "zone", text: "Configure restricted access zones", priority: "critical" }
    ]
  },
  manufacturing: {
    icon: "🏭",
    title: "Manufacturing Safety",
    insights: [
      "Safety incidents drop 60% with proper monitoring zones",
      "Equipment monitoring prevents costly downtime",
      "PPE compliance improves with visual reminders"
    ],
    recommendations: [
      { type: "placement", text: "Cover all work areas and machinery", priority: "critical" },
      { type: "ai", text: "Enable safety compliance monitoring", priority: "critical" },
      { type: "zone", text: "Set up safety zones around equipment", priority: "high" }
    ]
  },
  office: {
    icon: "🏢",
    title: "Office Management",
    insights: [
      "Space utilization data helps optimize office layout",
      "Visitor tracking improves building security",
      "Conference room monitoring shows usage patterns"
    ],
    recommendations: [
      { type: "placement", text: "Monitor all entry points and common areas", priority: "medium" },
      { type: "ai", text: "Enable occupancy detection", priority: "medium" },
      { type: "zone", text: "Configure visitor and employee zones", priority: "medium" }
    ]
  }
};

const getPriorityColor = (priority) => {
  const colors = {
    critical: "bg-red-100 text-red-800 border-red-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    medium: "bg-blue-100 text-blue-800 border-blue-200",
    low: "bg-slate-100 text-slate-800 border-slate-200"
  };
  return colors[priority] || colors.medium;
};

const getTypeIcon = (type) => {
  const icons = {
    placement: MapPin,
    ai: Zap,
    zone: Shield
  };
  return icons[type] || AlertTriangle;
};

export default function IndustryInsights({ industryType, cameras }) {
  const insights = INDUSTRY_INSIGHTS[industryType];
  
  if (!insights) return null;

  const activeCameras = cameras.filter(c => c.status === 'active').length;
  const totalEvents = cameras.reduce((acc, cam) => acc + (cam.events_today || 0), 0);
  const avgHealth = cameras.length > 0 
    ? Math.round(cameras.reduce((acc, cam) => acc + (cam.health_score || 0), 0) / cameras.length)
    : 0;

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-indigo-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white text-lg">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold">{insights.title}</span>
            <p className="text-sm text-slate-600 font-normal">AI-powered insights for your industry</p>
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Performance Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-blue-600">{activeCameras}</div>
            <div className="text-xs text-slate-600">Active Cameras</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-green-600">{avgHealth}%</div>
            <div className="text-xs text-slate-600">System Health</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-2xl font-bold text-purple-600">{totalEvents}</div>
            <div className="text-xs text-slate-600">Events Today</div>
          </div>
        </div>

        {/* Industry Insights */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            Industry Insights
          </h4>
          <div className="space-y-2">
            {insights.insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span className="text-slate-700">{insight}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-indigo-600" />
            Smart Recommendations
          </h4>
          <div className="space-y-3">
            {insights.recommendations.map((rec, index) => {
              const TypeIcon = getTypeIcon(rec.type);
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border hover:border-blue-200 transition-colors">
                  <div className="flex items-center gap-3">
                    <TypeIcon className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">{rec.text}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(rec.priority)}>
                      {rec.priority}
                    </Badge>
                    <Button size="sm" variant="outline" className="h-7 text-xs">
                      Apply
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}