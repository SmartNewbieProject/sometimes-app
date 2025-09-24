import { useModal } from '@/src/shared/hooks/use-modal';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { router } from 'expo-router';
import { type ReportResponse, submitReport } from '../services/report';

interface ApiErrorResponse {
	statusCode?: number;
	message?: string;
	error?: string;
}

interface SubmitReportVariables {
	userId: string;
	reason: string;
	description?: string;
	evidenceImages?: { uri: string; name: string; type: string }[];
}

export function useReport() {
	const queryClient = useQueryClient();
	const { showModal, hideModal } = useModal();

	const { mutate, isPending, isError, error } = useMutation<
		ReportResponse,
		AxiosError<ApiErrorResponse>,
		SubmitReportVariables,
		unknown
	>({
		mutationFn: submitReport,
		onSuccess: (data) => {
			showModal({
				title: '신고 접수',
				children: '신고가 성공적으로 접수되었습니다.',
				primaryButton: {
					text: '확인',
					onClick: () => {
						hideModal();
						router.navigate('/home');
					},
				},
			});
			Promise.all([
				queryClient.invalidateQueries({ queryKey: ['liked', 'of-me'] }),
				queryClient.invalidateQueries({ queryKey: ['preview-history'] }),
				queryClient.invalidateQueries({ queryKey: ['liked', 'to-me'] }),
			]);
		},
		onError: (error) => {
			console.error('신고 제출 중 오류 발생:', error);
			const errorMessage =
				error.response?.data?.message || '신고 제출에 실패했습니다. 다시 시도해주세요.';
			showModal({
				title: '신고 실패',
				children: errorMessage,
				primaryButton: {
					text: '확인',
					onClick: () => hideModal(),
				},
			});
		},
	});

	return { mutate, isLoading: isPending, isError, error };
}
