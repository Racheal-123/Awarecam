export const createPageUrl = (pageName) => {
  const pageRoutes = {
    'LandingPage': '/',
    'Welcome': '/welcome',
    'Dashboard': '/dashboard',
    'Cameras': '/cameras',
    'Live': '/live',
    'Events': '/events',
    'Alerts': '/alerts',
    'AlertSettings': '/alert-settings',
    'MediaLibrary': '/media',
    'Support': '/support',
    'Analytics': '/analytics',
    'Bots': '/bots',
    'LocationManagement': '/locations',
    'Employees': '/employees',
    'Workflows': '/workflows',
    'Tasks': '/tasks',
    'AITaskMonitor': '/ai-task-monitor',
    'Settings': '/settings',
    'BillingPlans': '/billing',
    'ProfileSettings': '/profile',
    'AdminDashboard': '/admin',
    'AdminAnalytics': '/admin/analytics',
    'AdminOrganizationManagement': '/admin/organizations',
    'AdminOrganizationDetails': '/admin/organizations/details',
    'AdminUsers': '/admin/users',
    'AdminAIAssistant': '/admin/ai-assistant',
    'AdminBots': '/admin/bots',
    'AdminIntegrations': '/admin/integrations',
    'AdminWorkflows': '/admin/workflows',
    'AdminRoles': '/admin/roles',
    'AdminOnboarding': '/admin/onboarding',
    'AdminLibrary': '/admin/library',
    'AdminBilling': '/admin/billing',
    'AdminSupport': '/admin/support',
    'AdminPermissions': '/admin/permissions',
    'AdminAlertMonitoring': '/admin/alert-monitoring'
  };

  const route = pageRoutes[pageName];
  if (!route) {
    console.warn(`No route defined for page: ${pageName}`);
    return '/';
  }
  return route;
};
