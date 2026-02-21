import { Button } from '@/src/components';
import { DisputeIssue, DisputeMessage, generateDisputeMessage } from '@/src/services/geminiVision';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as MailComposer from 'expo-mail-composer';
import { router, useLocalSearchParams } from 'expo-router';
import * as SMS from 'expo-sms';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type MessageType = 'email' | 'sms';

export default function DisputeScreen() {
  const params = useLocalSearchParams<{
    storeName: string;
    storeAddress: string;
    purchaseDate: string;
    total: string;
    issues: string;
  }>();

  const [isLoading, setIsLoading] = useState(true);
  const [disputeMessage, setDisputeMessage] = useState<DisputeMessage | null>(null);
  const [selectedType, setSelectedType] = useState<MessageType>('email');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    generateMessage();
  }, []);

  const generateMessage = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const issues: DisputeIssue[] = JSON.parse(params.issues || '[]');
      const total = parseFloat(params.total || '0');

      const message = await generateDisputeMessage(
        params.storeName || 'Unknown Store',
        params.storeAddress || null,
        params.purchaseDate || null,
        total,
        issues
      );

      setDisputeMessage(message);
    } catch (err: any) {
      console.error('Error generating dispute:', err);
      setError(err?.message || 'Failed to generate dispute message');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!disputeMessage) return;
    
    const text = selectedType === 'email' ? disputeMessage.emailBody : disputeMessage.smsBody;
    await Clipboard.setStringAsync(text);
    Alert.alert('Copied! 🎫', 'Message copied to clipboard. Your golden ticket awaits!');
  };

  const handleSendEmail = async () => {
    if (!disputeMessage) return;

    const isAvailable = await MailComposer.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('Email Not Available', 'Email is not configured on this device. Please copy the message instead.');
      return;
    }

    await MailComposer.composeAsync({
      subject: disputeMessage.subject,
      body: disputeMessage.emailBody,
    });
  };

  const handleSendSMS = async () => {
    if (!disputeMessage) return;

    const isAvailable = await SMS.isAvailableAsync();
    if (!isAvailable) {
      Alert.alert('SMS Not Available', 'SMS is not available on this device. Please copy the message instead.');
      return;
    }

    await SMS.sendSMSAsync([], disputeMessage.smsBody);
  };

  const handleSend = () => {
    if (selectedType === 'email') {
      handleSendEmail();
    } else {
      handleSendSMS();
    }
  };

  const currentMessage = disputeMessage 
    ? (selectedType === 'email' ? disputeMessage.emailBody : disputeMessage.smsBody)
    : '';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#FFF8E1" />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🎫 The Loompa Legal Team</Text>
          <Text style={styles.headerSubtitle}>Your Golden Ticket to Justice</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={styles.loadingTitle}>Crafting Your Golden Ticket...</Text>
            <Text style={styles.loadingSubtitle}>
              Our Oompa Loompas are writing the perfect dispute message
            </Text>
          </View>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="sad-outline" size={64} color="#E74C3C" />
          <Text style={styles.errorTitle}>Scrumdiddlyumptious Error!</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button title="Try Again" onPress={generateMessage} />
        </View>
      ) : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Store Info Card */}
          <View style={styles.storeCard}>
            <Ionicons name="storefront" size={24} color="#D4AF37" />
            <View style={styles.storeInfo}>
              <Text style={styles.storeName}>{params.storeName}</Text>
              {params.storeAddress && (
                <Text style={styles.storeAddress}>{params.storeAddress}</Text>
              )}
            </View>
          </View>

          {/* Refund Amount */}
          <View style={styles.refundCard}>
            <Text style={styles.refundLabel}>Estimated Refund</Text>
            <Text style={styles.refundAmount}>
              ${disputeMessage?.estimatedRefund?.toFixed(2) || '0.00'}
            </Text>
            <Text style={styles.refundHint}>✨ Pure Imagination Money ✨</Text>
          </View>

          {/* Message Type Toggle */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, selectedType === 'email' && styles.toggleActive]}
              onPress={() => setSelectedType('email')}
            >
              <Ionicons 
                name="mail" 
                size={20} 
                color={selectedType === 'email' ? '#3E2723' : '#FFF8E1'} 
              />
              <Text style={[styles.toggleText, selectedType === 'email' && styles.toggleTextActive]}>
                Email
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, selectedType === 'sms' && styles.toggleActive]}
              onPress={() => setSelectedType('sms')}
            >
              <Ionicons 
                name="chatbubble" 
                size={20} 
                color={selectedType === 'sms' ? '#3E2723' : '#FFF8E1'} 
              />
              <Text style={[styles.toggleText, selectedType === 'sms' && styles.toggleTextActive]}>
                SMS
              </Text>
            </TouchableOpacity>
          </View>

          {/* Subject Line (email only) */}
          {selectedType === 'email' && disputeMessage?.subject && (
            <View style={styles.subjectCard}>
              <Text style={styles.subjectLabel}>Subject Line</Text>
              <Text style={styles.subjectText}>{disputeMessage.subject}</Text>
            </View>
          )}

          {/* Message Preview */}
          <View style={styles.messageCard}>
            <View style={styles.messageHeader}>
              <Text style={styles.messageLabel}>
                {selectedType === 'email' ? '📧 Email Message' : '💬 SMS Message'}
              </Text>
              <TouchableOpacity onPress={handleCopyToClipboard} style={styles.copyButton}>
                <Ionicons name="copy-outline" size={18} color="#D4AF37" />
                <Text style={styles.copyText}>Copy</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.messageText}>{currentMessage}</Text>
          </View>

          {/* Legal References */}
          {disputeMessage?.legalReferences && disputeMessage.legalReferences.length > 0 && (
            <View style={styles.legalCard}>
              <Text style={styles.legalTitle}>⚖️ Consumer Protection References</Text>
              {disputeMessage.legalReferences.map((ref, index) => (
                <View key={index} style={styles.legalItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#26A69A" />
                  <Text style={styles.legalText}>{ref}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              title={selectedType === 'email' ? '📧 Send Email' : '💬 Send SMS'}
              onPress={handleSend}
              size="large"
            />
            <Button
              title="📋 Copy to Clipboard"
              onPress={handleCopyToClipboard}
              variant="secondary"
              size="large"
            />
            <Button
              title="🔄 Regenerate Message"
              onPress={generateMessage}
              variant="ghost"
            />
          </View>

          {/* Wonka Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              "A little nonsense now and then{'\n'}is relished by the wisest men."
            </Text>
            <Text style={styles.footerAuthor}>— Willy Wonka</Text>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
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
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#5D4037',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#D4AF37', // Gold
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#BCAAA4',
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingCard: {
    backgroundColor: '#5D4037',
    borderRadius: 20,
    padding: 40,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
  },
  loadingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFF8E1',
    marginTop: 20,
    textAlign: 'center',
  },
  loadingSubtitle: {
    fontSize: 14,
    color: '#BCAAA4',
    marginTop: 8,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#E74C3C',
  },
  errorText: {
    fontSize: 14,
    color: '#BCAAA4',
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5D4037',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    gap: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFF8E1',
  },
  storeAddress: {
    fontSize: 13,
    color: '#BCAAA4',
    marginTop: 2,
  },
  refundCard: {
    backgroundColor: '#D4AF37',
    borderRadius: 16,
    padding: 24,
    marginTop: 16,
    alignItems: 'center',
  },
  refundLabel: {
    fontSize: 14,
    color: '#5D4037',
    fontWeight: '600',
  },
  refundAmount: {
    fontSize: 40,
    fontWeight: '800',
    color: '#3E2723',
    marginVertical: 8,
  },
  refundHint: {
    fontSize: 12,
    color: '#5D4037',
    fontStyle: 'italic',
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#5D4037',
    borderRadius: 12,
    padding: 4,
    marginTop: 16,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  toggleActive: {
    backgroundColor: '#D4AF37',
  },
  toggleText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF8E1',
  },
  toggleTextActive: {
    color: '#3E2723',
  },
  subjectCard: {
    backgroundColor: '#5D4037',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  subjectLabel: {
    fontSize: 12,
    color: '#D4AF37',
    fontWeight: '600',
    marginBottom: 6,
  },
  subjectText: {
    fontSize: 15,
    color: '#FFF8E1',
    fontWeight: '500',
  },
  messageCard: {
    backgroundColor: '#5D4037',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  messageLabel: {
    fontSize: 14,
    color: '#D4AF37',
    fontWeight: '600',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
  },
  copyText: {
    fontSize: 13,
    color: '#D4AF37',
  },
  messageText: {
    fontSize: 14,
    color: '#FFF8E1',
    lineHeight: 22,
  },
  legalCard: {
    backgroundColor: 'rgba(38, 166, 154, 0.15)',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#26A69A',
  },
  legalTitle: {
    fontSize: 14,
    color: '#26A69A',
    fontWeight: '600',
    marginBottom: 12,
  },
  legalItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  legalText: {
    flex: 1,
    fontSize: 13,
    color: '#FFF8E1',
    lineHeight: 18,
  },
  actionButtons: {
    marginTop: 24,
    gap: 12,
  },
  footer: {
    alignItems: 'center',
    marginTop: 32,
    paddingVertical: 24,
    borderTopWidth: 1,
    borderTopColor: '#5D4037',
  },
  footerText: {
    fontSize: 14,
    color: '#8D6E63',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  footerAuthor: {
    fontSize: 12,
    color: '#D4AF37',
    marginTop: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
