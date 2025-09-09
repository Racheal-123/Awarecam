import { AlertNotification } from '@/api/entities';
import { User } from '@/api/entities';
import { toast } from 'sonner';

const validateRequired = (params, requiredFields) => {
  for (const field of requiredFields) {
    if (!params[field]) {
      throw new Error(`${field} is required`);
    }
  }
};

const getCurrentUserContext = async () => {
  try {
    const user = await User.me();
    if (!user.organization_id) {
      throw new Error('User must belong to an organization');
    }
    return { user, organization_id: user.organization_id };
  } catch (error) {
    console.error('Failed to get user context:', error);
    throw new Error('Authentication required');
  }
};

export const AlertNotificationService = {
  async listByCamera({ organization_id, camera_id, since, limit = 50 }) {
    try {
      validateRequired({ camera_id }, ['camera_id']);
      
      // Get organization context if not provided
      let finalOrgId = organization_id;
      if (!finalOrgId) {
        const context = await getCurrentUserContext();
        finalOrgId = context.organization_id;
      }

      const filter = {
        organization_id: finalOrgId
      };

      // Add camera filter - this might be through event_id or a direct camera_id field
      // Adjust based on your AlertNotification entity structure
      if (camera_id) {
        filter.camera_id = camera_id;
      }

      // Add time filter
      if (since) {
        filter.created_date_gte = since;
      }

      const notifications = await AlertNotification.filter(
        filter,
        '-created_date',
        limit
      );
      
      return notifications;
      
    } catch (error) {
      console.error('AlertNotificationService.listByCamera error:', error);
      
      if (error.message.includes('required')) {
        toast.error(error.message);
      } else if (error.message.includes('Authentication')) {
        toast.error('Please log in to view notifications');
      } else {
        toast.error("Couldn't load notifications for this camera.");
      }
      
      throw error;
    }
  },

  async listByUser({ organization_id, user_id, is_read, limit = 50 }) {
    try {
      // Get organization context if not provided
      let finalOrgId = organization_id;
      let finalUserId = user_id;
      
      if (!finalOrgId || !finalUserId) {
        const context = await getCurrentUserContext();
        finalOrgId = finalOrgId || context.organization_id;
        finalUserId = finalUserId || context.user.id;
      }

      const filter = {
        organization_id: finalOrgId,
        user_id: finalUserId
      };

      // Add read status filter if specified
      if (is_read !== undefined) {
        filter.is_read = is_read;
      }

      const notifications = await AlertNotification.filter(
        filter,
        '-created_date',
        limit
      );
      
      return notifications;
      
    } catch (error) {
      console.error('AlertNotificationService.listByUser error:', error);
      
      if (error.message.includes('Authentication')) {
        toast.error('Please log in to view notifications');
      } else {
        toast.error("Couldn't load your notifications.");
      }
      
      throw error;
    }
  },

  async acknowledge({ organization_id, alert_id, acknowledged_by }) {
    try {
      validateRequired({ alert_id }, ['alert_id']);
      
      // Get user context if not provided
      let finalOrgId = organization_id;
      let finalAcknowledgedBy = acknowledged_by;
      
      if (!finalOrgId || !finalAcknowledgedBy) {
        const context = await getCurrentUserContext();
        finalOrgId = finalOrgId || context.organization_id;
        finalAcknowledgedBy = finalAcknowledgedBy || context.user.email;
      }

      const updateData = {
        is_read: true,
        read_at: new Date().toISOString(),
        acknowledged_by: finalAcknowledgedBy
      };

      const updatedNotification = await AlertNotification.update(alert_id, updateData);
      
      return updatedNotification;
      
    } catch (error) {
      console.error('AlertNotificationService.acknowledge error:', error);
      
      if (error.message.includes('required')) {
        toast.error(error.message);
      } else if (error.message.includes('Authentication')) {
        toast.error('Please log in to acknowledge alerts');
      } else {
        toast.error("Couldn't acknowledge alert. Please try again.");
      }
      
      throw error;
    }
  },

  async markAsRead({ organization_id, notification_id, user_id }) {
    try {
      validateRequired({ notification_id }, ['notification_id']);
      
      // Get user context if not provided
      let finalOrgId = organization_id;
      let finalUserId = user_id;
      
      if (!finalOrgId || !finalUserId) {
        const context = await getCurrentUserContext();
        finalOrgId = finalOrgId || context.organization_id;
        finalUserId = finalUserId || context.user.id;
      }

      const updateData = {
        is_read: true,
        read_at: new Date().toISOString()
      };

      const updatedNotification = await AlertNotification.update(notification_id, updateData);
      
      return updatedNotification;
      
    } catch (error) {
      console.error('AlertNotificationService.markAsRead error:', error);
      
      if (error.message.includes('required')) {
        toast.error(error.message);
      } else if (error.message.includes('Authentication')) {
        toast.error('Please log in to update notifications');
      } else {
        toast.error("Couldn't update notification. Please try again.");
      }
      
      throw error;
    }
  },

  async create({ organization_id, user_id, event_id, title, description, severity = 'medium', notification_type = 'in_app' }) {
    try {
      validateRequired({ title, description }, ['title', 'description']);
      
      // Get user context if not provided
      let finalOrgId = organization_id;
      let finalUserId = user_id;
      
      if (!finalOrgId || !finalUserId) {
        const context = await getCurrentUserContext();
        finalOrgId = finalOrgId || context.organization_id;
        finalUserId = finalUserId || context.user.id;
      }

      const notificationData = {
        organization_id: finalOrgId,
        user_id: finalUserId,
        title: title.trim(),
        description: description.trim(),
        severity,
        notification_type,
        is_read: false
      };

      // Add event_id if provided
      if (event_id) {
        notificationData.event_id = event_id;
      }

      const createdNotification = await AlertNotification.create(notificationData);
      
      return createdNotification;
      
    } catch (error) {
      console.error('AlertNotificationService.create error:', error);
      
      if (error.message.includes('required')) {
        toast.error(error.message);
      } else if (error.message.includes('Authentication')) {
        toast.error('Please log in to create notifications');
      } else {
        toast.error("Couldn't create notification. Please try again.");
      }
      
      throw error;
    }
  }
};