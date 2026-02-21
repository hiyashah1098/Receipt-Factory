import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    Easing,
    Modal,
    StyleSheet,
    Text,
    View,
} from 'react-native';

interface GoldenTicketAnimationProps {
  onFinish?: () => void;
}

export default function GoldenTicketAnimation({ onFinish }: GoldenTicketAnimationProps) {
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  const ticketScale = useRef(new Animated.Value(0)).current;
  const ticketRotation = useRef(new Animated.Value(0)).current;
  const shimmerX = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    // Fade in overlay
    Animated.timing(overlayOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Scale and rotate ticket - total ~3 seconds
    Animated.sequence([
      // Scale up with bounce (300ms)
      Animated.spring(ticketScale, {
        toValue: 1,
        friction: 6,
        tension: 60,
        useNativeDriver: true,
      }),
      // Single spin (800ms)
      Animated.timing(ticketRotation, {
        toValue: 360,
        duration: 800,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: true,
      }),
      // Brief pause (400ms)
      Animated.delay(400),
      // Shrink and fade out (500ms)
      Animated.parallel([
        Animated.timing(ticketScale, {
          toValue: 0,
          duration: 400,
          easing: Easing.in(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      onFinish?.();
    });

    // Shimmer effect
    Animated.loop(
      Animated.timing(shimmerX, {
        toValue: 300,
        duration: 1000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      { iterations: 2 }
    ).start();
  }, []);

  const rotateInterpolate = ticketRotation.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Modal transparent visible animationType="none" statusBarTranslucent>
      <Animated.View style={[styles.overlay, { opacity: overlayOpacity }]}>
        {/* Golden Ticket */}
        <Animated.View
          style={[
            styles.ticketWrapper,
            {
              transform: [
                { scale: ticketScale },
                { rotate: rotateInterpolate },
              ],
            },
          ]}
        >
          {/* Glow */}
          <View style={styles.glow} />

          {/* The ticket */}
          <View style={styles.ticket}>
            <LinearGradient
              colors={['#F5D061', '#D4AF37', '#B8860B', '#D4AF37', '#F5D061']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.ticketGradient}
            >
              {/* Shimmer */}
              <Animated.View style={[styles.shimmer, { transform: [{ translateX: shimmerX }] }]}>
                <LinearGradient
                  colors={['transparent', 'rgba(255,255,255,0.7)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ width: 80, height: '100%' }}
                />
              </Animated.View>

              {/* Border */}
              <View style={styles.ticketBorder}>
                {/* Left perforations */}
                <View style={styles.perforations}>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <View key={`l-${i}`} style={styles.hole} />
                  ))}
                </View>

                {/* Content */}
                <View style={styles.content}>
                  <View style={styles.line} />
                  <Text style={styles.label}>WONKA&apos;S</Text>
                  <Text style={styles.title}>GOLDEN</Text>
                  <Text style={styles.title}>TICKET</Text>
                  <View style={styles.dividerRow}>
                    <Text style={styles.chocolate}>🍫</Text>
                    <View style={styles.dividerLine} />
                    <Text style={styles.chocolate}>🍫</Text>
                  </View>
                  <View style={styles.badge}>
                    <Text style={styles.check}>✓</Text>
                    <Text style={styles.badgeText}>NO HIDDEN FEES</Text>
                  </View>
                  <View style={styles.line} />
                </View>

                {/* Right perforations */}
                <View style={styles.perforations}>
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <View key={`r-${i}`} style={styles.hole} />
                  ))}
                </View>
              </View>
            </LinearGradient>
          </View>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(62, 39, 35, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  ticketWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: 320,
    height: 200,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 15,
  },
  ticket: {
    width: 280,
    height: 170,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 12,
  },
  ticketGradient: {
    flex: 1,
    padding: 4,
  },
  shimmer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  ticketBorder: {
    flex: 1,
    borderWidth: 3,
    borderColor: '#8B6914',
    borderRadius: 8,
    flexDirection: 'row',
    backgroundColor: 'rgba(212, 175, 55, 0.3)',
  },
  perforations: {
    width: 16,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    paddingVertical: 8,
  },
  hole: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#8B6914',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  line: {
    width: '75%',
    height: 2,
    backgroundColor: '#8B6914',
    borderRadius: 1,
    marginVertical: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    color: '#5D4037',
    letterSpacing: 5,
    marginBottom: 2,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#3E2723',
    letterSpacing: 3,
    lineHeight: 30,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  chocolate: {
    fontSize: 12,
    marginHorizontal: 6,
  },
  dividerLine: {
    width: 60,
    height: 2,
    backgroundColor: '#8B6914',
    borderRadius: 1,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(46, 125, 50, 0.25)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginVertical: 4,
  },
  check: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: 'bold',
    marginRight: 5,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#2E7D32',
    letterSpacing: 1,
  },
});
