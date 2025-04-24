import { Text } from '@/src/shared/ui';
import { IconWrapper } from '@/src/shared/ui/icons';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'react-native';
import CustomSwitch from './custom-switch';
import  ArrowUp  from '@/assets/icons/Vector-up.svg';
import { useState, useEffect } from 'react';
import NotSecuredIcon from '@/assets/icons/shield-not-secured.svg';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/src/features/auth';
import MyPage from '@/src/features/mypage';

export const Profile = () => {
  const { profileDetails } = useAuth();
  const [domatching, setDomatching] = useState(false);
  const [reMatchingTicketCount, setReMatchingTicketCount] = useState(0);

    useEffect(() => {
    const fetchRematchingTickets = async () => {
      try {
        const reMatchingTicket = await MyPage.getAllRematchingTicket();
        setReMatchingTicketCount(reMatchingTicket.total || 0);
      } catch (error) {
        console.error('Failed to fetch rematching tickets:', error);
      }
    };

    fetchRematchingTickets();
  }, []);

  const profileData = {
    name: profileDetails?.name || '이름',
    age: profileDetails?.age || '20',
    grade: profileDetails?.universityDetails?.grade || '19학번',
    domatching: domatching,
    university: profileDetails?.universityDetails?.name || '한밭대학교',
    profileImage: profileDetails?.profileImages[0] || require('@/assets/images/profile.png'),
    totalRematchingTickets: reMatchingTicketCount,
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#E9D9FF', '#D6B6FF']}
        style={styles.baseRectangle}
      />
      <View style={styles.overlapWrapper}>
        <View style={styles.overlapRectangle}>
            <View style={{ flexDirection: 'row' }}>
                <View style={{ width: 130, height: 130, marginLeft:10, borderRadius: 10, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={profileData.profileImage} style={{ borderRadius: 10, width: 120, height: 120 }} />
                </View>
                <View style={{ marginLeft: 10, justifyContent: 'center', alignItems: 'flex-start' }}>
                    <Text className='text-[25px] text-[#FFFFFF]'>{profileData.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', paddingBottom:20 }}>
                        <Text className='text-[13px] text-[#E6DBFF]'>{profileData.grade}</Text>
                        <Text className='text-[13px] text-[#E6DBFF]'> · </Text>
                        <Text className='text-[13px] text-[#E6DBFF]'>{profileData.university} </Text>
                        <IconWrapper size={14}>
                            <NotSecuredIcon/>
                        </IconWrapper>
                    </View>
                    <View className='flex-colum items-center'>
                        <CustomSwitch value={domatching} onChange={setDomatching} />
                        <Text className='text-[10px] pt-[8px] text-[#FFFFFF]'>매칭 쉬기</Text>
                    </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', transform: [{ translateY: -60 }] }}>
                    <TouchableOpacity onPress={() => {}}>
                        <View style={styles.leftRect} />
                        <View style={styles.leftRadius} />
                        <View style={[styles.previousButton]}>
                            <View className='pt-[10px]flex-colum items-center justify-center'>
                                <IconWrapper width={18} >
                                    <ArrowUp/>
                                </IconWrapper>
                                <Text className='text-[8px] text-[#9747FF]' >프로필 수정</Text>
                            </View>
                        </View>
                        <View style={styles.rightRect} />
                        <View style={styles.rightRadius} />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
        <View className='pt-[5px] pl-[32px] flex-row' style={{ alignItems: 'center' }}>
          <Image source={require('@/assets/images/ticket.png')} style={{ width: 30, height: 30 }} />
          <View className='pl-[10px] flex-row'>
            <Text className='text-[13px] text-[#FFFFFF]'>
              재매칭 티켓이  
            </Text>
            <Text className='text-[13px] text-[#9747FF]'>
              &nbsp;{profileData.totalRematchingTickets}장
            </Text>
            <Text className='text-[13px] text-[#FFFFFF]'>
              &nbsp;남았어요
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 40,
    alignItems: 'center',
  },
  baseRectangle: {
    width: 331,
    height: 200,
    borderRadius: 15,
    zIndex: 0,
  },
  overlapWrapper: {
    marginTop: -185,
    zIndex: 1,
  },
  overlapRectangle: {
    width: 361,
    height: 150,
    borderRadius: 15,
    backgroundColor: '#9747FF',
    paddingRight: 15,
    paddingTop: 10,
    overflow: 'hidden',
},
  previousButton: {
      width: 74,
      height: 42.75,
      borderBottomLeftRadius: 999,
      borderBottomRightRadius: 999,
      backgroundColor: '#E9D9FF',
  },
  leftRect: {
      width: 19,
      height: 20,
      backgroundColor: '#E9D9FF',
      position: 'absolute',
      top: 5,
      left: -18,
  },
  leftRadius: {
      width: 20,
      height: 20,
      backgroundColor: '#9747FF',
      borderTopRightRadius: 14,
      position: 'absolute',
      top: 5,
      left: -18,
  },
  rightRadius: {
      width: 20,
      height: 20,
      backgroundColor: '#9747FF',
      borderTopLeftRadius: 14,
      position: 'absolute',
      top: 5,
      right: -18,
  },
  rightRect: {
      width: 19,
      height: 20,
      backgroundColor: '#E9D9FF',
      position: 'absolute',
      top: 5,
      right: -18,
  }
});

export default Profile;