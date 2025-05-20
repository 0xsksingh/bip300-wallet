import React, { useState, useEffect } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, View, ActivityIndicator, Image } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack, Link, useRouter, useLocalSearchParams } from 'expo-router';
import { rebarLabsService } from '@/services/rebarLabs';
import { walletService } from '@/services/wallet';
import { Inscription, BRC20Balance, RuneHolder } from '@/types/rebarLabs';

type AssetType = 'ordinals' | 'brc20' | 'runes';

// FontAwesome icon names used in this component
type IconName = 'diamond' | 'money' | 'certificate' | 'image' | 'file-text-o' | 'film' | 'music' | 'file-o';

export default function OrdinalsScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const { tab } = useLocalSearchParams<{ tab?: string }>();
  const [activeTab, setActiveTab] = useState<AssetType>('ordinals');
  const [inscriptions, setInscriptions] = useState<Inscription[]>([]);
  const [brc20Balances, setBrc20Balances] = useState<BRC20Balance[]>([]);
  const [runeBalances, setRuneBalances] = useState<RuneHolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Set the active tab based on the URL parameter
  useEffect(() => {
    if (tab && (tab === 'ordinals' || tab === 'brc20' || tab === 'runes')) {
      setActiveTab(tab as AssetType);
    }
  }, [tab]);

  // Load data when the screen is focused or tab changes
  useFocusEffect(
    React.useCallback(() => {
      loadData();
    }, [activeTab])
  );

  // Load data based on the active tab
  const loadData = async () => {
    if (refreshing) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const wallet = walletService.getActiveWallet();
      if (!wallet) {
        setError('No active wallet found');
        setLoading(false);
        return;
      }
      
      // For now, we'll use a mock address since we don't have a real address
      // In a real implementation, we would get the user's address from the wallet
      const mockAddress = 'bc1pljg7csafhdnf24qnphnex92vjkg2qlcsvlna20zp8562ejlsfzrsmxme9s';
      
      if (activeTab === 'ordinals') {
        const response = await rebarLabsService.getInscriptions({
          address: ["bc1pmxavyuug4qkmvuj6y053jlcjwvehf5q63lufcdpgrpc6mgqzf30qglj5mx"],
          limit: 20,
        });
        

        console.log("inscription response", response);
        
        if (response.success && response.data?.results) {
          setInscriptions(response.data.results);
        } else {
          setError(response.error || 'Failed to load inscriptions');
        }
      } else if (activeTab === 'brc20') {
        const response = await rebarLabsService.getBRC20Balances(mockAddress);

        console.log("brc20 response", response);
        
        if (response.success && response.data?.results) {
          setBrc20Balances(response.data.results);
        } else {
          setError(response.error || 'Failed to load BRC-20 balances');
        }
      } else if (activeTab === 'runes') {
        // For Runes, we need to get all the user's balances for different etchings
        // This is a simplified version that assumes we know the etching IDs
        
        // Get a list of etchings first
        const etchingsResponse = await rebarLabsService.getRuneEtchings();
        
        console.log("etchings response", etchingsResponse);

        if (etchingsResponse.success && etchingsResponse.data?.results) {
          // For each etching, get the user's balance
          const balances = [];
          
          for (const etching of etchingsResponse.data.results) {
            console.log("checking for etching with id", etching.id , etching.name);
            const balanceResponse = await rebarLabsService.getRuneAddressBalance(
              etching.id,
              "bc1p4lngsrqkwdq86dlnyuganygccm3fkcghhma2hrv48d0hre06nrlqhx9ugc"
            );

            console.log("balance response", balanceResponse);
            
            if (balanceResponse.success && balanceResponse.data) {
              balances.push(balanceResponse.data);
            }
          }

          const etchingidarray = ["850474:464","870752:107", "845764:84", "840190:1620", "840000:3"];

          for (const etchingid of etchingidarray) {
            const balanceResponse = await rebarLabsService.getRuneAddressBalance(
              etchingid,
              "bc1p4lngsrqkwdq86dlnyuganygccm3fkcghhma2hrv48d0hre06nrlqhx9ugc"
            );

            console.log("balance response", balanceResponse);
            
            if (balanceResponse.success && balanceResponse.data) {
              balances.push(balanceResponse.data);
            }
          }
          
          setRuneBalances(balances);
        } else {
          setError(etchingsResponse.error || 'Failed to load Runes');
        }
      }
    } catch (err) {
      console.error(`Error loading ${activeTab}:`, err);
      setError(`Failed to load ${activeTab}`);
    } finally {
      setLoading(false);
    }
  };

  // Refresh data
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  // Render a tab button
  const renderTabButton = (type: AssetType, label: string, icon: IconName) => (
    <Pressable
      style={[styles.tabButton, activeTab === type && styles.activeTabButton]}
      onPress={() => setActiveTab(type)}
    >
      <FontAwesome
        name={icon}
        size={18}
        color={activeTab === type ? '#fff' : Colors[colorScheme ?? 'light'].text}
      />
      <ThemedText
        style={[
          styles.tabButtonText,
          activeTab === type && styles.activeTabButtonText
        ]}
      >
        {label}
      </ThemedText>
    </Pressable>
  );

  // Render an inscription item
  const renderInscriptionItem = ({ item }: { item: Inscription }) => (
    <Pressable
      style={styles.inscriptionItem}
      onPress={() => handleInscriptionPress(item)}
    >
      {item.mime_type.startsWith('image/') ? (
        <Image
          source={{ uri: `https://api.rebarlabs.io/ordinals/v1/inscriptions/${item.id}/content` }}
          style={styles.inscriptionImage}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.inscriptionPlaceholder}>
          <FontAwesome
            name={getIconForMimeType(item.mime_type)}
            size={24}
            color={Colors[colorScheme ?? 'light'].text}
          />
        </View>
      )}
      
      <View style={styles.inscriptionDetails}>
        <ThemedText style={styles.inscriptionNumber}>#{item.number}</ThemedText>
        <ThemedText style={styles.inscriptionType}>{item.mime_type}</ThemedText>
        <View style={styles.rarityRow}>
          <ThemedText style={styles.rarityLabel}>Rarity:</ThemedText>
          <ThemedText style={[
            styles.rarityValue,
            { color: getRarityColor(item.sat_rarity) }
          ]}>
            {item.sat_rarity}
          </ThemedText>
        </View>
      </View>
    </Pressable>
  );

  // Render a BRC-20 token item
  const renderBRC20Item = ({ item }: { item: BRC20Balance }) => (
    <Pressable
      style={styles.brc20Item}
      onPress={() => handleBRC20Press(item)}
    >
      <View style={styles.brc20Icon}>
        <ThemedText style={styles.brc20Ticker}>{item.ticker.charAt(0)}</ThemedText>
      </View>
      
      <View style={styles.brc20Details}>
        <ThemedText style={styles.brc20TickerText}>{item.ticker}</ThemedText>
        <ThemedText style={styles.brc20Balance}>
          Balance: {item.overall_balance}
        </ThemedText>
        <ThemedText style={styles.brc20AvailableBalance}>
          Available: {item.available_balance} · Transferrable: {item.transferrable_balance}
        </ThemedText>
      </View>
    </Pressable>
  );

  // Render a Rune item
  const renderRuneItem = ({ item }: { item: RuneHolder }) => (
    <Pressable
      style={styles.runeItem}
      onPress={() => handleRunePress(item)}
    >
      <View style={styles.runeIcon}>
        <FontAwesome name="certificate" size={24} color={Colors[colorScheme ?? 'light'].tint} />
      </View>
      
      <View style={styles.runeDetails}>
        <ThemedText style={styles.runeId}>ID: {item.address.substring(0, 16)}...</ThemedText>
        <ThemedText style={styles.runeBalance}>
          Balance: {item.balance}
        </ThemedText>
      </View>
    </Pressable>
  );

  // Handle inscription press
  const handleInscriptionPress = (inscription: Inscription) => {
    router.push(`/inscription/${inscription.id}`);
  };

  // Handle BRC-20 press
  const handleBRC20Press = (token: BRC20Balance) => {
    Alert.alert(
      `${token.ticker}`,
      `Balance: ${token.overall_balance}\nAvailable: ${token.available_balance}\nTransferrable: ${token.transferrable_balance}`
    );
  };

  // Handle Rune press
  const handleRunePress = (rune: RuneHolder) => {
    Alert.alert(
      'Rune',
      `Address: ${rune.address}\nBalance: ${rune.balance}`
    );
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

  // Render the content based on the active tab
  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
          <ThemedText style={styles.loadingText}>Loading {activeTab}...</ThemedText>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <Pressable style={styles.retryButton} onPress={loadData}>
            <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
          </Pressable>
        </View>
      );
    }

    if (activeTab === 'ordinals' && inscriptions.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>No inscriptions found</ThemedText>
        </View>
      );
    }

    if (activeTab === 'brc20' && brc20Balances.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>No BRC-20 tokens found</ThemedText>
        </View>
      );
    }

    if (activeTab === 'runes' && runeBalances.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <ThemedText style={styles.emptyText}>No Runes found</ThemedText>
        </View>
      );
    }

    if (activeTab === 'ordinals') {
      return (
        <FlatList
          data={inscriptions}
          keyExtractor={(item) => item.id}
          renderItem={renderInscriptionItem}
          contentContainerStyle={styles.listContent}
          numColumns={2}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      );
    }

    if (activeTab === 'brc20') {
      return (
        <FlatList
          data={brc20Balances}
          keyExtractor={(item) => item.ticker}
          renderItem={renderBRC20Item}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      );
    }

    if (activeTab === 'runes') {
      return (
        <FlatList
          data={runeBalances}
          keyExtractor={(item, index) => `rune-${index}`}
          renderItem={renderRuneItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack.Screen options={{ title: 'Bitcoin Assets', headerShown: true }} />
      
      <View style={styles.container}>
        <View style={styles.tabsContainer}>
          {renderTabButton('ordinals', 'Ordinals', 'diamond')}
          {renderTabButton('brc20', 'BRC-20', 'money')}
          {renderTabButton('runes', 'Runes', 'certificate')}
        </View>
        
        {renderContent()}
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
  tabsContainer: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    margin: 4,
  },
  activeTabButton: {
    backgroundColor: Colors.light.tint,
  },
  tabButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabButtonText: {
    color: '#fff',
  },
  listContent: {
    padding: 12,
  },
  inscriptionItem: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  inscriptionImage: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
  },
  inscriptionPlaceholder: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inscriptionDetails: {
    padding: 8,
  },
  inscriptionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  inscriptionType: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  rarityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  rarityLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginRight: 4,
  },
  rarityValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  brc20Item: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  brc20Icon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.tint,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  brc20Ticker: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  brc20Details: {
    flex: 1,
  },
  brc20TickerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  brc20Balance: {
    fontSize: 16,
    marginTop: 4,
  },
  brc20AvailableBalance: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 2,
  },
  runeItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
  },
  runeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  runeDetails: {
    flex: 1,
  },
  runeId: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  runeBalance: {
    fontSize: 16,
    marginTop: 4,
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
    marginBottom: 16,
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
    padding: 32,
  },
  emptyText: {
    opacity: 0.6,
    textAlign: 'center',
  },
}); 