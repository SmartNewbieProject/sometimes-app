import { View, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Button, PalePurpleGradient, BottomNavigation, Header } from '@/src/shared/ui';
import { Image } from 'expo-image';
import Home from "@features/home";

const { ui } = Home;
const { TotalMatchCounter } = ui;

// Mock data for the home screen
const upcomingEvents = [
  {
    id: '1',
    title: '서울대 미팅',
    date: '2023년 12월 25일',
    time: '오후 3:00',
    location: '서울특별시 관악구',
    participants: 4,
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=3432&auto=format&fit=crop&ixlib=rb-4.0.3'
  },
  {
    id: '2',
    title: '연세대 미팅',
    date: '2023년 12월 26일',
    time: '오후 5:00',
    location: '서울특별시 서대문구',
    participants: 6,
    imageUrl: 'https://images.unsplash.com/photo-1543269664-76bc3997d9ea?q=80&w=3540&auto=format&fit=crop&ixlib=rb-4.0.3'
  }
];

const recommendedMatches = [
  {
    id: '1',
    name: '김지수',
    age: 24,
    university: '서울대학교',
    department: '경영학과',
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=3276&auto=format&fit=crop&ixlib=rb-4.0.3',
    compatibility: 95
  },
  {
    id: '2',
    name: '이민지',
    age: 23,
    university: '연세대학교',
    department: '심리학과',
    imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3',
    compatibility: 92
  },
  {
    id: '3',
    name: '박서연',
    age: 25,
    university: '고려대학교',
    department: '컴퓨터공학과',
    imageUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=3387&auto=format&fit=crop&ixlib=rb-4.0.3',
    compatibility: 88
  }
];

export default function HomeScreen() {
  return (
    <View className="flex-1">
      <PalePurpleGradient />

      <Header
        centered={true}
        logoSize={128}
        showBackButton={false}
        rightContent={
          <TouchableOpacity>
            <Image
              source={require('@assets/images/ticket.png')}
              style={{ width: 40, height: 40 }}
            />
          </TouchableOpacity>
        }
      />

      <ScrollView className="flex-1 px-5">
        <View className="my-4">
          <TotalMatchCounter count={15000} />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </View>
  );
}
