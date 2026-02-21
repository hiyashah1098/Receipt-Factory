import { useAuth } from '@/src/context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    Animated,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  color: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'ticket-outline',
    title: 'Your Golden Ticket\nto Savings',
    description:
      'Welcome to the sweetest deal detector! Like Wonka finds golden tickets, we find hidden fees and savings in your receipts.',
    color: '#D4AF37', // Golden Ticket Gold
  },
  {
    id: '2',
    icon: 'warning-outline',
    title: 'Everlasting\nFee Stopper',
    description:
      'Just like everlasting gobstoppers, hidden fees never seem to end! Our AI catches sneaky charges before they bite.',
    color: '#E74C3C', // Candy Red
  },
  {
    id: '3',
    icon: 'people-outline',
    title: 'Fizzy Lifting\nBill Splits',
    description:
      '"Charlie pays for the chocolate, Grandpa Joe skips the fizzy drinks." Describe it naturally and we\'ll lift the math burden!',
    color: '#26A69A', // Mint Green
  },
  {
    id: '4',
    icon: 'trending-up-outline',
    title: 'Oompa Loompa\nPrice Check',
    description:
      'Our little helpers compare prices against market averages. Get a Rip-off Score and spot which items are pure imagination pricing!',
    color: '#F39C12', // Candy Orange
  },
  {
    id: '5',
    icon: 'notifications-outline',
    title: 'Wonkavision\nReturn Alerts',
    description:
      'See return deadlines from miles away! Get notified 48 hours before your window closes - no shrinking required.',
    color: '#5B2C6F', // Wonka Purple
  },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleGetStarted();
    }
  };

  const handleSkip = () => {
    handleGetStarted();
  };

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace('/(auth)/login');
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const renderSlide = ({ item, index }: { item: OnboardingSlide; index: number }) => {
    return (
      <View style={styles.slide}>
        <View style={[styles.iconContainer, { backgroundColor: `${item.color}20` }]}>
          <Ionicons name={item.icon} size={80} color={item.color} />
        </View>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    );
  };

  const renderPagination = () => {
    return (
      <View style={styles.pagination}>
        {SLIDES.map((_, index) => {
          const inputRange = [
            (index - 1) * width,
            index * width,
            (index + 1) * width,
          ];

          const dotWidth = scrollX.interpolate({
            inputRange,
            outputRange: [8, 24, 8],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.3, 1, 0.3],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              key={index}
              style={[
                styles.dot,
                {
                  width: dotWidth,
                  opacity,
                  backgroundColor: SLIDES[currentIndex].color,
                },
              ]}
            />
          );
        })}
      </View>
    );
  };

  const isLastSlide = currentIndex === SLIDES.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      {/* Skip button */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
      />

      {/* Pagination and buttons */}
      <View style={styles.footer}>
        {renderPagination()}

        <TouchableOpacity
          style={[
            styles.nextButton,
            { backgroundColor: SLIDES[currentIndex].color },
          ]}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          {isLastSlide ? (
            <Text style={styles.nextButtonText}>Get Started</Text>
          ) : (
            <>
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3E2723', // Chocolate Dark
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  skipButton: {
    padding: 10,
  },
  skipText: {
    color: '#D4AF37', // Gold
    fontSize: 16,
    fontWeight: '500',
  },
  slide: {
    width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFF8E1', // Cream
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 40,
  },
  description: {
    fontSize: 16,
    color: '#D7CCC8', // Light Chocolate
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
});
