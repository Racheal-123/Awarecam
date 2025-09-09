
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge'; // Keep Badge for displaying location count
import {
  MapPin,
  ChevronDown,
  Globe,
  Plus,
  Check
} from 'lucide-react'; // Building was not used in original, removing.
import { useLocationContext } from '@/components/shared/LocationContext'; // New import for context

export default function LocationSwitcher({
  currentLocationId,
  onLocationChange,
  organization,
  showAddLocation = false,
  onAddLocation = null,
  compact = false
}) {
  // Use the location context to get locations and loading state
  const { locations, loading } = useLocationContext();

  // Determine the currently selected location object from the fetched locations
  // If currentLocationId is null, it means 'All Locations' is implicitly selected.
  const currentLocation = locations.find(loc => loc.id === currentLocationId);
  const isAllLocations = !currentLocationId; // 'All Locations' is represented by null currentLocationId

  const handleValueChange = (value) => {
    // If 'all' is selected from the UI (which represents the 'All Locations' option),
    // pass null to onLocationChange. Otherwise, pass the actual location ID.
    const newLocationId = value === 'all' ? null : value;
    onLocationChange(newLocationId);

    // Persist selection to localStorage
    if (typeof window !== 'undefined' && organization?.id) {
      localStorage.setItem(`selectedLocation_${organization.id}`, value); // Store 'all' or location ID string
    }
  };

  if (loading) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'text-sm' : ''}`}>
        <MapPin className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-slate-400 animate-pulse`} />
        <span className="text-slate-400">Loading...</span>
      </div>
    );
  }

  // If there's only one location and 'Add Location' is not shown, display it as a simple badge/text.
  if (locations.length <= 1 && !showAddLocation) {
    const singleLocation = locations[0];
    return (
      <div className={`flex items-center gap-2 ${compact ? 'text-sm' : ''}`}>
        <MapPin className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-blue-600`} />
        <span className="font-medium text-slate-700">
          {singleLocation?.name || 'Main Location'}
        </span>
      </div>
    );
  }

  return (
    <Select value={currentLocationId || 'all'} onValueChange={handleValueChange}>
      <SelectTrigger
        className={`flex items-center gap-2 ${compact ? 'h-8 text-sm px-3' : 'h-10'} hover:bg-slate-50 border-slate-200`}
      >
        {isAllLocations ? (
          <Globe className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-blue-600`} />
        ) : (
          <MapPin className={`${compact ? 'w-4 h-4' : 'w-5 h-5'} text-blue-600`} />
        )}
        <SelectValue placeholder="Select Location">
          <span className="font-medium text-slate-700">
            {isAllLocations
              ? 'All Locations'
              : (currentLocation?.name || 'Select Location')
            }
          </span>
        </SelectValue>
        {locations.length > 1 && (
          <Badge variant="secondary" className="ml-1 text-xs">
            {isAllLocations ? locations.length : '1'}
          </Badge>
        )}
        <ChevronDown className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-slate-500`} />
      </SelectTrigger>

      <SelectContent align="start" className="w-64">
        {/* All Locations Option */}
        <SelectItem
          value="all"
          className="flex items-center justify-between py-3 px-3 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <Globe className="w-4 h-4 text-blue-600" />
            <div>
              <p className="font-medium">All Locations</p>
              <p className="text-xs text-slate-500">View data from all sites</p>
            </div>
          </div>
          {isAllLocations && <Check className="w-4 h-4 text-blue-600" />}
        </SelectItem>

        {/* Separator */}
        {locations.length > 0 && <div className="relative my-1">
          <span className="absolute inset-x-0 h-[1px] bg-border my-1" />
        </div>}

        {/* Individual Locations */}
        {locations.map((location) => (
          <SelectItem
            key={location.id}
            value={location.id}
            className="flex items-center justify-between py-3 px-3 cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-slate-600" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{location.name}</p>
                <p className="text-xs text-slate-500 truncate">
                  {location.city ? `${location.city}, ${location.country}` : location.country}
                </p>
              </div>
            </div>
            {currentLocationId === location.id && (
              <Check className="w-4 h-4 text-blue-600" />
            )}
          </SelectItem>
        ))}

        {/* Add Location Option */}
        {showAddLocation && onAddLocation && (
          <>
            <div className="relative my-1">
              <span className="absolute inset-x-0 h-[1px] bg-border my-1" />
            </div>
            <SelectItem
              value="_add_new_location_" // Unique dummy value for this action item
              onSelect={(event) => {
                event.preventDefault(); // Prevent closing Select before action
                onAddLocation();
              }}
              className="flex items-center gap-3 py-3 px-3 cursor-pointer text-blue-600"
            >
              <Plus className="w-4 h-4" />
              <div>
                <p className="font-medium">Add New Location</p>
                <p className="text-xs text-slate-500">Set up a new site</p>
              </div>
            </SelectItem>
          </>
        )}
      </SelectContent>
    </Select>
  );
}
