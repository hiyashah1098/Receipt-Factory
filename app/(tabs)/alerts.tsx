import { Button, WarrantyItemCard } from '@/src/components';
import {
    completeReminder,
    CustomReminder,
    deleteReminder,
    getCategoryEmoji,
    getReminders,
} from '@/src/services/reminderService';
import { addDays } from '@/src/utils/dateFormatting';
import {
    cancelAllNotifications,
    getScheduledNotifications,
    requestNotificationPermissions,
    sendTestNotification,
} from '@/src/utils/notifications';
import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Alert,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TrackedItem {
  id: string;
  name: string;
  category: 'electronics' | 'clothing' | 'appliance' | 'other';
  price: number;
  deadline: Date;
  isReturn: boolean;
  notificationId?: string;
}

// Demo data - in production this would come from Firestore
const DEMO_ITEMS: TrackedItem[] = [
  {
    id: '1',
    name: 'iPhone 15 Pro Case',
    category: 'electronics',
    price: 49.99,
    deadline: addDays(new Date(), 12),
    isReturn: true,
  },
  {
    id: '2',
    name: 'Nike Running Shoes',
    category: 'clothing',
    price: 129.99,
    deadline: addDays(new Date(), 3),
    isReturn: true,
  },
  {
    id: '3',
    name: 'Bluetooth Headphones',
    category: 'electronics',
    price: 199.99,
    deadline: addDays(new Date(), 25),
    isReturn: false,
  },
  {
    id: '4',
    name: 'Winter Jacket',
    category: 'clothing',
    price: 89.99,
    deadline: addDays(new Date(), 1),
    isReturn: true,
  },
];

export default function AlertsScreen() {
  const router = useRouter();
  const [items, setItems] = useState<TrackedItem[]>(DEMO_ITEMS);
  const [customReminders, setCustomReminders] = useState<CustomReminder[]>([]);
  const [scheduledNotifications, setScheduledNotifications] = useState<string[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const loadNotifications = async () => {
    const notifications = await getScheduledNotifications();
    const ids = notifications.map((n) => n.identifier);
    setScheduledNotifications(ids);
  };

  const loadCustomReminders = async () => {
    const reminders = await getReminders();
    setCustomReminders(reminders.filter(r => !r.isCompleted));
  };

  const checkPermissions = async () => {
    const granted = await requestNotificationPermissions();
    setPermissionGranted(granted);
  };

  useFocusEffect(
    useCallback(() => {
      checkPermissions();
      loadNotifications();
      loadCustomReminders();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
    await loadCustomReminders();
    setRefreshing(false);
  };

  const handleAddReminder = () => {
    router.push('/add-reminder');
  };

  const handleCompleteReminder = async (reminderId: string) => {
    Alert.alert(
      'Complete Reminder',
      'Mark this reminder as complete?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Complete',
          onPress: async () => {
            await completeReminder(reminderId);
            await loadCustomReminders();
          },
        },
      ]
    );
  };

  const handleDeleteReminder = async (reminderId: string) => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteReminder(reminderId);
            await loadCustomReminders();
          },
        },
      ]
    );
  };

  const handleScheduleNotification = async (item: TrackedItem) => {
    // Notifications not supported on web
    if (Platform.OS === 'web') {
      Alert.alert('Not Supported', 'Push notifications are only available on mobile devices.');
      return;
    }

    if (!permissionGranted) {
      Alert.alert(
        'Notifications Disabled',
        'Please enable notifications in your device settings to receive reminders.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      const notificationDate = new Date(item.deadline);
      notificationDate.setHours(notificationDate.getHours() - 48);

      if (notificationDate.getTime() <= Date.now()) {
        Alert.alert(
          'Too Late',
          'The reminder time has already passed for this item.'
        );
        return;
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: `⏰ ${item.isReturn ? 'Return' : 'Warranty'} Deadline!`,
          body: `Do you still like your ${item.name}? You have 48 hours left!`,
          sound: true,
          data: { itemId: item.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: notificationDate,
        },
      });

      setScheduledNotifications((prev) => [...prev, identifier]);
      
      Alert.alert(
        'Reminder Set! 🔔',
        `You'll be notified 48 hours before your ${item.isReturn ? 'return' : 'warranty'} deadline.`
      );
    } catch (error) {
      console.error('Error scheduling notification:', error);
      Alert.alert('Error', 'Failed to schedule notification.');
    }
  };

  const handleTestNotification = async () => {
    await sendTestNotification();
  };

  const handleClearAll = async () => {
    Alert.alert(
      'Clear All Reminders',
      'Are you sure you want to cancel all scheduled reminders?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            await cancelAllNotifications();
            setScheduledNotifications([]);
          },
        },
      ]
    );
  };

  // Sort items by urgency (closest deadline first)
  const sortedItems = [...items].sort(
    (a, b) => a.deadline.getTime() - b.deadline.getTime()
  );

  const urgentItems = sortedItems.filter(
    (item) => item.deadline.getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Floating Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={handleAddReminder}>
        <Ionicons name="add" size={28} color="#3E2723" />
      </TouchableOpacity>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#D4AF37"
          />
        }
      >
        <View style={styles.header}>
          <Ionicons name="notifications" size={32} color="#D4AF37" />
          <Text style={styles.title}>🔍 Wonkavision</Text>
          <Text style={styles.subtitle}>
            Never miss a return deadline or warranty expiration
          </Text>
        </View>

        {/* Permission status */}
        {!permissionGranted && (
          <View style={styles.permissionBanner}>
            <Ionicons name="warning" size={24} color="#F59E0B" />
            <Text style={styles.permissionText}>
              Enable notifications to receive deadline reminders
            </Text>
            <Button
              title="Enable"
              onPress={checkPermissions}
              size="small"
            />
          </View>
        )}

        {/* Custom Reminders Section */}
        {customReminders.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎫 Your Golden Ticket Reminders</Text>
            {customReminders.map((reminder) => (
              <View key={reminder.id} style={styles.reminderCard}>
                <View style={styles.reminderHeader}>
                  <Text style={styles.reminderEmoji}>
                    {getCategoryEmoji(reminder.category)}
                  </Text>
                  <View style={styles.reminderContent}>
                    <Text style={styles.reminderTitle} numberOfLines={1}>
                      {reminder.title}
                    </Text>
                    <Text style={styles.reminderDate}>
                      {new Date(reminder.reminderDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                  <View style={styles.reminderActions}>
                    <TouchableOpacity
                      onPress={() => handleCompleteReminder(reminder.id)}
                      style={styles.reminderActionBtn}
                    >
                      <Ionicons name="checkmark-circle" size={24} color="#26A69A" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDeleteReminder(reminder.id)}
                      style={styles.reminderActionBtn}
                    >
                      <Ionicons name="trash-outline" size={20} color="#E74C3C" />
                    </TouchableOpacity>
                  </View>
                </View>
                {reminder.description ? (
                  <Text style={styles.reminderDescription} numberOfLines={2}>
                    {reminder.description}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Test Notification"
            onPress={handleTestNotification}
            variant="secondary"
            size="small"
            icon={<Ionicons name="notifications-outline" size={16} color="#FFFFFF" />}
          />
          {scheduledNotifications.length > 0 && (
            <Button
              title="Clear All"
              onPress={handleClearAll}
              variant="ghost"
              size="small"
            />
          )}
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{items.length}</Text>
            <Text style={styles.statLabel}>Tracked Items</Text>
          </View>
          <View style={[styles.statCard, urgentItems.length > 0 && styles.urgentCard]}>
            <Text style={[styles.statNumber, urgentItems.length > 0 && styles.urgentNumber]}>
              {urgentItems.length}
            </Text>
            <Text style={styles.statLabel}>Urgent</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{scheduledNotifications.length}</Text>
            <Text style={styles.statLabel}>Reminders</Text>
          </View>
        </View>

        {/* Urgent Items */}
        {urgentItems.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🚨 Urgent - Action Required</Text>
            {urgentItems.map((item) => (
              <WarrantyItemCard
                key={item.id}
                itemName={item.name}
                category={item.category}
                deadline={item.deadline}
                price={item.price}
                isReturn={item.isReturn}
                notificationScheduled={scheduledNotifications.some((id) =>
                  id.includes(item.id)
                )}
                onScheduleNotification={() => handleScheduleNotification(item)}
              />
            ))}
          </View>
        )}

        {/* All Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📋 All Tracked Items</Text>
          {sortedItems.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="cube-outline" size={48} color="#6B7280" />
              <Text style={styles.emptyText}>
                No items being tracked yet. Scan a receipt to start tracking warranties and returns.
              </Text>
            </View>
          ) : (
            sortedItems.map((item) => (
              <WarrantyItemCard
                key={item.id}
                itemName={item.name}
                category={item.category}
                deadline={item.deadline}
                price={item.price}
                isReturn={item.isReturn}
                notificationScheduled={scheduledNotifications.some((id) =>
                  id.includes(item.id)
                )}
                onScheduleNotification={() => handleScheduleNotification(item)}
              />
            ))
          )}
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3E2723', // Chocolate Dark
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF8E1', // Cream
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#D7CCC8', // Light Chocolate
    textAlign: 'center',
  },
  permissionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(212, 175, 55, 0.2)', // Gold tint
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  permissionText: {
    flex: 1,
    color: '#D4AF37', // Gold
    fontSize: 14,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#5D4037', // Chocolate
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  urgentCard: {
    backgroundColor: 'rgba(231, 76, 60, 0.2)', // Candy Red tint
    borderWidth: 1,
    borderColor: '#E74C3C', // Candy Red
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF8E1', // Cream
  },
  urgentNumber: {
    color: '#E74C3C', // Candy Red
  },
  statLabel: {
    fontSize: 12,
    color: '#D7CCC8', // Light Chocolate
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF8E1', // Cream
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  emptyText: {
    color: '#BCAAA4', // Light Chocolate
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
  addButton: {
    position: 'absolute',
    top: 60,
    right: 20,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D4AF37', // Gold
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  reminderCard: {
    backgroundColor: '#5D4037', // Chocolate
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#D4AF37', // Gold
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderEmoji: {
    fontSize: 28,
    marginRight: 12,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF8E1', // Cream
  },
  reminderDate: {
    fontSize: 12,
    color: '#BCAAA4',
    marginTop: 2,
  },
  reminderDescription: {
    fontSize: 13,
    color: '#D7CCC8',
    marginTop: 8,
    fontStyle: 'italic',
  },
  reminderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  reminderActionBtn: {
    padding: 4,
  },
  bottomPadding: {
    height: 40,
  },
});
