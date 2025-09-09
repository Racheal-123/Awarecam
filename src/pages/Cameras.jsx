
import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/layout';
import { useNavigate } from 'react-router-dom';
import { Camera } from '@/api/entities';
import { Location } from '@/api/entities';
import { StreamCallbackLog } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue }
  from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Camera as CameraIcon,
  Grid,
  List,
  Plus,
  Search,
  Filter, // Add filter icon
  RefreshCw,
  Settings,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Wifi,
  WifiOff,
  Loader2,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  Server // Add server icon
} from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocationContext } from '@/components/shared/LocationContext';
import { getDemoCameras } from '@/components/utils/demoData';

import CameraGrid from '@/components/cameras/CameraGrid';
import CameraList from '@/components/cameras/CameraList';
import CameraSetupWizard from '@/components/cameras/CameraSetupWizard';
import CameraDetailsModal from '@/components/cameras/CameraDetailsModal';
import StatusViewerDrawer from '@/components/cameras/StatusViewerDrawer';
import CallbackLogViewer from '@/components/cameras/CallbackLogViewer';
import { fetchStreamStatus } from '@/api/functions';


const mapDemoCameras = (demoCams, locations, currentLoc) => {
  let effectiveLocation;
  if (currentLoc) {
    effectiveLocation = currentLoc;
  } else if (locations && locations.length > 0) {
    effectiveLocation = locations[0];
  } else {
    effectiveLocation = { id: 'temp-demo-location', name: 'Your First Location' };
  }
  const locationId = effectiveLocation.id;

  return demoCams.map((cam, index) => ({
    ...cam, // Spread existing properties from the base demo camera
    id: cam.id,
    name: cam.name,
    location_id: locationId,
    location: effectiveLocation.name,
    rtsp_url: cam.streamUrl, // Map streamUrl from demoData to rtsp_url
    status: index < 2 ? 'active' : (index === 2 ? 'maintenance' : 'inactive'), // Example dynamic status
    is_public_feed: true,
    health_score: 80 + Math.floor(Math.random() * 20), // Randomize health score
    events_today: 5 + Math.random() * 20, // Randomize events
    uptime: `${95 + Math.random() * 5}%`, // Randomize uptime
    last_heartbeat: new Date(Date.now() - (Math.random() * 300000)).toISOString(), // Randomize last heartbeat
    ai_agents: cam.ai_agents || ['People Detection', 'Safety Monitor'] // Use agents from demo data or default
  }));
};

export default function CamerasPage({ effectiveRole }) {
  const [cameras, setCameras] = useState([]);
  const [filteredCameras, setFilteredCameras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showSetupWizard, setShowSetupWizard] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [selectedCamera, setSelectedCamera] = useState(null);
  const [statusToView, setStatusToView] = useState(null);
  const [cameraForStatus, setCameraForStatus] = useState(null);
  const [callbackLogs, setCallbackLogs] = useState([]); // New state
  const [selectedCallbackLog, setSelectedCallbackLog] = useState(null); // New state

  const { user, organization } = useUser();
  const navigate = useNavigate();

  const { locations, getCurrentLocation, getLocationFilter, isAllLocations, getLocationName } = useLocationContext();

  const isManager = effectiveRole && ['organization_admin', 'manager'].includes(effectiveRole); // Defined here to be available for useCallback deps

  const loadCameras = useCallback(async () => {
    setLoading(true);
    try {
      const locationFilter = getLocationFilter();

      let realCameras = [];
      let logs = [];

      if (organization) {
        try {
          // Load real cameras first
          realCameras = await Camera.filter({ ...locationFilter, organization_id: organization.id });
          console.log('Loaded real cameras:', realCameras);

          // Load callback logs for managers/admins
          if (isManager) {
            const allLogs = await StreamCallbackLog.filter({}, '-created_date', 100);
            const logMap = new Map();
            allLogs.forEach(log => {
              const existingLog = logMap.get(log.camera_id);
              if (!existingLog || new Date(log.created_date) > new Date(existingLog.created_date)) {
                logMap.set(log.camera_id, log);
              }
            });
            logs = Array.from(logMap.values());
          }
        } catch (error) {
          console.error('Failed to load real cameras from API:', error);
        }
      }

      // Only add demo cameras if we have no real cameras
      // This ensures real cameras are not mixed with demo data
      let allCameras = realCameras;
      if (realCameras.length === 0) {
        console.log('No real cameras found, adding demo cameras');
        const currentLoc = getCurrentLocation();
        const demoCameras = mapDemoCameras(getDemoCameras(), locations, currentLoc);
        allCameras = [...realCameras, ...demoCameras];
      } else {
        console.log(`Found ${realCameras.length} real cameras, skipping demo data`);
      }

      // Make sure STREAMING_FEATURE_ENABLED is available globally
      window.STREAMING_FEATURE_ENABLED = true;

      setCameras(allCameras);
      setFilteredCameras(allCameras);
      setCallbackLogs(logs);

    } catch (error) {
      console.error('Failed to load cameras:', error);
      toast.error('Failed to load cameras.');

      // Only show demo data as absolute fallback
      const demoData = mapDemoCameras(getDemoCameras(), [], null);
      setCameras(demoData);
      setFilteredCameras(demoData);
      setCallbackLogs([]);
    } finally {
      setLoading(false);
    }
  }, [getLocationFilter, locations, getCurrentLocation, organization, isManager]);

  useEffect(() => {
    loadCameras();
  }, [loadCameras]);

  useEffect(() => {
    let filtered = cameras;

    if (searchTerm) {
      filtered = filtered.filter(camera =>
        camera.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        camera.location?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(camera => camera.status === statusFilter);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'health':
          return (b.health_score || 0) - (a.health_score || 0);
        case 'events':
          return (b.events_today || 0) - (a.events_today || 0);
        default:
          return 0;
      }
    });

    setFilteredCameras(filtered);
  }, [cameras, searchTerm, statusFilter, sortBy]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCameras();
    setRefreshing(false);
    toast.success('Cameras refreshed');
  };

  const handleCreateTestCamera = async () => {
    if (!organization) {
      toast.error("Organization not found. Cannot create test camera.");
      return;
    }

    toast.info("Creating test camera...");

    try {
      // 1. Find or create "Test Location"
      let testLocation;
      const existingLocations = await Location.filter({
        name: "Test Location",
        organization_id: organization.id,
      });

      if (existingLocations.length > 0) {
        testLocation = existingLocations[0];
      } else {
        testLocation = await Location.create({
          name: "Test Location",
          organization_id: organization.id,
          country: "Test Country", // Required field
          city: "Testville",
          state: "TS",
          postal_code: "12345"
        });
        toast.info("Created new 'Test Location'.");
      }

      // 2. Create the new Camera with a default RTSP URL for testing
      const newCamera = await Camera.create({
        name: "Test Camera",
        location_id: testLocation.id,
        organization_id: organization.id,
        stream_status: "idle",
        camera_type: 'rtsp',
        status: 'active',
        rtsp_url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' // Add default URL
      });

      // 3. Show toast notification
      toast.success("Test Camera created!", {
        description: `ID: ${newCamera.id}`,
        action: {
          label: 'Copy ID',
          onClick: () => {
            navigator.clipboard.writeText(newCamera.id);
            toast.info("Camera ID copied to clipboard!");
          },
        },
      });

      // Refresh camera list
      await loadCameras();

      // 4. Navigate to the streaming page
      navigate(`/CameraStreaming/${newCamera.id}`);

    } catch (error) {
      console.error("Failed to create test camera:", error);
      toast.error("Failed to create test camera. See console for details.");
    }
  };

  const handleFetchStatus = async (camera) => {
    if (!camera) {
      toast.error("No camera selected.");
      return;
    }
    if (!camera.stream_id && !camera.id) {
      toast.error("This camera does not have identifiers for status check.");
      return;
    }

    toast.info(`Fetching status for ${camera.name}...`);
    setCameraForStatus(camera);

    try {
      // Pass both identifiers so the function can fall back if needed
      const { data } = await fetchStreamStatus({ stream_id: camera.stream_id, camera_id: camera.id });

      setStatusToView(data);

      if (data) {
        if ((data.status === 'live' || data.status === 'active') && (data.hls_url || camera.hls_url)) {
          await Camera.update(camera.id, {
            stream_status: 'live',
            hls_url: data.hls_url || camera.hls_url,
            last_error: null,
          });
          toast.success(`Status for ${camera.name} is LIVE. Camera updated.`);
          await loadCameras();
        } else if (data.status === 'error' && data.message) {
          await Camera.update(camera.id, { stream_status: 'error', last_error: data.message });
          toast.error(`Stream for ${camera.name} reported an error: ${data.message}`);
          await loadCameras();
        } else {
          toast.info(`Received status: ${data.status || 'unknown'}.`);
        }
      } else {
        toast.warning("Received an empty response from the status endpoint.");
      }
    } catch (error) {
      console.error("Failed to fetch stream status:", error);
      const errorMessage = error.response?.data?.details || error.message || "An unknown error occurred.";
      toast.error(`Failed to fetch status: ${errorMessage}`);
    }
  };

  const handleApplyStatusAndClose = async () => {
    setStatusToView(null);
    setCameraForStatus(null);
    await loadCameras(); // Refresh the list
  };

  const handleViewCallbackLog = (cameraId) => {
    const log = callbackLogs.find(log => log.camera_id === cameraId);
    if (log) {
      setSelectedCallbackLog(log);
    } else {
      toast.info("No callback log found for this camera.");
    }
  };

  const handleSetupNew = () => {
    setEditingCamera(null);
    setShowSetupWizard(true);
  };

  const handleEditCamera = (camera) => {
    setEditingCamera(camera);
    setShowSetupWizard(true);
  };

  const handleViewCamera = (camera) => {
    // Always open the details modal for any camera type from the Cameras page
    setSelectedCamera(camera);
  };

  const handleDeleteCamera = async (cameraId) => {
    // Check if this is a demo camera - demo cameras have IDs like "cam-01", "cam-02", etc.
    // or they might be prefixed with "demo-"
    const isDemoCamera = String(cameraId).startsWith('demo-') ||
      String(cameraId).startsWith('cam-') ||
      getDemoCameras().some(demoCam => demoCam.id === cameraId);

    if (isDemoCamera) {
      setCameras(prev => prev.filter(c => c.id !== cameraId));
      toast.success('Demo camera removed.');
      return;
    }

    try {
      await Camera.delete(cameraId);
      toast.success('Camera deleted successfully');
      loadCameras();
    } catch (error) {
      console.error('Failed to delete camera:', error);
      toast.error('Failed to delete camera');
    }
  };

  const handleWizardComplete = async (cameraData) => {
    const isEditing = !!editingCamera;

    try {
      console.log('Saving camera with data:', cameraData);

      // Validate required fields before sending
      if (!cameraData.organization_id) {
        throw new Error('Organization ID is required');
      }
      if (!cameraData.location_id) {
        throw new Error('Location ID is required');
      }
      if (!cameraData.name?.trim()) {
        throw new Error('Camera name is required');
      }

      let savedCamera;
      if (isEditing) {
        savedCamera = await Camera.update(editingCamera.id, cameraData);
        toast.success('Camera updated successfully');
        console.log('Camera updated:', savedCamera);
      } else {
        savedCamera = await Camera.create(cameraData);
        toast.success('Camera added successfully');
        console.log('Camera created:', savedCamera);
      }

    } catch (error) {
      console.error('Failed to save camera:', error);

      // Log detailed error information for debugging
      if (error.response?.data) {
        console.error('API Error Response:', error.response.data);

        // Try to extract specific validation errors
        if (error.response.data.details) {
          console.error('Validation Details:', error.response.data.details);
        }
      }

      // Provide user-friendly error messages
      let errorMessage = isEditing ? 'Failed to update camera.' : 'Failed to add camera.';

      if (error.response?.status === 422) {
        errorMessage = 'Validation error: Please check all required fields are filled correctly.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication error: Please refresh the page and try again.';
      } else if (error.message && !error.message.includes('Request failed')) { // Check if it's a client-side error
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setShowSetupWizard(false);
      setEditingCamera(null);
      // Reload cameras to show the newly created/updated camera
      await loadCameras();
    }
  };

  const getCameraStats = () => {
    const total = cameras.length;
    const active = cameras.filter(c => c.status === 'active').length;
    const inactive = cameras.filter(c => c.status === 'inactive').length;
    const maintenance = cameras.filter(c => c.status === 'maintenance').length;
    const avgHealth = total > 0 ? Math.round(cameras.reduce((sum, c) => sum + (c.health_score || 0), 0) / total) : 0;

    return { total, active, inactive, maintenance, avgHealth };
  };

  const stats = getCameraStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="ml-2">Loading cameras...</span>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 bg-slate-50 min-h-full max-w-full overflow-x-hidden">
      {/* Header section - single row on desktop */}
      <div className="w-full max-w-full">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Title and description */}
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
              <CameraIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 flex-shrink-0" />
              <span className="truncate">Cameras</span>
            </h1>
            <p className="text-slate-600 mt-1 text-sm sm:text-base">
              Manage your camera network for {isAllLocations() ? 'all locations' : getLocationName()}
            </p>
          </div>

          {/* Action buttons - inline on desktop */}
          <div className="flex flex-col sm:flex-row gap-3 lg:flex-row lg:items-center">
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                disabled={refreshing}
                className="flex-1 sm:flex-initial"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
              {isManager && (
                <Button
                  onClick={handleCreateTestCamera}
                  variant="secondary"
                  className="flex-1 sm:flex-initial"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Create Test Camera</span>
                  <span className="sm:hidden">Test Camera</span>
                </Button>
              )}
            </div>
            <Button
              onClick={handleSetupNew}
              className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Camera
            </Button>
          </div>
        </div>
      </div>

      {/* Stats cards - responsive grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 w-full max-w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="w-full">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-slate-600 truncate">Total Cameras</p>
                  <p className="text-lg sm:text-2xl font-bold text-slate-900">{stats.total}</p>
                </div>
                <CameraIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0 self-start xs:self-auto" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="w-full">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-slate-600 truncate">Active</p>
                  <p className="text-lg sm:text-2xl font-bold text-green-600">{stats.active}</p>
                </div>
                <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0 self-start xs:self-auto" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="w-full">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-slate-600 truncate">Inactive</p>
                  <p className="text-lg sm:text-2xl font-bold text-red-600">{stats.inactive}</p>
                </div>
                <WifiOff className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 flex-shrink-0 self-start xs:self-auto" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="w-full">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-slate-600 truncate">Maintenance</p>
                  <p className="text-lg sm:text-2xl font-bold text-amber-600">{stats.maintenance}</p>
                </div>
                <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500 flex-shrink-0 self-start xs:self-auto" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="w-full col-span-2 sm:col-span-1">
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-slate-600 truncate">Avg Health</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">{stats.avgHealth}%</p>
                </div>
                <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 flex-shrink-0 self-start xs:self-auto" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Enhanced Filters and controls - single horizontal row on desktop */}
      <Card className="w-full max-w-full border-0 shadow-sm bg-white">
        <CardContent className="p-4 sm:p-6">
          {/* Single row layout on desktop - stacked on mobile */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-4 gap-4">
            {/* Search Field */}
            <div className="relative flex-1 lg:max-w-md">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Search cameras by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-10 text-base border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 bg-slate-50 focus:bg-white transition-colors"
              />
            </div>

            {/* Filter Controls - horizontal on desktop */}
            <div className="flex flex-col sm:flex-row lg:flex-row items-start sm:items-center lg:items-center gap-3 lg:gap-4">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Filter className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-700 hidden lg:block">Filters:</span>
              </div>

              {/* Status and Sort dropdowns - horizontal */}
              <div className="flex flex-col sm:flex-row lg:flex-row gap-3 lg:gap-4">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600 font-medium hidden lg:block whitespace-nowrap">Status:</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-36 lg:w-40 h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          Active
                        </div>
                      </SelectItem>
                      <SelectItem value="inactive">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          Inactive
                        </div>
                      </SelectItem>
                      <SelectItem value="maintenance">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                          Maintenance
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-600 font-medium hidden lg:block whitespace-nowrap">Sort by:</label>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full sm:w-36 lg:w-40 h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500/20">
                      <SelectValue placeholder="Name" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="health">Health Score</SelectItem>
                      <SelectItem value="events">Events Today</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* View Toggle - on the right */}
            <div className="flex items-center gap-3 flex-shrink-0 lg:ml-auto">
              <span className="text-sm text-slate-600 font-medium hidden lg:block whitespace-nowrap">View:</span>
              <ToggleGroup type="single" value={viewMode} onValueChange={setViewMode} className="bg-slate-100 p-1 rounded-lg">
                <ToggleGroupItem
                  value="grid"
                  aria-label="Grid view"
                  className="data-[state=on]:bg-white data-[state=on]:text-blue-600 data-[state=on]:shadow-sm h-8 px-3"
                >
                  <Grid className="w-4 h-4" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="list"
                  aria-label="List view"
                  className="data-[state=on]:bg-white data-[state=on]:text-blue-600 data-[state=on]:shadow-sm h-8 px-3"
                >
                  <List className="w-4 h-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <p className="text-sm text-slate-600">
              Showing <span className="font-medium text-slate-900">{filteredCameras.length}</span> of <span className="font-medium text-slate-900">{cameras.length}</span> cameras
              {searchTerm && (
                <span> matching "<span className="font-medium text-blue-600">{searchTerm}</span>"</span>
              )}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Camera content */}
      <div className="w-full max-w-full">
        <AnimatePresence mode="wait">
          {filteredCameras.length === 0 ? (
            <motion.div
              key="no-cameras"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="p-6 sm:p-12 w-full">
                <div className="text-center">
                  <CameraIcon className="w-12 h-12 sm:w-16 sm:h-16 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg sm:text-xl font-semibold text-slate-700 mb-2">
                    {searchTerm || statusFilter !== 'all' ? 'No cameras found' : 'No cameras set up yet'}
                  </h3>
                  <p className="text-slate-500 mb-6 text-sm sm:text-base">
                    {searchTerm || statusFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Get started by adding your first camera to the network.'
                    }
                  </p>
                  {!searchTerm && statusFilter === 'all' && (
                    <Button onClick={handleSetupNew} className="w-full xs:w-auto">
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Camera
                    </Button>
                  )}
                </div>
              </Card>
            </motion.div>
          ) : viewMode === 'grid' ? (
            <motion.div
              key="grid-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <CameraGrid
                cameras={filteredCameras}
                onEdit={handleEditCamera}
                onView={handleViewCamera}
                onDelete={handleDeleteCamera}
                onFetchStatus={handleFetchStatus}
                onViewCallbackLog={handleViewCallbackLog}
                callbackLogs={callbackLogs}
                userRole={effectiveRole}
                onRefresh={loadCameras}
              />
            </motion.div>
          ) : (
            <motion.div
              key="list-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full"
            >
              <CameraList
                cameras={filteredCameras}
                onCameraSelect={handleViewCamera}
                onCameraEdit={handleEditCamera}
                onFetchStatus={handleFetchStatus}
                onViewCallbackLog={handleViewCallbackLog}
                callbackLogs={callbackLogs}
                userRole={effectiveRole}
                onRefresh={loadCameras}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showSetupWizard && (
        <CameraSetupWizard
          camera={editingCamera}
          onComplete={handleWizardComplete}
          onCancel={() => {
            setShowSetupWizard(false);
            setEditingCamera(null);
          }}
          industryType={organization?.industry_type || 'office'}
          organization={organization}
        />
      )}

      {selectedCamera && (
        <CameraDetailsModal
          camera={selectedCamera}
          isOpen={!!selectedCamera}
          onClose={() => setSelectedCamera(null)}
          onEdit={handleEditCamera}
          onDelete={handleDeleteCamera}
        />
      )}

      {/* Add the new Status Viewer Drawer */}
      <StatusViewerDrawer
        isOpen={!!statusToView}
        onClose={() => setStatusToView(null)}
        statusData={statusToView}
        camera={cameraForStatus}
        userRole={effectiveRole}
        onApply={handleApplyStatusAndClose}
      />

      {/* Add the new Callback Log Viewer */}
      <CallbackLogViewer
        isOpen={!!selectedCallbackLog}
        onClose={() => setSelectedCallbackLog(null)}
        logEntry={selectedCallbackLog}
      />
    </div>
  );
}
