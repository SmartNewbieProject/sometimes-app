import { View, StyleSheet } from 'react-native';
import { Text } from '@/src/shared/ui';

interface TimeProps {
  value: string;
}

export default function Time({ value }: TimeProps) {
  return (
    <View style={styles.container}>
      <Text
        weight="bold"
        className="text-[23px] text-primaryPurple font-rubik"
      >
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    textAlign: 'center',
    paddingHorizontal: 12,
    fontFamily: 'Rubik',
    paddingVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});
