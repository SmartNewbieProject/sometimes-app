import { Text } from '@shared/ui';
import { View } from 'react-native';

type Props = {
	classNames?: string;
	totalPrice: number;
	originalPrice?: number;
	salesPercent?: number;
};

export const PriceDisplay = ({ classNames, totalPrice, originalPrice, salesPercent }: Props) => {
	const showSales =
		(originalPrice && salesPercent && originalPrice > totalPrice && salesPercent) !== 0;

	return (
		<View className={classNames}>
			<View className="flex-row items-center">
				<Text weight="semibold" textColor="black" className="mr-2">
					총
				</Text>
				<Text weight="semibold" size="lg" textColor="purple">
					{totalPrice.toLocaleString()}
				</Text>
				<Text weight="semibold" textColor="black" className="ml-1">
					원
				</Text>
			</View>

			{showSales && (
				<View className="flex-row justify-end mb-1">
					<Text size="sm" textColor="light" className="line-through mr-1">
						{originalPrice?.toLocaleString()}원
					</Text>
					<Text size="sm" textColor="purple" weight="semibold">
						{salesPercent}% 할인
					</Text>
				</View>
			)}
		</View>
	);
};
