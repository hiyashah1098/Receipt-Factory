import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';

const { width, height } = Dimensions.get('window');
const FRAME_SIZE = width * 0.85;

interface CameraOverlayProps {
  isProcessing?: boolean;
  hint?: string;
}

export function CameraOverlay({ isProcessing = false, hint }: CameraOverlayProps) {
  return (
    <View style={styles.container}>
      {/* Top overlay */}
      <View style={styles.topOverlay}>
        <Text style={styles.title}>📷 Scan Your Receipt</Text>
        <Text style={styles.subtitle}>
          Position the receipt within the frame
        </Text>
      </View>

      {/* Frame guides */}
      <View style={styles.frameContainer}>
        <View style={styles.frame}>
          {/* Corner indicators */}
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />

          {isProcessing && (
            <View style={styles.processingOverlay}>
              <Ionicons name="scan" size={48} color="#D4AF37" />
              <Text style={styles.processingText}>Analyzing your Golden Ticket...</Text>
            </View>
          )}
        </View>
      </View>

      {/* Bottom hint */}
      <View style={styles.bottomOverlay}>
        {hint ? (
          <Text style={styles.hint}>{hint}</Text>
        ) : (
          <View style={styles.tips}>
            <View style={styles.tipRow}>
              <Ionicons name="sunny" size={16} color="#9CA3AF" />
              <Text style={styles.tipText}>Good lighting helps</Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="resize" size={16} color="#9CA3AF" />
              <Text style={styles.tipText}>Keep receipt flat</Text>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
  },
  topOverlay: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#E5E7EB',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  frameContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE * 1.4, // Receipt aspect ratio
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.5)', // Gold
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#D4AF37', // Gold
  },
  topLeft: {
    top: -2,
    left: -2,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: 12,
  },
  topRight: {
    top: -2,
    right: -2,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: 12,
  },
  bottomLeft: {
    bottom: -2,
    left: -2,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: 12,
  },
  bottomRight: {
    bottom: -2,
    right: -2,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: 12,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  processingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '600',
  },
  bottomOverlay: {
    paddingBottom: 140,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  hint: {
    fontSize: 14,
    color: '#D4AF37', // Gold
    fontWeight: '600',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  tips: {
    flexDirection: 'row',
    gap: 24,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tipText: {
    color: '#D7CCC8', // Light Chocolate
    fontSize: 13,
  },
});
