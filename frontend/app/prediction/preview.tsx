import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/Button';
import { AnimatedCard } from '@/components/AnimatedCard';
import { colors } from '@/constants/colors';
import { useTheme } from '@/store/ThemeContext';

export default function PreviewScreen() {
  const router = useRouter();
  const { activeColors } = useTheme();
  const { imageUri, fileName, fileType, source } = useLocalSearchParams<{
    imageUri?: string;
    fileName?: string;
    fileType?: string;
    source?: string;
  }>();

  const isPdf = fileType === 'pdf' || fileName?.endsWith('.pdf');

  const handleAnalyze = () => {
    router.push({
      pathname: '/prediction/analyzing',
      params: { imageUri, fileName, fileType, source },
    } as any);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: activeColors.background }]} edges={['bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <AnimatedCard delay={60}>
          <View style={styles.header}>
            <Text style={[styles.headerBadge, { color: colors.primary.DEFAULT }]}>STEP 1 OF 3</Text>
            <Text style={[styles.title, { color: activeColors.textPrimary }]}>Soil Report Preview</Text>
            <Text style={[styles.subtitle, { color: activeColors.textSecondary }]}>
              Verify your soil test report document before AI analysis
            </Text>
          </View>
        </AnimatedCard>

        {/* Document/Image Preview Card */}
        <AnimatedCard delay={120}>
          <View style={[styles.previewCard, { backgroundColor: activeColors.card, borderColor: activeColors.border }]}>
            {imageUri && !isPdf ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={[styles.pdfPlaceholder, { backgroundColor: colors.primary.subtle }]}>
                <Ionicons name="document-text" size={64} color={colors.primary.DEFAULT} />
                <Text style={[styles.pdfText, { color: colors.primary.DEFAULT }]}>PDF Soil Test Report</Text>
              </View>
            )}

            <View style={styles.fileDetailsRow}>
              <View style={styles.fileIconWrap}>
                <Ionicons name={isPdf ? 'document-attach' : 'image'} size={20} color={colors.primary.DEFAULT} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.fileName, { color: activeColors.textPrimary }]} numberOfLines={1}>
                  {fileName || 'Soil_Test_Report.jpg'}
                </Text>
                <Text style={[styles.fileMeta, { color: activeColors.textSecondary }]}>
                  {source === 'camera' ? 'Camera Scan' : 'Uploaded File'} • Ready for OCR Scan
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: colors.primary.subtle }]}>
                <Ionicons name="checkmark-circle" size={14} color={colors.primary.DEFAULT} />
                <Text style={[styles.statusText, { color: colors.primary.DEFAULT }]}>Valid</Text>
              </View>
            </View>
          </View>
        </AnimatedCard>

        {/* Change / Retake Actions */}
        <AnimatedCard delay={180}>
          <TouchableOpacity
            style={[styles.reselectBtn, { borderColor: activeColors.border }]}
            onPress={() => router.back()}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={18} color={activeColors.textPrimary} />
            <Text style={[styles.reselectText, { color: activeColors.textPrimary }]}>Choose Different File</Text>
          </TouchableOpacity>
        </AnimatedCard>

        {/* Primary CTA */}
        <AnimatedCard delay={240} style={{ marginBottom: 28 }}>
          <Button
            title="Analyze Report →"
            onPress={handleAnalyze}
            style={styles.analyzeBtn}
          />
        </AnimatedCard>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 10,
  },
  header: {
    marginBottom: 18,
  },
  headerBadge: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  previewCard: {
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  previewImage: {
    width: '100%',
    height: 240,
  },
  pdfPlaceholder: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  pdfText: {
    fontSize: 15,
    fontWeight: '700',
  },
  fileDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  fileIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary.subtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileName: {
    fontSize: 14,
    fontWeight: '700',
  },
  fileMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  reselectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 20,
  },
  reselectText: {
    fontSize: 14,
    fontWeight: '600',
  },
  analyzeBtn: {
    height: 52,
    borderRadius: 14,
  },
});
