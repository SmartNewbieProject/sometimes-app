import { cn } from '@/src/shared/libs/cn';
import { Text } from '@/src/shared/ui/text';
import { Pressable, View, type ViewStyle } from 'react-native';

export interface Tab {
	id: string;
	label: string;
}

interface ToggleTabProps {
	tabs: Tab[];
	activeTab: string;
	onTabChange: (tabId: string) => void;
	className?: string;
	style?: ViewStyle;
}

export const ToggleTab = ({ tabs, activeTab, onTabChange, className, style }: ToggleTabProps) => {
	return (
		<View
			className={cn('flex-row rounded-full bg-[#F6F2FF] p-1.5 relative', className)}
			style={[
				style,
				{
					borderTopWidth: 2.5,
					borderColor: 'rgba(0, 0, 0, 0.1)', // 보라색 계열의 어두운 색상
				},
			]}
		>
			{tabs.map((tab) => {
				const isActive = activeTab === tab.id;
				return (
					<Pressable
						key={tab.id}
						onPress={() => onTabChange(tab.id)}
						className={cn('relative py-2.5 px-4', isActive && 'z-10')}
					>
						{isActive && <View className="absolute inset-1 bg-primaryPurple rounded-full" />}
						<Text
							size="sm"
							weight="medium"
							textColor={isActive ? 'white' : 'pale-purple'}
							className="text-center"
						>
							{tab.label}
						</Text>
					</Pressable>
				);
			})}
		</View>
	);
};
