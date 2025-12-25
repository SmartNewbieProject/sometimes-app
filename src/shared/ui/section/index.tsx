import { View, StyleSheet } from "react-native";
import { Text } from "../text";
import { Divider } from "../divider";

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

const Container = ({ title, children }: SectionProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text size="18" textColor="black">
          {title}
        </Text>
        <Divider.Horizontal style={styles.divider} />
      </View>

      <View style={styles.childrenContainer}>
        {children}
      </View>
    </View>
  );
};

type ProfileProps = {
  title: string;
  children: React.ReactNode;
};

const Profile = ({ title, children }: ProfileProps) => {
  return (
    <View style={styles.profileContainer}>
      <Text textColor="black" size="md">{title}</Text>
      {children}
    </View>
  );
};

export const Section = {
  Container,
  Profile,
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'column',
  },
  titleContainer: {
    width: '100%',
    flexDirection: 'column',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 4,
  },
  childrenContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  profileContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
