import { Entity } from '@/lib/entity';
import api from '@/lib/api';

class BaseEntityClass extends Entity {
  static client = api;
}

class OrganizationClass extends BaseEntityClass {
  static endpoint = 'organizations';
}

class CameraClass extends BaseEntityClass {
  static endpoint = 'cameras';
}

class EventClass extends BaseEntityClass {
  static endpoint = 'events';
}

class AIAgentClass extends BaseEntityClass {
  static endpoint = 'ai-agents';
}

class AIConversationClass extends BaseEntityClass {
  static endpoint = 'ai-conversations';
}

class WorkflowTemplateClass extends BaseEntityClass {
  static endpoint = 'workflow-templates';
}

class EmployeeClass extends BaseEntityClass {
  static endpoint = 'employees';
}

class WorkflowClass extends BaseEntityClass {
  static endpoint = 'workflows';
}

class TaskClass extends BaseEntityClass {
  static endpoint = 'tasks';
}

export const BaseEntity = BaseEntityClass;
export const Organization = OrganizationClass;
export const Camera = CameraClass;
export const Event = EventClass;
export const AIAgent = AIAgentClass;
export const AIConversation = AIConversationClass;
export const WorkflowTemplate = WorkflowTemplateClass;
export const Employee = EmployeeClass;
export const Workflow = WorkflowClass;
export const Task = TaskClass;

class SubscriptionPlanClass extends BaseEntityClass {
  static endpoint = 'subscription-plans';
}

class AddOnProductClass extends BaseEntityClass {
  static endpoint = 'add-on-products';
}

class CustomerSubscriptionClass extends BaseEntityClass {
  static endpoint = 'customer-subscriptions';
}

class SubscriptionItemClass extends BaseEntityClass {
  static endpoint = 'subscription-items';
}

class InvoiceClass extends BaseEntityClass {
  static endpoint = 'invoices';
}

class InvoiceLineItemClass extends BaseEntityClass {
  static endpoint = 'invoice-line-items';
}

class PaymentClass extends BaseEntityClass {
  static endpoint = 'payments';
}

class UsageRecordClass extends BaseEntityClass {
  static endpoint = 'usage-records';
}

class CreditNoteClass extends BaseEntityClass {
  static endpoint = 'credit-notes';
}

class BillingEventClass extends BaseEntityClass {
  static endpoint = 'billing-events';
}

class CustomerPaymentMethodClass extends BaseEntityClass {
  static endpoint = 'customer-payment-methods';
}

class RoleClass extends BaseEntityClass {
  static endpoint = 'roles';
}

class SupportTicketClass extends BaseEntityClass {
  static endpoint = 'support-tickets';
}

class TicketMessageClass extends BaseEntityClass {
  static endpoint = 'ticket-messages';
}

class KnowledgeBaseArticleClass extends BaseEntityClass {
  static endpoint = 'knowledge-base-articles';
}

class CameraZoneClass extends BaseEntityClass {
  static endpoint = 'camera-zones';
}

class DiscoveredObjectClass extends BaseEntityClass {
  static endpoint = 'discovered-objects';
}

class DemoFeedClass extends BaseEntityClass {
  static endpoint = 'demo-feeds';
}

class WorkflowTemplateCategoryClass extends BaseEntityClass {
  static endpoint = 'workflow-template-categories';
}

class TemplateSuccessStoryClass extends BaseEntityClass {
  static endpoint = 'template-success-stories';
}

class EmployeeRoleClass extends BaseEntityClass {
  static endpoint = 'employee-roles';
}

class EmployeeAssignmentClass extends BaseEntityClass {
  static endpoint = 'employee-assignments';
}

class TeamImportSessionClass extends BaseEntityClass {
  static endpoint = 'team-import-sessions';
}

export const SubscriptionPlan = SubscriptionPlanClass;
export const AddOnProduct = AddOnProductClass;
export const CustomerSubscription = CustomerSubscriptionClass;
export const SubscriptionItem = SubscriptionItemClass;
export const Invoice = InvoiceClass;
export const InvoiceLineItem = InvoiceLineItemClass;
export const Payment = PaymentClass;
export const UsageRecord = UsageRecordClass;
export const CreditNote = CreditNoteClass;
export const BillingEvent = BillingEventClass;
export const CustomerPaymentMethod = CustomerPaymentMethodClass;
export const Role = RoleClass;
export const SupportTicket = SupportTicketClass;
export const TicketMessage = TicketMessageClass;
export const KnowledgeBaseArticle = KnowledgeBaseArticleClass;
export const CameraZone = CameraZoneClass;
export const DiscoveredObject = DiscoveredObjectClass;
export const DemoFeed = DemoFeedClass;
export const WorkflowTemplateCategory = WorkflowTemplateCategoryClass;
export const TemplateSuccessStory = TemplateSuccessStoryClass;
export const EmployeeRole = EmployeeRoleClass;
export const EmployeeAssignment = EmployeeAssignmentClass;
export const TeamImportSession = TeamImportSessionClass;

import { Entity } from './entity';

class CameraClass extends Entity {
    static entity = 'camera';
}

class StreamCallbackLogClass extends Entity {
    static entity = 'streamCallbackLog';
}

class AgentAlertChannelClass extends Entity {
    static entity = 'agentAlertChannel';
}

class AlertWorkflowClass extends Entity {
    static entity = 'alertWorkflow';
}

export const CustomAgentBuilderSession = CustomAgentBuilderSessionClass;
export const AgentAlertChannel = AgentAlertChannelClass;
export const AlertWorkflow = AlertWorkflowClass;

class AITaskValidationClass extends Entity {
    static entity = 'aiTaskValidation';
}

class AITaskMonitoringSessionClass extends Entity {
    static entity = 'aiTaskMonitoringSession';
}

class TaskValidationRuleClass extends Entity {
    static entity = 'taskValidationRule';
}

class MediaLibraryItemClass extends Entity {
    static entity = 'mediaLibraryItem';
}

class AlertNotificationClass extends Entity {
    static entity = 'alertNotification';
}

class UserNotificationSettingsClass extends Entity {
    static entity = 'userNotificationSettings';
}

class UserNotificationPreferencesClass extends Entity {
    static entity = 'userNotificationPreferences';
}

class EventNoteClass extends Entity {
    static entity = 'eventNote';
}

class PlatformAnomalyClass extends Entity {
    static entity = 'platformAnomaly';
}

class PlatformIntegrationClass extends Entity {
    static entity = 'platformIntegration';
}

class NotificationProviderClass extends Entity {
    static entity = 'notificationProvider';
}

class WorkflowExecutionClass extends Entity {
    static entity = 'workflowExecution';
}

class LocationClass extends Entity {
    static entity = 'location';
}

class EmployeeCertificationClass extends Entity {
    static entity = 'employeeCertification';
}

class EmployeeShiftClass extends Entity {
    static entity = 'employeeShift';
}

class WorkflowAssignmentClass extends Entity {
    static entity = 'workflowAssignment';
}

class AssignmentOccurrenceClass extends Entity {
    static entity = 'assignmentOccurrence';
}

class TaskApprovalClass extends Entity {
    static entity = 'taskApproval';
}

class TaskExceptionClass extends Entity {
    static entity = 'taskException';
}

class StreamCallbackLogClass extends Entity {
    static entity = 'streamCallbackLog';
}

export const AITaskValidation = AITaskValidationClass;
export const AITaskMonitoringSession = AITaskMonitoringSessionClass;
export const TaskValidationRule = TaskValidationRuleClass;
export const MediaLibraryItem = MediaLibraryItemClass;
export const AlertNotification = AlertNotificationClass;
export const UserNotificationSettings = UserNotificationSettingsClass;
export const UserNotificationPreferences = UserNotificationPreferencesClass;
export const EventNote = EventNoteClass;
export const PlatformAnomaly = PlatformAnomalyClass;
export const PlatformIntegration = PlatformIntegrationClass;
export const NotificationProvider = NotificationProviderClass;
export const WorkflowExecution = WorkflowExecutionClass;
export const Location = LocationClass;
export const EmployeeCertification = EmployeeCertificationClass;
export const EmployeeShift = EmployeeShiftClass;
export const WorkflowAssignment = WorkflowAssignmentClass;
export const AssignmentOccurrence = AssignmentOccurrenceClass;
export const TaskApproval = TaskApprovalClass;
export const TaskException = TaskExceptionClass;
export const StreamCallbackLog = StreamCallbackLogClass;



// auth sdk:
class UserClass extends Entity {
    static entity = 'user';
    static endpoint = 'users';

    static async me() {
        const response = await this.client.get('/users/me');
        return response.data;
    }

    static async login() {
        // Redirect to Google OAuth or handle login
        window.location.href = `${this.client.defaults.baseURL}/auth/google`;
    }

    static async logout() {
        try {
            await this.client.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        }
        // Clear local storage
        localStorage.removeItem('auth-storage');
        // Redirect to landing page
        window.location.href = '/';
    }

    static async getCurrentUser() {
        try {
            const response = await this.client.get('/users/me');
            return response.data;
        } catch (error) {
            console.error('Failed to get current user:', error);
            return null;
        }
    }

    static async updateProfile(data) {
        const response = await this.client.patch('/users/profile', data);
        return response.data;
    }

    static async changePassword(currentPassword, newPassword) {
        const response = await this.client.post('/users/change-password', {
            currentPassword,
            newPassword,
        });
        return response.data;
    }
}
export const User = UserClass;