import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Plus,
  MapPin,
  Globe,
  Camera,
  Users,
  Clock,
  Settings,
  Edit,
  Trash2,
  Move,
  MoreVertical,
  Building,
  ArrowRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Location } from '@/api/entities';
import { Camera as CameraEntity } from '@/api/entities';
import { Employee } from '@/api/entities';
import { Task } from '@/api/entities';
import { Event } from '@/api/entities';
import { Organization } from '@/api/entities';
import { User } from '@/api/entities';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import LocationForm from '@/components/locations/LocationForm';
import BulkMoveModal from '@/components/locations/BulkMoveModal';
import LocationStats from '@/components/locations/LocationStats';

export default function LocationManagementPage() {
  const [locations, setLocations] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLocationForm, setShowLocationForm] = useState(false);
  const [showBulkMove, setShowBulkMove] = useState(false);
  const [locationStats, setLocationStats] = useState({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, orgData] = await Promise.all([
        User.me(),
        Organization.list()
      ]);

      setUser(userData);
      const currentOrg = orgData.find(org => org.id === userData.organization_id) || orgData[0];
      setOrganization(currentOrg);

      if (currentOrg) {
        await loadLocations(currentOrg.id);
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLocations = async (organizationId) => {
    try {
      const locationData = await Location.filter({ organization_id: organizationId });
      setLocations(locationData);

      // Load stats for each location
      const stats = {};
      for (const location of locationData) {
        const [cameras, employees, tasks, events] = await Promise.all([
          CameraEntity.filter({ location_id: location.id }).catch(() => []),
          Employee.filter({ location_id: location.id }).catch(() => []),
          Task.filter({ location_id: location.id }).catch(() => []),
          Event.filter({ location_id: location.id }, '-created_date', 100).catch(() => [])
        ]);

        stats[location.id] = {
          cameras: cameras.length,
          activeCameras: cameras.filter(c => c.status === 'active').length,
          employees: employees.length,
          activeEmployees: employees.filter(e => e.is_active).length,
          tasks: tasks.length,
          pendingTasks: tasks.filter(t => ['pending', 'assigned'].includes(t.status)).length,
          events: events.length,
          recentEvents: events.filter(e => {
            const eventDate = new Date(e.created_date);
            const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
            return eventDate > dayAgo;
          }).length
        };
      }
      setLocationStats(stats);
    } catch (error) {
      console.error('Failed to load locations:', error);
    }
  };

  const handleCreateLocation = () => {
    setSelectedLocation(null);
    setShowLocationForm(true);
  };

  const handleEditLocation = (location) => {
    setSelectedLocation(location);
    setShowLocationForm(true);
  };

  const handleDeleteLocation = async (location) => {
    if (!confirm(`Are you sure you want to delete "${location.name}"? This will remove all associated cameras, employees, and tasks.`)) {
      return;
    }

    try {
      await Location.delete(location.id);
      await loadLocations(organization.id);
    } catch (error) {
      console.error('Failed to delete location:', error);
      alert('Failed to delete location. Please try again.');
    }
  };

  const handleLocationSaved = async () => {
    setShowLocationForm(false);
    setSelectedLocation(null);
    await loadLocations(organization.id);
  };

  const handleBulkMove = () => {
    setShowBulkMove(true);
  };

  const filteredLocations = locations.filter(location =>
    location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    location.country?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-64"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-blue-600" />
            Location Management
          </h1>
          <p className="text-slate-600 mt-2">
            Manage your organization's locations and distribute resources across sites.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={handleBulkMove}>
            <Move className="w-4 h-4 mr-2" />
            Bulk Move
          </Button>
          <Button onClick={handleCreateLocation} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-5 h-5 mr-2" />
            Add Location
          </Button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-700 text-sm font-medium">Total Locations</p>
                  <p className="text-3xl font-bold text-blue-900">{locations.length}</p>
                </div>
                <Building className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-700 text-sm font-medium">Total Cameras</p>
                  <p className="text-3xl font-bold text-green-900">
                    {Object.values(locationStats).reduce((sum, stats) => sum + stats.cameras, 0)}
                  </p>
                </div>
                <Camera className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-700 text-sm font-medium">Total Employees</p>
                  <p className="text-3xl font-bold text-purple-900">
                    {Object.values(locationStats).reduce((sum, stats) => sum + stats.employees, 0)}
                  </p>
                </div>
                <Users className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-50 to-amber-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-700 text-sm font-medium">Active Tasks</p>
                  <p className="text-3xl font-bold text-amber-900">
                    {Object.values(locationStats).reduce((sum, stats) => sum + stats.pendingTasks, 0)}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-amber-600" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Search locations by name, city, or country..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Locations Grid */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
        {filteredLocations.length === 0 ? (
          <Card className="border-0 shadow-lg">
            <CardContent className="text-center py-16">
              <MapPin className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-700">
                {locations.length === 0 ? 'No Locations Added Yet' : 'No Locations Found'}
              </h3>
              <p className="text-slate-500 mt-2">
                {locations.length === 0
                  ? "Get started by adding your first location to organize cameras and employees by site."
                  : "Try adjusting your search criteria or add a new location."}
              </p>
              {locations.length === 0 && (
                <Button onClick={handleCreateLocation} className="mt-4 bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Location
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location, index) => (
              <LocationCard
                key={location.id}
                location={location}
                stats={locationStats[location.id] || {}}
                index={index}
                onEdit={handleEditLocation}
                onDelete={handleDeleteLocation}
              />
            ))}
          </div>
        )}
      </motion.div>

      {/* Modals */}
      {showLocationForm && (
        <LocationForm
          location={selectedLocation}
          organization={organization}
          onSave={handleLocationSaved}
          onCancel={() => {
            setShowLocationForm(false);
            setSelectedLocation(null);
          }}
        />
      )}

      {showBulkMove && (
        <BulkMoveModal
          locations={locations}
          onClose={() => setShowBulkMove(false)}
          onComplete={() => {
            setShowBulkMove(false);
            loadLocations(organization.id);
          }}
        />
      )}
    </div>
  );
}

// Location Card Component
function LocationCard({ location, stats, index, onEdit, onDelete }) {
  const hasData = stats.cameras > 0 || stats.employees > 0 || stats.tasks > 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 h-full bg-white group">
        <CardHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-lg group-hover:text-blue-600 transition-colors">
                  {location.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Globe className="w-4 h-4" />
                  <span>{location.city ? `${location.city}, ` : ''}{location.country}</span>
                </div>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => onEdit(location)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Location
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(location)}
                  className="text-red-600"
                  disabled={hasData}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Location
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {location.timezone && (
            <div className="flex items-center gap-2 text-sm text-slate-500 mt-2">
              <Clock className="w-4 h-4" />
              <span>{location.timezone}</span>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Resource Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-900">{stats.cameras || 0}</p>
              <p className="text-xs text-blue-700">Cameras</p>
              {stats.activeCameras !== undefined && (
                <p className="text-xs text-slate-500">{stats.activeCameras} active</p>
              )}
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-900">{stats.employees || 0}</p>
              <p className="text-xs text-purple-700">Employees</p>
              {stats.activeEmployees !== undefined && (
                <p className="text-xs text-slate-500">{stats.activeEmployees} active</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-900">{stats.tasks || 0}</p>
              <p className="text-xs text-green-700">Tasks</p>
              {stats.pendingTasks !== undefined && (
                <p className="text-xs text-slate-500">{stats.pendingTasks} pending</p>
              )}
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <p className="text-2xl font-bold text-amber-900">{stats.events || 0}</p>
              <p className="text-xs text-amber-700">Events</p>
              {stats.recentEvents !== undefined && (
                <p className="text-xs text-slate-500">{stats.recentEvents} recent</p>
              )}
            </div>
          </div>

          {/* Status Indicators */}
          <div className="pt-4 border-t border-slate-100">
            {hasData ? (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600">Location Active</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-600">Setup Required</span>
              </div>
            )}
          </div>

          {location.notes && (
            <div className="pt-2 border-t border-slate-100">
              <p className="text-sm text-slate-600 line-clamp-2">{location.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}