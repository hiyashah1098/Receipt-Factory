import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Individual } from '../services/firebaseSetup';
import { formatCurrency } from '../utils/mathSplits';

interface BillSplitCardProps {
  individuals: Individual[];
  total: number;
}

const COLORS = ['#D4AF37', '#26A69A', '#7D3C98', '#E74C3C', '#F4D03F', '#5B2C6F'];

export function BillSplitCard({ individuals, total }: BillSplitCardProps) {
  // Debug logging
  console.log('BillSplitCard rendering:', { 
    individualsCount: individuals?.length, 
    total, 
    individuals: JSON.stringify(individuals, null, 2) 
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="people" size={24} color="#D4AF37" />
        <Text style={styles.title}>Fizzy Lifting Split 🍾</Text>
        <Text style={styles.total}>{formatCurrency(total)}</Text>
      </View>

      {/* Debug info */}
      <Text style={styles.debugInfo}>
        {individuals?.length || 0} people detected
      </Text>

      {(!individuals || individuals.length === 0) ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            No individual splits found. The AI couldn't parse the split instructions.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {individuals.map((person, index) => (
            <PersonCard
              key={person.name || `person-${index}`}
              person={person}
              color={COLORS[index % COLORS.length]}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function PersonCard({ person, color }: { person: Individual; color: string }) {
  return (
    <View style={[styles.personCard, { borderLeftColor: color }]}>
      <View style={styles.personHeader}>
        <View style={[styles.avatar, { backgroundColor: color }]}>
          <Text style={styles.avatarText}>
            {person.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.personInfo}>
          <Text style={styles.personName}>{person.name}</Text>
          <Text style={styles.itemCount}>
            {person.items.length} item{person.items.length !== 1 ? 's' : ''}
          </Text>
        </View>
        <Text style={styles.personTotal}>{formatCurrency(person.owed)}</Text>
      </View>

      {/* Line items */}
      <View style={styles.items}>
        {person.items.map((item, idx) => (
          <View key={idx} style={styles.itemRow}>
            <Text style={styles.itemName} numberOfLines={1}>
              {item.quantity > 1 && `${item.quantity}x `}{item.name}
            </Text>
            <Text style={styles.itemPrice}>
              {formatCurrency(item.price * item.quantity)}
            </Text>
          </View>
        ))}
      </View>

      {/* Breakdown */}
      <View style={styles.breakdown}>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Subtotal</Text>
          <Text style={styles.breakdownValue}>
            {formatCurrency(person.subtotal)}
          </Text>
        </View>
        <View style={styles.breakdownRow}>
          <Text style={styles.breakdownLabel}>Tax Share</Text>
          <Text style={styles.breakdownValue}>
            {formatCurrency(person.taxShare)}
          </Text>
        </View>
        {person.tipShare > 0 && (
          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Tip Share</Text>
            <Text style={styles.breakdownValue}>
              {formatCurrency(person.tipShare)}
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#5D4037', // Chocolate
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 10,
  },
  debugInfo: {
    fontSize: 12,
    color: '#F4D03F',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
  },
  emptyText: {
    color: '#BCAAA4',
    fontSize: 14,
    textAlign: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF8E1', // Cream
    flex: 1,
  },
  total: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D4AF37', // Gold
  },
  list: {
    flex: 1,
  },
  personCard: {
    backgroundColor: '#3E2723', // Chocolate Dark
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFF8E1', // Cream
    fontSize: 18,
    fontWeight: '700',
  },
  personInfo: {
    flex: 1,
    marginLeft: 12,
  },
  personName: {
    color: '#FFF8E1', // Cream
    fontSize: 16,
    fontWeight: '600',
  },
  itemCount: {
    color: '#D7CCC8', // Light Chocolate
    fontSize: 12,
  },
  personTotal: {
    color: '#D4AF37', // Gold
    fontSize: 20,
    fontWeight: '700',
  },
  items: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#8D6E63', // Chocolate Light
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemName: {
    color: '#D7CCC8', // Light Chocolate
    fontSize: 13,
    flex: 1,
  },
  itemPrice: {
    color: '#D7CCC8', // Light Chocolate
    fontSize: 13,
    fontWeight: '500',
  },
  breakdown: {
    borderTopWidth: 1,
    borderTopColor: '#8D6E63', // Chocolate Light
    paddingTop: 8,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  breakdownLabel: {
    color: '#BCAAA4', // Lighter Chocolate
    fontSize: 12,
  },
  breakdownValue: {
    color: '#D7CCC8', // Light Chocolate
    fontSize: 12,
  },
});
