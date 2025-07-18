import { Stack, router } from 'expo-router';
import { View } from 'react-native';
import { useEffect, useState } from 'react';
import { useAuth } from '@/src/features/auth/hooks/use-auth';
import { getUserStatus } from '@/src/features/auth/apis';
import Loading from '@/src/features/loading';

export default function HomeLayout() {
  const { my } = useAuth();
  const [statusChecked, setStatusChecked] = useState(false);

  useEffect(() => {
    const checkApprovalStatus = async () => {
      if (!my?.phoneNumber || statusChecked) return;

      try {
        const statusData = await getUserStatus(my.phoneNumber);

        if (statusData.status === 'pending') {
          router.replace('/auth/approval-pending' as any);
          return;
        }

        if (statusData.status === 'rejected') {
          router.replace({
            pathname: '/auth/approval-rejected' as any,
            params: {
              phoneNumber: my.phoneNumber,
              rejectionReason: statusData.rejectionReason || '승인이 거절되었습니다.'
            }
          });
          return;
        }
        setStatusChecked(true);
      } catch (error) {
        console.error('승인 상태 확인 오류:', error);
        setStatusChecked(true);
      }
    };

    checkApprovalStatus();
  }, [my?.phoneNumber, statusChecked]);

  if (!statusChecked) {
    return <Loading.Page title="사용자 정보를 확인하고 있어요..." />;
  }

  return (
    <View className="flex-1">
      <Stack>
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
            contentStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
      </Stack>
    </View>
  );
}
