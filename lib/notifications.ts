interface NotificationPreferences {
  emailNotifications: boolean;
  postNotifications: boolean;
  replyNotifications: boolean;
  likeNotifications: boolean;
}

interface NotificationData {
  type: 'post' | 'reply' | 'like';
  recipientEmail: string;
  senderName: string;
  content: string;
  postId?: string;
  bookName?: string;
}

class NotificationService {
  private static instance: NotificationService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Get user notification preferences (in real app, this would come from database)
  async getUserPreferences(userId: string): Promise<NotificationPreferences> {
    // Mock implementation - replace with actual API call
    return {
      emailNotifications: true,
      postNotifications: true,
      replyNotifications: true,
      likeNotifications: true
    };
  }

  // Update user notification preferences
  async updatePreferences(userId: string, preferences: Partial<NotificationPreferences>): Promise<void> {
    // Mock implementation - replace with actual API call
    console.log('Updating preferences for user', userId, preferences);
  }

  // Send email notification
  async sendEmailNotification(data: NotificationData): Promise<boolean> {
    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  // Notify about new post
  async notifyNewPost(authorName: string, content: string, followerEmails: string[]): Promise<void> {
    const preferences = await this.getUserPreferences('current-user'); // Replace with actual user ID
    
    if (!preferences.emailNotifications || !preferences.postNotifications) {
      return;
    }

    const notifications = followerEmails.map(email => ({
      type: 'post' as const,
      recipientEmail: email,
      senderName: authorName,
      content
    }));

    // Send notifications in parallel
    await Promise.all(
      notifications.map(notification => this.sendEmailNotification(notification))
    );
  }

  // Notify about new reply
  async notifyReply(
    recipientEmail: string,
    senderName: string,
    content: string,
    postId: string
  ): Promise<void> {
    const preferences = await this.getUserPreferences('current-user'); // Replace with actual user ID
    
    if (!preferences.emailNotifications || !preferences.replyNotifications) {
      return;
    }

    await this.sendEmailNotification({
      type: 'reply',
      recipientEmail,
      senderName,
      content,
      postId
    });
  }

  // Notify about like
  async notifyLike(
    recipientEmail: string,
    senderName: string,
    content: string,
    postId: string,
    bookName?: string
  ): Promise<void> {
    const preferences = await this.getUserPreferences('current-user'); // Replace with actual user ID
    
    if (!preferences.emailNotifications || !preferences.likeNotifications) {
      return;
    }

    await this.sendEmailNotification({
      type: 'like',
      recipientEmail,
      senderName,
      content,
      postId,
      bookName
    });
  }
}

export default NotificationService;
