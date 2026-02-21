import { ReceiptCard } from '@/src/components';
import { Receipt } from '@/src/services/firebaseSetup';
import { deleteAllReceipts, deleteReceipt, getUserReceipts } from '@/src/services/receiptService';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ReceiptHistoryScreen() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadReceipts = useCallback(async () => {
    try {
      const userReceipts = await getUserReceipts();
      setReceipts(userReceipts);
    } catch (error) {
      console.log('Could not load receipts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReceipts();
    }, [loadReceipts])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadReceipts();
  };

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

  const handleDeleteReceipt = (receipt: Receipt) => {
    Alert.alert(
      'Delete Receipt',
      `Are you sure you want to delete the receipt from ${receipt.storeName || 'Unknown Store'}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (receipt.id) {
                await deleteReceipt(receipt.id);
                setReceipts(prev => prev.filter(r => r.id !== receipt.id));
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to delete receipt');
            }
          },
        },
      ]
    );
  };

  const handleClearAll = () => {
    if (receipts.length === 0) {
      Alert.alert('No Receipts', 'There are no receipts to delete.');
      return;
    }

    Alert.alert(
      '🍫 Clear All Receipts?',
      `This will permanently delete all ${receipts.length} receipt${receipts.length !== 1 ? 's' : ''} from your Golden Vault. This action cannot be undone!`,
      [
        { text: 'Keep Them', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);
            try {
              const count = await deleteAllReceipts();
              setReceipts([]);
              Alert.alert('Cleared!', `${count} receipt${count !== 1 ? 's' : ''} have been removed from your vault.`);
            } catch (error) {
              Alert.alert('Error', 'Failed to clear receipts');
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF8E1" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Receipt Vault</Text>
          <Text style={styles.headerSubtitle}>Your Golden Ticket Collection 🎫</Text>
        </View>
        <TouchableOpacity onPress={handleClearAll} style={styles.clearButton} disabled={deleting}>
          <Ionicons name="trash-outline" size={22} color="#E74C3C" />
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{receipts.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            ${receipts.reduce((sum, r) => sum + (r.total || r.analysis?.basic?.total || 0), 0).toFixed(0)}
          </Text>
          <Text style={styles.statLabel}>Spent</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>
            {receipts.filter(r => r.analysis?.junkFees?.hasJunkFees).length}
          </Text>
          <Text style={styles.statLabel}>With Fees</Text>
        </View>
      </View>

      {/* Receipt List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#D4AF37"
            colors={['#D4AF37']}
          />
        }
      >
        {loading || deleting ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={styles.loadingText}>
              {deleting ? 'Clearing receipts...' : 'Loading your vault...'}
            </Text>
          </View>
        ) : receipts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="receipt-outline" size={64} color="#8D6E63" />
            <Text style={styles.emptyTitle}>No Receipts Yet</Text>
            <Text style={styles.emptyText}>
              Your golden ticket collection is empty. Scan a receipt to start finding savings!
            </Text>
            <TouchableOpacity
              style={styles.scanButton}
              onPress={() => router.push('/(tabs)/scan')}
            >
              <Ionicons name="camera" size={20} color="#3E2723" />
              <Text style={styles.scanButtonText}>Scan Receipt</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {receipts.map((receipt) => (
              <View key={receipt.id} style={styles.receiptRow}>
                <View style={styles.receiptCardContainer}>
                  <ReceiptCard
                    storeName={receipt.storeName || receipt.analysis?.basic?.storeName || 'Unknown Store'}
                    date={receipt.createdAt}
                    total={receipt.total || receipt.analysis?.basic?.total || 0}
                    itemCount={receipt.analysis?.basic?.lineItems?.length || 0}
                    hasWarnings={receipt.analysis?.junkFees?.hasJunkFees || false}
                    warningCount={receipt.analysis?.junkFees?.fees?.length || 0}
                    onPress={() => handleReceiptPress(receipt)}
                  />
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteReceipt(receipt)}
                >
                  <Ionicons name="close-circle" size={24} color="#E74C3C" />
                </TouchableOpacity>
              </View>
            ))}
            <View style={styles.bottomPadding} />
          </>
        )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#5D4037',
  },
  backButton: {
    padding: 8,
  },
  headerContent: {
    flex: 1,
    marginLeft: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFF8E1', // Cream
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#D7CCC8',
    marginTop: 2,
  },
  clearButton: {
    padding: 8,
    backgroundColor: 'rgba(231, 76, 60, 0.15)',
    borderRadius: 8,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: '#5D4037',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D4AF37', // Gold
  },
  statLabel: {
    fontSize: 12,
    color: '#D7CCC8',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#8D6E63',
    marginHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
  },
  loadingText: {
    color: '#D7CCC8',
    marginTop: 12,
    fontSize: 14,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFF8E1',
    marginTop: 16,
  },
  emptyText: {
    color: '#D7CCC8',
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#D4AF37',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 24,
    gap: 8,
  },
  scanButtonText: {
    color: '#3E2723',
    fontWeight: '600',
    fontSize: 16,
  },
  receiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  receiptCardContainer: {
    flex: 1,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 4,
  },
  bottomPadding: {
    height: 40,
  },
});
