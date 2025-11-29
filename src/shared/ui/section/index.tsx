import { View, StyleSheet } from "react-native";
import { Divider } from "@/src/shared/ui/divider";
import { Text } from "@/src/shared/ui/text";

type SectionProps = {
  title: string;
  children: React.ReactNode;
};

const Container = ({ title, children }: SectionProps) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text size="lg" textColor="black">
          {title}
        </Text>
        <Divider.Horizontal style={styles.divider} />
      </View>

      <View style={styles.content}>
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
    <View style={styles.profile}>
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
  header: {
    width: '100%',
    flexDirection: 'column',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 4,
  },
  content: {
    flexDirection: 'column',
    gap: 8,
  },
  profile: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
