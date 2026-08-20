import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentUserLocation, UserLocationResult } from '@/utils/location';
import { useTheme } from '@/store/ThemeContext';

interface FetchLocationButtonProps {
  onLocationFetched: (location: UserLocationResult) => void;
}

export const FetchLocationButton: React.FC<FetchLocationButtonProps> = ({ onLocationFetched }) => {
  const { activeColors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [activeLocationName, setActiveLocationName] = useState<string | null>(null);

  const handleFetch = async () => {
    try {
      setLoading(true);
      const res = await getCurrentUserLocation();
      const name = res.city || res.region || `${res.latitude.toFixed(2)}, ${res.longitude.toFixed(2)}`;
      setActiveLocationName(name);
      onLocationFetched(res);
    } catch (err: any) {
      console.warn('Fetch location failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: activeColors.primarySubtle,
          borderColor: activeColors.primary,
        },
      ]}
      onPress={handleFetch}
      disabled={loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator size="small" color={activeColors.primary} />
      ) : (
        <Ionicons name="location-outline" size={14} color={activeColors.primary} />
      )}
      <Text style={[styles.text, { color: activeColors.primary }]}>
        {loading ? 'Locating...' : activeLocationName ? activeLocationName : 'Use My Location'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  text: {
    fontSize: 12,
    fontWeight: '700',
  },
});

export default FetchLocationButton;
