
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Location } from '@/api/entities';

const LocationContext = createContext({
  currentLocationId: null,
  locations: [],
  loading: true,
  updateLocation: () => console.warn('Location provider not ready'),
  getCurrentLocation: () => null,
  getLocationName: () => '',
  isAllLocations: () => true, // Default to 'all locations' to prevent errors
  getLocationFilter: () => ({}),
  refreshLocations: async () => console.warn('Location provider not ready'),
});

export const useLocationContext = () => {
  const context = useContext(LocationContext);
  if (!context) {
    // This should theoretically not be hit now, but good for debugging.
    throw new Error('useLocationContext must be used within LocationProvider');
  }
  return context;
};

export function LocationProvider({ children, organization }) {
  const [currentLocationId, setCurrentLocationId] = useState(null);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLocations();
  }, [organization?.id]);

  useEffect(() => {
    // Load persisted location preference
    if (organization?.id && typeof window !== 'undefined') {
      const saved = localStorage.getItem(`selectedLocation_${organization.id}`);
      if (saved && saved !== 'null') {
        setCurrentLocationId(saved);
      }
    }
  }, [organization?.id]);

  const loadLocations = async () => {
    if (!organization?.id) return;

    try {
      setLoading(true);
      const locationData = await Location.filter({ organization_id: organization.id });
      setLocations(locationData);

      // If no location selected and only one location exists, select it
      if (!currentLocationId && locationData.length === 1) {
        setCurrentLocationId(locationData[0].id);
      }
    } catch (error) {
      console.error('Failed to load locations:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateLocation = (locationId) => {
    setCurrentLocationId(locationId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`selectedLocation_${organization.id}`, locationId || '');
    }
  };

  const getCurrentLocation = () => {
    if (currentLocationId === 'all') return null;
    return locations.find(loc => loc.id === currentLocationId) || null;
  };

  const getLocationName = (locationId) => {
    if (locationId === 'all') return 'All Locations';
    const location = locations.find(loc => loc.id === locationId);
    return location?.name || 'Unknown Location';
  };

  const isAllLocations = () => {
    return currentLocationId === 'all' || !currentLocationId;
  };

  const getLocationFilter = () => {
    return isAllLocations() ? {} : { location_id: currentLocationId };
  };

  const value = {
    currentLocationId,
    locations,
    loading,
    updateLocation,
    getCurrentLocation,
    getLocationName,
    isAllLocations,
    getLocationFilter,
    refreshLocations: loadLocations
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}
