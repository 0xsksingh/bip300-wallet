import React, { useState } from 'react';
import { Alert, StyleSheet, View, ScrollView, Switch, Pressable } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BitcoinNetwork } from '@/types/blockchain';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Link, Stack } from 'expo-router';
import { walletService } from '@/services/wallet';
import { electrumService } from '@/services/electrum';

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  const [network, setNetwork] = useState<BitcoinNetwork>(BitcoinNetwork.TESTNET);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [nightMode, setNightMode] = useState(colorScheme === 'dark');

  // Load settings when the screen is focused
  useFocusEffect(
    React.useCallback(() => {
      loadSettings();
    }, [])
  );

  // Load settings from storage
  const loadSettings = async () => {
    // In a real implementation, we would load settings from storage
    // For now, we'll just use the wallet service's network
    setNetwork(walletService.getNetwork());
  };

  // Handle network selection
  const handleNetworkSelect = (newNetwork: BitcoinNetwork) => {
    Alert.alert(
      'Change Network',
      `Are you sure you want to switch to ${newNetwork}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Switch',
          onPress: () => {
            walletService.setNetwork(newNetwork);
            setNetwork(newNetwork);
            Alert.alert('Network Changed', `Network has been changed to ${newNetwork}`);
          },
        },
      ]
    );
  };

  // Handle wallet backup
  const handleBackupWallet = () => {
    Alert.alert(
      'Backup Wallet',
      'This will display your recovery phrase. Make sure no one is watching.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Continue',
          onPress: () => {
            // In a real implementation, we would show the recovery phrase
            Alert.alert('Backup', 'Recovery phrase would be displayed here');
          },
        },
      ]
    );
  };

  // Handle wallet reset
  const handleResetWallet = () => {
    Alert.alert(
      'Reset Wallet',
      'This will delete all wallet data. This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            // In a real implementation, we would reset the wallet
            Alert.alert('Reset', 'Wallet has been reset');
          },
        },
      ]
    );
  };

  // Render a settings item with text and optional right component
  const renderSettingsItem = (
    title: string,
    icon: React.ComponentProps<typeof FontAwesome>['name'],
    onPress?: () => void,
    rightComponent?: React.ReactNode,
    subtitle?: string
  ) => (
    <Pressable 
      style={styles.settingsItem} 
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingsItemLeft}>
        <View style={styles.iconContainer}>
          <FontAwesome 
            name={icon} 
            size={18} 
            color={Colors[colorScheme ?? 'light'].tint} 
          />
        </View>
        <View>
          <ThemedText style={styles.settingsItemTitle}>{title}</ThemedText>
          {subtitle && (
            <ThemedText style={styles.settingsItemSubtitle}>{subtitle}</ThemedText>
          )}
        </View>
      </View>
      <View style={styles.settingsItemRight}>
        {rightComponent || (
          onPress && (
            <FontAwesome 
              name="chevron-right" 
              size={16} 
              color={Colors[colorScheme ?? 'light'].icon} 
            />
          )
        )}
      </View>
    </Pressable>
  );

  // Render a section header
  const renderSectionHeader = (title: string) => (
    <View style={styles.sectionHeader}>
      <ThemedText style={styles.sectionHeaderText}>{title}</ThemedText>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <Stack.Screen options={{ title: 'Settings', headerShown: true }} />
      
      <ScrollView style={styles.container}>
        {/* Wallet Section */}
        {renderSectionHeader('Wallet')}
        <View style={styles.section}>
          {renderSettingsItem(
            'Backup Wallet',
            'shield',
            handleBackupWallet,
            undefined,
            'Create or view your recovery phrase'
          )}
          {renderSettingsItem(
            'Reset Wallet',
            'trash',
            handleResetWallet,
            undefined,
            'Delete all wallet data'
          )}
        </View>

        {/* Network Section */}
        {renderSectionHeader('Network')}
        <View style={styles.section}>
          {renderSettingsItem(
            'Mainnet',
            'circle',
            () => handleNetworkSelect(BitcoinNetwork.MAINNET),
            <View style={[
              styles.networkIndicator, 
              { backgroundColor: network === BitcoinNetwork.MAINNET ? '#4CAF50' : 'transparent' }
            ]} />
          )}
          {renderSettingsItem(
            'Testnet',
            'circle',
            () => handleNetworkSelect(BitcoinNetwork.TESTNET),
            <View style={[
              styles.networkIndicator, 
              { backgroundColor: network === BitcoinNetwork.TESTNET ? '#4CAF50' : 'transparent' }
            ]} />
          )}
          {renderSettingsItem(
            'Regtest',
            'circle',
            () => handleNetworkSelect(BitcoinNetwork.REGTEST),
            <View style={[
              styles.networkIndicator, 
              { backgroundColor: network === BitcoinNetwork.REGTEST ? '#4CAF50' : 'transparent' }
            ]} />
          )}
          {renderSettingsItem(
            'Server Info',
            'server',
            () => {
              const server = electrumService.getServer();
              Alert.alert(
                'Server Info',
                server 
                  ? `Host: ${server.host}\nPort: ${server.port}\nProtocol: ${server.protocol}` 
                  : 'Not connected to any server'
              );
            }
          )}
        </View>

        {/* Security Section */}
        {renderSectionHeader('Security')}
        <View style={styles.section}>
          {renderSettingsItem(
            'Biometric Authentication',
            'lock',
            undefined,
            <Switch
              value={biometricEnabled}
              onValueChange={setBiometricEnabled}
              trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].tint }}
              thumbColor="#f4f3f4"
            />,
            'Use fingerprint or face ID to unlock'
          )}
          {renderSettingsItem(
            'Change PIN',
            'lock',
            () => Alert.alert('PIN', 'PIN change screen would be displayed here')
          )}
        </View>

        {/* App Settings Section */}
        {renderSectionHeader('App Settings')}
        <View style={styles.section}>
          {renderSettingsItem(
            'Notifications',
            'bell',
            undefined,
            <Switch
              value={notificationsEnabled}
              onValueChange={setNotificationsEnabled}
              trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].tint }}
              thumbColor="#f4f3f4"
            />
          )}
          {renderSettingsItem(
            'Night Mode',
            'moon-o',
            undefined,
            <Switch
              value={nightMode}
              onValueChange={setNightMode}
              trackColor={{ false: '#767577', true: Colors[colorScheme ?? 'light'].tint }}
              thumbColor="#f4f3f4"
            />
          )}
        </View>

        {/* About Section */}
        {renderSectionHeader('About')}
        <View style={styles.section}>
          {renderSettingsItem(
            'Version',
            'info-circle',
            undefined,
            <ThemedText style={styles.versionText}>1.0.0</ThemedText>
          )}
          {renderSettingsItem(
            'Source Code',
            'github',
            () => Alert.alert('GitHub', 'GitHub repository link would open here')
          )}
          {renderSettingsItem(
            'BIP300 Documentation',
            'book',
            () => Alert.alert('Documentation', 'Documentation link would open here')
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
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  sectionHeaderText: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    opacity: 0.6,
  },
  section: {
    marginBottom: 20,
  },
  settingsItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  settingsItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  settingsItemTitle: {
    fontSize: 16,
  },
  settingsItemSubtitle: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  settingsItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  networkIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4CAF50',
    marginRight: 4,
  },
  versionText: {
    fontSize: 14,
    opacity: 0.6,
  },
}); 