import { Tabs } from 'expo-router';
import React from 'react';
import { Pressable } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { useAuth } from '@/contexts/AuthContext';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { signOut } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: true,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Công việc',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'home' : 'home-outline'} color={color} />
          ),
          headerRight: () => (
            <Pressable onPress={signOut} style={{ marginRight: 15 }}>
              <TabBarIcon name="log-out-outline" color={Colors[colorScheme ?? 'light'].text} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="categories"
        options={{
          title: 'Danh mục',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'folder-open' : 'folder-outline'} color={color} />
          ),
          headerRight: () => (
            <Pressable onPress={signOut} style={{ marginRight: 15 }}>
              <TabBarIcon name="log-out-outline" color={Colors[colorScheme ?? 'light'].text} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name={focused ? 'code-slash' : 'code-slash-outline'} color={color} />
          ),
          headerRight: () => (
            <Pressable onPress={signOut} style={{ marginRight: 15 }}>
              <TabBarIcon name="log-out-outline" color={Colors[colorScheme ?? 'light'].text} />
            </Pressable>
          ),
        }}
      />
    </Tabs>
  );
}