import { Image, StyleSheet, Platform } from 'react-native';

import { Collapsible } from '@/components/Collapsible';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

export default function TabTwoScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Explore Section</ThemedText>
      <ThemedText>This is a placeholder screen. You can add your own components here.</ThemedText>

      <Collapsible title="About The Template">
        <ThemedText>
          This app includes example code to help you get started.
        </ThemedText>
        <Image
          source={require('../../assets/images/react-logo.png')} // <-- ĐƯỜNG DẪN ĐÚNG
          style={{ alignSelf: 'center', marginVertical: 10 }}
        />
      </Collapsible>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    gap: 16,
  },
});