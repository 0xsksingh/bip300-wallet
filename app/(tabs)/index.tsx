import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, ScrollView, StyleSheet, View, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { walletService } from '@/services/wallet';
import { rebarLabsService } from '@/services/rebarLabs';
import { WalletAccount } from '@/types/blockchain';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Link, Stack } from 'expo-router';

export default function WalletScreen() {
  const colorScheme = useColorScheme();
  const [activeWallet, setActiveWallet] = useState<WalletAccount | undefined>();
  const [refreshing, setRefreshing] = useState(false);
  const [inscriptionCount, setInscriptionCount] = useState(0);
  const [brc20Count, setBrc20Count] = useState(0);
  const [runeCount, setRuneCount] = useState(0);
  const [loadingAssets, setLoadingAssets] = useState(false);

  // Load the active wallet when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadActiveWallet();
      loadBitcoinAssets();
    }, [])
  );

  // Load the active wallet from the wallet service
  const loadActiveWallet = async () => {
    const wallet = walletService.getActiveWallet();
    setActiveWallet(wallet);
  };

  // Load Bitcoin-native assets from Rebar Labs API
  const loadBitcoinAssets = async () => {
    setLoadingAssets(true);
    
    try {
      // For demo purposes, we'll use a mock address
      // In a real implementation, we would get the address from the wallet
      const mockAddress = 'bc1p8aq8s3z9xl87e74twfk93mljxq6alv4a79yheadx33t9np4g2wkqqt8kc5';
      
      // Get inscriptions count
      const inscriptionsResponse = await rebarLabsService.getInscriptions({
        address: [mockAddress],
        limit: 1,
      });
      
      if (inscriptionsResponse.success && inscriptionsResponse.data) {
        setInscriptionCount(inscriptionsResponse.data.total);
      }
      
      // Get BRC-20 balances count
      const brc20Response = await rebarLabsService.getBRC20Balances(mockAddress, { limit: 1 });
      
      if (brc20Response.success && brc20Response.data) {
        setBrc20Count(brc20Response.data.total);
      }
      
      // Get Runes count (simplified)
      // In a real implementation, we'd need to query balances for specific runes
      setRuneCount(2); // Mock count for demo purposes
    } catch (error) {
      console.error('Error loading Bitcoin assets:', error);
    } finally {
      setLoadingAssets(false);
    }
  };

  // Refresh the wallet balances
  const refreshWallet = async () => {
    setRefreshing(true);
    try {
      await walletService.updateBalances();
      await loadActiveWallet();
      await loadBitcoinAssets();
    } catch (error) {
      console.error('Error refreshing wallet:', error);
      Alert.alert('Error', 'Failed to refresh wallet');
    } finally {
      setRefreshing(false);
    }
  };

  // Format a balance for display
  const formatBalance = (balance: number): string => {
    return balance.toFixed(8);
  };

  // Get the total sidechain balance
  const getTotalSidechainBalance = (): number => {
    if (!activeWallet || !activeWallet.sidechainBalances) return 0;
    
    return Object.values(activeWallet.sidechainBalances).reduce(
      (total, balance) => total + balance.total,
      0
    );
  };

  // Get the total balance (main chain + sidechains)
  const getTotalBalance = (): number => {
    if (!activeWallet) return 0;
    
    return activeWallet.balance.total + getTotalSidechainBalance();
  };

  // Generate a list of sidechains with balances
  const getSidechainList = () => {
    if (!activeWallet || !activeWallet.sidechainBalances) return [];
    
    return Object.entries(activeWallet.sidechainBalances).map(([id, balance]) => ({
      id,
      balance: balance.total,
      name: getSidechainName(parseInt(id)),
    }));
  };

  // Get a sidechain name based on its ID
  const getSidechainName = (id: number): string => {
    switch (id) {
      case 0:
        return 'BitNames';
      case 1:
        return 'BitAssets';
      case 2:
        return 'zSide';
      case 3:
        return 'Thunder';
      default:
        return `Sidechain #${id}`;
    }
  };

  // Handle sending BTC
  const handleSend = () => {
    // Navigate to send screen
    Alert.alert('Send', 'Send screen not implemented yet');
  };

  // Handle receiving BTC
  const handleReceive = () => {
    // Navigate to receive screen
    Alert.alert('Receive', 'Receive screen not implemented yet');
  };

  if (!activeWallet) {
  return (
      <ThemedView style={styles.container}>
        <ThemedText style={styles.title}>No Wallet Available</ThemedText>
        <ThemedText style={styles.description}>
          Please create or restore a wallet to continue.
        </ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack.Screen options={{ title: 'Wallet', headerShown: true }} />
      
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={refreshWallet} />
        }
      >
        {/* Wallet Header */}
        <View style={styles.walletHeader}>
          <ThemedText style={styles.walletName}>{activeWallet.name}</ThemedText>
          <ThemedText style={styles.totalBalance}>
            {formatBalance(getTotalBalance())} BTC
          </ThemedText>
          <ThemedText style={styles.subBalance}>
            Main Chain: {formatBalance(activeWallet.balance.total)} BTC
          </ThemedText>
          <ThemedText style={styles.subBalance}>
            Sidechains: {formatBalance(getTotalSidechainBalance())} BTC
          </ThemedText>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <Pressable style={styles.actionButton} onPress={handleSend}>
            <FontAwesome
              name="arrow-up"
              size={20}
              color={Colors[colorScheme ?? 'light'].tint}
            />
            <ThemedText style={styles.actionButtonText}>Send</ThemedText>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={handleReceive}>
            <FontAwesome
              name="arrow-down"
              size={20}
              color={Colors[colorScheme ?? 'light'].tint}
            />
            <ThemedText style={styles.actionButtonText}>Receive</ThemedText>
          </Pressable>
          <Link href="/deposit" asChild>
            <Pressable style={styles.actionButton}>
              <FontAwesome
                name="chain"
                size={20}
                color={Colors[colorScheme ?? 'light'].tint}
              />
              <ThemedText style={styles.actionButtonText}>Deposit</ThemedText>
            </Pressable>
          </Link>
        </View>

        {/* Bitcoin-Native Assets */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Bitcoin Assets</ThemedText>
          <View style={styles.bitcoinAssetsContainer}>
            <Link href="/(tabs)/ordinals?tab=ordinals" asChild>
              <Pressable style={styles.assetCard}>
                <FontAwesome
                  name="diamond"
                  size={24}
                  color={Colors[colorScheme ?? 'light'].tint}
                />
                <ThemedText style={styles.assetCount}>{inscriptionCount}</ThemedText>
                <ThemedText style={styles.assetType}>Ordinals</ThemedText>
              </Pressable>
            </Link>
            
            <Link href="/(tabs)/ordinals?tab=brc20" asChild>
              <Pressable style={styles.assetCard}>
                <FontAwesome
                  name="money"
                  size={24}
                  color={Colors[colorScheme ?? 'light'].tint}
                />
                <ThemedText style={styles.assetCount}>{brc20Count}</ThemedText>
                <ThemedText style={styles.assetType}>BRC-20s</ThemedText>
              </Pressable>
            </Link>
            
            <Link href="/(tabs)/ordinals?tab=runes" asChild>
              <Pressable style={styles.assetCard}>
                <FontAwesome
                  name="certificate"
                  size={24}
                  color={Colors[colorScheme ?? 'light'].tint}
                />
                <ThemedText style={styles.assetCount}>{runeCount}</ThemedText>
                <ThemedText style={styles.assetType}>Runes</ThemedText>
              </Pressable>
            </Link>
          </View>
          
          {loadingAssets && (
            <View style={styles.loadingAssetsContainer}>
              <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].tint} />
              <ThemedText style={styles.loadingAssetsText}>Loading assets...</ThemedText>
            </View>
          )}
        </View>

        {/* Sidechain Balances */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Sidechain Balances</ThemedText>
          {getSidechainList().length > 0 ? (
            <FlatList
              data={getSidechainList()}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <View style={styles.sidechainItem}>
                  <View style={styles.sidechainInfo}>
                    <ThemedText style={styles.sidechainName}>{item.name}</ThemedText>
                    <ThemedText style={styles.sidechainId}>Escrow #{item.id}</ThemedText>
                  </View>
                  <ThemedText style={styles.sidechainBalance}>
                    {formatBalance(item.balance)} BTC
        </ThemedText>
                </View>
              )}
            />
          ) : (
            <ThemedText style={styles.emptyText}>
              No sidechain balances available.
        </ThemedText>
          )}
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
  walletHeader: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  totalBalance: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subBalance: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 4,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  actionButtonText: {
    marginTop: 5,
    fontSize: 14,
  },
  section: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sidechainItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  sidechainInfo: {
    flex: 1,
  },
  sidechainName: {
    fontSize: 16,
    fontWeight: '600',
  },
  sidechainId: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  sidechainBalance: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
    marginTop: 20,
  },
  bitcoinAssetsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  assetCard: {
    width: '31%',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  assetCount: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  assetType: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 4,
  },
  loadingAssetsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  loadingAssetsText: {
    fontSize: 14,
    opacity: 0.7,
    marginLeft: 8,
  },
});
