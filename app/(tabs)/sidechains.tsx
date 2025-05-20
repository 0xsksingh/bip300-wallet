import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { bip300Service } from '@/services/bip300';
import { SidechainInfo } from '@/types/blockchain';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Link, Stack } from 'expo-router';

export default function SidechainsScreen() {
  const colorScheme = useColorScheme();
  const [sidechains, setSidechains] = useState<SidechainInfo[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load sidechains when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadSidechains();
    }, [])
  );

  // Load sidechains from the BIP300 service
  const loadSidechains = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await bip300Service.getSidechains();
      if (response.success && response.data) {
        setSidechains(response.data);
      } else {
        setError(response.error || 'Failed to load sidechains');
      }
    } catch (err) {
      console.error('Error loading sidechains:', err);
      setError('Failed to load sidechains');
    } finally {
      setLoading(false);
    }
  };

  // Refresh the sidechains list
  const refreshSidechains = async () => {
    setRefreshing(true);
    await loadSidechains();
    setRefreshing(false);
  };

  // Handle deposit to sidechain
  const handleDeposit = (sidechain: SidechainInfo) => {
    // Navigate to deposit screen with sidechain info
    Alert.alert('Deposit', `Deposit to ${sidechain.name} (Escrow #${sidechain.escrowNumber})`);
  };

  // Handle viewing sidechain details
  const handleViewDetails = (sidechain: SidechainInfo) => {
    // Navigate to sidechain details screen
    Alert.alert('Details', `View details for ${sidechain.name} (Escrow #${sidechain.escrowNumber})`);
  };

  // Render a sidechain item
  const renderSidechainItem = ({ item }: { item: SidechainInfo }) => (
    <View style={styles.sidechainItem}>
      <View style={styles.sidechainHeader}>
        <ThemedText style={styles.sidechainName}>{item.name}</ThemedText>
        <View style={[
          styles.statusBadge,
          { backgroundColor: item.isActive ? '#4CAF50' : '#F44336' }
        ]}>
          <ThemedText style={styles.statusText}>
            {item.isActive ? 'Active' : 'Inactive'}
          </ThemedText>
        </View>
      </View>
      
      <ThemedText style={styles.sidechainId}>Escrow #{item.escrowNumber}</ThemedText>
      <ThemedText style={styles.description} numberOfLines={2}>
        {item.description}
      </ThemedText>
      
      <View style={styles.actionButtons}>
        <Pressable 
          style={[styles.actionButton, styles.primaryButton]} 
          onPress={() => handleDeposit(item)}
        >
          <FontAwesome name="chain" size={14} color="#fff" />
          <ThemedText style={styles.primaryButtonText}>Deposit</ThemedText>
        </Pressable>
        <Pressable 
          style={[styles.actionButton, styles.secondaryButton]} 
          onPress={() => handleViewDetails(item)}
        >
          <FontAwesome name="info-circle" size={14} color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText style={styles.secondaryButtonText}>Details</ThemedText>
        </Pressable>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack.Screen options={{ title: 'Sidechains', headerShown: true }} />
      
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.title}>Available Sidechains</ThemedText>
          <ThemedText style={styles.subtitle}>
            Explore and interact with BIP300 sidechains
          </ThemedText>
        </View>

        {loading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ThemedText>Loading sidechains...</ThemedText>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <Pressable style={styles.retryButton} onPress={loadSidechains}>
              <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
            </Pressable>
          </View>
        )}

        {!loading && !error && sidechains.length === 0 && (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>No sidechains available.</ThemedText>
          </View>
        )}

        {sidechains.length > 0 && (
          <FlatList
            data={sidechains}
            keyExtractor={(item) => item.escrowNumber.toString()}
            renderItem={renderSidechainItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={refreshSidechains} />
            }
          />
        )}
      </View>
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
  header: {
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  listContent: {
    padding: 16,
  },
  sidechainItem: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  sidechainHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sidechainName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  sidechainId: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    marginBottom: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
  },
  primaryButton: {
    backgroundColor: Colors.light.tint,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 6,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.light.tint,
  },
  secondaryButtonText: {
    fontWeight: '600',
    marginLeft: 6,
    color: Colors.light.tint,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#F44336',
    marginBottom: 10,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    opacity: 0.6,
    textAlign: 'center',
  },
}); 