import { Tabs } from 'expo-router/tabs';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { FontAwesome } from '@expo/vector-icons';

/**
 * Use a tab-based layout for the bottom navigation in the app.
 */
export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Wallet',
          tabBarIcon: ({ color }) => <FontAwesome name="bitcoin" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="sidechains"
        options={{
          title: 'Sidechains',
          tabBarIcon: ({ color }) => <FontAwesome name="chain" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="ordinals"
        options={{
          title: 'Ordinals',
          tabBarIcon: ({ color }) => <FontAwesome name="diamond" size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <FontAwesome name="history" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <FontAwesome name="gear" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
