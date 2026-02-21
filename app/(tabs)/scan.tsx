import { Button, CameraOverlay } from '@/src/components';
import { fullReceiptAnalysis } from '@/src/services/geminiVision';
import { saveReceipt } from '@/src/services/receiptService';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';
import { router } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#D4AF37" />
      </SafeAreaView>
    );
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.permissionContainer}>
          <Ionicons name="camera-outline" size={80} color="#D4AF37" />
          <Text style={styles.permissionTitle}>Camera Access Required</Text>
          <Text style={styles.permissionText}>
            We need camera access to scan your receipts and unwrap hidden fees,
            like finding golden tickets in chocolate bars!
          </Text>
          <Button
            title="Enable Camera"
            onPress={requestPermission}
            size="large"
          />
        </View>
      </SafeAreaView>
    );
  }

  const capturePhoto = async () => {
    if (!cameraRef.current || isProcessing) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });

      if (photo) {
        setCapturedImage(photo.uri);
      }
    } catch (error) {
      console.error('Error capturing photo:', error);
      Alert.alert('Error', 'Failed to capture photo. Please try again.');
    }
  };

  const processReceipt = async () => {
    if (!capturedImage) return;

    setIsProcessing(true);

    try {
      // Resize and convert to base64
      const manipulated = await ImageManipulator.manipulateAsync(
        capturedImage,
        [{ resize: { width: 1200 } }],
        { base64: true, format: ImageManipulator.SaveFormat.JPEG, compress: 0.8 }
      );

      if (!manipulated.base64) {
        throw new Error('Failed to convert image to base64');
      }

      // Analyze with Gemini
      const analysis = await fullReceiptAnalysis(manipulated.base64);

      // Save to Firebase (don't block navigation on this)
      let receiptId: string | undefined;
      try {
        receiptId = await saveReceipt(analysis, capturedImage, true);
      } catch (saveError) {
        // Silently continue - save failures don't affect the analysis
      }

      // Navigate to results with analysis data
      router.push({
        pathname: '/results' as any,
        params: {
          analysis: JSON.stringify(analysis),
          imageUri: capturedImage,
          receiptId: receiptId || '',
        },
      });
    } catch (error: any) {
      console.error('Error processing receipt:', error);
      
      // Check for rate limit error
      if (error?.message?.includes('RATE_LIMIT_EXCEEDED')) {
        Alert.alert(
          'API Quota Exceeded',
          'You\'ve reached the daily limit for receipt scans (free tier allows ~5 scans/day). Please try again tomorrow or upgrade your Gemini API plan.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Analysis Failed',
          'Could not analyze the receipt. Please ensure the image is clear and try again.'
        );
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  // Preview mode
  if (capturedImage) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.preview} />

          {isProcessing && (
            <View style={styles.processingOverlay}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={styles.processingText}>
                🔍 Analyzing receipt...
              </Text>
              <Text style={styles.processingSubtext}>
                Detecting fees, prices, and warranties
              </Text>
            </View>
          )}

          <View style={styles.previewActions}>
            <Button
              title="Retake"
              onPress={retakePhoto}
              variant="secondary"
              icon={<Ionicons name="refresh" size={20} color="#FFFFFF" />}
              disabled={isProcessing}
            />
            <Button
              title="Analyze Receipt"
              onPress={processReceipt}
              loading={isProcessing}
              icon={
                !isProcessing && (
                  <Ionicons name="scan" size={20} color="#FFFFFF" />
                )
              }
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Camera mode
  return (
    <View style={styles.cameraContainer}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        <CameraOverlay isProcessing={isProcessing} />

        <View style={styles.cameraControls}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={capturePhoto}
            disabled={isProcessing}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>

          <View style={styles.placeholder} />
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3E2723', // Chocolate Dark
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    gap: 20,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF8E1', // Cream
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    color: '#D7CCC8', // Light Chocolate
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  backButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(62, 39, 35, 0.7)', // Chocolate Dark
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFF8E1', // Cream
    padding: 4,
  },
  captureButtonInner: {
    flex: 1,
    borderRadius: 36,
    backgroundColor: '#D4AF37', // Gold
  },
  placeholder: {
    width: 50,
  },
  previewContainer: {
    flex: 1,
  },
  preview: {
    flex: 1,
    resizeMode: 'contain',
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(62, 39, 35, 0.9)', // Chocolate Dark
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  processingText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF8E1', // Cream
  },
  processingSubtext: {
    fontSize: 14,
    color: '#D7CCC8', // Light Chocolate
  },
  previewActions: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
});
