import React, { useState, useEffect } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View, FlatList, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack } from 'expo-router';
import { walletService } from '@/services/wallet';

interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'deposit' | 'withdraw';
  amount: number;
  date: Date;
  address: string;
  confirmations: number;
  sidechainNumber?: number;
  sidechainName?: string;
}

export default function HistoryScreen() {
  const colorScheme = useColorScheme();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load transaction history when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadTransactionHistory();
    }, [])
  );

  // Load transaction history
  const loadTransactionHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real implementation, we would fetch transaction history from the wallet service
      // For now, we'll use mock data
      const mockData: Transaction[] = [
        {
          id: '7ea0d7c5fa0a5a5c1b5f2c8209d90b0cc459450c1ad025680bd7861ed970379c',
          type: 'receive',
          amount: 0.1,
          date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
          address: 'tb1qnv5luf8mav8263sxfa4fdr3m6kws74n0yfzzrx',
          confirmations: 12,
        },
        {
          id: '8fa1d8c6fb1b6b6c2c6f3c9d0a90b1cc4694a1c2ad026771bd7972fe981479d',
          type: 'deposit',
          amount: 0.02,
          date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
          address: 'tb1qnv5luf8mav8263sxfa4fdr3m6kws74n0yfzzrx',
          confirmations: 6,
          sidechainNumber: 0,
          sidechainName: 'BitNames',
        },
        {
          id: '9gb2e9d7fc2c7c7d3d7f4dad1a91b2dd5795b2d3be137862ce8983gf992580e',
          type: 'send',
          amount: 0.05,
          date: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
          address: 'tb1qw508d6qejxtdg4y5r3zarvary0c5xw7kxpjzsx',
          confirmations: 3,
        },
        {
          id: 'agc3fad8gd3d8d8e4e8gadad2a92c3ee6896c3e4cf248963df9a94hga93691f',
          type: 'withdraw',
          amount: 0.01,
          date: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
          address: 'tb1qnv5luf8mav8263sxfa4fdr3m6kws74n0yfzzrx',
          confirmations: 1,
          sidechainNumber: 2,
          sidechainName: 'zSide',
        },
      ];

      setTransactions(mockData);
    } catch (err) {
      console.error('Error loading transaction history:', err);
      setError('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  // Refresh the transaction history
  const refreshTransactionHistory = async () => {
    setRefreshing(true);
    await loadTransactionHistory();
    setRefreshing(false);
  };

  // Format the transaction date
  const formatDate = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // If less than 24 hours, show relative time
    if (diff < 24 * 60 * 60 * 1000) {
      const hours = Math.floor(diff / (60 * 60 * 1000));
      if (hours === 0) {
        const minutes = Math.floor(diff / (60 * 1000));
        return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
      }
      return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
    }
    
    // If less than 7 days, show day of week
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      return days[date.getDay()];
    }
    
    // Otherwise, show date
    return date.toLocaleDateString();
  };

  // Get icon for transaction type
  const getTransactionIcon = (type: Transaction['type']): React.ComponentProps<typeof FontAwesome>['name'] => {
    switch (type) {
      case 'send':
        return 'arrow-up';
      case 'receive':
        return 'arrow-down';
      case 'deposit':
        return 'arrow-circle-down';
      case 'withdraw':
        return 'arrow-circle-up';
      default:
        return 'exchange';
    }
  };

  // Get color for transaction type
  const getTransactionColor = (type: Transaction['type']): string => {
    switch (type) {
      case 'send':
      case 'withdraw':
        return '#F44336'; // Red
      case 'receive':
      case 'deposit':
        return '#4CAF50'; // Green
      default:
        return '#2196F3'; // Blue
    }
  };

  // Format the transaction amount (with + or - prefix)
  const formatAmount = (transaction: Transaction): string => {
    const prefix = transaction.type === 'receive' || transaction.type === 'deposit' ? '+' : '-';
    return `${prefix}${transaction.amount.toFixed(8)} BTC`;
  };

  // Get transaction description
  const getTransactionDescription = (transaction: Transaction): string => {
    switch (transaction.type) {
      case 'send':
        return `Sent to ${shortenAddress(transaction.address)}`;
      case 'receive':
        return `Received at ${shortenAddress(transaction.address)}`;
      case 'deposit':
        return `Deposited to ${transaction.sidechainName} (Escrow #${transaction.sidechainNumber})`;
      case 'withdraw':
        return `Withdrawn from ${transaction.sidechainName} (Escrow #${transaction.sidechainNumber})`;
      default:
        return `Transaction to ${shortenAddress(transaction.address)}`;
    }
  };

  // Shorten an address for display
  const shortenAddress = (address: string): string => {
    return `${address.substring(0, 8)}...${address.substring(address.length - 4)}`;
  };

  // Render a transaction item
  const renderTransactionItem = ({ item }: { item: Transaction }) => (
    <Pressable 
      style={styles.transactionItem}
      onPress={() => handleTransactionPress(item)}
    >
      <View style={[styles.iconContainer, { backgroundColor: getTransactionColor(item.type) }]}>
        <FontAwesome 
          name={getTransactionIcon(item.type)} 
          size={16} 
          color="#fff"
        />
      </View>

      <View style={styles.transactionDetails}>
        <View style={styles.transactionHeader}>
          <ThemedText style={styles.transactionType}>
            {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
          </ThemedText>
          <ThemedText 
            style={[
              styles.transactionAmount, 
              { color: getTransactionColor(item.type) }
            ]}
          >
            {formatAmount(item)}
          </ThemedText>
        </View>

        <View style={styles.transactionInfo}>
          <ThemedText style={styles.transactionDescription}>
            {getTransactionDescription(item)}
          </ThemedText>
          <ThemedText style={styles.transactionDate}>
            {formatDate(item.date)}
          </ThemedText>
        </View>

        <View style={styles.transactionFooter}>
          <ThemedText style={styles.transactionConfirmations}>
            {item.confirmations} confirmation{item.confirmations !== 1 ? 's' : ''}
          </ThemedText>
          <FontAwesome 
            name="chevron-right" 
            size={14} 
            color={Colors[colorScheme ?? 'light'].icon} 
          />
        </View>
      </View>
    </Pressable>
  );

  // Handle transaction item press
  const handleTransactionPress = (transaction: Transaction) => {
    // Navigate to transaction details screen
    console.log('View transaction details:', transaction.id);
    // In a real implementation, this would navigate to a transaction details screen
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack.Screen options={{ title: 'Transaction History', headerShown: true }} />
      
      <View style={styles.container}>
        {loading && !refreshing && (
          <View style={styles.loadingContainer}>
            <ThemedText>Loading transaction history...</ThemedText>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <Pressable style={styles.retryButton} onPress={loadTransactionHistory}>
              <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
            </Pressable>
          </View>
        )}

        {!loading && !error && transactions.length === 0 && (
          <View style={styles.emptyContainer}>
            <ThemedText style={styles.emptyText}>
              No transactions found.
            </ThemedText>
          </View>
        )}

        {transactions.length > 0 && (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            renderItem={renderTransactionItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl 
                refreshing={refreshing} 
                onRefresh={refreshTransactionHistory} 
              />
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
  listContent: {
    padding: 16,
  },
  transactionItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionType: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  transactionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  transactionDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionConfirmations: {
    fontSize: 12,
    opacity: 0.6,
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