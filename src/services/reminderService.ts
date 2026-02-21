import { requestNotificationPermissions } from '@/src/utils/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export type ReminderCategory = 
  | 'return_deadline'
  | 'warranty_expiry'
  | 'upcoming_sale'
  | 'price_check'
  | 'purchase_reminder'
  | 'custom';

export interface CustomReminder {
  id: string;
  title: string;
  description: string;
  category: ReminderCategory;
  reminderDate: string; // ISO date string
  notificationId: string | null;
  createdAt: string;
  isCompleted: boolean;
}

const REMINDERS_KEY = '@receipt_detective_reminders';

/**
 * Get all custom reminders
 */
export async function getReminders(): Promise<CustomReminder[]> {
  try {
    const data = await AsyncStorage.getItem(REMINDERS_KEY);
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error loading reminders:', error);
    return [];
  }
}

/**
 * Save a new reminder
 */
export async function saveReminder(
  reminder: Omit<CustomReminder, 'id' | 'createdAt' | 'notificationId' | 'isCompleted'>
): Promise<CustomReminder> {
  const reminders = await getReminders();
  
  const newReminder: CustomReminder = {
    ...reminder,
    id: `reminder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
    notificationId: null,
    isCompleted: false,
  };

  // Schedule notification if date is in future
  const reminderDate = new Date(reminder.reminderDate);
  if (reminderDate.getTime() > Date.now() && Platform.OS !== 'web') {
    try {
      // Ensure notification permissions are granted and Android channel is set up
      const hasPermission = await requestNotificationPermissions();
      if (!hasPermission) {
        console.warn('Notification permissions not granted');
      } else {
        // Build trigger based on platform
        const trigger: Notifications.NotificationTriggerInput = Platform.OS === 'android'
          ? {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: reminderDate,
              channelId: 'warranty-alerts',
            }
          : {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: reminderDate,
            };

        const notificationId = await Notifications.scheduleNotificationAsync({
          content: {
            title: `🎫 ${getCategoryEmoji(reminder.category)} ${reminder.title}`,
            body: reminder.description || 'Your golden ticket reminder is here!',
            data: { reminderId: newReminder.id, type: 'custom-reminder' },
            sound: true,
          },
          trigger,
        });
        newReminder.notificationId = notificationId;
        console.log('Scheduled notification:', notificationId, 'for', reminderDate.toISOString());
      }
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  }

  reminders.unshift(newReminder); // Add to beginning
  await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  
  return newReminder;
}

/**
 * Delete a reminder
 */
export async function deleteReminder(reminderId: string): Promise<void> {
  const reminders = await getReminders();
  const reminder = reminders.find(r => r.id === reminderId);
  
  // Cancel notification if exists
  if (reminder?.notificationId && Platform.OS !== 'web') {
    try {
      await Notifications.cancelScheduledNotificationAsync(reminder.notificationId);
    } catch (error) {
      console.error('Error canceling notification:', error);
    }
  }
  
  const filtered = reminders.filter(r => r.id !== reminderId);
  await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(filtered));
}

/**
 * Mark reminder as completed
 */
export async function completeReminder(reminderId: string): Promise<void> {
  const reminders = await getReminders();
  const index = reminders.findIndex(r => r.id === reminderId);
  
  if (index !== -1) {
    reminders[index].isCompleted = true;
    
    // Cancel notification if exists
    if (reminders[index].notificationId && Platform.OS !== 'web') {
      try {
        await Notifications.cancelScheduledNotificationAsync(reminders[index].notificationId!);
      } catch (error) {
        console.error('Error canceling notification:', error);
      }
    }
    
    await AsyncStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders));
  }
}

/**
 * Get emoji for category
 */
export function getCategoryEmoji(category: ReminderCategory): string {
  switch (category) {
    case 'return_deadline':
      return '📦';
    case 'warranty_expiry':
      return '🛡️';
    case 'upcoming_sale':
      return '🏷️';
    case 'price_check':
      return '💰';
    case 'purchase_reminder':
      return '🛒';
    case 'custom':
    default:
      return '🎫';
  }
}

/**
 * Get category label
 */
export function getCategoryLabel(category: ReminderCategory): string {
  switch (category) {
    case 'return_deadline':
      return 'Return Deadline';
    case 'warranty_expiry':
      return 'Warranty Expiry';
    case 'upcoming_sale':
      return 'Upcoming Sale';
    case 'price_check':
      return 'Price Check';
    case 'purchase_reminder':
      return 'Purchase Reminder';
    case 'custom':
    default:
      return 'Custom Reminder';
  }
}

/**
 * Get all category options
 */
export function getCategoryOptions(): { value: ReminderCategory; label: string; emoji: string }[] {
  return [
    { value: 'return_deadline', label: 'Return Deadline', emoji: '📦' },
    { value: 'warranty_expiry', label: 'Warranty Expiry', emoji: '🛡️' },
    { value: 'upcoming_sale', label: 'Upcoming Sale', emoji: '🏷️' },
    { value: 'price_check', label: 'Price Check', emoji: '💰' },
    { value: 'purchase_reminder', label: 'Purchase Reminder', emoji: '🛒' },
    { value: 'custom', label: 'Custom Reminder', emoji: '🎫' },
  ];
}
