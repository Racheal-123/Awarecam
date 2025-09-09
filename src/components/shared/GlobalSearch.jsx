
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Users, Camera, Activity, Video, ChevronRight, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { createPageUrl } from '@/utils';
// Assuming these entity imports are correctly aliased or located in your project
import { Camera as CameraEntity } from '@/api/entities';
import { Event } from '@/api/entities';
import { User } from '@/api/entities';
import { Employee } from '@/api/entities';
import { Task } from '@/api/entities';

const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const formatEventType = (eventType) => {
  if (!eventType) return ''; // Handle cases where eventType might be null or undefined
  return eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

export default function GlobalSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState({ cameras: [], events: [], users: [], employees: [], tasks: [] });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef(null);
  const inputRef = useRef(null);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Create flattened results for keyboard navigation
  const flatResults = useMemo(() => {
    const flat = [];
    if (results.cameras.length > 0) flat.push(...results.cameras.map(item => ({ ...item, type: 'camera' })));
    if (results.events.length > 0) flat.push(...results.events.map(item => ({ ...item, type: 'event' })));
    if (results.users.length > 0) flat.push(...results.users.map(item => ({ ...item, type: 'user' })));
    if (results.employees.length > 0) flat.push(...results.employees.map(item => ({ ...item, type: 'employee' })));
    if (results.tasks.length > 0) flat.push(...results.tasks.map(item => ({ ...item, type: 'task' })));
    return flat;
  }, [results]);

  // Search function
  const performSearch = async (term) => {
    if (!term.trim()) {
      setResults({ cameras: [], events: [], users: [], employees: [], tasks: [] });
      return;
    }

    setIsLoading(true);
    try {
      const searchPromises = [
        CameraEntity.list().then(cameras => 
          cameras.filter(camera => 
            camera.name?.toLowerCase().includes(term.toLowerCase()) ||
            camera.location?.toLowerCase().includes(term.toLowerCase())
          ).slice(0, 3)
        ),
        Event.list('-created_date', 50).then(events => 
          events.filter(event => 
            event.description?.toLowerCase().includes(term.toLowerCase()) ||
            event.camera_name?.toLowerCase().includes(term.toLowerCase()) ||
            formatEventType(event.event_type).toLowerCase().includes(term.toLowerCase())
          ).slice(0, 3)
        ),
        User.list().then(users => 
          users.filter(user => 
            user.full_name?.toLowerCase().includes(term.toLowerCase()) ||
            user.email?.toLowerCase().includes(term.toLowerCase())
          ).slice(0, 3)
        ).catch(() => []), // Catch errors for specific entity lists
        Employee.list().then(employees => 
          employees.filter(employee => 
            employee.name?.toLowerCase().includes(term.toLowerCase()) ||
            employee.email?.toLowerCase().includes(term.toLowerCase()) ||
            employee.department?.toLowerCase().includes(term.toLowerCase())
          ).slice(0, 3)
        ).catch(() => []),
        Task.list('-created_date', 50).then(tasks => 
          tasks.filter(task => 
            task.title?.toLowerCase().includes(term.toLowerCase()) ||
            task.description?.toLowerCase().includes(term.toLowerCase())
          ).slice(0, 3)
        ).catch(() => [])
      ];

      const [cameras, events, users, employees, tasks] = await Promise.all(searchPromises);
      
      setResults({ cameras, events, users, employees, tasks });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced search effect
  useEffect(() => {
    if (debouncedSearchTerm) {
      performSearch(debouncedSearchTerm);
    } else {
      setResults({ cameras: [], events: [], users: [], employees: [], tasks: [] });
    }
    // Reset selected index when search term changes
    setSelectedIndex(-1); 
  }, [debouncedSearchTerm]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsOpen(false);
        setSelectedIndex(-1);
        setSearchTerm(''); // Clear search term when closing
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      // These global shortcuts are now handled by the global listener
      // No need to handle here if the component is closed
      return; 
    }

    switch (e.key) {
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        setSearchTerm(''); // Clear search term when escaping
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, flatResults.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && flatResults[selectedIndex]) {
          handleResultClick(flatResults[selectedIndex]);
        }
        break;
      case 'Backspace':
        // Allow backspace to work normally in the input
        break;
      default:
        // Any other key press should focus the input if it's not already
        if (inputRef.current && document.activeElement !== inputRef.current) {
          inputRef.current.focus();
        }
        break;
    }
  };

  // Handle result click
  const handleResultClick = (item) => {
    let url = '';
    
    switch (item.type) {
      case 'camera':
        url = createPageUrl('Cameras'); // Or a specific camera detail page
        break;
      case 'event':
        url = createPageUrl('Events'); // Or a specific event detail page
        break;
      case 'user':
        url = createPageUrl('Users'); // Or a specific user detail page
        break;
      case 'employee':
        url = createPageUrl('Employees'); // Or a specific employee detail page
        break;
      case 'task':
        url = createPageUrl('Tasks'); // Or a specific task detail page
        break;
      default:
        return;
    }
    
    setIsOpen(false);
    setSelectedIndex(-1);
    setSearchTerm('');
    // Use router navigation if available (e.g., Next.js router), otherwise window.location.href
    window.location.href = url;
  };

  // Global keyboard listener for opening the search
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Check if we are not already in an input field or contenteditable element
      const isTyping = e.target.isContentEditable || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';

      if (!isOpen && !isTyping) {
        if (e.key === '/' || (e.metaKey && e.key === 'k') || (e.ctrlKey && e.key === 'k')) {
          e.preventDefault();
          setIsOpen(true);
          // Use a timeout to ensure the modal is rendered before focusing
          setTimeout(() => {
            inputRef.current?.focus();
          }, 100);
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeyDown);
    return () => document.removeEventListener('keydown', handleGlobalKeyDown);
  }, [isOpen]);

  const hasResults = flatResults.length > 0;

  return (
    <div ref={searchRef} className="relative w-full max-w-md mx-auto">
      {/* Search Input */}
      <Button
        variant="outline"
        className={`
          w-full h-10 justify-between items-center text-sm
          ${isOpen ? 'ring-2 ring-blue-500 bg-white shadow-lg' : 'bg-slate-100 hover:bg-slate-200'}
          transition-all duration-200
        `}
        onClick={() => {
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 100);
        }}
      >
        <div className="flex items-center gap-2 text-slate-500">
          <Search className="w-4 h-4" />
          <span className="sr-only sm:not-sr-only">Search everything...</span> {/* Hidden on mobile, visible on larger screens */}
        </div>
        <kbd className="pointer-events-none hidden h-6 select-none items-center gap-1 rounded border bg-slate-50 px-2 font-mono text-[10px] font-medium text-slate-600 opacity-100 sm:flex">
          <span className="text-xs">⌘</span>K
        </kbd>
        <kbd className="pointer-events-none sm:hidden h-6 select-none items-center gap-1 rounded border bg-slate-50 px-2 font-mono text-[10px] font-medium text-slate-600 opacity-100 flex">
          /
        </kbd>
      </Button>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 sm:absolute sm:top-full sm:left-0 sm:right-0 mt-0 sm:mt-2 bg-white rounded-none sm:rounded-lg shadow-none sm:shadow-xl border-none sm:border border-slate-200 z-[9999] sm:z-50 flex flex-col" // Increased z-index for mobile full-screen
          >
            {/* Header for mobile full-screen search */}
            <div className="flex items-center p-3 sm:hidden border-b border-slate-200">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500"
                onClick={() => {
                  setIsOpen(false);
                  setSearchTerm('');
                  setSelectedIndex(-1);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
              <div className="flex-grow relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Search everything..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10 pr-8 py-2 rounded-md bg-slate-100 text-sm placeholder-slate-500 focus:outline-none"
                />
                {searchTerm && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-500"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Input for desktop search */}
            <div className="hidden sm:flex p-3 border-b border-slate-200">
              <Search className="w-4 h-4 text-slate-500 ml-3 flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search everything..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-3 py-2 bg-transparent text-sm placeholder-slate-500 focus:outline-none min-w-0"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 mr-2 flex-shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm('');
                  // Keep search open on desktop
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex-grow overflow-y-auto custom-scrollbar"> {/* Added custom-scrollbar class for styling */}
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
                  <span className="ml-2 text-sm text-slate-500">Searching...</span>
                </div>
              ) : hasResults ? (
                <div className="py-2">
                  {/* Cameras */}
                  {results.cameras.length > 0 && (
                    <SearchSection
                      title="Cameras"
                      icon={Camera}
                      items={results.cameras}
                      type="camera"
                      renderItem={(camera, localIndex) => (
                        <SearchResult
                          key={`camera-${camera.id}`}
                          isSelected={selectedIndex === (results.flatResultsOffset?.cameras || 0) + localIndex}
                          onClick={() => handleResultClick({ ...camera, type: 'camera' })}
                        >
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${
                              camera.stream_status === 'live' ? 'bg-green-500' : 
                              camera.status === 'active' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-slate-900 truncate">{camera.name}</p>
                              <p className="text-xs text-slate-500 truncate">{camera.location || 'No location'}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 ml-2 flex-shrink-0" />
                          </div>
                        </SearchResult>
                      )}
                      startIndex={0}
                    />
                  )}

                  {/* Events */}
                  {results.events.length > 0 && (
                    <SearchSection
                      title="Events"
                      icon={Activity}
                      items={results.events}
                      type="event"
                      renderItem={(event, localIndex) => (
                        <SearchResult
                          key={`event-${event.id}`}
                          isSelected={selectedIndex === (results.flatResultsOffset?.cameras || 0) + results.cameras.length + localIndex}
                          onClick={() => handleResultClick({ ...event, type: 'event' })}
                        >
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${
                              event.severity === 'critical' ? 'bg-red-500' :
                              event.severity === 'high' ? 'bg-orange-500' :
                              event.severity === 'medium' ? 'bg-blue-500' : 'bg-slate-400'
                            }`} />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-slate-900 truncate">{event.description}</p>
                              <p className="text-xs text-slate-500 truncate">
                                {formatEventType(event.event_type)} • {event.camera_name}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 ml-2 flex-shrink-0" />
                          </div>
                        </SearchResult>
                      )}
                      startIndex={results.cameras.length}
                    />
                  )}

                  {/* Users */}
                  {results.users.length > 0 && (
                    <SearchSection
                      title="Users"
                      icon={Users}
                      items={results.users}
                      type="user"
                      renderItem={(user, localIndex) => (
                        <SearchResult
                          key={`user-${user.id}`}
                          isSelected={selectedIndex === (results.flatResultsOffset?.cameras || 0) + results.cameras.length + results.events.length + localIndex}
                          onClick={() => handleResultClick({ ...user, type: 'user' })}
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                              <span className="text-white text-xs font-medium">
                                {user.full_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-slate-900 truncate">{user.full_name}</p>
                              <p className="text-xs text-slate-500 truncate">{user.email}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 ml-2 flex-shrink-0" />
                          </div>
                        </SearchResult>
                      )}
                      startIndex={results.cameras.length + results.events.length}
                    />
                  )}

                  {/* Employees */}
                  {results.employees.length > 0 && (
                    <SearchSection
                      title="Employees"
                      icon={Users}
                      items={results.employees}
                      type="employee"
                      renderItem={(employee, localIndex) => (
                        <SearchResult
                          key={`employee-${employee.id}`}
                          isSelected={selectedIndex === (results.flatResultsOffset?.cameras || 0) + results.cameras.length + results.events.length + results.users.length + localIndex}
                          onClick={() => handleResultClick({ ...employee, type: 'employee' })}
                        >
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                              <span className="text-white text-xs font-medium">
                                {employee.name?.charAt(0) || 'E'}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-slate-900 truncate">{employee.name}</p>
                              <p className="text-xs text-slate-500 truncate">
                                {employee.department || employee.email}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 ml-2 flex-shrink-0" />
                          </div>
                        </SearchResult>
                      )}
                      startIndex={results.cameras.length + results.events.length + results.users.length}
                    />
                  )}

                  {/* Tasks */}
                  {results.tasks.length > 0 && (
                    <SearchSection
                      title="Tasks"
                      icon={Video} // Changed to Video as an example, use appropriate icon
                      items={results.tasks}
                      type="task"
                      renderItem={(task, localIndex) => (
                        <SearchResult
                          key={`task-${task.id}`}
                          isSelected={selectedIndex === (results.flatResultsOffset?.cameras || 0) + results.cameras.length + results.events.length + results.users.length + results.employees.length + localIndex}
                          onClick={() => handleResultClick({ ...task, type: 'task' })}
                        >
                          <div className="flex items-center">
                            <div className={`w-2 h-2 rounded-full mr-3 flex-shrink-0 ${
                              task.status === 'completed' ? 'bg-green-500' :
                              task.status === 'in_progress' ? 'bg-blue-500' :
                              task.status === 'overdue' ? 'bg-red-500' : 'bg-slate-400'
                            }`} />
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-slate-900 truncate">{task.title}</p>
                              <p className="text-xs text-slate-500 truncate">
                                {task.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                              </p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-slate-400 ml-2 flex-shrink-0" />
                          </div>
                        </SearchResult>
                      )}
                      startIndex={results.cameras.length + results.events.length + results.users.length + results.employees.length}
                    />
                  )}
                </div>
              ) : searchTerm.trim() ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-slate-500">No results found for "{searchTerm}"</p>
                </div>
              ) : (
                <div className="py-6 px-4">
                  <p className="text-xs text-slate-500 mb-3">Search for cameras, events, users, and more</p>
                  <div className="flex flex-wrap gap-2 text-xs text-slate-400">
                    <Badge variant="outline" className="text-xs">Press / to search</Badge>
                    <Badge variant="outline" className="text-xs">↑↓ to navigate</Badge>
                    <Badge variant="outline" className="text-xs">Enter to select</Badge>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Components
function SearchSection({ title, icon: Icon, items, renderItem, startIndex }) {
  if (items.length === 0) return null;

  return (
    <div className="px-2 py-1">
      <div className="flex items-center gap-2 px-2 py-1 text-xs font-medium text-slate-500 uppercase tracking-wide">
        <Icon className="w-3 h-3" />
        {title}
      </div>
      {items.map((item, localIndex) => renderItem(item, localIndex))}
    </div>
  );
}

function SearchResult({ children, isSelected, onClick }) {
  return (
    <div
      className={`px-3 py-2 mx-1 rounded cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 text-blue-900' : 'hover:bg-slate-50'
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
