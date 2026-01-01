import { useMemo, useState } from 'react';
import i18n from '@/src/shared/libs/i18n';
import type { Log, LogLevel } from '../types/log';

export type Tab = 'all' | 'console' | 'network';

const getConsoleEmoji = (level: LogLevel) => {
	switch (level) {
		case 'error':
			return '🚨';
		case 'warn':
			return '⚠️';
		case 'log':
			return '💬';

		case 'debug':
			return '🐞';
		default:
			return '📄';
	}
};

const getNetworkEmoji = (status: number) => {
	if (status >= 500) return '🔥';
	if (status >= 400) return '❌';
	if (status >= 300) return '➡️';
	if (status >= 200) return '✅';
	return '🌐';
};

export const useLoggerTabs = (logs: Log[]) => {
	const [activeTab, setActiveTab] = useState<Tab>('all');

	const filteredLogs = useMemo(() => {
		if (activeTab === 'console') {
			return logs.filter((log) => log.type === 'console');
		}
		if (activeTab === 'network') {
			return logs.filter((log) => log.type === 'network');
		}
		return logs;
	}, [logs, activeTab]);

	const handleTabChange = (tab: Tab) => {
		setActiveTab(tab);
	};
	const sendLogsToSlack = async () => {
		const webhookUrl = process.env.EXPO_PUBLIC_SLACK_LOGGER ?? '';

		if (!webhookUrl.startsWith('https://hooks.slack.com')) {
			console.warn('유효한 Slack 웹훅 URL을 입력해주세요.');
			return;
		}

		const blocks = [...logs.slice(0, 20)].flatMap((log) => {
			if (log.type === 'console') {
				const { level, data } = log;
				const emoji = getConsoleEmoji(level);

				const message = data.map((d) => JSON.stringify(d, null, 2)).join(' ');
				const truncatedMessage =
					message.length > 2800 ? `${message.substring(0, 2800)}...` : message;

				return {
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: `${emoji} *[${level.toUpperCase()}]*\n\`\`\`${truncatedMessage}\`\`\``,
					},
				};
			}

			if (log.type === 'network') {
				const { status, method, url, duration, responseBody } = log;
				const emoji = getNetworkEmoji(status);
				const truncatedBody =
					responseBody && responseBody.length > 2000
						? `${responseBody.substring(0, 2000)}...`
						: responseBody;

				const mainBlock = {
					type: 'section',
					text: {
						type: 'mrkdwn',
						text: `${emoji} *${status}* \`${method}\` - ${url} (${duration})`,
					},
				};

				if (truncatedBody) {
					const contextBlock = {
						type: 'context',
						elements: [
							{
								type: 'mrkdwn',
								text: `*Response Body:*\n\`\`\`${truncatedBody}\`\`\``,
							},
						],
					};
					return [mainBlock, contextBlock, { type: 'divider' }];
				}

				return [mainBlock, { type: 'divider' }];
			}

			return [];
		});

		try {
			const response = await fetch(webhookUrl, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					text: i18n.t('hooks.새로운_앱_로그가_도착했습니다'), // 알림용 대체 텍스트
					blocks: [
						{
							type: 'header',
							text: {
								type: 'plain_text',
								text: '📱 앱 로그 리포트',
							},
						},
						...blocks,
					],
				}),
			});

			if (response.ok) {
				console.log('상세 로그가 슬랙으로 성공적으로 전송되었습니다.');
			} else {
				console.error('슬랙 전송 실패:', await response.text());
			}
		} catch (error) {
			console.error('슬랙 전송 중 네트워크 오류가 발생했습니다:', error);
		}
	};

	return { activeTab, filteredLogs, handleTabChange, sendLogsToSlack };
};
