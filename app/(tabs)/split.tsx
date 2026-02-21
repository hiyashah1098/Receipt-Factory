import { BillSplitCard, Button } from '@/src/components';
import { BillSplit } from '@/src/services/firebaseSetup';
import { splitBill } from '@/src/services/geminiVision';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const TIP_OPTIONS = [0, 15, 18, 20, 25];

export default function SplitScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [instructions, setInstructions] = useState('');
  const [tipPercentage, setTipPercentage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [splitResult, setSplitResult] = useState<BillSplit | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      
      // Convert to base64
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1200 } }],
        { base64: true, format: ImageManipulator.SaveFormat.JPEG, compress: 0.8 }
      );
      setImageBase64(manipulated.base64 || null);
      setSplitResult(null);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Camera permission is required to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      
      const manipulated = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 1200 } }],
        { base64: true, format: ImageManipulator.SaveFormat.JPEG, compress: 0.8 }
      );
      setImageBase64(manipulated.base64 || null);
      setSplitResult(null);
    }
  };

  const handleSplit = async () => {
    console.log('=== HANDLE SPLIT CALLED ===');
    console.log('imageBase64 exists:', !!imageBase64);
    console.log('imageBase64 length:', imageBase64?.length || 0);
    console.log('instructions:', instructions);
    console.log('tipPercentage:', tipPercentage);
    
    if (!imageBase64) {
      Alert.alert('No Receipt', 'Please upload or take a photo of your receipt first.');
      return;
    }

    if (!instructions.trim()) {
      Alert.alert(
        'Missing Instructions',
        'Please describe how to split the bill (e.g., "Split between me, Alex, and Sam. Alex didn\'t drink alcohol.")'
      );
      return;
    }

    setIsProcessing(true);
    console.log('Starting bill split with Gemini...');

    try {
      console.log('Calling splitBill API...');
      const result = await splitBill(imageBase64, instructions, tipPercentage);
      console.log('Split result received:', JSON.stringify(result, null, 2));
      setSplitResult(result);
      Alert.alert('Success', 'Bill split calculated! Scroll down to see results.');
    } catch (error: any) {
      console.error('Error splitting bill:', error);
      console.error('Error message:', error?.message);
      Alert.alert(
        'Split Failed',
        `Could not split the bill: ${error?.message || 'Unknown error'}`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Ionicons name="people" size={32} color="#D4AF37" />
            <Text style={styles.title}>Fizzy Lifting Bill Split 🍾</Text>
            <Text style={styles.subtitle}>
              Upload a receipt and describe how to split it in plain English
            </Text>
          </View>

          {/* Image Upload */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📸 Receipt Image</Text>
            
            {imageUri ? (
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUri }} style={styles.image} />
                <View style={styles.imageActions}>
                  <Button
                    title="Change"
                    onPress={pickImage}
                    variant="ghost"
                    size="small"
                  />
                </View>
              </View>
            ) : (
              <View style={styles.uploadButtons}>
                <Button
                  title="Take Photo"
                  onPress={takePhoto}
                  variant="secondary"
                  icon={<Ionicons name="camera" size={20} color="#FFFFFF" />}
                />
                <Button
                  title="Upload"
                  onPress={pickImage}
                  variant="secondary"
                  icon={<Ionicons name="image" size={20} color="#FFFFFF" />}
                />
              </View>
            )}
          </View>

          {/* Natural Language Input */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💬 Split Instructions</Text>
            <Text style={styles.hint}>
              e.g., "Split between me, Alex, and Sam. Alex didn't drink alcohol, Sam pays for appetizers"
            </Text>
            <TextInput
              style={styles.textInput}
              placeholder="Describe how to split the bill..."
              placeholderTextColor="#6B7280"
              value={instructions}
              onChangeText={setInstructions}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Tip Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💵 Add Tip</Text>
            <View style={styles.tipOptions}>
              {TIP_OPTIONS.map((tip) => (
                <Button
                  key={tip}
                  title={tip === 0 ? 'No Tip' : `${tip}%`}
                  onPress={() => setTipPercentage(tip)}
                  variant={tipPercentage === tip ? 'primary' : 'secondary'}
                  size="small"
                />
              ))}
            </View>
          </View>

          {/* Split Button */}
          <View style={styles.section}>
            {/* Debug info */}
            <Text style={styles.debugText}>
              Image: {imageBase64 ? `✅ (${Math.round(imageBase64.length / 1024)}KB)` : '❌ No image'} | 
              Instructions: {instructions.trim() ? '✅' : '❌ Empty'}
            </Text>
            <Button
              title={isProcessing ? "Calculating..." : "Calculate Split"}
              onPress={handleSplit}
              loading={isProcessing}
              size="large"
              disabled={!imageBase64 || !instructions.trim()}
              icon={
                !isProcessing && (
                  <Ionicons name="calculator" size={20} color="#FFFFFF" />
                )
              }
            />
          </View>

          {/* Results */}
          {splitResult && (
            <View style={styles.section}>
              <BillSplitCard
                individuals={splitResult.individuals}
                total={splitResult.total}
              />
            </View>
          )}

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
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF8E1', // Cream
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#D7CCC8', // Light Chocolate
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF8E1', // Cream
    marginBottom: 12,
  },
  hint: {
    fontSize: 12,
    color: '#BCAAA4', // Light Chocolate
    marginBottom: 8,
    fontStyle: 'italic',
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  imageContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#5D4037', // Chocolate
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  imageActions: {
    padding: 8,
    alignItems: 'center',
  },
  textInput: {
    backgroundColor: '#5D4037', // Chocolate
    borderRadius: 12,
    padding: 16,
    color: '#FFF8E1', // Cream
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#8D6E63', // Chocolate Light
  },
  tipOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  debugText: {
    fontSize: 12,
    color: '#F4D03F', // Gold Light
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'monospace',
  },
  bottomPadding: {
    height: 40,
  },
});
