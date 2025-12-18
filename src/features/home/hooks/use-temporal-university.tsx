import {useCallback, useEffect} from 'react';
import {useModal} from '@/src/shared/hooks/use-modal';
import {useExistsUniversityQuery} from '../queries';
import {useUniversityMutation} from './use-university-mutation';
import UniversityForm from '../ui/university-form';
import {Text} from '@/src/shared/ui';
import {View, StyleSheet} from 'react-native';
import {queryClient} from "@shared/config/query";

export const useTemporalUniversity = () => {
  const {data: existsUniversity = true, isLoading} = useExistsUniversityQuery();
  const {showModal, hideModal} = useModal();
  const {mutate: updateUniversity, isPending} = useUniversityMutation();

  const showUniversityModal = useCallback(() => {
    showModal({
      customTitle: (
          <Text size="md" weight="bold" textColor="black" style={modalStyles.title}>
            대학정보를 다시 입력해주세요
          </Text>
      ),
      children: (
          <View style={modalStyles.container}>
            <UniversityForm
                onSubmit={(data) => {
                  updateUniversity({
                    university: data.universityName,
                    department: data.departmentName,
                    studentNumber: data.studentNumber,
                    grade: data.grade,
                  }, {
                    onSuccess: () => {
                      alert('대학 정보가 갱신되었습니다');
                      queryClient.setQueryData(['exists-university'], () => true);
                      hideModal();
                    }
                  });
                }}
                isLoading={isPending}
            />
          </View>
      ),
    });
  }, [showModal, updateUniversity, isPending, hideModal]);

  useEffect(() => {
    if (!isLoading && !existsUniversity) {
      showUniversityModal();
    }
  }, [isLoading, existsUniversity, showUniversityModal]);

  return {
    existsUniversity,
    isLoading,
    showUniversityModal,
  };
};

const modalStyles = StyleSheet.create({
  title: {
    marginBottom: 8,
  },
  container: {
    flexDirection: 'column',
  },
});