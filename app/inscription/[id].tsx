import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack, useLocalSearchParams } from 'expo-router';
import { rebarLabsService } from '@/services/rebarLabs';
import { Inscription } from '@/types/rebarLabs';

// FontAwesome icon names used in this component
type IconName = 'image' | 'file-text-o' | 'film' | 'music' | 'file-o';

export default function InscriptionDetailScreen() {
  const colorScheme = useColorScheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [inscription, setInscription] = useState<Inscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadInscription();
  }, [id]);

  const loadInscription = async () => {
    setLoading(true);
    setError(null);

    try {
      if (!id) {
        setError('Inscription ID is required');
        setLoading(false);
        return;
      }

      const response = await rebarLabsService.getInscription(id);
      
      if (response.success && response.data) {
        setInscription(response.data);
      } else {
        setError(response.error || 'Failed to load inscription');
      }
    } catch (err) {
      console.error('Error loading inscription:', err);
      setError('Failed to load inscription');
    } finally {
      setLoading(false);
    }
  };

  // Get icon for MIME type
  const getIconForMimeType = (mimeType: string): IconName => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('text/')) return 'file-text-o';
    if (mimeType.startsWith('video/')) return 'film';
    if (mimeType.startsWith('audio/')) return 'music';
    return 'file-o';
  };

  // Get color for rarity
  const getRarityColor = (rarity: string): string => {
    switch (rarity) {
      case 'common':
        return '#6c757d';
      case 'uncommon':
        return '#28a745';
      case 'rare':
        return '#007bff';
      case 'epic':
        return '#6f42c1';
      case 'legendary':
        return '#ffc107';
      case 'mythic':
        return '#dc3545';
      default:
        return '#6c757d';
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack.Screen options={{ title: 'Inscription Details', headerShown: true }} />
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText style={styles.loadingText}>Loading inscription...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !inscription) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <Stack.Screen options={{ title: 'Inscription Details', headerShown: true }} />
        
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-triangle" size={48} color="#F44336" />
          <ThemedText style={styles.errorText}>{error || 'Inscription not found'}</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack.Screen options={{ title: `Inscription #${inscription.number}`, headerShown: true }} />
      
      <ScrollView style={styles.container}>
        {/* Content Preview */}
        <View style={styles.contentContainer}>
          {inscription.mime_type.startsWith('image/') ? (
            <Image
              source={{ uri: `https://api.rebarlabs.io/ordinals/v1/inscriptions/${inscription.id}/content` }}
              style={styles.contentImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.contentPlaceholder}>
              <FontAwesome
                name={getIconForMimeType(inscription.mime_type)}
                size={64}
                color={Colors[colorScheme ?? 'light'].text}
              />
              <ThemedText style={styles.mimeTypeText}>{inscription.mime_type}</ThemedText>
            </View>
          )}
        </View>

        {/* Inscription Details */}
        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Inscription ID:</ThemedText>
            <ThemedText style={styles.detailValue}>{inscription.id.substring(0, 20)}...</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Number:</ThemedText>
            <ThemedText style={styles.detailValue}>#{inscription.number}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Current Owner:</ThemedText>
            <ThemedText style={styles.detailValue}>{inscription.address.substring(0, 16)}...</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Genesis Address:</ThemedText>
            <ThemedText style={styles.detailValue}>{inscription.genesis_address.substring(0, 16)}...</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Sat Ordinal:</ThemedText>
            <ThemedText style={styles.detailValue}>{inscription.sat_ordinal}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Rarity:</ThemedText>
            <ThemedText style={[styles.detailValue, { color: getRarityColor(inscription.sat_rarity) }]}>
              {inscription.sat_rarity}
            </ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Timestamp:</ThemedText>
            <ThemedText style={styles.detailValue}>
              {new Date(inscription.timestamp).toLocaleString()}
            </ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Content Type:</ThemedText>
            <ThemedText style={styles.detailValue}>{inscription.content_type}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Content Size:</ThemedText>
            <ThemedText style={styles.detailValue}>
              {Math.round(inscription.content_length / 1024 * 100) / 100} KB
            </ThemedText>
          </View>

          {inscription.meta_protocol && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Protocol:</ThemedText>
              <ThemedText style={styles.detailValue}>{inscription.meta_protocol}</ThemedText>
            </View>
          )}

          {inscription.curse_type && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Curse Type:</ThemedText>
              <ThemedText style={styles.detailValue}>{inscription.curse_type}</ThemedText>
            </View>
          )}

          {inscription.recursive && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Recursive:</ThemedText>
              <ThemedText style={styles.detailValue}>Yes</ThemedText>
            </View>
          )}

          {inscription.charms && inscription.charms.length > 0 && (
            <View style={styles.detailRow}>
              <ThemedText style={styles.detailLabel}>Charms:</ThemedText>
              <ThemedText style={styles.detailValue}>{inscription.charms.join(', ')}</ThemedText>
            </View>
          )}
        </View>

        {/* Transaction Info */}
        <View style={styles.sectionContainer}>
          <ThemedText style={styles.sectionTitle}>Transaction Information</ThemedText>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Genesis Transaction:</ThemedText>
            <ThemedText style={styles.detailValue}>{inscription.genesis_tx_id.substring(0, 16)}...</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Genesis Block:</ThemedText>
            <ThemedText style={styles.detailValue}>#{inscription.genesis_block_height}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Current Output:</ThemedText>
            <ThemedText style={styles.detailValue}>{inscription.output}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Value:</ThemedText>
            <ThemedText style={styles.detailValue}>{inscription.value} sats</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.detailLabel}>Offset:</ThemedText>
            <ThemedText style={styles.detailValue}>{inscription.offset}</ThemedText>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 8,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  errorText: {
    color: '#F44336',
    marginTop: 16,
    textAlign: 'center',
  },
  contentContainer: {
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  contentImage: {
    width: '100%',
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  contentPlaceholder: {
    width: '100%',
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  mimeTypeText: {
    marginTop: 8,
    fontSize: 14,
    opacity: 0.6,
  },
  detailsContainer: {
    padding: 16,
  },
  sectionContainer: {
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#ccc',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
}); 