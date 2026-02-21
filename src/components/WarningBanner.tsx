import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface WarningBannerProps {
  type: 'danger' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  visible: boolean;
}

export function WarningBanner({ type, title, message, visible }: WarningBannerProps) {
  if (!visible) return null;

  const config = {
    danger: {
      backgroundColor: '#E74C3C', // Candy Red
      iconName: 'warning' as const,
      borderColor: '#C0392B',
    },
    warning: {
      backgroundColor: '#D4AF37', // Gold
      iconName: 'alert-circle' as const,
      borderColor: '#B8860B',
    },
    info: {
      backgroundColor: '#7D3C98', // Wonka Purple
      iconName: 'information-circle' as const,
      borderColor: '#5B2C6F',
    },
    success: {
      backgroundColor: '#26A69A', // Mint Green
      iconName: 'checkmark-circle' as const,
      borderColor: '#1E8A7E',
    },
  };

  const { backgroundColor, iconName, borderColor } = config[type];

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <View style={styles.iconContainer}>
        <Ionicons name={iconName} size={28} color="#FFFFFF" />
      </View>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

/**
 * Specialized banner for gratuity warning
 */
export function GratuityWarningBanner({
  visible,
  gratuityPercentage,
}: {
  visible: boolean;
  gratuityPercentage: number;
}) {
  return (
    <WarningBanner
      type="danger"
      title="🛑 WONKA WARNING: TIP TRAP!"
      message={`A ${gratuityPercentage}% gratuity is already baked in like an everlasting gobstopper. Do NOT double tip!`}
      visible={visible}
    />
  );
}

/**
 * Banner for junk fees detected
 */
export function JunkFeeBanner({
  visible,
  feeCount,
  totalFees,
}: {
  visible: boolean;
  feeCount: number;
  totalFees: number;
}) {
  return (
    <WarningBanner
      type="warning"
      title={`⚠️ ${feeCount} Slugworth Fee${feeCount !== 1 ? 's' : ''} Detected!`}
      message={`You're being charged $${totalFees.toFixed(2)} in sneaky Slugworth fees. Tap to investigate!`}
      visible={visible}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  message: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.95,
  },
});
