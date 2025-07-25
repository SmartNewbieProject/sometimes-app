import { View, Text, StyleSheet } from 'react-native';
import { FacebookEventsExample } from '@/src/shared/lib/facebook-events-example';

export default function FacebookEventsTestScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Facebook App Events 테스트</Text>
      <Text style={styles.subtitle}>
        아래 버튼들을 눌러서 Facebook App Events 연결과 이벤트 추적을 테스트하세요.
      </Text>
      <FacebookEventsExample />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
});
