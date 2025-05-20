import React, { useState, useEffect } from 'react';
import { Alert, StyleSheet, View, TextInput, KeyboardAvoidingView, Platform, Pressable, ActivityIndicator } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Stack, useRouter } from 'expo-router';
import { SidechainInfo } from '@/types/blockchain';
import { bip300Service } from '@/services/bip300';
import { walletService } from '@/services/wallet';
import { ScrollView } from 'react-native-gesture-handler';

export default function DepositScreen() {
  const colorScheme = useColorScheme();
  const router = useRouter();
  const [sidechains, setSidechains] = useState<SidechainInfo[]>([]);
  const [selectedSidechain, setSelectedSidechain] = useState<SidechainInfo | null>(null);
  const [amount, setAmount] = useState('');
  const [fee, setFee] = useState('0.0001'); // Default fee in BTC
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [loadingError, setLoadingError] = useState<string | null>(null);

  // Load sidechains when the screen mounts
  useEffect(() => {
    loadSidechains();
  }, []);

  // Load sidechains from the BIP300 service
  const loadSidechains = async () => {
    setIsLoading(true);
    setLoadingError(null);
    try {
      const response = await bip300Service.getSidechains();
      if (response.success && response.data) {
        // Filter out inactive sidechains
        const activeSidechains = response.data.filter(sc => sc.isActive);
        setSidechains(activeSidechains);
        
        // Select the first sidechain by default if available
        if (activeSidechains.length > 0) {
          setSelectedSidechain(activeSidechains[0]);
        }
      } else {
        setLoadingError(response.error || 'Failed to load sidechains');
      }
    } catch (error) {
      console.error('Error loading sidechains:', error);
      setLoadingError('Failed to load sidechains');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle sidechain selection
  const handleSidechainSelect = (sidechain: SidechainInfo) => {
    setSelectedSidechain(sidechain);
  };

  // Check if the deposit amount is valid
  const isValidAmount = (): boolean => {
    const amountValue = parseFloat(amount);
    return !isNaN(amountValue) && amountValue > 0;
  };

  // Check if the fee is valid
  const isValidFee = (): boolean => {
    const feeValue = parseFloat(fee);
    return !isNaN(feeValue) && feeValue >= 0;
  };

  // Get total cost (amount + fee)
  const getTotalCost = (): number => {
    const amountValue = parseFloat(amount) || 0;
    const feeValue = parseFloat(fee) || 0;
    return amountValue + feeValue;
  };

  // Check if the user has enough balance
  const hasEnoughBalance = (): boolean => {
    const wallet = walletService.getActiveWallet();
    if (!wallet) return false;
    
    const totalCost = getTotalCost();
    return wallet.balance.total >= totalCost;
  };

  // Handle deposit submission
  const handleDeposit = async () => {
    // Validate inputs
    if (!selectedSidechain) {
      Alert.alert('Error', 'Please select a sidechain');
      return;
    }

    if (!isValidAmount()) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!isValidFee()) {
      Alert.alert('Error', 'Please enter a valid fee');
      return;
    }

    if (!hasEnoughBalance()) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    // Confirm deposit
    Alert.alert(
      'Confirm Deposit',
      `Are you sure you want to deposit ${amount} BTC to ${selectedSidechain.name} (Escrow #${selectedSidechain.escrowNumber})?\n\nFee: ${fee} BTC\nTotal: ${getTotalCost()} BTC`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Deposit',
          onPress: async () => {
            setIsSending(true);
            try {
              const response = await walletService.depositToSidechain(
                selectedSidechain.escrowNumber,
                parseFloat(amount),
                parseFloat(fee)
              );

              if (response.success && response.data) {
                Alert.alert(
                  'Deposit Successful',
                  `Your deposit to ${selectedSidechain.name} has been submitted.\n\nTransaction ID: ${response.data}`,
                  [
                    {
                      text: 'OK',
                      onPress: () => router.back(),
                    },
                  ]
                );
              } else {
                Alert.alert('Error', response.error || 'Failed to send deposit');
              }
            } catch (error) {
              console.error('Error making deposit:', error);
              Alert.alert('Error', 'An unexpected error occurred');
            } finally {
              setIsSending(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack.Screen 
        options={{ 
          title: 'Deposit to Sidechain',
          headerShown: true,
        }} 
      />
      
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView style={styles.scrollView}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].tint} />
              <ThemedText style={styles.loadingText}>Loading sidechains...</ThemedText>
            </View>
          ) : loadingError ? (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>{loadingError}</ThemedText>
              <Pressable style={styles.retryButton} onPress={loadSidechains}>
                <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
              </Pressable>
            </View>
          ) : (
            <>
              <View style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Select Sidechain</ThemedText>
                <View style={styles.sidechainList}>
                  {sidechains.map(sidechain => (
                    <Pressable
                      key={sidechain.escrowNumber}
                      style={[
                        styles.sidechainItem,
                        selectedSidechain?.escrowNumber === sidechain.escrowNumber && styles.selectedSidechain
                      ]}
                      onPress={() => handleSidechainSelect(sidechain)}
                    >
                      <ThemedText 
                        style={[
                          styles.sidechainName,
                          selectedSidechain?.escrowNumber === sidechain.escrowNumber && styles.selectedText
                        ]}
                      >
                        {sidechain.name}
                      </ThemedText>
                      <ThemedText 
                        style={[
                          styles.sidechainId,
                          selectedSidechain?.escrowNumber === sidechain.escrowNumber && styles.selectedText
                        ]}
                      >
                        Escrow #{sidechain.escrowNumber}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>

              {selectedSidechain && (
                <>
                  <View style={styles.section}>
                    <ThemedText style={styles.sectionTitle}>Deposit Details</ThemedText>
                    <ThemedText style={styles.label}>Amount (BTC)</ThemedText>
                    <TextInput
                      style={styles.input}
                      value={amount}
                      onChangeText={setAmount}
                      keyboardType="decimal-pad"
                      placeholder="0.00"
                      placeholderTextColor="#999"
                    />

                    <ThemedText style={styles.label}>Transaction Fee (BTC)</ThemedText>
                    <TextInput
                      style={styles.input}
                      value={fee}
                      onChangeText={setFee}
                      keyboardType="decimal-pad"
                      placeholder="0.0001"
                      placeholderTextColor="#999"
                    />

                    <View style={styles.summaryContainer}>
                      <View style={styles.summaryRow}>
                        <ThemedText style={styles.summaryLabel}>Deposit Amount:</ThemedText>
                        <ThemedText style={styles.summaryValue}>{amount || '0'} BTC</ThemedText>
                      </View>
                      <View style={styles.summaryRow}>
                        <ThemedText style={styles.summaryLabel}>Transaction Fee:</ThemedText>
                        <ThemedText style={styles.summaryValue}>{fee} BTC</ThemedText>
                      </View>
                      <View style={styles.summaryDivider} />
                      <View style={styles.summaryRow}>
                        <ThemedText style={styles.totalLabel}>Total:</ThemedText>
                        <ThemedText style={styles.totalValue}>{getTotalCost()} BTC</ThemedText>
                      </View>
                      <View style={styles.balanceRow}>
                        <ThemedText style={[
                          styles.balanceText,
                          !hasEnoughBalance() && styles.balanceError
                        ]}>
                          {hasEnoughBalance() 
                            ? 'Sufficient balance'
                            : 'Insufficient balance'}
                        </ThemedText>
                      </View>
                    </View>
                  </View>

                  <View style={styles.noteSection}>
                    <ThemedText style={styles.noteText}>
                      <FontAwesome name="info-circle" size={14} color={Colors[colorScheme ?? 'light'].icon} /> Note: 
                      Deposits to sidechains (M5 transactions) are processed with one confirmation.
                      Make sure you're sending to the correct sidechain as deposits cannot be reversed.
                    </ThemedText>
                  </View>

                  <Pressable 
                    style={[
                      styles.depositButton,
                      (!isValidAmount() || !isValidFee() || !hasEnoughBalance()) && styles.disabledButton
                    ]}
                    onPress={handleDeposit}
                    disabled={!isValidAmount() || !isValidFee() || !hasEnoughBalance() || isSending}
                  >
                    {isSending ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <FontAwesome name="arrow-circle-right" size={16} color="#fff" />
                        <ThemedText style={styles.depositButtonText}>
                          Deposit to Sidechain
                        </ThemedText>
                      </>
                    )}
                  </Pressable>
                </>
              )}
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
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
  scrollView: {
    flex: 1,
  },
  section: {
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  sidechainList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -4,
  },
  sidechainItem: {
    width: '48%',
    marginHorizontal: '1%',
    marginBottom: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  selectedSidechain: {
    borderColor: Colors.light.tint,
    backgroundColor: `${Colors.light.tint}20`,
  },
  sidechainName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  sidechainId: {
    fontSize: 12,
    opacity: 0.6,
  },
  selectedText: {
    color: Colors.light.tint,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
  },
  summaryContainer: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    opacity: 0.7,
  },
  summaryValue: {
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  totalLabel: {
    fontWeight: 'bold',
  },
  totalValue: {
    fontWeight: 'bold',
  },
  balanceRow: {
    alignItems: 'flex-end',
    marginTop: 4,
  },
  balanceText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  balanceError: {
    color: '#F44336',
  },
  noteSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  noteText: {
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 18,
  },
  depositButton: {
    margin: 16,
    backgroundColor: Colors.light.tint,
    paddingVertical: 14,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  depositButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  disabledButton: {
    backgroundColor: '#ccc',
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
}); 