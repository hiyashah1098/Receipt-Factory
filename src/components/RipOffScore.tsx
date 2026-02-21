import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface RipOffScoreProps {
  score: number; // 1-10
  totalOverpayment: number;
  assessment: string;
}

export function RipOffScore({ score, totalOverpayment, assessment }: RipOffScoreProps) {
  const getScoreConfig = (score: number) => {
    if (score <= 3) {
      return {
        color: '#26A69A', // Mint Green
        label: 'Pure Imagination Pricing',
        icon: 'checkmark-circle' as const,
        bgColor: 'rgba(38, 166, 154, 0.15)',
      };
    }
    if (score <= 5) {
      return {
        color: '#D4AF37', // Gold
        label: 'Slightly Slugworth',
        icon: 'alert-circle' as const,
        bgColor: 'rgba(212, 175, 55, 0.15)',
      };
    }
    if (score <= 7) {
      return {
        color: '#E74C3C', // Candy Red
        label: 'Veruca Salt Pricing',
        icon: 'warning' as const,
        bgColor: 'rgba(231, 76, 60, 0.15)',
      };
    }
    return {
      color: '#DC2626',
      label: 'Highway Robbery!',
      icon: 'skull' as const,
      bgColor: 'rgba(220, 38, 38, 0.15)',
    };
  };

  const config = getScoreConfig(score);

  return (
    <View style={[styles.container, { backgroundColor: config.bgColor }]}>
      <View style={styles.header}>
        <Text style={styles.title}>🍫 Oompa Loompa Price Check</Text>
      </View>

      <View style={styles.scoreContainer}>
        <View style={[styles.scoreCircle, { borderColor: config.color }]}>
          <Text style={[styles.scoreNumber, { color: config.color }]}>{score}</Text>
          <Text style={styles.scoreOutOf}>/10</Text>
        </View>

        <View style={styles.scoreInfo}>
          <View style={styles.labelRow}>
            <Ionicons name={config.icon} size={20} color={config.color} />
            <Text style={[styles.scoreLabel, { color: config.color }]}>
              {config.label}
            </Text>
          </View>

          {totalOverpayment > 0 && (
            <Text style={styles.overpayment}>
              Overpaid: ${totalOverpayment.toFixed(2)}
            </Text>
          )}
        </View>
      </View>

      <Text style={styles.assessment}>{assessment}</Text>

      {/* Score scale */}
      <View style={styles.scale}>
        <View style={[styles.scaleBar, { width: `${(score / 10) * 100}%`, backgroundColor: config.color }]} />
        <View style={styles.scaleLabels}>
          <Text style={styles.scaleText}>1</Text>
          <Text style={styles.scaleMid}>Rip-off Score</Text>
          <Text style={styles.scaleText}>10</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#8D6E63', // Chocolate Light
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF8E1', // Cream
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 16,
  },
  scoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#3E2723', // Chocolate Dark
  },
  scoreNumber: {
    fontSize: 32,
    fontWeight: '800',
  },
  scoreOutOf: {
    fontSize: 14,
    color: '#BCAAA4', // Light Chocolate
    marginTop: -4,
  },
  scoreInfo: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  scoreLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  overpayment: {
    fontSize: 14,
    color: '#E74C3C', // Candy Red
    fontWeight: '600',
  },
  assessment: {
    fontSize: 14,
    color: '#D7CCC8', // Light Chocolate
    lineHeight: 20,
    marginBottom: 16,
  },
  scale: {
    height: 30,
  },
  scaleBar: {
    height: 6,
    borderRadius: 3,
    backgroundColor: '#D4AF37', // Gold
  },
  scaleLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  scaleText: {
    fontSize: 12,
    color: '#BCAAA4', // Light Chocolate
  },
  scaleMid: {
    fontSize: 10,
    color: '#BCAAA4', // Light Chocolate
  },
});
