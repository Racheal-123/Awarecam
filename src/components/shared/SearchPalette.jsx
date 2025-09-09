import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
    Camera, 
    Shield, 
    Users, 
    ClipboardCheck, 
    Video, 
    Search,
    X,
    ArrowRight
} from 'lucide-react';

// Simple search sections with mock data
const searchSections = [
  {
    id: 'cameras',
    title: 'Cameras',
    icon: Camera,
    description: 'Search camera names and locations',
    color: 'blue',
    mockData: [
      { id: '1', name: 'Main Entrance Camera', location: 'Building A - Front Door', status: 'active' },
      { id: '2', name: 'Warehouse Camera B', location: 'Building B - Loading Dock', status: 'active' },
      { id: '3', name: 'Parking Lot Camera', location: 'Exterior - East Side', status: 'inactive' }
    ]
  },
  {
    id: 'events',
    title: 'Events',
    icon: Shield,
    description: 'Search security events and alerts',
    color: 'red',
    mockData: [
      { id: '1', description: 'Motion detected in restricted area', camera_name: 'Main Entrance Camera', severity: 'high' },
      { id: '2', description: 'Person detected after hours', camera_name: 'Warehouse Camera B', severity: 'critical' },
      { id: '3', description: 'Vehicle in loading zone', camera_name: 'Parking Lot Camera', severity: 'medium' }
    ]
  },
  {
    id: 'media',
    title: 'Media Library',
    icon: Video,
    description: 'Find saved videos and screenshots',
    color: 'purple',
    mockData: [
      { id: '1', title: 'Safety Incident Recording', description: 'Video of safety incident', media_type: 'video' },
      { id: '2', title: 'Equipment Screenshot', description: 'Screenshot of equipment status', media_type: 'screenshot' },
      { id: '3', title: 'Training Session', description: 'Training session recording', media_type: 'video' }
    ]
  }
];

export default function SearchPalette({ isOpen, setIsOpen }) {
  const [selectedSection, setSelectedSection] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);

  // Simple search function
  const performSearch = (section, term) => {
    if (!term.trim()) {
      setResults([]);
      return;
    }

    const mockData = section.mockData || [];
    const filteredItems = mockData.filter(item => {
      const searchableText = Object.values(item).join(' ').toLowerCase();
      return searchableText.includes(term.toLowerCase());
    });

    setResults(filteredItems.slice(0, 5));
  };

  // Handle search when term changes
  useEffect(() => {
    if (selectedSection && searchTerm) {
      const timeoutId = setTimeout(() => {
        performSearch(selectedSection, searchTerm);
      }, 300);
      return () => clearTimeout(timeoutId);
    } else {
      setResults([]);
    }
  }, [selectedSection, searchTerm]);

  const handleSectionSelect = (section) => {
    setSelectedSection(section);
    setSearchTerm('');
    setResults([]);
  };

  const handleResultClick = (result) => {
    // Simple navigation - you can enhance this later
    console.log('Navigate to:', selectedSection.title, result);
    setIsOpen(false);
  };

  const handleClose = () => {
    setIsOpen(false);
    setSelectedSection(null);
    setSearchTerm('');
    setResults([]);
  };

  const handleBack = () => {
    setSelectedSection(null);
    setSearchTerm('');
    setResults([]);
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (selectedSection) {
          handleBack();
        } else {
          handleClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, selectedSection]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="flex items-start justify-center pt-[10vh] px-4">
        <div className="w-full max-w-2xl">
          <Card className="shadow-2xl border-0">
            <CardContent className="p-0">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  {selectedSection ? (
                    <>
                      <button
                        onClick={handleBack}
                        className="p-1 hover:bg-slate-100 rounded"
                      >
                        <ArrowRight className="w-4 h-4 rotate-180 text-slate-500" />
                      </button>
                      <selectedSection.icon className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="font-semibold text-slate-900">Search {selectedSection.title}</h3>
                        <p className="text-xs text-slate-500">{selectedSection.description}</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <Search className="w-5 h-5 text-slate-500" />
                      <div>
                        <h3 className="font-semibold text-slate-900">Search AwareCam</h3>
                        <p className="text-xs text-slate-500">Choose what you'd like to search</p>
                      </div>
                    </>
                  )}
                </div>
                <button
                  onClick={handleClose}
                  className="p-2 hover:bg-slate-100 rounded-full"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              </div>

              {/* Content */}
              <div className="max-h-96 overflow-y-auto">
                {!selectedSection ? (
                  /* Section Selection */
                  <div className="p-4 space-y-2">
                    {searchSections.map((section) => (
                      <button
                        key={section.id}
                        onClick={() => handleSectionSelect(section)}
                        className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
                      >
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <section.icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900">{section.title}</h4>
                          <p className="text-sm text-slate-500">{section.description}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </button>
                    ))}
                  </div>
                ) : (
                  /* Search Interface */
                  <>
                    <div className="p-4 border-b border-slate-100">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder={`Search ${selectedSection.title.toLowerCase()}...`}
                          className="pl-10 border-0 bg-slate-50 focus:bg-white"
                          autoFocus
                        />
                      </div>
                    </div>

                    {/* Results */}
                    <div className="p-4">
                      {results.length > 0 ? (
                        <div className="space-y-2">
                          {results.map((result) => (
                            <button
                              key={result.id}
                              onClick={() => handleResultClick(result)}
                              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors text-left"
                            >
                              <selectedSection.icon className="w-4 h-4 text-blue-600 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-slate-900 truncate">
                                  {result.name || result.title || result.description || 'Untitled'}
                                </p>
                                <p className="text-sm text-slate-500 truncate">
                                  {result.location || result.camera_name || result.media_type || ''}
                                </p>
                              </div>
                              {result.status && (
                                <Badge className={`${result.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}`}>
                                  {result.status}
                                </Badge>
                              )}
                              {result.severity && (
                                <Badge className={`${result.severity === 'critical' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                                  {result.severity}
                                </Badge>
                              )}
                            </button>
                          ))}
                        </div>
                      ) : searchTerm ? (
                        <div className="text-center py-8">
                          <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-slate-500">No results found for "{searchTerm}"</p>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <selectedSection.icon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                          <p className="text-slate-500">Start typing to search {selectedSection.title.toLowerCase()}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              {!selectedSection && (
                <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>Press <kbd className="px-1 py-0.5 bg-white border rounded">⌘K</kbd> to open</span>
                    <span>Press <kbd className="px-1 py-0.5 bg-white border rounded">Esc</kbd> to close</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}