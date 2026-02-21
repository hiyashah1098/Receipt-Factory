import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface InstantAdvocateProps {
  issueCount: number;
  totalDisputed: number;
  onPress: () => void;
}

export function InstantAdvocate({ issueCount, totalDisputed, onPress }: InstantAdvocateProps) {
  if (issueCount === 0) return null;

  return (
    <TouchableOpacity style={styles.container} onPress={onPress} activeOpacity={0.8}>
      {/* Golden Ticket Design */}
      <View style={styles.ticketEdgeLeft} />
      
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.iconContainer}>
            <Ionicons name="megaphone" size={28} color="#3E2723" />
          </View>
          <View style={styles.titleContainer}>
            <Text style={styles.title}>🎫 The Loompa Legal Team</Text>
            <Text style={styles.subtitle}>Your Golden Ticket to a Refund!</Text>
          </View>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{issueCount}</Text>
            <Text style={styles.statLabel}>Issue{issueCount !== 1 ? 's' : ''} Found</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.stat}>
            <Text style={styles.statValue}>${totalDisputed.toFixed(2)}</Text>
            <Text style={styles.statLabel}>To Recover</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Text style={styles.actionText}>Generate Dispute Message</Text>
          <Ionicons name="arrow-forward" size={20} color="#3E2723" />
        </View>
      </View>

      <View style={styles.ticketEdgeRight} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginVertical: 16,
    marginHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  ticketEdgeLeft: {
    width: 12,
    backgroundColor: '#F4D03F', // Gold Light
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    borderRightWidth: 2,
    borderRightColor: '#B8860B',
    borderStyle: 'dashed',
  },
  ticketEdgeRight: {
    width: 12,
    backgroundColor: '#F4D03F', // Gold Light
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderLeftWidth: 2,
    borderLeftColor: '#B8860B',
    borderStyle: 'dashed',
  },
  content: {
    flex: 1,
    backgroundColor: '#D4AF37', // Gold
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F4D03F',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#3E2723', // Chocolate Dark
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 13,
    color: '#5D4037', // Chocolate
    fontStyle: 'italic',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(62, 39, 35, 0.15)',
    borderRadius: 10,
    paddingVertical: 12,
    marginBottom: 12,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    backgroundColor: '#5D4037',
    marginVertical: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3E2723',
  },
  statLabel: {
    fontSize: 11,
    color: '#5D4037',
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8E1', // Cream
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3E2723',
  },
});
