
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Video,
  Plus,
  Search,
  MapPin,
  Save,
  ChevronDown,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useUser } from '@/layout';
import { useToast } from '@/components/ui/use-toast';
import { useLocationContext } from '@/components/shared/LocationContext';

import { Camera } from '@/api/entities';
import { getDemoCameras, mapDemoCameras } from '@/components/utils/demoData';

import CameraGridItem from '@/components/video/CameraGridItem';
import LiveVideoModal from '@/components/video/LiveVideoModal';
import AddCameraModal from '@/components/cameras/AddCameraModal';
import EmptyGridSlot from '@/components/cameras/EmptyGridSlot';
import CameraDetailsModal from '@/components/cameras/CameraDetailsModal';
import CameraSetupWizard from '@/components/cameras/CameraSetupWizard';
import LayoutDropdown from '@/components/live/LayoutDropdown';
import SaveLayoutModal from '@/components/live/SaveLayoutModal';

// Storage helpers
function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function getFromStorage(key, defaultValue = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

const PREDEFINED_LAYOUTS = {
  '1x1': { id: '1x1', name: '1x1 Grid', slots: 1, grid: [] },
  '2x2': { id: '2x2', name: '2x2 Grid', slots: 4, grid: [] },
  '3x3': { id: '3x3', name: '3x3 Grid', slots: 9, grid: [] },
  '4x4': { id: '4x4', name: '4x4 Grid', slots: 16, grid: [] },
};

export default function LivePage() {
  const { user, organization } = useUser();
  const { toast } = useToast();
  
  const [allCameras, setAllCameras] = useState([]);
  const [gridCameraIds, setGridCameraIds] = useState(new Set());
  const [customLayouts, setCustomLayouts] = useState({});
  const [activeLayout, setActiveLayout] = useState(null);
  const [maxGridSlots, setMaxGridSlots] = useState(9);
  const [loading, setLoading] = useState(true);
  const [modalIsLoading, setModalIsLoading] = useState(false);

  // Modals
  const [showAddCameraModal, setShowAddCameraModal] = useState(false);
  const [showSaveLayoutModal, setShowSaveLayoutModal] = useState(false);
  const [fullscreenCamera, setFullscreenCamera] = useState(null);
  const [showCameraDetails, setShowCameraDetails] = useState(null);
  const [showEditCameraModal, setShowEditCameraModal] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocationIds, setSelectedLocationIds] = useState(new Set());
  
  const { locations, getCurrentLocation } = useLocationContext();

  const isGridFull = useMemo(() => gridCameraIds.size >= maxGridSlots, [gridCameraIds.size, maxGridSlots]);
  const availableSlots = useMemo(() => maxGridSlots - gridCameraIds.size, [maxGridSlots, gridCameraIds.size]);

  // Load camera data
  const loadData = useCallback(async () => {
    if (!organization) return;
    
    try {
      const realCameras = await Camera.filter({ organization_id: organization.id });
      const currentLoc = getCurrentLocation();
      const demoCameras = mapDemoCameras(getDemoCameras(), locations, currentLoc);
      
      const combined = [...realCameras, ...demoCameras];
      setAllCameras(combined);
    } catch (error) {
      console.error("Failed to load camera data:", error);
      toast({ title: "Error", description: "Could not load cameras.", variant: "destructive" });
    }
  }, [organization, locations, getCurrentLocation, toast]);

  // Load initial state only once
  useEffect(() => {
    const savedLayouts = getFromStorage('awarecam.live.custom_layouts.v1', {});
    setCustomLayouts(savedLayouts);
    
    const session = getFromStorage('awarecam.live.layout.v2', {});
    if (session.gridIds) {
      setGridCameraIds(new Set(session.gridIds));
    }
    if (session.maxGridSlots) {
      setMaxGridSlots(session.maxGridSlots);
    }
    if (session.selectedLocationIds) {
      setSelectedLocationIds(new Set(session.selectedLocationIds));
    }
    if (session.layout) {
      setActiveLayout(session.layout);
    }
  }, [setCustomLayouts, setGridCameraIds, setMaxGridSlots, setSelectedLocationIds, setActiveLayout]);

  // Load camera data when organization changes
  useEffect(() => {
    if (organization) {
      setLoading(true);
      loadData().finally(() => setLoading(false));
    }
  }, [organization, loadData]);

  // Save session when state changes
  useEffect(() => {
    const session = { 
      gridIds: Array.from(gridCameraIds), 
      layout: activeLayout,
      selectedLocationIds: Array.from(selectedLocationIds),
      maxGridSlots: maxGridSlots,
    };
    saveToStorage('awarecam.live.layout.v2', session);
  }, [gridCameraIds, selectedLocationIds, maxGridSlots, activeLayout]);

  // Handle layout selection
  const handleSelectLayout = (layoutName) => {
    const allLayouts = { ...PREDEFINED_LAYOUTS, ...customLayouts };
    const layout = allLayouts[layoutName];

    if (layout) {
      if (PREDEFINED_LAYOUTS[layoutName]) {
        setMaxGridSlots(layout.slots);
        setGridCameraIds(new Set());
        setSelectedLocationIds(new Set());
      } else {
        setMaxGridSlots(layout.slots);
        setGridCameraIds(new Set(layout.grid));
        setSelectedLocationIds(new Set(layout.selectedLocationIds || []));
      }
      setActiveLayout(layoutName);
      toast({ title: "Layout Loaded", description: `Switched to ${layout.name || layoutName} layout.` });
    } else {
      toast({ title: "Layout Not Found", description: `Layout "${layoutName}" does not exist.`, variant: "destructive" });
    }
  };

  // Memoized grid cameras
  const gridCameras = useMemo(() => {
    const camMap = new Map(allCameras.map(cam => [cam.id, cam]));
    return Array.from(gridCameraIds).map(id => camMap.get(id)).filter(Boolean);
  }, [allCameras, gridCameraIds]);

  // Available cameras for modal
  const availableCamerasForModal = useMemo(() => {
    const gridIds = new Set(gridCameraIds);
    return allCameras.filter(cam => 
      !gridIds.has(cam.id) &&
      (searchTerm ? cam.name.toLowerCase().includes(searchTerm.toLowerCase()) : true) &&
      (selectedLocationIds.size > 0 ? selectedLocationIds.has(cam.location_id) : true)
    );
  }, [allCameras, gridCameraIds, searchTerm, selectedLocationIds]);

  const handleOpenAddCameraModal = async () => {
    if (isGridFull) {
      toast({ title: "Grid is Full", description: "Change the layout or remove cameras to add more.", variant: "warning" });
      return;
    }
    setModalIsLoading(true);
    setShowAddCameraModal(true);
    await loadData();
    setModalIsLoading(false);
  };

  const handleRemoveCamera = (cameraId) => {
    setGridCameraIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(cameraId);
      return newSet;
    });
    setActiveLayout(null);
  };

  const handleAddCameras = (addedIds) => {
    setGridCameraIds(prev => {
      const newSet = new Set(prev);
      addedIds.forEach(id => newSet.add(id));
      return newSet;
    });
    setShowAddCameraModal(false);
    setActiveLayout(null);
  };

  const handleEditCamera = (camera) => {
    setShowCameraDetails(null);
    setShowEditCameraModal(camera);
  };
  
  const handleSaveLayoutClick = () => {
    if (gridCameraIds.size === 0) {
      toast({ title: "Empty Grid", description: "Add cameras to the grid before saving a layout.", variant: "destructive" });
      return;
    }
    setShowSaveLayoutModal(true);
  };
  
  const handleSaveLayout = (name) => {
    if (!name || !name.trim()) {
      toast({ title: "Save Failed", description: "Layout name is required.", variant: "destructive" });
      return;
    }

    const trimmedName = name.trim();
    
    if (customLayouts[trimmedName] || PREDEFINED_LAYOUTS[trimmedName]) {
      toast({ title: "Save Failed", description: "Layout name already exists.", variant: "destructive" });
      return;
    }
    
    const newLayout = { 
      name: trimmedName, 
      slots: maxGridSlots, 
      grid: Array.from(gridCameraIds), 
      selectedLocationIds: Array.from(selectedLocationIds) 
    };
    
    const newLayouts = {
      ...customLayouts,
      [trimmedName]: newLayout
    };
    
    setCustomLayouts(newLayouts);
    saveToStorage('awarecam.live.custom_layouts.v1', newLayouts);
    setActiveLayout(trimmedName);
    setShowSaveLayoutModal(false);
    toast({ title: "Layout Saved", description: `"${trimmedName}" has been saved successfully.` });
  };

  const handleDeleteLayout = (layoutName) => {
    const newLayouts = { ...customLayouts };
    delete newLayouts[layoutName];
    setCustomLayouts(newLayouts);
    saveToStorage('awarecam.live.custom_layouts.v1', newLayouts);
    if (activeLayout === layoutName) {
      setActiveLayout(null);
    }
    toast({ title: "Layout Deleted", description: `"${layoutName}" has been deleted.` });
  };
  
  const emptySlotsCount = maxGridSlots - gridCameras.length;

  const gridColsClass = useMemo(() => {
    if (maxGridSlots <= 1) return 'grid-cols-1';
    if (maxGridSlots <= 4) return 'grid-cols-1 sm:grid-cols-2';
    if (maxGridSlots <= 9) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    if (maxGridSlots <= 16) return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
    return 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-3';
  }, [maxGridSlots]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-screen bg-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        <span className="mt-2 text-slate-700">Loading live monitor...</span>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 bg-slate-100 min-h-screen">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Video className="w-8 h-8 text-blue-600" />
            Live Monitor
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Filter cameras..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-40 sm:w-56"
            />
          </div>
          
          <LayoutDropdown
            layouts={{ predefined: Object.values(PREDEFINED_LAYOUTS), custom: Object.values(customLayouts) }}
            activeLayout={activeLayout}
            onSelect={handleSelectLayout}
            onDelete={handleDeleteLayout}
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-shrink-0">
                <MapPin className="w-4 h-4 mr-2" />
                <span>Locations ({selectedLocationIds.size > 0 ? selectedLocationIds.size : 'All'})</span>
                <ChevronDown className="w-4 h-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64">
              <DropdownMenuCheckboxItem
                checked={selectedLocationIds.size === 0}
                onCheckedChange={(checked) => {
                  if (checked) setSelectedLocationIds(new Set());
                }}
              >
                All Locations
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {locations.map((loc) => (
                <DropdownMenuCheckboxItem
                  key={loc.id}
                  checked={selectedLocationIds.has(loc.id)}
                  onCheckedChange={(checked) => {
                    setSelectedLocationIds(prev => {
                      const newSet = new Set(prev);
                      if (checked) newSet.add(loc.id);
                      else newSet.delete(loc.id);
                      return newSet;
                    });
                  }}
                >
                  {loc.name}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={handleSaveLayoutClick} variant="outline">
            <Save className="w-4 h-4 mr-2" />
            Save Layout
          </Button>

          <Button onClick={handleOpenAddCameraModal} disabled={isGridFull || modalIsLoading}>
            {modalIsLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Add Camera
          </Button>
        </div>
      </div>
      
      <div className={`grid ${gridColsClass} gap-4`}>
        <AnimatePresence>
          {gridCameras.map((camera) => (
            <CameraGridItem
              key={camera.id}
              camera={camera}
              organization={organization}
              onRemove={handleRemoveCamera}
              onViewDetails={setShowCameraDetails}
              onEdit={handleEditCamera}
              onFullscreen={setFullscreenCamera}
            />
          ))}
          {emptySlotsCount > 0 && Array.from({ length: emptySlotsCount }).map((_, index) => (
            <EmptyGridSlot key={`empty-${index}`} index={index} onAdd={handleOpenAddCameraModal} disabled={isGridFull} />
          ))}
        </AnimatePresence>
      </div>

      {fullscreenCamera && (
        <LiveVideoModal 
            camera={fullscreenCamera}
            isOpen={!!fullscreenCamera}
            onClose={() => setFullscreenCamera(null)}
        />
      )}

      {showAddCameraModal && (
        <AddCameraModal
          isOpen={showAddCameraModal}
          onClose={() => setShowAddCameraModal(false)}
          onAdd={handleAddCameras}
          availableCameras={availableCamerasForModal}
          maxSlots={availableSlots}
          isLoading={modalIsLoading}
        />
      )}
      
      {showCameraDetails && (
        <CameraDetailsModal
          camera={showCameraDetails}
          isOpen={!!showCameraDetails}
          onClose={() => setShowCameraDetails(null)}
          onEdit={handleEditCamera}
        />
      )}

      {showEditCameraModal && (
        <CameraSetupWizard
          camera={showEditCameraModal}
          onComplete={() => {
            setShowEditCameraModal(null);
            loadData();
            toast({ title: "Camera Updated", description: "Camera details saved successfully." });
          }}
          onCancel={() => setShowEditCameraModal(null)}
          organization={organization}
        />
      )}

      <SaveLayoutModal 
        isOpen={showSaveLayoutModal}
        onClose={() => setShowSaveLayoutModal(false)}
        onSave={handleSaveLayout}
      />
    </div>
  );
}
