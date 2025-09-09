import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Camera, 
  Users, 
  CheckCircle, 
  AlertTriangle,
  Activity,
  TrendingUp
} from 'lucide-react';
import { motion } from 'framer-motion';

const LocationStats = ({ locationId, stats = {} }) => {
  // TODO: Replace with real stats fetching logic based on locationId
  const defaultStats = {
    cameras: stats.cameras || 0,
    activeCameras: stats.activeCameras || 0,
    employees: stats.employees || 0,
    activeEmployees: stats.activeEmployees || 0,
    tasks: stats.tasks || 0,
    pendingTasks: stats.pendingTasks || 0,
    events: stats.events || 0,
    recentEvents: stats.recentEvents || 0
  };

  const statCards = [
    {
      title: 'Total Cameras',
      value: defaultStats.cameras,
      subtitle: `${defaultStats.activeCameras} active`,
      icon: Camera,
      color: 'blue'
    },
    {
      title: 'Total Employees',
      value: defaultStats.employees,
      subtitle: `${defaultStats.activeEmployees} active`,
      icon: Users,
      color: 'green'
    },
    {
      title: 'Tasks',
      value: defaultStats.tasks,
      subtitle: `${defaultStats.pendingTasks} pending`,
      icon: CheckCircle,
      color: 'amber'
    },
    {
      title: 'Recent Events',
      value: defaultStats.recentEvents,
      subtitle: `${defaultStats.events} total`,
      icon: Activity,
      color: 'purple'
    }
  ];

  const colorClasses = {
    blue: 'from-blue-50 to-blue-100 text-blue-900 border-blue-200',
    green: 'from-green-50 to-green-100 text-green-900 border-green-200',
    amber: 'from-amber-50 to-amber-100 text-amber-900 border-amber-200',
    purple: 'from-purple-50 to-purple-100 text-purple-900 border-purple-200'
  };

  if (!locationId) {
    return (
      <Card className="rounded-xl border p-6">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-900 mb-2">No Location Selected</h3>
          <p className="text-sm text-slate-600">Select a location to view its statistics.</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Location Overview
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className={`border-0 shadow-lg bg-gradient-to-br ${colorClasses[stat.color]}`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-80">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    {stat.subtitle && (
                      <p className="text-xs opacity-70 mt-1">{stat.subtitle}</p>
                    )}
                  </div>
                  <stat.icon className="w-6 h-6 opacity-60" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {defaultStats.cameras === 0 && defaultStats.employees === 0 && (
        <Card className="border-dashed border-2 border-slate-200 p-6">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-3" />
            <h4 className="font-medium text-slate-900 mb-2">Setup Required</h4>
            <p className="text-sm text-slate-600">
              This location needs cameras and employees to be assigned before statistics can be displayed.
            </p>
          </div>
        </Card>
      )}
    </div>
  );
};

export default LocationStats;