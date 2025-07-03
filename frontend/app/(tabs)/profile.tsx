import React from 'react';
import { StyleSheet, View, Pressable, Alert } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/contexts/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';

export default function ProfileScreen() {
  const { authState, onLogout } = useAuth();

  const handleChangePassword = () => {
    Alert.alert("Chức năng đang phát triển", "Tính năng đổi mật khẩu sẽ được cập nhật trong phiên bản sau.");
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Tài khoản</ThemedText>

      <View style={styles.profileInfo}>
        <View style={styles.avatar}>
          <Ionicons name="person-circle-outline" size={80} color={Colors.light.tint} />
        </View>
        <ThemedText style={styles.email}>{authState?.user?.email}</ThemedText>
      </View>

      <Pressable style={styles.menuItem} onPress={handleChangePassword}>
        <Ionicons name="lock-closed-outline" size={24} color="#8e8e93" />
        <ThemedText style={styles.menuText}>Đổi mật khẩu</ThemedText>
        <Ionicons name="chevron-forward-outline" size={24} color="#8e8e93" />
      </Pressable>

      <Pressable style={styles.menuItem} onPress={onLogout}>
        <Ionicons name="log-out-outline" size={24} color="#ff3b30" />
        <ThemedText style={[styles.menuText, { color: '#ff3b30' }]}>Đăng xuất</ThemedText>
      </Pressable>

    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  profileInfo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatar: {
    marginBottom: 10,
  },
  email: {
    fontSize: 18,
    color: '#3c3c43',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  menuText: {
    flex: 1,
    marginLeft: 20,
    fontSize: 17,
  },
});