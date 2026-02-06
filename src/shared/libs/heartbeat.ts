import axiosClient from './axios';

let lastHeartbeatTime = 0;
const HEARTBEAT_THROTTLE_MS = 60 * 1000; // 1분

/**
 * 서버에 heartbeat 전송 (lastLoginAt 업데이트)
 * 1분 throttle 적용으로 과도한 호출 방지
 */
export const sendHeartbeat = async (): Promise<void> => {
	const now = Date.now();
	if (now - lastHeartbeatTime < HEARTBEAT_THROTTLE_MS) {
		console.log('💓 Heartbeat throttled');
		return;
	}

	try {
		await axiosClient.get('/auth/heartbeat');
		lastHeartbeatTime = now;
		console.log('💓 Heartbeat 전송 성공');
	} catch (error) {
		console.warn('💔 Heartbeat 전송 실패:', error);
	}
};
