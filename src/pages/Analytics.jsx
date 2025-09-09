import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Eye, 
  Shield, 
  Users,
  Camera,
  Clock,
  AlertTriangle,
  CheckCircle,
  Download,
  Filter,
  RefreshCw,
  Award
} from 'lucide-react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// Mock data for charts
// ... (keep existing mock data)
const teamPerformanceData = [
    { name: 'Alice', completion_rate: 98, tasks: 52 },
    { name: 'Bob', completion_rate: 95, tasks: 48 },
    { name: 'Charlie', completion_rate: 92, tasks: 45 },
    { name: 'Diana', completion_rate: 88, tasks: 55 },
];


export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState(null);

  // ... (keep existing useEffect and handlers)

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            Analytics Dashboard
          </h1>
          <p className="text-slate-600 mt-2">
            Insights into your video intelligence and operational performance.
          </p>
        </div>
        {/* ... (keep existing header buttons) ... */}
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-sm font-medium">Total Events</p>
                  <p className="text-3xl font-bold text-blue-900">1,247</p>
                </div>
                <Activity className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium">Completion Rate</p>
                  <p className="text-3xl font-bold text-green-900">92%</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-700 text-sm font-medium">SLA Breaches</p>
                  <p className="text-3xl font-bold text-red-900">8</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-700 text-sm font-medium">Avg. Approval Time</p>
                  <p className="text-3xl font-bold text-amber-900">4.5h</p>
                </div>
                <Clock className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Events Timeline */}
        {/* ... (keep existing events timeline chart) ... */}

        {/* Team Performance */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Award className="text-amber-500"/>Team Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={teamPerformanceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]} unit="%"/>
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="completion_rate" name="Completion Rate" fill="#10B981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ... (keep existing camera performance table and other charts) ... */}
    </div>
  );
}