import {useMutation, useQueryClient} from '@tanstack/react-query';
import {UniversityUpdateRequest, updateUniversity} from '../apis';

export const useUniversityMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UniversityUpdateRequest) => updateUniversity(data),
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['my-details']});
      queryClient.invalidateQueries({queryKey: ['my-profile-details']});
      queryClient.setQueryData(['exists-university'], false);
    },
  });
};
