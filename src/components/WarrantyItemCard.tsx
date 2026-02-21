import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatDate, formatTimeRemaining, getUrgencyLevel } from '../utils/dateFormatting';

interface WarrantyItemCardProps {
  itemName: string;
  category: 'electronics' | 'clothing' | 'appliance' | 'other';
  deadline: Date;
  price: number;
  isReturn?: boolean;
  notificationScheduled?: boolean;
  onScheduleNotification?: () => void;
}

const CATEGORY_ICONS = {
  electronics: 'phone-portrait-outline',
  clothing: 'shirt-outline',
  appliance: 'home-outline',
  other: 'cube-outline',
} as const;

const CATEGORY_COLORS = {
  electronics: '#7D3C98', // Wonka Purple
  clothing: '#E74C3C', // Candy Red
  appliance: '#D4AF37', // Gold
  other: '#BCAAA4', // Light Chocolate
};

export function WarrantyItemCard({
  itemName,
  category,
  deadline,
  price,
  isReturn = true,
  notificationScheduled = false,
  onScheduleNotification,
}: WarrantyItemCardProps) {
  const urgency = getUrgencyLevel(deadline);
  const timeRemaining = formatTimeRemaining(deadline);

  const urgencyConfig = {
    critical: { color: '#E74C3C', bg: 'rgba(231, 76, 60, 0.15)' }, // Candy Red
    warning: { color: '#D4AF37', bg: 'rgba(212, 175, 55, 0.15)' }, // Gold
    normal: { color: '#26A69A', bg: 'rgba(38, 166, 154, 0.15)' }, // Mint
    expired: { color: '#BCAAA4', bg: 'rgba(188, 170, 164, 0.15)' }, // Light Chocolate
  };

  const config = urgencyConfig[urgency];

  return (
    <View style={[styles.container, { borderColor: config.color }]}>
      <View style={styles.header}>
        <View style={[styles.categoryBadge, { backgroundColor: CATEGORY_COLORS[category] }]}>
          <Ionicons
            name={CATEGORY_ICONS[category]}
            size={18}
            color="#FFFFFF"
          />
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>
            {itemName}
          </Text>
          <Text style={styles.price}>${price.toFixed(2)}</Text>
        </View>
      </View>

      <View style={[styles.deadlineContainer, { backgroundColor: config.bg }]}>
        <Ionicons
          name={urgency === 'expired' ? 'close-circle' : 'time-outline'}
          size={20}
          color={config.color}
        />
        <View style={styles.deadlineInfo}>
          <Text style={[styles.deadlineLabel, { color: config.color }]}>
            {isReturn ? 'Return By' : 'Warranty Expires'}
          </Text>
          <Text style={styles.deadlineDate}>{formatDate(deadline, 'long')}</Text>
          <Text style={[styles.timeRemaining, { color: config.color }]}>
            {timeRemaining}
          </Text>
        </View>
      </View>

      {onScheduleNotification && urgency !== 'expired' && (
        <TouchableOpacity
          style={[
            styles.notifyButton,
            notificationScheduled && styles.notifyButtonActive,
          ]}
          onPress={onScheduleNotification}
        >
          <Ionicons
            name={notificationScheduled ? 'notifications' : 'notifications-outline'}
            size={18}
            color={notificationScheduled ? '#26A69A' : '#D4AF37'}
          />
          <Text
            style={[
              styles.notifyText,
              notificationScheduled && styles.notifyTextActive,
            ]}
          >
            {notificationScheduled ? 'Wonkavision Alert Set' : 'Set Wonkavision Alert'}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#5D4037', // Chocolate
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderLeftWidth: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  categoryBadge: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF8E1', // Cream
    marginBottom: 2,
  },
  price: {
    fontSize: 14,
    color: '#D7CCC8', // Light Chocolate
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    gap: 12,
  },
  deadlineInfo: {
    flex: 1,
  },
  deadlineLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  deadlineDate: {
    fontSize: 14,
    color: '#FFF8E1', // Cream
    fontWeight: '500',
    marginTop: 2,
  },
  timeRemaining: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
  },
  notifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: 'rgba(212, 175, 55, 0.15)', // Gold tint
    gap: 8,
  },
  notifyButtonActive: {
    backgroundColor: 'rgba(38, 166, 154, 0.15)', // Mint tint
  },
  notifyText: {
    color: '#D4AF37', // Gold
    fontWeight: '600',
    fontSize: 14,
  },
  notifyTextActive: {
    color: '#26A69A', // Mint
  },
});
