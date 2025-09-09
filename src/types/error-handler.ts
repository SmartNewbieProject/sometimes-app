import type { ModalOptions } from '@/src/shared/providers/modal-provider';
import type { AxiosError } from 'axios';
import type { useRouter } from 'expo-router';

type ModalHook = (options: ModalOptions) => void;

type ErrorModalHook = (message: string, type: 'announcement' | 'error') => void;

interface ApiErrorResponse {
	statusCode: number;
	message: string;
	error: string;
}

type ExpoRouter = ReturnType<typeof useRouter>;
interface HandlerContext {
	router: ExpoRouter;
	showModal: ModalHook;
	showErrorModal: ErrorModalHook;
}

export interface ErrorHandler {
	handle: (error: AxiosError<ApiErrorResponse>, context: HandlerContext) => void;
}
