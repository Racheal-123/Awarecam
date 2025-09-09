import { Entity } from '@/lib/entity';
import api from '@/lib/api';

// Base entity class
class BaseEntityClass extends Entity {
  static client = api;
}

// Alert Notification
class AlertNotificationClass extends BaseEntityClass {
  static endpoint = 'alert-notifications';

  static async markAsRead(id) {
    const response = await this.client.patch(`/${this.endpoint}/${id}/read`);
    return response.data;
  }

  static async markAllAsRead() {
    const response = await this.client.patch(`/${this.endpoint}/read-all`);
    return response.data;
  }

  static async markAllAsReadForType(type) {
    const response = await this.client.patch(`/${this.endpoint}/read-type/${type}`);
    return response.data;
  }

  static async getUnreadCount() {
    const response = await this.client.get(`/${this.endpoint}/unread-count`);
    return response.data.count;
  }
}

AlertNotificationClass.defaultFields = {
  id: '',
  userId: '',
  organizationId: '',
  locationId: '',
  alertType: '',
  message: '',
  isRead: false,
  metadata: {},
  createdBy: '',
  createdDate: '',
  updatedBy: '',
  updatedDate: '',
};

// User
class UserClass extends BaseEntityClass {
  static endpoint = 'users';

  static async getCurrentUser() {
    const response = await this.client.get('/users/me');
    return response.data;
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

// Organization
class OrganizationClass extends BaseEntityClass {
  static endpoint = 'organizations';
}

// Camera
class CameraClass extends BaseEntityClass {
  static endpoint = 'cameras';
}

// Event
class EventClass extends BaseEntityClass {
  static endpoint = 'events';
}

// AIAgent
class AIAgentClass extends BaseEntityClass {
  static endpoint = 'ai-agents';
}

// AIConversation
class AIConversationClass extends BaseEntityClass {
  static endpoint = 'ai-conversations';
}

// WorkflowTemplate
class WorkflowTemplateClass extends BaseEntityClass {
  static endpoint = 'workflow-templates';
}

// Employee
class EmployeeClass extends BaseEntityClass {
  static endpoint = 'employees';
}

// Workflow
class WorkflowClass extends BaseEntityClass {
  static endpoint = 'workflows';
}

// Task
class TaskClass extends BaseEntityClass {
  static endpoint = 'tasks';
}

// Export all entities
export const AlertNotification = AlertNotificationClass;
export const User = UserClass;
export const Organization = OrganizationClass;
export const Camera = CameraClass;
export const Event = EventClass;
export const AIAgent = AIAgentClass;
export const AIConversation = AIConversationClass;
export const WorkflowTemplate = WorkflowTemplateClass;
export const Employee = EmployeeClass;
export const Workflow = WorkflowClass;
export const Task = TaskClass;
