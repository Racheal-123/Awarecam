
import React, { createContext, useContext, useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { AlertNotification } from "@/entities";
import { LocationProvider } from '@/components/shared/LocationContext';
import LocationSwitcher from '@/components/shared/LocationSwitcher';
import {
  Camera,
  LayoutDashboard,
  Settings,
  Users,
  BarChart3,
  Bell,
  Shield,
  Video,
  Loader2,
  Mail,
  Activity,
  Briefcase,
  ClipboardCheck,
  Sparkles,
  Crown,
  UserCheck,
  Building,
  CreditCard,
  Zap as ZapIcon,
  Headphones as HeadphonesIcon,
  ChevronDown,
  ChevronLeft,
  Menu,
  Bot,
  ShieldCheck,
  ClipboardList,
  IdCard,
  Library,
  BellRing,
  PlugZap,
  ShieldAlert,
  MapPin,
  Search, // Added Search icon
  X // Added X icon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User } from "@/api/entities";
import { Organization } from "@/api/entities";
import { Role } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { ModalProvider } from '@/components/providers/ModalProvider';

import AIAssistant from "@/components/shared/AIAssistant";
import WelcomePage from "@/pages/Welcome";
import UpgradePrompt from "@/components/workflows/UpgradePrompt";
import OrganizationSwitcher from '@/components/shared/OrganizationSwitcher';
import UserRoleSwitcher from '@/components/shared/UserRoleSwitcher';
import AlertsDropdown from '@/components/shared/AlertsDropdown';
import PlatformUserSwitcher from '@/components/shared/PlatformUserSwitcher';
import GlobalSearch from '@/components/shared/GlobalSearch';
import { Toaster } from "@/components/ui/sonner"

import StreamManager from '@/components/services/StreamManager';

// Create User Context
const UserContext = createContext();

// Enhanced UserProvider with automatic user account creation
function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false); // New state to indicate UserProvider's initial check is done

  const updateUser = (userData) => {
    setUser(prevUser => ({ ...prevUser, ...userData }));
  };

  const createUserAccount = async (userData) => {
    try {
      // Step 1: Create or assign a default role for new users
      let defaultRole;
      const existingRoles = await Role.filter({ role_name: 'organization_admin' });

      if (existingRoles.length > 0) {
        defaultRole = existingRoles[0];
      } else {
        // Create default organization_admin role if it doesn't exist
        defaultRole = await Role.create({
          role_name: 'organization_admin',
          role_display_name: 'Organization Administrator',
          is_platform_role: false,
          permissions: {
            can_manage_orgs: false,
            can_manage_users: false,
            can_manage_billing: false,
            can_manage_ai_assistant: false,
            can_manage_support: false
          }
        });
      }

      // Step 2: Update user with role_id
      const updatedUser = await User.update(userData.id, {
        role_id: defaultRole.id,
        onboarding_completed: false // They'll need to complete onboarding
      });

      setUser(updatedUser);
      setUserRole(defaultRole);
      setIsInitialized(true); // Mark as initialized after user creation

      return { user: updatedUser, role: defaultRole };

    } catch (error) {
      console.error('Failed to create user account:', error);
      setIsInitialized(true); // Mark as initialized even on error to avoid infinite loading
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await User.me();
      let fetchedUserRole = null;

      if (userData.role_id) {
        fetchedUserRole = await Role.get(userData.role_id);
      } else {
        // Handle special case for super admin email
        const isSuperAdminEmail = userData.email === 'awarecamai@gmail.com';
        if (isSuperAdminEmail) {
          const superAdminRoles = await Role.filter({ role_name: 'super_admin' });
          if (superAdminRoles.length > 0) {
            const superAdminRole = superAdminRoles[0];
            await User.update(userData.id, { role_id: superAdminRole.id });
            userData.role_id = superAdminRole.id;
            fetchedUserRole = superAdminRole;
          }
        } else {
          // New user - create account automatically
          console.log('Creating account for new user:', userData.email);
          return await createUserAccount(userData);
        }
      }

      setUser(userData);
      setUserRole(fetchedUserRole);
      setIsInitialized(true); // Mark as initialized after user fetch

      return { user: userData, role: fetchedUserRole };

    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
      setUserRole(null);
      setIsInitialized(true); // Mark as initialized even on error/no user
      throw error;
    }
  };

  // Initial load check for the UserProvider
  useEffect(() => {
    let isMounted = true;
    const initialLoad = async () => {
      try {
        const userData = await User.me();
        if (isMounted) {
          if (userData && userData.id) {
            let fetchedUserRole = null;
            if (userData.role_id) {
              fetchedUserRole = await Role.get(userData.role_id);
            } else {
              // Special case for super admin email on initial load
              const isSuperAdminEmail = userData.email === 'awarecamai@gmail.com';
              if (isSuperAdminEmail) {
                const superAdminRoles = await Role.filter({ role_name: 'super_admin' });
                if (superAdminRoles.length > 0) {
                  const superAdminRole = superAdminRoles[0];
                  await User.update(userData.id, { role_id: superAdminRole.id });
                  userData.role_id = superAdminRole.id;
                  fetchedUserRole = superAdminRole;
                }
              }
            }
            setUser(userData);
            setUserRole(fetchedUserRole);
          } else {
            setUser(null);
            setUserRole(null);
          }
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("UserProvider initial load failed:", error);
        if (isMounted) {
          setUser(null);
          setUserRole(null);
          setIsInitialized(true); // Always set initialized to true after attempt
        }
      }
    };
    initialLoad();
    return () => { isMounted = false; };
  }, []); // Run only once on mount

  return (
    <UserContext.Provider value={{
      user,
      setUser,
      userRole,
      organization,
      setOrganization,
      updateUser,
      refreshUser,
      isInitialized
    }}>
      {children}
    </UserContext.Provider>
  );
}

// Hook to use user context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

function LayoutContent({ children, currentPageName }) {
  const location = useLocation();
  const { user, setUser, userRole, organization, setOrganization } = useUser();
  const [viewingOrgId, setViewingOrgId] = useState(null);
  const [viewingAsRole, setViewingAsRole] = useState('organization_admin');
  const [viewingAsPlatformRole, setViewingAsPlatformRole] = useState(null);
  const [viewingLocationId, setViewingLocationId] = useState(null);
  const [isAIAssistantOpen, setAIAssistantOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false); // New state for mobile search

  // State for notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;

    try {
        const newNotifications = await AlertNotification.filter(
            { user_id: user.id, is_read: false },
            '-created_date',
            10
        );
        setNotifications(newNotifications);
        setUnreadCount(newNotifications.length);
    } catch (error) {
        if (error.message.includes('429') || error.message.includes('Rate limit')) {
            // Silently ignore rate limit errors for this background task
            console.warn('Rate limit hit when fetching notifications, will retry later');
        } else {
            console.error("Failed to fetch notifications", error);
        }
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 120000); // Increased interval to 2 minutes
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  useEffect(() => {
    let timeoutId;
    const throttledFetch = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(fetchNotifications, 2000);
    };

    window.addEventListener('notificationsUpdated', throttledFetch);
    return () => {
      window.removeEventListener('notificationsUpdated', throttledFetch);
      clearTimeout(timeoutId);
    };
  }, [fetchNotifications]);

  // Only handle organization loading, not auth checking
  useEffect(() => {
    const handleLocationChange = async () => {
      const params = new URLSearchParams(window.location.search);
      const orgIdFromUrl = params.get('org_id');
      const roleView = params.get('role_view');
      const platformRoleView = params.get('platform_role_view');
      const locationIdFromUrl = params.get('location_id');

      setViewingOrgId(orgIdFromUrl);
      setViewingAsRole(roleView || 'organization_admin');
      setViewingAsPlatformRole(platformRoleView || userRole?.role_name);
      setViewingLocationId(locationIdFromUrl);

      // Only handle organization loading, not auth checking
      const isPlatformAdminUser = userRole?.is_platform_role;

      if (isPlatformAdminUser && orgIdFromUrl) {
        if (!organization || organization.id !== orgIdFromUrl) {
          try {
            const orgData = await Organization.get(orgIdFromUrl);
            setOrganization(orgData);
          } catch (orgError) {
            console.warn('Failed to load organization:', orgError);
            setOrganization(null);
          }
        }
      } else if (!isPlatformAdminUser && user?.organization_id) {
        if (!organization || organization.id !== user.organization_id) {
          try {
            const orgs = await Organization.filter({ id: user.organization_id });
            setOrganization(orgs.length > 0 ? orgs[0] : null);
          } catch (orgError) {
            console.warn('Failed to load user organization:', orgError);
            setOrganization(null);
          }
        }
      } else {
        if (organization) {
          setOrganization(null);
        }
      }
    };

    handleLocationChange();

    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, [location.key, user, userRole, setOrganization, organization]);

  const createNavUrl = (pageName) => {
    const params = new URLSearchParams();
    if (viewingOrgId) {
      params.set('org_id', viewingOrgId);
    }
    if (viewingAsRole && viewingAsRole !== 'organization_admin') {
      params.set('role_view', viewingAsRole);
    }
    if (viewingLocationId) {
      params.set('location_id', viewingLocationId);
    }
    const isPlatformAdmin = userRole?.is_platform_role;
    const isViewingAsOrg = isPlatformAdmin && viewingOrgId;

    if (isPlatformAdmin && !isViewingAsOrg && userRole && viewingAsPlatformRole !== userRole.role_name) {
      params.set('platform_role_view', viewingAsPlatformRole);
    }
    const queryString = params.toString();
    return queryString ? `${createPageUrl(pageName)}?${queryString}` : createPageUrl(pageName);
  };

  const handlePlatformRoleChange = (selectedUser) => {
    setViewingAsPlatformRole(selectedUser.role);

    const params = new URLSearchParams(window.location.search);
    if (selectedUser.role !== userRole?.role_name) {
      params.set('platform_role_view', selectedUser.role);
    } else {
      params.delete('platform_role_view');
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  };

  const handleRoleChange = (newRole) => {
    setViewingAsRole(newRole);
    const params = new URLSearchParams(window.location.search);
    if (newRole && newRole !== 'organization_admin') {
      params.set('role_view', newRole);
    } else {
      params.delete('role_view');
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  };

  const handleLogout = async () => {
    await User.logout();
    setUser(null);
  };

  const isPlatformAdmin = userRole?.is_platform_role;
  const isAdminPage = currentPageName && currentPageName.startsWith('Admin');

  const isViewingAsOrg = isPlatformAdmin && viewingOrgId && !isAdminPage;

  const effectiveRole = isViewingAsOrg ? viewingAsRole : userRole?.role_name;

  const isOrgAdmin = effectiveRole === 'organization_admin';
  const isManager = effectiveRole === 'manager' || isOrgAdmin;
  const isOperator = effectiveRole === 'operator' || isManager;

  const effectivePlatformRole = (isPlatformAdmin && !isViewingAsOrg) ? viewingAsPlatformRole : userRole?.role_name;
  const isSuperAdmin = effectivePlatformRole === 'super_admin';
  const adminPermissions = userRole?.permissions || {};

  const workflowAddonEnabled = organization?.workflow_addon_enabled || false;

  return (
    <LocationProvider organization={organization}>
      <div className="min-h-screen flex w-full bg-slate-50">
        {/* Custom scrollbar styles */}
        <style jsx="true" global="true">{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(30, 41, 59, 0.1);
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(148, 163, 184, 0.5);
            border-radius: 2px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(148, 163, 184, 0.8);
          }
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(148, 163, 184, 0.5) rgba(30, 41, 59, 0.1);
          }
        `}</style>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Fixed Sidebar */}
        <div
          className={`bg-slate-900 border-r border-slate-200 flex flex-col transition-all duration-300 ease-in-out
            fixed h-full inset-y-0 left-0 z-40
            ${isSidebarCollapsed ? 'w-20' : 'w-64'}
            ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          {/* Header - Fixed */}
          <div className={`p-6 bg-slate-900 flex items-center gap-3 flex-shrink-0 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <Video className="w-5 h-5 text-white" />
              </div>
              <div className={`${isSidebarCollapsed ? 'hidden' : ''}`}>
                <h1 className="text-xl font-bold text-white">AwareCam</h1>
                <p className="text-xs text-slate-300">Video Intelligence</p>
              </div>
          </div>

          {/* Role Switcher - Fixed */}
          <div className={`px-6 py-3 border-b border-slate-800 flex-shrink-0 ${isSidebarCollapsed ? 'px-3' : 'px-6'}`}>
            {isPlatformAdmin && !isViewingAsOrg ? (
              <PlatformUserSwitcher
                currentUser={{...user, role: viewingAsPlatformRole}}
                onUserChange={handlePlatformRoleChange}
                isCollapsed={isSidebarCollapsed}
              />
            ) : isPlatformAdmin && isViewingAsOrg ? (
              <UserRoleSwitcher currentRole={viewingAsRole} onRoleChange={handleRoleChange} isCollapsed={isSidebarCollapsed} />
            ) : (
              <UserRoleSwitcher currentRole={userRole?.role_name} onRoleChange={null} isCollapsed={isSidebarCollapsed} />
            )}
          </div>

          {/* Navigation - Scrollable */}
          <div className="flex-1 bg-slate-900 overflow-y-auto custom-scrollbar">
            {isPlatformAdmin && !isViewingAsOrg && (
              <div className="px-4 py-2">
                <p className={`text-slate-400 font-medium text-xs uppercase tracking-wider px-2 py-2 flex items-center gap-2 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                  <Crown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  <span className={isSidebarCollapsed ? 'hidden' : ''}>Platform Admin</span>
                </p>
                <div className="space-y-1">
                  <Link
                    to={createNavUrl("AdminDashboard")}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                      location.pathname === createPageUrl("AdminDashboard")
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Crown className="w-5 h-5 flex-shrink-0" />
                    <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Admin Dashboard</span>
                  </Link>

                  {(isSuperAdmin || adminPermissions.can_manage_orgs) && (
                    <Link
                      to={createNavUrl("AdminAnalytics")}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                        location.pathname === createPageUrl("AdminAnalytics")
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <BarChart3 className="w-5 h-5 flex-shrink-0" />
                      <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Analytics</span>
                    </Link>
                  )}

                  {(isSuperAdmin || adminPermissions.can_manage_orgs) && (
                    <Link
                      to={createNavUrl("AdminOrganizationManagement")}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                        location.pathname === createPageUrl("AdminOrganizationManagement") || location.pathname === createPageUrl("AdminOrganizationDetails")
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Briefcase className="w-5 h-5 flex-shrink-0" />
                      <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Organizations</span>
                    </Link>
                  )}
                  {(isSuperAdmin || adminPermissions.can_manage_users) && (
                    <Link
                      to={createNavUrl("AdminUsers")}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                        location.pathname === createPageUrl("AdminUsers")
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <UserCheck className="w-5 h-5 flex-shrink-0" />
                      <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>All Users</span>
                    </Link>
                  )}
                  {(isSuperAdmin || adminPermissions.can_manage_ai_assistant) && (
                    <Link
                      to={createNavUrl("AdminAIAssistant")}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                        location.pathname === createPageUrl("AdminAIAssistant")
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Bot className="w-5 h-5 flex-shrink-0" />
                      <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>AI Assistant</span>
                    </Link>
                  )}
                  {(isSuperAdmin || adminPermissions.can_manage_ai_assistant) && (
                      <Link
                        to={createNavUrl("AdminBots")}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                          location.pathname === createPageUrl("AdminBots")
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        <ZapIcon className="w-5 h-5 flex-shrink-0" />
                        <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>AI Bots</span>
                      </Link>
                  )}
                  {isSuperAdmin && (
                      <Link
                        to={createNavUrl("AdminIntegrations")}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                          location.pathname === createPageUrl("AdminIntegrations")
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        <PlugZap className="w-5 h-5 flex-shrink-0" />
                        <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Integrations</span>
                      </Link>
                  )}
                  {isSuperAdmin && (
                      <Link
                        to={createNavUrl("AdminWorkflows")}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                          location.pathname === createPageUrl("AdminWorkflows")
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        <ClipboardList className="w-5 h-5 flex-shrink-0" />
                        <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Workflow Templates</span>
                      </Link>
                  )}
                  {isSuperAdmin && (
                      <Link
                        to={createNavUrl("AdminRoles")}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                          location.pathname === createPageUrl("AdminRoles")
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        <IdCard className="w-5 h-5 flex-shrink-0" />
                        <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Employee Roles</span>
                      </Link>
                  )}
                  {isSuperAdmin && (
                      <Link
                        to={createNavUrl("AdminOnboarding")}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                          location.pathname === createPageUrl("AdminOnboarding")
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Sparkles className="w-5 h-5 flex-shrink-0" />
                        <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Onboarding</span>
                      </Link>
                  )}
                  {(isSuperAdmin || adminPermissions.can_manage_support) && (
                      <Link
                        to={createNavUrl("AdminLibrary")}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                          location.pathname === createPageUrl("AdminLibrary")
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Library className="w-5 h-5 flex-shrink-0" />
                        <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Platform Media</span>
                      </Link>
                  )}
                  {(isSuperAdmin || adminPermissions.can_manage_billing) && (
                    <Link
                      to={createPageUrl("AdminBilling")}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                        location.pathname === createPageUrl("AdminBilling")
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 flex-shrink-0" />
                      <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Billing</span>
                    </Link>
                  )}
                  {(isSuperAdmin || adminPermissions.can_manage_support) && (
                    <Link
                      to={createNavUrl("AdminSupport")}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                        location.pathname === createPageUrl("AdminSupport")
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <HeadphonesIcon className="w-5 h-5 flex-shrink-0" />
                      <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Support</span>
                    </Link>
                  )}

                  {(isSuperAdmin || adminPermissions.can_manage_support) && (
                      <Link
                        to={createNavUrl("AdminAlertMonitoring")}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                          location.pathname === createPageUrl("AdminAlertMonitoring")
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                        <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Alert Monitoring</span>
                      </Link>
                  )}

                  {isSuperAdmin && (
                    <Link
                      to={createNavUrl("AdminPermissions")}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                        location.pathname === createPageUrl("AdminPermissions")
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                      <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Permissions</span>
                    </Link>
                  )}
                </div>
              </div>
            )}

            {(!isPlatformAdmin || isViewingAsOrg) && (
              <>
                <div className="px-4 py-2">
                  <p className={`text-slate-400 font-medium text-xs uppercase tracking-wider px-2 py-2 ${isSidebarCollapsed ? 'text-center' : ''}`}>
                    <span className={isSidebarCollapsed ? 'hidden' : ''}>Navigation</span>
                  </p>
                  <div className="space-y-1">
                    <Link
                      to={createNavUrl("Dashboard")}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                        location.pathname === createPageUrl("Dashboard")
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <LayoutDashboard className="w-5 h-5 flex-shrink-0" />
                      <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Dashboard</span>
                    </Link>

                    {isOperator && (
                      <Link
                        to={createNavUrl("Cameras")}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                          location.pathname === createPageUrl("Cameras")
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Camera className="w-5 h-5 flex-shrink-0" />
                        <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Cameras</span>
                      </Link>
                    )}

                    <Link
                      to={createNavUrl("Live")}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                        location.pathname === createPageUrl("Live")
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Video className="w-5 h-5 flex-shrink-0" />
                      <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Live Monitor</span>
                    </Link>

                    <Link
                      to={createNavUrl("Events")}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                        location.pathname === createPageUrl("Events")
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                    >
                      <Shield className="w-5 h-5 flex-shrink-0" />
                      <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Events</span>
                    </Link>

                    <Link
                        to={createNavUrl("Alerts")}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                          location.pathname.startsWith(createPageUrl("Alerts")) && !location.pathname.startsWith(createPageUrl("AlertSettings"))
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Bell className="w-5 h-5 flex-shrink-0" />
                        <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Notifications</span>
                        {unreadCount > 0 && !isSidebarCollapsed && (
                          <Badge className="ml-auto bg-red-500 text-white">{unreadCount}</Badge>
                        )}
                      </Link>

                    {isManager && (
                      <Link
                        to={createNavUrl("AlertSettings")}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                          location.pathname.startsWith(createPageUrl("AlertSettings"))
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        <BellRing className="w-5 h-5 flex-shrink-0" />
                        <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Alert Settings</span>
                      </Link>
                    )}

                      <Link
                        to={createNavUrl("MediaLibrary")}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                          location.pathname === createPageUrl("MediaLibrary")
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Library className="w-5 h-5 flex-shrink-0" />
                        <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Media Library</span>
                      </Link>

                      <Link
                        to={createNavUrl("Support")}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                          location.pathname.startsWith(createPageUrl("Support"))
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        <HeadphonesIcon className="w-5 h-5 flex-shrink-0" />
                        <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Support</span>
                      </Link>

                      {isManager && (
                        <Link
                          to={createNavUrl("Analytics")}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                            location.pathname === createPageUrl("Analytics")
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                        <BarChart3 className="w-5 h-5 flex-shrink-0" />
                        <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Analytics</span>
                      </Link>
                    )}

                    {isManager && (
                      <Link
                        to={createNavUrl("Bots")}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                          location.pathname === createPageUrl("Bots")
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        <ZapIcon className="w-5 h-5 flex-shrink-0" />
                        <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Bots</span>
                      </Link>
                    )}
                  </div>
                </div>

                {isManager && (
                  <div className="px-4 py-2">
                    <p className={`text-slate-400 font-medium text-xs uppercase tracking-wider px-2 py-2 flex items-center gap-2 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                      <Building className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className={isSidebarCollapsed ? 'hidden' : ''}>Management</span>
                    </p>
                    <div className="space-y-1">
                      <Link
                        to={createNavUrl("LocationManagement")}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                          location.pathname === createPageUrl("LocationManagement")
                            ? 'bg-blue-500 text-white shadow-lg'
                            : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        <MapPin className="w-5 h-5 flex-shrink-0" />
                        <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Locations</span>
                      </Link>
                    </div>
                  </div>
                )}

                {isManager && (
                  <div className="px-4 py-2">
                    <p className={`text-slate-400 font-medium text-xs uppercase tracking-wider px-2 py-2 flex items-center gap-2 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
                      <Sparkles className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span className={isSidebarCollapsed ? 'hidden' : ''}>Workflow Add-On</span>
                    </p>
                    <div className="space-y-1">
                      <Link
                        to={workflowAddonEnabled ? createNavUrl("Employees") : '#'}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                          location.pathname === createPageUrl("Employees") && workflowAddonEnabled
                            ? 'bg-blue-500 text-white shadow-lg'
                            : workflowAddonEnabled
                              ? 'hover:bg-slate-800 text-slate-300 hover:text-white'
                              : 'text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Briefcase className="w-5 h-5 flex-shrink-0" />
                        <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Employees</span>
                      </Link>
                      <Link
                        to={workflowAddonEnabled ? createNavUrl("Workflows") : '#'}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                          location.pathname === createPageUrl("Workflows") && workflowAddonEnabled
                            ? 'bg-blue-500 text-white shadow-lg'
                            : workflowAddonEnabled
                              ? 'hover:bg-slate-800 text-slate-300 hover:text-white'
                              : 'text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <ClipboardCheck className="w-5 h-5 flex-shrink-0" />
                        <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Workflows</span>
                      </Link>

                      <Link
                        to={workflowAddonEnabled ? createNavUrl("Tasks") : '#'}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${isSidebarCollapsed ? 'justify-center' : ''} ${
                          (location.pathname === createPageUrl("Tasks") && location.pathname !== createPageUrl("AITaskMonitor")) && workflowAddonEnabled
                            ? 'bg-blue-500 text-white shadow-lg'
                            : workflowAddonEnabled
                              ? 'hover:bg-slate-800 text-slate-300 hover:text-white'
                              : 'text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Shield className="w-5 h-5 flex-shrink-0" />
                        <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>Tasks</span>
                      </Link>

                      {isManager && workflowAddonEnabled && (
                        <Link
                          to={createNavUrl("AITaskMonitor")}
                          className={`flex items-center gap-3 pl-6 pr-3 py-2 rounded-lg transition-all duration-200 ml-3 border-l border-slate-700 text-sm ${isSidebarCollapsed ? 'justify-center pl-3 ml-0 border-l-0' : ''} ${
                            location.pathname === createPageUrl("AITaskMonitor")
                              ? 'bg-blue-500 text-white shadow-lg'
                              : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                          }`}
                        >
                          <Sparkles className="w-4 h-4 flex-shrink-0" />
                          <span className={`font-medium ${isSidebarCollapsed ? 'hidden' : ''}`}>AI Monitor</span>
                        </Link>
                      )}
                    </div>
                    {!workflowAddonEnabled && (
                      <div className={`px-2 py-2 ${isSidebarCollapsed ? 'hidden' : ''}`}>
                        <UpgradePrompt />
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Profile Section - Fixed at Bottom */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex-shrink-0">
              <div className="hidden md:flex items-center justify-center">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                  className="text-slate-400 hover:text-white hover:bg-slate-700"
                >
                  <ChevronLeft className={`transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
                </Button>
              </div>

              <div className={`mt-4 ${isSidebarCollapsed ? 'hidden' : ''}`}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center gap-3 p-2 bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-sm font-medium">
                          {user?.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {user?.full_name || 'User'}
                        </p>
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400 capitalize">
                              {userRole?.role_display_name || 'User'}
                            </span>
                        </div>
                      </div>
                      <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to={createNavUrl("ProfileSettings")}>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    {(!isPlatformAdmin || isViewingAsOrg) && organization && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to={createNavUrl("Settings")}>
                            <Building className="w-4 h-4 mr-2" />
                            {organization.name}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={createNavUrl("BillingPlans")}>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Billing & Plans
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <Activity className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
          </div>
        </div>

        {/* Main Content - Offset by sidebar width */}
        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
          {/* Desktop Header */}
          <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 items-center justify-between gap-4 hidden md:flex">
            <div className="flex items-center gap-4 flex-shrink-0">
              {/* This button is only shown on mobile, but moved outside the desktop header to be handled by the mobile double header */}
              {/* <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="w-6 h-6" />
              </Button> */}
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {currentPageName || 'Dashboard'}
                </h1>
                {(!isPlatformAdmin || isViewingAsOrg) && organization && (
                  <p className="text-sm text-slate-600">
                    {organization.name} - {organization.industry_type}
                  </p>
                )}
                {isPlatformAdmin && !isViewingAsOrg &&(
                  <p className="text-sm text-slate-600">Platform Administration</p>
                )}
              </div>
            </div>

            <div className="flex-1 flex justify-center max-w-xl">
              <GlobalSearch />
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              {(!isPlatformAdmin || isViewingAsOrg) && organization && (
                <LocationSwitcher
                  currentLocationId={viewingLocationId}
                  onLocationChange={setViewingLocationId}
                  organization={organization}
                  compact={true}
                />
              )}

              {isPlatformAdmin && (
                <OrganizationSwitcher initialOrgId={viewingOrgId} />
              )}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setAIAssistantOpen(prev => !prev)}
                className="relative"
              >
                <Bot className="w-5 h-5" />
              </Button>

              <AlertsDropdown
                notifications={notifications}
                unreadCount={unreadCount}
                onMarkAsRead={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
              />
            </div>
          </header>

          {/* Mobile Double Header */}
          <div className="md:hidden">
            {/* Top Mobile Header - Controls */}
            <div className="bg-white border-b border-slate-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="flex-shrink-0"
                >
                  <Menu className="w-6 h-6" />
                </Button>

                <div className="flex items-center gap-2 flex-1 justify-end max-w-[calc(100%-3rem)]">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMobileSearchOpen(true)}
                    className="flex-shrink-0"
                  >
                    <Search className="w-5 h-5" />
                  </Button>

                  {(!isPlatformAdmin || isViewingAsOrg) && organization && (
                    <div className="max-w-[120px]">
                      <LocationSwitcher
                        currentLocationId={viewingLocationId}
                        onLocationChange={setViewingLocationId}
                        organization={organization}
                        compact={true}
                      />
                    </div>
                  )}

                  {isPlatformAdmin && (
                    <div className="max-w-[120px]">
                      <OrganizationSwitcher initialOrgId={viewingOrgId} />
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setAIAssistantOpen(prev => !prev)}
                    className="flex-shrink-0"
                  >
                    <Bot className="w-5 h-5" />
                  </Button>

                  <AlertsDropdown
                    notifications={notifications}
                    unreadCount={unreadCount}
                    onMarkAsRead={(id) => setNotifications(prev => prev.filter(n => n.id !== id))}
                  />
                </div>
              </div>
            </div>

            {/* Bottom Mobile Header - Page Title and User */}
            <div className="bg-white border-b border-slate-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl font-bold text-slate-900 truncate">
                    {currentPageName || 'Dashboard'}
                  </h1>
                  {(!isPlatformAdmin || isViewingAsOrg) && organization && (
                    <p className="text-sm text-slate-600 truncate">
                      {organization.name}
                    </p>
                  )}
                  {isPlatformAdmin && !isViewingAsOrg &&(
                    <p className="text-sm text-slate-600">Platform Admin</p>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {user?.full_name?.charAt(0) || 'U'}
                        </span>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuItem asChild>
                      <Link to={createNavUrl("ProfileSettings")}>
                        <UserCheck className="w-4 h-4 mr-2" />
                        Profile Settings
                      </Link>
                    </DropdownMenuItem>
                    {(!isPlatformAdmin || isViewingAsOrg) && organization && (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to={createNavUrl("Settings")}>
                            <Building className="w-4 h-4 mr-2" />
                            {organization.name}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={createNavUrl("BillingPlans")}>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Billing & Plans
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <Activity className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Mobile Search Overlay */}
            <AnimatePresence>
              {isMobileSearchOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="absolute top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 p-4 shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <GlobalSearch />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMobileSearchOpen(false)}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <main className="flex-1 p-4 sm:p-6 overflow-y-auto max-w-full">
            <div className="max-w-full">
              {React.Children.map(children, child =>
                React.isValidElement(child)
                  ? React.cloneElement(child, { user, userRole, effectiveRole })
                  : child
              )}
            </div>
          </main>

          {/* Add StreamManager service */}
          {user && organization && (
            <StreamManager />
          )}

          <Toaster position="top-right" richColors />
        </div>

        {currentPageName !== 'Welcome' && (
          <div className="fixed bottom-6 right-6 z-50">
          </div>
        )}

        {isAIAssistantOpen && currentPageName !== 'Welcome' && (
          <AIAssistant
            onClose={() => setAIAssistantOpen(false)}
            user={user}
            organization={organization}
            userRole={userRole}
          />
        )}
      </div>
    </LocationProvider>
  );
}

// Single Auth Check Component with landing page first
function LayoutWrapper({ children, currentPageName }) {
  const { user, userRole, refreshUser, isInitialized } = useUser();
  const [showLanding, setShowLanding] = useState(true);
  const [authState, setAuthState] = useState({
    isLoading: false,
    hasCheckedAuth: false,
    isNewUser: false,
    needsWelcome: false,
    accountCreated: false
  });
  const hasPerformedAuthCheck = useRef(false);

  // Ensure NEXT_PUBLIC_FUNCTIONS_BASE is available globally for frontend components
  useEffect(() => {
    if (typeof window !== 'undefined' && !window.NEXT_PUBLIC_FUNCTIONS_BASE) {
      window.NEXT_PUBLIC_FUNCTIONS_BASE = 'https://app.awarecam.com';
    }
  }, []);

  const performAuthCheck = useCallback(async () => {
    if (hasPerformedAuthCheck.current) return;
    hasPerformedAuthCheck.current = true;

    setAuthState(prev => ({ ...prev, isLoading: true }));
    setShowLanding(false);

    try {
      const refreshedData = await refreshUser();
      const currentUser = refreshedData.user;
      const currentRole = refreshedData.role;

      // At this point, user should have both user data and role
      const needsWelcome = currentUser && currentRole &&
        (!currentRole.is_platform_role && (!currentUser.organization_id || !currentUser.onboarding_completed));

      setAuthState({
        isLoading: false,
        hasCheckedAuth: true,
        isNewUser: false, // If we reached here, user exists
        needsWelcome,
        accountCreated: currentUser && currentRole // true if user/role exist
      });

    } catch (error) {
      console.error('Auth check failed:', error);

      // Only redirect to login if it's a real auth failure, not a rate limit
      if (!error.message.includes('429') && !error.message.includes('Rate limit')) {
        setShowLanding(true);
        setAuthState({
          isLoading: false,
          hasCheckedAuth: true,
          isNewUser: true, // Indicate that no authenticated user was found
          needsWelcome: false,
          accountCreated: false
        });
        // Reset hasPerformedAuthCheck only on actual failures that lead back to landing
        hasPerformedAuthCheck.current = false;
        return;
      }

      // For rate limits, show landing page but don't mark as "new user" for direct login.
      // User might be logged in, just rate limited on refresh.
      setShowLanding(true);
      setAuthState(prev => ({ ...prev, isLoading: false, hasCheckedAuth: true }));
    }
  }, [refreshUser, setAuthState, setShowLanding]); // setAuthState and setShowLanding are stable, but included for clarity. refreshUser is critical.

  // Check if we should show landing page or check auth based on UserProvider's initialization
  useEffect(() => {
    const checkInitialState = async () => {
      // Wait for UserProvider to finish its initial user fetch
      if (!isInitialized) {
        return;
      }

      // If user context is already initialized and we have a user, skip landing
      if (user && userRole) { // No need for isInitialized here as it's checked above.
        setShowLanding(false);

        // Determine if user needs onboarding
        const needsWelcome = !userRole.is_platform_role &&
                           (!user.organization_id || !user.onboarding_completed);

        setAuthState({
          isLoading: false,
          hasCheckedAuth: true,
          isNewUser: false,
          needsWelcome,
          accountCreated: true
        });
      } else {
        // No user found, show landing page
        setShowLanding(true);
        setAuthState({
          isLoading: false,
          hasCheckedAuth: true,
          isNewUser: false, // Not a new user until they try to sign up
          needsWelcome: false,
          accountCreated: false
        });
      }
    };

    checkInitialState();
  }, [isInitialized, user, userRole]); // Depend on UserProvider's initialization and user state

  // Auth check after user clicks sign in (from URL params or direct access)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasAuthCallback = urlParams.has('code') || urlParams.has('state') || window.location.hash.includes('access_token');

    // If there's an auth callback or user manually navigates to a protected route, check auth
    if (hasAuthCallback || (currentPageName && currentPageName !== 'LandingPage')) {
      performAuthCheck();
    }
  }, [currentPageName, performAuthCheck]); // Simplified dependencies

  // Show landing page for unauthenticated users when not loading
  if (showLanding && !authState.isLoading) {
    const LandingPage = lazy(() => import('./pages/LandingPage')); // Moved lazy import here
    return (
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      }>
        <LandingPage />
      </Suspense>
    );
  }

  // Show loading spinner during auth check
  if (authState.isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">
            {authState.accountCreated ? 'Setting up your account...' : 'Authenticating...'}
          </p>
        </div>
      </div>
    );
  }

  // Handle unauthenticated users (should only be hit if performAuthCheck fails to reset showLanding)
  if (authState.isNewUser) {
    setShowLanding(true); // Forces showing landing page
    // Returning null here to avoid rendering anything further while the state change takes effect.
    return null;
  }

  // Show welcome page for new users who need onboarding
  if (authState.needsWelcome) {
    return <WelcomePage user={user} userRole={userRole} />;
  }

  // Render main layout for authenticated users
  return <LayoutContent children={children} currentPageName={currentPageName} />;
}

export default function Layout({ children, currentPageName }) {
  return (
    <UserProvider>
      <ModalProvider>
        <LayoutWrapper children={children} currentPageName={currentPageName} />
      </ModalProvider>
    </UserProvider>
  );
}
