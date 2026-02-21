import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { formatDate } from '../utils/dateFormatting';
import { formatCurrency } from '../utils/mathSplits';

interface ReceiptCardProps {
  storeName: string;
  date: string | Date;
  total: number;
  itemCount: number;
  hasWarnings: boolean;
  warningCount?: number;
  onPress?: () => void;
}

export function ReceiptCard({
  storeName,
  date,
  total,
  itemCount,
  hasWarnings,
  warningCount = 0,
  onPress,
}: ReceiptCardProps) {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return (
    <TouchableOpacity
      style={[styles.container, hasWarnings && styles.warningContainer]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.header}>
        <View style={styles.storeInfo}>
          <Ionicons name="receipt-outline" size={24} color="#D4AF37" />
          <Text style={styles.storeName} numberOfLines={1}>
            {storeName}
          </Text>
        </View>
        {hasWarnings && (
          <View style={styles.warningBadge}>
            <Ionicons name="warning" size={14} color="#FFFFFF" />
            <Text style={styles.warningBadgeText}>{warningCount}</Text>
          </View>
        )}
      </View>

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Date</Text>
          <Text style={styles.detailValue}>{formatDate(dateObj, 'short')}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Items</Text>
          <Text style={styles.detailValue}>{itemCount} items</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatCurrency(total)}</Text>
        </View>
      </View>

      <View style={styles.arrow}>
        <Ionicons name="chevron-forward" size={20} color="#6B7280" />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#5D4037', // Chocolate
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#8D6E63', // Chocolate Light
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  warningContainer: {
    borderColor: '#D4AF37', // Gold for warnings
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF8E1', // Cream
    flex: 1,
  },
  warningBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E74C3C', // Candy Red
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  warningBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  details: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    color: '#D7CCC8', // Light Chocolate
    fontSize: 14,
  },
  detailValue: {
    color: '#FFF8E1', // Cream
    fontSize: 14,
    fontWeight: '500',
  },
  totalValue: {
    color: '#D4AF37', // Gold
    fontSize: 18,
    fontWeight: '700',
  },
  arrow: {
    position: 'absolute',
    right: 16,
    top: '50%',
  },
});
