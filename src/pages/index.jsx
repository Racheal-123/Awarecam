import Layout from "@/pages/Layout.jsx";

import Events from "@/pages/Events";

import Analytics from "@/pages/Analytics";

import Users from "@/pages/Users";

import Settings from "@/pages/Settings";

import Dashboard from "@/pages/Dashboard";

import Cameras from "@/pages/Cameras";

import Welcome from "@/pages/Welcome";

import Employees from "@/pages/Employees";

import Workflows from "@/pages/Workflows";

import Tasks from "@/pages/Tasks";

import AdminDashboard from "@/pages/AdminDashboard";

import AdminUsers from "@/pages/AdminUsers";

import AdminBilling from "@/pages/AdminBilling";

import Live from "@/pages/Live";

import AdminSupport from "@/pages/AdminSupport";

import AdminOrganizationManagement from "@/pages/AdminOrganizationManagement";

import ProfileSettings from "@/pages/ProfileSettings";

import BillingPlans from "@/pages/BillingPlans";

import AdminAIAssistant from "@/pages/AdminAIAssistant";

import AdminPermissions from "@/pages/AdminPermissions";

import AdminOrganizationDetails from "@/pages/AdminOrganizationDetails";

import Support from "@/pages/Support";

import TicketDetails from "@/pages/TicketDetails";

import AdminTicketDetails from "@/pages/AdminTicketDetails";

import KnowledgeBase from "@/pages/KnowledgeBase";

import AdminWorkflows from "@/pages/AdminWorkflows";

import AdminRoles from "@/pages/AdminRoles";

import AdminOnboarding from "@/pages/AdminOnboarding";

import AITaskMonitor from "@/pages/AITaskMonitor";

import AdminLibrary from "@/pages/AdminLibrary";

import MediaLibrary from "@/pages/MediaLibrary";

import Alerts from "@/pages/Alerts";

import AdminAlertMonitoring from "@/pages/AdminAlertMonitoring";

import AlertSettings from "@/pages/AlertSettings";

import Bots from "@/pages/Bots";

import AdminBots from "@/pages/AdminBots";

import AdminAnalytics from "@/pages/AdminAnalytics";

import AdminIntegrations from "@/pages/AdminIntegrations";

import LocationManagement from "@/pages/LocationManagement";

import CameraStreaming from "@/pages/CameraStreaming";

import LandingPage from "@/pages/LandingPage";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Events: Events,
    
    Analytics: Analytics,
    
    Users: Users,
    
    Settings: Settings,
    
    Dashboard: Dashboard,
    
    Cameras: Cameras,
    
    Welcome: Welcome,
    
    Employees: Employees,
    
    Workflows: Workflows,
    
    Tasks: Tasks,
    
    AdminDashboard: AdminDashboard,
    
    AdminUsers: AdminUsers,
    
    AdminBilling: AdminBilling,
    
    Live: Live,
    
    AdminSupport: AdminSupport,
    
    AdminOrganizationManagement: AdminOrganizationManagement,
    
    ProfileSettings: ProfileSettings,
    
    BillingPlans: BillingPlans,
    
    AdminAIAssistant: AdminAIAssistant,
    
    AdminPermissions: AdminPermissions,
    
    AdminOrganizationDetails: AdminOrganizationDetails,
    
    Support: Support,
    
    TicketDetails: TicketDetails,
    
    AdminTicketDetails: AdminTicketDetails,
    
    KnowledgeBase: KnowledgeBase,
    
    AdminWorkflows: AdminWorkflows,
    
    AdminRoles: AdminRoles,
    
    AdminOnboarding: AdminOnboarding,
    
    AITaskMonitor: AITaskMonitor,
    
    AdminLibrary: AdminLibrary,
    
    MediaLibrary: MediaLibrary,
    
    Alerts: Alerts,
    
    AdminAlertMonitoring: AdminAlertMonitoring,
    
    AlertSettings: AlertSettings,
    
    Bots: Bots,
    
    AdminBots: AdminBots,
    
    AdminAnalytics: AdminAnalytics,
    
    AdminIntegrations: AdminIntegrations,
    
    LocationManagement: LocationManagement,
    
    CameraStreaming: CameraStreaming,
    
    LandingPage: LandingPage,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Events />} />
                
                
                <Route path="/Events" element={<Events />} />
                
                <Route path="/Analytics" element={<Analytics />} />
                
                <Route path="/Users" element={<Users />} />
                
                <Route path="/Settings" element={<Settings />} />
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/Cameras" element={<Cameras />} />
                
                <Route path="/Welcome" element={<Welcome />} />
                
                <Route path="/Employees" element={<Employees />} />
                
                <Route path="/Workflows" element={<Workflows />} />
                
                <Route path="/Tasks" element={<Tasks />} />
                
                <Route path="/AdminDashboard" element={<AdminDashboard />} />
                
                <Route path="/AdminUsers" element={<AdminUsers />} />
                
                <Route path="/AdminBilling" element={<AdminBilling />} />
                
                <Route path="/Live" element={<Live />} />
                
                <Route path="/AdminSupport" element={<AdminSupport />} />
                
                <Route path="/AdminOrganizationManagement" element={<AdminOrganizationManagement />} />
                
                <Route path="/ProfileSettings" element={<ProfileSettings />} />
                
                <Route path="/BillingPlans" element={<BillingPlans />} />
                
                <Route path="/AdminAIAssistant" element={<AdminAIAssistant />} />
                
                <Route path="/AdminPermissions" element={<AdminPermissions />} />
                
                <Route path="/AdminOrganizationDetails" element={<AdminOrganizationDetails />} />
                
                <Route path="/Support" element={<Support />} />
                
                <Route path="/TicketDetails" element={<TicketDetails />} />
                
                <Route path="/AdminTicketDetails" element={<AdminTicketDetails />} />
                
                <Route path="/KnowledgeBase" element={<KnowledgeBase />} />
                
                <Route path="/AdminWorkflows" element={<AdminWorkflows />} />
                
                <Route path="/AdminRoles" element={<AdminRoles />} />
                
                <Route path="/AdminOnboarding" element={<AdminOnboarding />} />
                
                <Route path="/AITaskMonitor" element={<AITaskMonitor />} />
                
                <Route path="/AdminLibrary" element={<AdminLibrary />} />
                
                <Route path="/MediaLibrary" element={<MediaLibrary />} />
                
                <Route path="/Alerts" element={<Alerts />} />
                
                <Route path="/AdminAlertMonitoring" element={<AdminAlertMonitoring />} />
                
                <Route path="/AlertSettings" element={<AlertSettings />} />
                
                <Route path="/Bots" element={<Bots />} />
                
                <Route path="/AdminBots" element={<AdminBots />} />
                
                <Route path="/AdminAnalytics" element={<AdminAnalytics />} />
                
                <Route path="/AdminIntegrations" element={<AdminIntegrations />} />
                
                <Route path="/LocationManagement" element={<LocationManagement />} />
                
                <Route path="/CameraStreaming" element={<CameraStreaming />} />
                
                <Route path="/LandingPage" element={<LandingPage />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}