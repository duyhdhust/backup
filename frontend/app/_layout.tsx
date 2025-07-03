import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { CategoryProvider } from '@/contexts/CategoryContext';

SplashScreen.preventAutoHideAsync();

// --- HOOK MỚI: Logic bảo vệ route được tách ra riêng ---
function useProtectedRoute(user: { isAuthenticated: boolean; isLoading: boolean; }) {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    // Bỏ qua cho đến khi trạng thái đăng nhập được xác định
    if (user.isLoading) {
      return;
    }

    const inAuthGroup = segments[0] === '(auth)';

    // Nếu người dùng chưa đăng nhập và đang không ở trong nhóm (auth),
    // chuyển họ ra màn hình đăng nhập.
    if (!user.isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login');
    }
    // Nếu người dùng đã đăng nhập và đang ở trong nhóm (auth),
    // chuyển họ vào màn hình chính.
    else if (user.isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [user.isAuthenticated, user.isLoading, segments, router]);
}


function RootLayoutNav() {
  const auth = useAuth();

  // Dùng hook mới để xử lý điều hướng
  useProtectedRoute(auth);

  // Màn hình sẽ không render gì cho đến khi logic điều hướng hoàn tất
  if (auth.isLoading) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <CategoryProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <RootLayoutNav />
        </ThemeProvider>
      </CategoryProvider>
    </AuthProvider>
  );
}