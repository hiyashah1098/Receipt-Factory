import { LogoIcon, ReceiptCard } from '@/src/components';
import { Receipt } from '@/src/services/firebaseSetup';
import { getUserReceipts } from '@/src/services/receiptService';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Demo recent scans
const DEMO_RECEIPTS = [
  {
    id: '1',
    storeName: 'Whole Foods Market',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    total: 87.43,
    itemCount: 12,
    hasWarnings: true,
    warningCount: 2,
  },
  {
    id: '2',
    storeName: 'The Cheesecake Factory',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    total: 156.89,
    itemCount: 8,
    hasWarnings: true,
    warningCount: 1,
  },
  {
    id: '3',
    storeName: 'Target',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    total: 234.56,
    itemCount: 15,
    hasWarnings: false,
    warningCount: 0,
  },
];

const FEATURES = [
  {
    icon: 'scan',
    title: 'Golden Scan',
    description: 'Find your savings ticket',
    route: '/scan' as const,
    color: '#D4AF37', // Gold
  },
  {
    icon: 'people',
    title: 'Fizzy Split',
    description: 'Lift the math burden',
    route: '/split' as const,
    color: '#26A69A', // Mint
  },
  {
    icon: 'notifications',
    title: 'Wonkavision',
    description: 'See deadlines ahead',
    route: '/alerts' as const,
    color: '#5B2C6F', // Purple
  },
];

export default function HomeScreen() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  const loadReceipts = useCallback(async () => {
    try {
      const userReceipts = await getUserReceipts();
      setReceipts(userReceipts);
    } catch (error) {
      // User might not be logged in, show demo data
      console.log('Could not load receipts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReceipts();
    }, [loadReceipts])
  );

  const handleReceiptPress = (receipt: Receipt) => {
    if (receipt.analysis) {
      router.push({
        pathname: '/results',
        params: {
          analysis: JSON.stringify(receipt.analysis),
          imageUri: receipt.imageUrl || '',
        },
      });
    }
  };

  // Convert demo receipts to Receipt format
  const demoReceiptsFormatted = DEMO_RECEIPTS.map(demo => ({
    id: demo.id,
    userId: 'demo',
    imageUrl: '',
    createdAt: demo.date,
    storeName: demo.storeName,
    total: demo.total,
    analysis: {
      basic: {
        storeName: demo.storeName,
        storeAddress: '123 Demo Street',
        date: demo.date.toISOString().split('T')[0],
        total: demo.total,
        subtotal: demo.total * 0.9,
        tax: demo.total * 0.08,
        lineItems: [
          { name: 'Item 1', price: demo.total * 0.3, quantity: 1, category: 'General' },
          { name: 'Item 2', price: demo.total * 0.25, quantity: 1, category: 'General' },
          { name: 'Item 3', price: demo.total * 0.15, quantity: 2, category: 'General' },
        ],
        serviceFees: [],
        durableItems: [],
        gratuityIncluded: false,
        ripOffScore: demo.hasWarnings ? 45 : 15,
        gratuityAmount: 0,
      },
      junkFees: {
        hasJunkFees: demo.hasWarnings,
        gratuityIncluded: false,
        gratuityPercentage: null,
        fees: demo.hasWarnings ? [{ name: 'Service Fee', amount: 3.99, isSuspicious: true, reason: 'Hidden fee' }] : [],
        warnings: demo.hasWarnings ? ['Suspicious fee detected'] : [],
      },
      inflation: {
        ripOffScore: demo.hasWarnings ? 45 : 15,
        overallAssessment: demo.hasWarnings ? 'Some items appear overpriced' : 'Prices are reasonable',
        priceComparisons: [],
      },
      warranty: {
        durableItems: [],
        recommendations: [],
      },
    },
  } as Receipt));

  // Show real receipts first, then demo receipts as examples
  const displayReceipts = useMemo(() => [...receipts, ...demoReceiptsFormatted], [receipts]);

  // Calculate dynamic stats from all receipts (including demo)
  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let savedThisMonth = 0;
    let hiddenFeesFound = 0;
    let returnDeadlines = 0;
    
    displayReceipts.forEach(receipt => {
      const analysis = receipt.analysis;
      if (!analysis) return;
      
      // Check if receipt is from this month
      const receiptDate = receipt.createdAt instanceof Date ? receipt.createdAt : new Date(receipt.createdAt);
      const isThisMonth = receiptDate >= startOfMonth;
      
      // Count hidden/suspicious fees
      if (analysis.junkFees?.fees) {
        const suspiciousFees = analysis.junkFees.fees.filter(fee => fee.isSuspicious);
        hiddenFeesFound += suspiciousFees.length;
        
        // Add suspicious fee amounts to savings (fees you now know about)
        if (isThisMonth) {
          suspiciousFees.forEach(fee => {
            savedThisMonth += fee.amount || 0;
          });
        }
      }
      
      // Add overpayment detection to savings awareness
      if (analysis.inflation?.totalOverpayment && isThisMonth) {
        savedThisMonth += analysis.inflation.totalOverpayment;
      }
      
      // Count active return deadlines
      if (analysis.warranty?.durableItems) {
        analysis.warranty.durableItems.forEach(item => {
          if (item.returnDeadline) {
            const deadline = new Date(item.returnDeadline);
            if (deadline > now) {
              returnDeadlines++;
            }
          }
        });
      }
    });
    
    return {
      savedThisMonth: Math.round(savedThisMonth),
      hiddenFeesFound,
      returnDeadlines,
    };
  }, [displayReceipts]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Receipt Factory</Text>
            <Text style={styles.tagline}>
              Your Golden Ticket to Savings 💰
            </Text>
          </View>
          <View style={styles.logo}>
            <LogoIcon size={56} />
          </View>
        </View>

        {/* Quick Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>${stats.savedThisMonth}</Text>
            <Text style={styles.statLabel}>Saved this month</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.hiddenFeesFound}</Text>
            <Text style={styles.statLabel}>Hidden fees found</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{stats.returnDeadlines}</Text>
            <Text style={styles.statLabel}>Return deadlines</Text>
          </View>
        </View>

        {/* Main CTA */}
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            style={styles.mainCta}
            onPress={() => router.push('/(tabs)/scan')}
            activeOpacity={0.8}
          >
            <View style={styles.ctaIcon}>
              <Ionicons name="camera" size={32} color="#3E2723" />
            </View>
            <View style={styles.ctaContent}>
              <Text style={styles.ctaTitle}>Scan a Receipt</Text>
              <Text style={styles.ctaDescription}>
                Unwrap hidden fees like a chocolate bar surprise
              </Text>
            </View>
            <Ionicons name="arrow-forward" size={24} color="#D4AF37" />
          </TouchableOpacity>
        </View>

        {/* Feature Grid */}
        <Text style={styles.sectionTitle}>Features</Text>
        <View style={styles.featureGrid}>
          {FEATURES.map((feature) => (
            <TouchableOpacity
              key={feature.title}
              style={styles.featureCard}
              onPress={() => router.push(feature.route)}
              activeOpacity={0.8}
            >
              <View style={[styles.featureIcon, { backgroundColor: feature.color }]}>
                <Ionicons name={feature.icon as any} size={24} color="#FFFFFF" />
              </View>
              <Text style={styles.featureTitle}>{feature.title}</Text>
              <Text style={styles.featureDescription}>{feature.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Scans */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitleInline}>Recent Scans</Text>
          {displayReceipts.length > 0 && (
            <TouchableOpacity onPress={() => router.push('/receipt-history')} style={styles.viewAllButton}>
              <Text style={styles.viewAllText}>View All</Text>
              <Ionicons name="chevron-forward" size={16} color="#D4AF37" />
            </TouchableOpacity>
          )}
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#D4AF37" />
            <Text style={styles.loadingText}>Loading receipts...</Text>
          </View>
        ) : displayReceipts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={48} color="#8D6E63" />
            <Text style={styles.emptyText}>No receipts yet. Scan your first golden ticket!</Text>
          </View>
        ) : (
          displayReceipts.slice(0, 8).map((receipt) => (
            <ReceiptCard
              key={receipt.id}
              storeName={receipt.storeName || receipt.analysis?.basic?.storeName || 'Unknown Store'}
              date={receipt.createdAt}
              total={receipt.total || receipt.analysis?.basic?.total || 0}
              itemCount={receipt.analysis?.basic?.lineItems?.length || 0}
              hasWarnings={receipt.analysis?.junkFees?.hasJunkFees || false}
              warningCount={receipt.analysis?.junkFees?.fees?.length || 0}
              onPress={() => handleReceiptPress(receipt)}
            />
          ))
        )}

        {/* App Info */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>🍫 Sweet Savings Await</Text>
          <Text style={styles.infoText}>
            Like a golden ticket in a chocolate bar, savings are hidden everywhere! 
            We help you find them while keeping your data as safe as Wonka's secret recipes.
          </Text>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFF8E1', // Cream
  },
  tagline: {
    fontSize: 14,
    color: '#D7CCC8', // Light Chocolate
    marginTop: 4,
  },
  logo: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 28,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#5D4037', // Chocolate
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#D4AF37', // Gold
  },
  statLabel: {
    fontSize: 11,
    color: '#D7CCC8', // Light Chocolate
    marginTop: 4,
    textAlign: 'center',
  },
  ctaContainer: {
    marginBottom: 24,
  },
  mainCta: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5D4037', // Chocolate
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#D4AF37', // Gold border
  },
  ctaIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#D4AF37', // Gold
    justifyContent: 'center',
    alignItems: 'center',
  },
  ctaContent: {
    flex: 1,
    marginLeft: 16,
  },
  ctaTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF8E1', // Cream
  },
  ctaDescription: {
    fontSize: 13,
    color: '#D7CCC8', // Light Chocolate
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF8E1', // Cream
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitleInline: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF8E1', // Cream
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#D4AF37', // Gold
    fontWeight: '600',
  },
  featureGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    flex: 1,
    backgroundColor: '#5D4037', // Chocolate
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFF8E1', // Cream
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 11,
    color: '#D7CCC8', // Light Chocolate
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: 'rgba(212, 175, 55, 0.15)', // Gold tint
    borderRadius: 16,
    padding: 20,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(212, 175, 55, 0.4)', // Gold border
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF8E1', // Cream
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#D7CCC8', // Light Chocolate
    lineHeight: 20,
  },
  loadingContainer: {
    padding: 32,
    alignItems: 'center',
  },
  loadingText: {
    color: '#D7CCC8',
    marginTop: 8,
    fontSize: 14,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#5D4037',
    borderRadius: 16,
    marginBottom: 16,
  },
  emptyText: {
    color: '#D7CCC8',
    marginTop: 12,
    fontSize: 14,
    textAlign: 'center',
  },
  bottomPadding: {
    height: 40,
  },
});
