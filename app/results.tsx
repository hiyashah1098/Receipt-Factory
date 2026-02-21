import {
    Button,
    GoldenTicketAnimation,
    GratuityWarningBanner,
    InstantAdvocate,
    JunkFeeBanner,
    RipOffScore,
    WarningBanner,
    WarrantyItemCard
} from '@/src/components';
import { DisputeIssue } from '@/src/services/geminiVision';
import { addDays } from '@/src/utils/dateFormatting';
import { formatCurrency } from '@/src/utils/mathSplits';
import { scheduleReturnReminder } from '@/src/utils/notifications';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TabType = 'overview' | 'fees' | 'prices' | 'warranty';

export default function ResultsScreen() {
  const params = useLocalSearchParams<{ analysis: string; imageUri: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [scheduledItems, setScheduledItems] = useState<string[]>([]);
  const [showGoldenTicket, setShowGoldenTicket] = useState(false);
  const [hasShownAnimation, setHasShownAnimation] = useState(false);

  // Parse the analysis data
  let analysis: any = null;
  try {
    analysis = params.analysis ? JSON.parse(params.analysis) : null;
  } catch (e) {
    console.error('Failed to parse analysis:', e);
  }

  if (!analysis) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color="#DC2626" />
          <Text style={styles.errorText}>Analysis data not found</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const { basic, junkFees, inflation, warranty } = analysis;

  // Calculate disputable issues for The Loompa Legal Team
  const disputeData = useMemo(() => {
    const issues: DisputeIssue[] = [];

    // Add junk fees as disputable issues
    if (junkFees?.fees?.length > 0) {
      junkFees.fees.forEach((fee: any) => {
        if (fee.isSuspicious) {
          issues.push({
            type: 'junk_fee',
            itemName: fee.name,
            amount: fee.amount,
            reason: fee.reason || 'Suspicious/hidden fee detected',
          });
        }
      });
    }

    // Add double-tip if gratuity was included
    if (junkFees?.gratuityIncluded && basic?.gratuityAmount > 0) {
      issues.push({
        type: 'double_tip',
        itemName: 'Automatic Gratuity',
        amount: basic.gratuityAmount,
        reason: 'Gratuity already included - may have been charged twice if tip was added',
      });
    }

    // Add significantly overpriced items from inflation analysis
    if (inflation?.priceComparisons?.length > 0) {
      inflation.priceComparisons.forEach((item: any) => {
        if (item.isOverpriced && item.percentageDiff > 50) {
          issues.push({
            type: 'overcharge',
            itemName: item.itemName,
            amount: item.receiptPrice - item.averagePrice,
            reason: `${item.percentageDiff.toFixed(0)}% above market average`,
          });
        }
      });
    }

    const totalDisputed = issues.reduce((sum, issue) => sum + issue.amount, 0);

    return { issues, totalDisputed };
  }, [junkFees, inflation, basic]);

  // Determine if receipt has no hidden fees (triggers Golden Ticket!)
  const isCleanReceipt = useMemo(() => {
    const noHiddenFees = !junkFees?.hasJunkFees || (junkFees?.fees?.length || 0) === 0;
    return noHiddenFees;
  }, [junkFees]);

  // Show golden ticket animation for clean receipts
  useEffect(() => {
    if (isCleanReceipt && !hasShownAnimation) {
      // Small delay to let the screen render first
      const timer = setTimeout(() => {
        setShowGoldenTicket(true);
        setHasShownAnimation(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isCleanReceipt, hasShownAnimation]);

  const handleOpenDispute = () => {
    router.push({
      pathname: '/dispute',
      params: {
        storeName: basic?.storeName || 'Unknown Store',
        storeAddress: basic?.storeAddress || '',
        purchaseDate: basic?.date || '',
        total: String(basic?.total || 0),
        issues: JSON.stringify(disputeData.issues),
      },
    });
  };

  const handleScheduleReminder = async (item: any) => {
    try {
      const deadline = item.returnDeadline
        ? new Date(item.returnDeadline)
        : addDays(new Date(), item.returnDays || 14);

      await scheduleReturnReminder(item.name, deadline, 48);
      setScheduledItems((prev) => [...prev, item.name]);
      Alert.alert('Reminder Set!', `You'll be notified 48 hours before the return deadline.`);
    } catch (error) {
      console.error('Failed to schedule reminder:', error);
      Alert.alert('Error', 'Failed to schedule reminder.');
    }
  };

  const tabs: { key: TabType; label: string; icon: string; badge?: number }[] = [
    { key: 'overview', label: 'Overview', icon: 'receipt-outline' },
    {
      key: 'fees',
      label: 'Fees',
      icon: 'warning-outline',
      badge: junkFees?.fees?.length || 0,
    },
    { key: 'prices', label: 'Prices', icon: 'trending-up-outline' },
    {
      key: 'warranty',
      label: 'Returns',
      icon: 'shield-outline',
      badge: warranty?.durableItems?.length || 0,
    },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <View>
            {/* Receipt Image */}
            {params.imageUri && (
              <View style={styles.imageContainer}>
                <Image source={{ uri: params.imageUri }} style={styles.receiptImage} />
              </View>
            )}

            {/* Store Info */}
            <View style={styles.storeCard}>
              <Text style={styles.storeName}>{basic?.storeName || 'Unknown Store'}</Text>
              {basic?.storeAddress && (
                <Text style={styles.storeAddress}>{basic.storeAddress}</Text>
              )}
              {basic?.date && <Text style={styles.storeDate}>{basic.date}</Text>}
            </View>

            {/* Warnings */}
            {junkFees?.gratuityIncluded && (
              <GratuityWarningBanner
                visible={true}
                gratuityPercentage={junkFees.gratuityPercentage || 20}
              />
            )}

            {junkFees?.hasJunkFees && (
              <JunkFeeBanner
                visible={true}
                feeCount={junkFees.fees?.length || 0}
                totalFees={
                  junkFees.fees?.reduce((sum: number, f: any) => sum + f.amount, 0) || 0
                }
              />
            )}

            {/* The Loompa Legal Team - Golden Ticket to Refund */}
            {disputeData.issues.length > 0 && (
              <InstantAdvocate
                issueCount={disputeData.issues.length}
                totalDisputed={disputeData.totalDisputed}
                onPress={handleOpenDispute}
              />
            )}

            {/* Summary */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  {formatCurrency(basic?.subtotal || 0)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax</Text>
                <Text style={styles.summaryValue}>{formatCurrency(basic?.tax || 0)}</Text>
              </View>
              {basic?.gratuityAmount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, styles.warningText]}>
                    Included Gratuity
                  </Text>
                  <Text style={[styles.summaryValue, styles.warningText]}>
                    {formatCurrency(basic.gratuityAmount)}
                  </Text>
                </View>
              )}
              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatCurrency(basic?.total || 0)}</Text>
              </View>
            </View>

            {/* Line Items */}
            <Text style={styles.sectionTitle}>Line Items</Text>
            <View style={styles.itemsCard}>
              {basic?.lineItems?.map((item: any, index: number) => (
                <View key={index} style={styles.lineItem}>
                  <View style={styles.lineItemInfo}>
                    <Text style={styles.lineItemName}>
                      {item.quantity > 1 && `${item.quantity}x `}
                      {item.name}
                    </Text>
                    {item.category && (
                      <Text style={styles.lineItemCategory}>{item.category}</Text>
                    )}
                  </View>
                  <Text style={styles.lineItemPrice}>
                    {formatCurrency(item.price * item.quantity)}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        );

      case 'fees':
        return (
          <View>
            {junkFees?.gratuityIncluded && (
              <GratuityWarningBanner
                visible={true}
                gratuityPercentage={junkFees.gratuityPercentage || 20}
              />
            )}

            {junkFees?.fees?.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>🚨 Detected Fees</Text>
                {junkFees.fees.map((fee: any, index: number) => (
                  <View
                    key={index}
                    style={[styles.feeCard, fee.isSuspicious && styles.suspiciousCard]}
                  >
                    <View style={styles.feeHeader}>
                      <Ionicons
                        name={fee.isSuspicious ? 'warning' : 'information-circle'}
                        size={24}
                        color={fee.isSuspicious ? '#F59E0B' : '#6B7280'}
                      />
                      <Text style={styles.feeName}>{fee.name}</Text>
                      <Text style={styles.feeAmount}>{formatCurrency(fee.amount)}</Text>
                    </View>
                    <Text style={styles.feeReason}>{fee.reason}</Text>
                  </View>
                ))}

                {junkFees.warnings?.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>⚠️ Warnings</Text>
                    {junkFees.warnings.map((warning: string, index: number) => (
                      <WarningBanner
                        key={index}
                        type="warning"
                        title="Warning"
                        message={warning}
                        visible={true}
                      />
                    ))}
                  </>
                )}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="checkmark-circle" size={64} color="#10B981" />
                <Text style={styles.emptyTitle}>No Hidden Fees Detected!</Text>
                <Text style={styles.emptyText}>
                  This receipt looks clean. No suspicious charges found.
                </Text>
              </View>
            )}
          </View>
        );

      case 'prices':
        return (
          <View>
            {inflation && (
              <>
                <RipOffScore
                  score={inflation.ripOffScore || 1}
                  totalOverpayment={inflation.totalOverpayment || 0}
                  assessment={inflation.overallAssessment || 'Analysis complete.'}
                />

                {inflation.priceComparisons?.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>💰 Price Comparisons</Text>
                    {inflation.priceComparisons.map((item: any, index: number) => (
                      <View
                        key={index}
                        style={[
                          styles.priceCard,
                          item.isOverpriced && styles.overpricedCard,
                        ]}
                      >
                        <View style={styles.priceHeader}>
                          <Text style={styles.priceName}>{item.itemName}</Text>
                          {item.isOverpriced && (
                            <View style={styles.overpricedBadge}>
                              <Text style={styles.overpricedText}>
                                +{item.percentageDiff.toFixed(0)}%
                              </Text>
                            </View>
                          )}
                        </View>
                        <View style={styles.priceComparison}>
                          <View style={styles.priceCol}>
                            <Text style={styles.priceLabel}>You Paid</Text>
                            <Text style={styles.priceValue}>
                              {formatCurrency(item.receiptPrice)}
                            </Text>
                          </View>
                          <Ionicons name="arrow-forward" size={20} color="#6B7280" />
                          <View style={styles.priceCol}>
                            <Text style={styles.priceLabel}>Average</Text>
                            <Text style={styles.priceAvg}>
                              {formatCurrency(item.averagePrice)}
                            </Text>
                          </View>
                        </View>
                        <Text style={styles.priceVerdict}>{item.verdict}</Text>
                      </View>
                    ))}
                  </>
                )}

                {inflation.recommendations?.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>💡 Recommendations</Text>
                    {inflation.recommendations.map((rec: string, index: number) => (
                      <View key={index} style={styles.recommendationCard}>
                        <Ionicons name="bulb" size={20} color="#F59E0B" />
                        <Text style={styles.recommendationText}>{rec}</Text>
                      </View>
                    ))}
                  </>
                )}
              </>
            )}
          </View>
        );

      case 'warranty':
        return (
          <View>
            {warranty?.hasDurableItems && warranty.durableItems?.length > 0 ? (
              <>
                {warranty.storeReturnPolicy && (
                  <View style={styles.policyCard}>
                    <Ionicons name="document-text" size={24} color="#6366F1" />
                    <View style={styles.policyContent}>
                      <Text style={styles.policyTitle}>Store Return Policy</Text>
                      <Text style={styles.policyText}>{warranty.storeReturnPolicy}</Text>
                    </View>
                  </View>
                )}

                <Text style={styles.sectionTitle}>📦 Trackable Items</Text>
                {warranty.durableItems.map((item: any, index: number) => (
                  <WarrantyItemCard
                    key={index}
                    itemName={item.name}
                    category={item.category}
                    deadline={
                      item.returnDeadline
                        ? new Date(item.returnDeadline)
                        : addDays(new Date(), item.returnDays || 14)
                    }
                    price={item.price}
                    isReturn={!item.warrantyInfo}
                    notificationScheduled={scheduledItems.includes(item.name)}
                    onScheduleNotification={() => handleScheduleReminder(item)}
                  />
                ))}

                {warranty.recommendations?.length > 0 && (
                  <>
                    <Text style={styles.sectionTitle}>💡 Tips</Text>
                    {warranty.recommendations.map((rec: string, index: number) => (
                      <View key={index} style={styles.recommendationCard}>
                        <Ionicons name="bulb" size={20} color="#F59E0B" />
                        <Text style={styles.recommendationText}>{rec}</Text>
                      </View>
                    ))}
                  </>
                )}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="cube-outline" size={64} color="#6B7280" />
                <Text style={styles.emptyTitle}>No Durable Items Found</Text>
                <Text style={styles.emptyText}>
                  This receipt doesn't contain electronics, clothing, or other items that
                  typically have return policies or warranties.
                </Text>
              </View>
            )}
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Golden Ticket Animation for clean receipts */}
      {showGoldenTicket && (
        <GoldenTicketAnimation onFinish={() => setShowGoldenTicket(false)} />
      )}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analysis Results</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.key ? '#6366F1' : '#6B7280'}
            />
            <Text
              style={[styles.tabLabel, activeTab === tab.key && styles.activeTabLabel]}
            >
              {tab.label}
            </Text>
            {tab.badge !== undefined && tab.badge > 0 && (
              <View style={styles.tabBadge}>
                <Text style={styles.tabBadgeText}>{tab.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#5D4037', // Chocolate
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF8E1', // Cream
  },
  placeholder: {
    width: 40,
  },
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    backgroundColor: '#5D4037', // Chocolate
    gap: 4,
  },
  activeTab: {
    backgroundColor: 'rgba(212, 175, 55, 0.2)', // Gold tint
    borderWidth: 1,
    borderColor: '#D4AF37', // Gold
  },
  tabLabel: {
    fontSize: 11,
    color: '#D7CCC8', // Light Chocolate
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#D4AF37', // Gold
  },
  tabBadge: {
    backgroundColor: '#E74C3C', // Candy Red
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 1,
    minWidth: 16,
    alignItems: 'center',
  },
  tabBadgeText: {
    color: '#FFF8E1', // Cream
    fontSize: 10,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  receiptImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  storeCard: {
    backgroundColor: '#5D4037', // Chocolate
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  storeName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF8E1', // Cream
  },
  storeAddress: {
    fontSize: 14,
    color: '#D7CCC8', // Light Chocolate
    marginTop: 4,
  },
  storeDate: {
    fontSize: 14,
    color: '#BCAAA4', // Lighter Chocolate
    marginTop: 4,
  },
  summaryCard: {
    backgroundColor: '#5D4037', // Chocolate
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    color: '#D7CCC8', // Light Chocolate
    fontSize: 14,
  },
  summaryValue: {
    color: '#FFF8E1', // Cream
    fontSize: 14,
    fontWeight: '500',
  },
  warningText: {
    color: '#F4D03F', // Gold Light
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#8D6E63', // Chocolate Light
    marginVertical: 8,
  },
  totalLabel: {
    color: '#FFF8E1', // Cream
    fontSize: 16,
    fontWeight: '700',
  },
  totalValue: {
    color: '#D4AF37', // Gold
    fontSize: 20,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF8E1', // Cream
    marginBottom: 12,
    marginTop: 8,
  },
  itemsCard: {
    backgroundColor: '#5D4037', // Chocolate
    borderRadius: 12,
    padding: 16,
  },
  lineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#8D6E63', // Chocolate Light
  },
  lineItemInfo: {
    flex: 1,
  },
  lineItemName: {
    color: '#FFF8E1', // Cream
    fontSize: 14,
  },
  lineItemCategory: {
    color: '#BCAAA4', // Light Chocolate
    fontSize: 12,
    marginTop: 2,
  },
  lineItemPrice: {
    color: '#FFF8E1', // Cream
    fontSize: 14,
    fontWeight: '600',
  },
  feeCard: {
    backgroundColor: '#5D4037', // Chocolate
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  suspiciousCard: {
    borderWidth: 1,
    borderColor: '#F4D03F', // Gold Light
  },
  feeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  feeName: {
    flex: 1,
    color: '#FFF8E1', // Cream
    fontSize: 16,
    fontWeight: '600',
  },
  feeAmount: {
    color: '#E74C3C', // Candy Red
    fontSize: 16,
    fontWeight: '700',
  },
  feeReason: {
    color: '#D7CCC8', // Light Chocolate
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF8E1', // Cream
  },
  emptyText: {
    fontSize: 14,
    color: '#BCAAA4', // Light Chocolate
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  priceCard: {
    backgroundColor: '#5D4037', // Chocolate
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  overpricedCard: {
    borderWidth: 1,
    borderColor: '#E74C3C', // Candy Red
  },
  priceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priceName: {
    color: '#FFF8E1', // Cream
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  overpricedBadge: {
    backgroundColor: '#E74C3C', // Candy Red
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  overpricedText: {
    color: '#FFF8E1', // Cream
    fontSize: 12,
    fontWeight: '700',
  },
  priceComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceCol: {
    alignItems: 'center',
  },
  priceLabel: {
    color: '#BCAAA4', // Light Chocolate
    fontSize: 11,
    marginBottom: 4,
  },
  priceValue: {
    color: '#E74C3C', // Candy Red
    fontSize: 18,
    fontWeight: '700',
  },
  priceAvg: {
    color: '#26A69A', // Mint Green
    fontSize: 18,
    fontWeight: '700',
  },
  priceVerdict: {
    color: '#D7CCC8', // Light Chocolate
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(212, 175, 55, 0.15)', // Gold tint
    borderRadius: 10,
    padding: 14,
    gap: 12,
    marginBottom: 8,
  },
  recommendationText: {
    flex: 1,
    color: '#D7CCC8', // Light Chocolate
    fontSize: 14,
    lineHeight: 20,
  },
  policyCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(91, 44, 111, 0.25)', // Purple tint
    borderRadius: 12,
    padding: 16,
    gap: 12,
    marginBottom: 16,
  },
  policyContent: {
    flex: 1,
  },
  policyTitle: {
    color: '#7D3C98', // Purple
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  policyText: {
    color: '#D7CCC8', // Light Chocolate
    fontSize: 13,
    lineHeight: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    padding: 40,
  },
  errorText: {
    color: '#FFF8E1', // Cream
    fontSize: 18,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});
