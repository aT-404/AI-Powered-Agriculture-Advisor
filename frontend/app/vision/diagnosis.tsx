import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Button } from '@/components/Button';
import { AnimatedCard } from '@/components/AnimatedCard';
import { colors } from '@/constants/colors';
import { useTheme } from '@/store/ThemeContext';
import { getBaseUrl } from '@/services/api';

export default function DiagnosisScreen() {
  const router = useRouter();
  const { activeColors } = useTheme();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Camera access is needed.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!res.canceled && res.assets.length > 0) {
      setImageUri(res.assets[0].uri);
      setResult(null);
    }
  };

  const handleGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Gallery access is needed.');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!res.canceled && res.assets.length > 0) {
      setImageUri(res.assets[0].uri);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!imageUri) return;
    setIsAnalyzing(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        name: 'crop_image.jpg',
        type: 'image/jpeg',
      } as any);

      const response = await fetch(`${getBaseUrl()}/api/vision/diagnose/`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to diagnose image');
      }

      const data = await response.json();
      setResult(data);
    } catch (error: any) {
      Alert.alert('Analysis Failed', error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={activeColors.textPrimary} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.title, { color: activeColors.textPrimary }]}>AI Crop Doctor</Text>
            <Text style={[styles.subtitle, { color: activeColors.textSecondary }]}>
              Take a picture of a diseased plant for instant diagnosis and treatment plan.
            </Text>
          </View>
        </View>

        <AnimatedCard delay={100}>
          <View style={[styles.uploadCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={[styles.placeholder, { backgroundColor: colors.primary.subtle }]}>
                <Ionicons name="leaf" size={64} color={colors.primary.DEFAULT} />
                <Text style={[styles.placeholderText, { color: colors.primary.DEFAULT }]}>No Image Selected</Text>
              </View>
            )}
            
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.iconBtn, { backgroundColor: activeColors.background, borderColor: activeColors.border }]} onPress={handleCamera}>
                <Ionicons name="camera" size={24} color={colors.primary.DEFAULT} />
                <Text style={[styles.iconBtnText, { color: activeColors.textPrimary }]}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.iconBtn, { backgroundColor: activeColors.background, borderColor: activeColors.border }]} onPress={handleGallery}>
                <Ionicons name="image" size={24} color={colors.primary.DEFAULT} />
                <Text style={[styles.iconBtnText, { color: activeColors.textPrimary }]}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </View>
        </AnimatedCard>

        {imageUri && !result && (
          <AnimatedCard delay={200} style={{ marginTop: 24 }}>
            <Button
              title={isAnalyzing ? "Analyzing..." : "Analyze Image"}
              onPress={handleAnalyze}
              disabled={isAnalyzing}
              style={styles.analyzeBtn}
            />
            {isAnalyzing && <ActivityIndicator size="large" color={colors.primary.DEFAULT} style={{ marginTop: 16 }} />}
          </AnimatedCard>
        )}

        {result && (
          <AnimatedCard delay={100} style={{ marginTop: 24 }}>
            <View style={[styles.resultCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
              {!result.is_crop ? (
                <View style={styles.errorState}>
                  <Ionicons name="alert-circle" size={48} color={colors.status.error} />
                  <Text style={[styles.errorTitle, { color: activeColors.textPrimary }]}>Not a Crop</Text>
                  <Text style={[styles.errorDesc, { color: activeColors.textSecondary }]}>
                    The AI could not identify a crop in this image. Please take a clear picture of the plant leaves or stem.
                  </Text>
                </View>
              ) : result.is_healthy ? (
                <View style={styles.successState}>
                  <Ionicons name="checkmark-circle" size={48} color={colors.status.success} />
                  <Text style={[styles.successTitle, { color: activeColors.textPrimary }]}>Healthy Crop!</Text>
                  <Text style={[styles.successDesc, { color: activeColors.textSecondary }]}>
                    This plant looks perfectly healthy. Keep up the good work!
                  </Text>
                </View>
              ) : (
                <View style={styles.diseaseState}>
                  <View style={styles.diseaseHeader}>
                    <Ionicons name="warning" size={28} color={colors.status.warning} />
                    <Text style={[styles.diseaseTitle, { color: activeColors.textPrimary }]}>{result.disease_name}</Text>
                  </View>
                  
                  <View style={styles.metricRow}>
                    <Text style={[styles.metricLabel, { color: activeColors.textSecondary }]}>Severity:</Text>
                    <Text style={[styles.metricValue, { color: colors.status.error }]}>{result.severity}</Text>
                  </View>
                  <View style={styles.metricRow}>
                    <Text style={[styles.metricLabel, { color: activeColors.textSecondary }]}>Confidence:</Text>
                    <Text style={[styles.metricValue, { color: activeColors.textPrimary }]}>{(result.confidence * 100).toFixed(1)}%</Text>
                  </View>
                  
                  <View style={[styles.treatmentBox, { backgroundColor: colors.status.info + '20' }]}>
                    <Text style={[styles.treatmentTitle, { color: activeColors.textPrimary }]}>Treatment Plan:</Text>
                    <Text style={[styles.treatmentText, { color: activeColors.textSecondary }]}>{result.treatment}</Text>
                  </View>
                </View>
              )}
            </View>
          </AnimatedCard>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
    paddingRight: 40,
  },
  uploadCard: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 16,
  },
  previewImage: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    marginBottom: 16,
  },
  placeholder: {
    width: '100%',
    height: 240,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  iconBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  iconBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },
  analyzeBtn: {
    height: 52,
    borderRadius: 14,
  },
  resultCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
  },
  errorState: {
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  errorDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  successState: {
    alignItems: 'center',
    padding: 20,
    gap: 12,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  successDesc: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  diseaseState: {
    gap: 16,
  },
  diseaseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  diseaseTitle: {
    fontSize: 22,
    fontWeight: '800',
    flex: 1,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  metricLabel: {
    fontSize: 15,
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  treatmentBox: {
    marginTop: 8,
    padding: 16,
    borderRadius: 12,
  },
  treatmentTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  treatmentText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
