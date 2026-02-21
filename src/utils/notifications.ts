import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { calculateNotificationDate } from './dateFormatting';

// Only configure notification handler on native platforms
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  // Notifications not supported on web
  if (Platform.OS === 'web') {
    console.log('Notifications not supported on web');
    return false;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Notification permissions not granted');
    return false;
  }

  // Set up Android notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('warranty-alerts', {
      name: 'Wonkavision Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF6B6B',
    });
  }

  return true;
}

/**
 * Schedule a warranty/return reminder notification
 */
export async function scheduleReturnReminder(
  itemName: string,
  deadline: Date,
  hoursBefore: number = 48
): Promise<string | null> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  const notificationDate = calculateNotificationDate(deadline, hoursBefore);

  // Don't schedule if the notification date is in the past
  if (notificationDate.getTime() <= Date.now()) {
    console.log('Notification date is in the past, skipping');
    return null;
  }

  // Build trigger based on platform
  const trigger: Notifications.NotificationTriggerInput = Platform.OS === 'android'
    ? {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notificationDate,
        channelId: 'warranty-alerts',
      }
    : {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notificationDate,
      };

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '⏰ Return Deadline Approaching!',
      body: `Do you still like your ${itemName}? You have ${hoursBefore} hours left to return it!`,
      data: { itemName, deadline: deadline.toISOString(), type: 'return-reminder' },
      sound: true,
    },
    trigger,
  });

  console.log(`Scheduled reminder for ${itemName} at ${notificationDate.toISOString()}`);
  return identifier;
}

/**
 * Schedule warranty expiration reminder
 */
export async function scheduleWarrantyReminder(
  itemName: string,
  warrantyExpiration: Date,
  daysBefore: number = 7
): Promise<string | null> {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return null;

  const notificationDate = calculateNotificationDate(warrantyExpiration, daysBefore * 24);

  if (notificationDate.getTime() <= Date.now()) {
    return null;
  }

  // Build trigger based on platform
  const warrantyTrigger: Notifications.NotificationTriggerInput = Platform.OS === 'android'
    ? {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notificationDate,
        channelId: 'warranty-alerts',
      }
    : {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: notificationDate,
      };

  const identifier = await Notifications.scheduleNotificationAsync({
    content: {
      title: '🛡️ Warranty Expiring Soon!',
      body: `Your warranty for ${itemName} expires in ${daysBefore} days. Check if everything still works!`,
      data: { itemName, deadline: warrantyExpiration.toISOString(), type: 'warranty-reminder' },
      sound: true,
    },
    trigger: warrantyTrigger,
  });

  return identifier;
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(identifier: string): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelScheduledNotificationAsync(identifier);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  if (Platform.OS === 'web') return;
  await Notifications.cancelAllScheduledNotificationsAsync();
}

/**
 * Get all scheduled notifications
 */
export async function getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
  if (Platform.OS === 'web') return [];
  return await Notifications.getAllScheduledNotificationsAsync();
}

/**
 * Set up notification listeners
 */
export function setupNotificationListeners(
  onNotificationReceived?: (notification: Notifications.Notification) => void,
  onNotificationResponse?: (response: Notifications.NotificationResponse) => void
): () => void {
  // Notifications not supported on web
  if (Platform.OS === 'web') {
    return () => {}; // Return no-op cleanup function
  }

  const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
    console.log('Notification received:', notification);
    onNotificationReceived?.(notification);
  });

  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    console.log('Notification response:', response);
    onNotificationResponse?.(response);
  });

  // Return cleanup function
  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

/**
 * Send an immediate test notification
 */
export async function sendTestNotification(): Promise<void> {  if (Platform.OS === 'web') {
    console.log('Test notifications not supported on web');
    return;
  }
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🍫 Receipt Factory',
      body: 'Notifications are working! You will receive alerts before return deadlines expire.',
      sound: true,
    },
    trigger: null, // Send immediately
  });
}
