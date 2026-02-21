import { Button } from '@/src/components';
import {
    getCategoryOptions,
    ReminderCategory,
    saveReminder
} from '@/src/services/reminderService';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddReminderScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ReminderCategory>('custom');
  const [reminderDate, setReminderDate] = useState(new Date(Date.now() + 24 * 60 * 60 * 1000)); // Tomorrow
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const categoryOptions = getCategoryOptions();

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const newDate = new Date(reminderDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setReminderDate(newDate);
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      const newDate = new Date(reminderDate);
      newDate.setHours(selectedTime.getHours());
      newDate.setMinutes(selectedTime.getMinutes());
      setReminderDate(newDate);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Missing Title', 'Please enter a title for your reminder.');
      return;
    }

    if (reminderDate.getTime() <= Date.now()) {
      Alert.alert('Invalid Date', 'Please select a future date and time.');
      return;
    }

    setIsSaving(true);

    try {
      await saveReminder({
        title: title.trim(),
        description: description.trim(),
        category,
        reminderDate: reminderDate.toISOString(),
      });

      Alert.alert(
        '🎫 Golden Ticket Created!',
        "Your reminder has been set. We'll notify you when it's time!",
        [{ text: 'Wonderful!', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Error saving reminder:', error);
      Alert.alert('Error', 'Failed to save reminder. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="close" size={28} color="#FFF8E1" />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>🎫 New Golden Ticket</Text>
            <Text style={styles.headerSubtitle}>Set Your Reminder</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Title Input */}
          <View style={styles.section}>
            <Text style={styles.label}>✨ Reminder Title</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Return shoes to Nike Store"
              placeholderTextColor="#8D6E63"
              value={title}
              onChangeText={setTitle}
              maxLength={100}
            />
          </View>

          {/* Description Input */}
          <View style={styles.section}>
            <Text style={styles.label}>📝 Description (Optional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any details you want to remember..."
              placeholderTextColor="#8D6E63"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              maxLength={500}
            />
          </View>

          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>🏷️ Category</Text>
            <View style={styles.categoryGrid}>
              {categoryOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.categoryButton,
                    category === option.value && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(option.value)}
                >
                  <Text style={styles.categoryEmoji}>{option.emoji}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      category === option.value && styles.categoryLabelActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Date & Time Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>📅 Remind Me On</Text>
            <View style={styles.dateTimeRow}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowDatePicker(true)}
              >
                <Ionicons name="calendar" size={20} color="#D4AF37" />
                <Text style={styles.dateButtonText}>{formatDate(reminderDate)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowTimePicker(true)}
              >
                <Ionicons name="time" size={20} color="#D4AF37" />
                <Text style={styles.dateButtonText}>{formatTime(reminderDate)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date Picker */}
          {showDatePicker && (
            <DateTimePicker
              value={reminderDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
              themeVariant="dark"
            />
          )}

          {/* Time Picker */}
          {showTimePicker && (
            <DateTimePicker
              value={reminderDate}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleTimeChange}
              themeVariant="dark"
            />
          )}

          {/* Preview Card */}
          <View style={styles.previewSection}>
            <Text style={styles.previewTitle}>Preview</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewHeader}>
                <Text style={styles.previewEmoji}>
                  {categoryOptions.find((c) => c.value === category)?.emoji || '🎫'}
                </Text>
                <View style={styles.previewContent}>
                  <Text style={styles.previewItemTitle} numberOfLines={1}>
                    {title || 'Your reminder title'}
                  </Text>
                  <Text style={styles.previewDate}>
                    {formatDate(reminderDate)} at {formatTime(reminderDate)}
                  </Text>
                </View>
              </View>
              {description ? (
                <Text style={styles.previewDescription} numberOfLines={2}>
                  {description}
                </Text>
              ) : null}
            </View>
          </View>

          {/* Save Button */}
          <View style={styles.buttonSection}>
            <Button
              title="🎫 Create Golden Ticket"
              onPress={handleSave}
              loading={isSaving}
              size="large"
              disabled={!title.trim()}
            />
          </View>

          {/* Wonka Quote */}
          <View style={styles.quoteSection}>
            <Text style={styles.quoteText}>
              "Time is a precious thing.{'\n'}Never waste it."
            </Text>
            <Text style={styles.quoteAuthor}>— Willy Wonka</Text>
          </View>

          <View style={styles.bottomPadding} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3E2723', // Chocolate Dark
  },
  flex: {
    flex: 1,
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
    padding: 4,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#D4AF37', // Gold
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#BCAAA4',
    marginTop: 2,
  },
  headerSpacer: {
    width: 36,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFF8E1', // Cream
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#5D4037', // Chocolate
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#FFF8E1',
    borderWidth: 1,
    borderColor: '#8D6E63',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5D4037',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#8D6E63',
    gap: 6,
  },
  categoryButtonActive: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  categoryEmoji: {
    fontSize: 16,
  },
  categoryLabel: {
    fontSize: 13,
    color: '#FFF8E1',
    fontWeight: '500',
  },
  categoryLabelActive: {
    color: '#3E2723',
  },
  dateTimeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  dateButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5D4037',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8D6E63',
    gap: 10,
  },
  timeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#5D4037',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8D6E63',
    gap: 10,
    paddingHorizontal: 20,
  },
  dateButtonText: {
    fontSize: 14,
    color: '#FFF8E1',
    fontWeight: '500',
  },
  previewSection: {
    marginTop: 32,
  },
  previewTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#BCAAA4',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  previewCard: {
    backgroundColor: '#D4AF37',
    borderRadius: 16,
    padding: 16,
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  previewContent: {
    flex: 1,
  },
  previewItemTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3E2723',
  },
  previewDate: {
    fontSize: 13,
    color: '#5D4037',
    marginTop: 2,
  },
  previewDescription: {
    fontSize: 13,
    color: '#5D4037',
    marginTop: 10,
    fontStyle: 'italic',
  },
  buttonSection: {
    marginTop: 32,
  },
  quoteSection: {
    alignItems: 'center',
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#5D4037',
  },
  quoteText: {
    fontSize: 14,
    color: '#8D6E63',
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 22,
  },
  quoteAuthor: {
    fontSize: 12,
    color: '#D4AF37',
    marginTop: 8,
  },
  bottomPadding: {
    height: 40,
  },
});
