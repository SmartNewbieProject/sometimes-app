import {
    ImageResources,
    parser,
} from "@/src/shared/libs";
import { ImageResource, Text } from "@/src/shared/ui";
import { Image } from "expo-image";
import { View } from "react-native";
import { semanticColors } from "@/src/shared/constants/colors";


interface PartnerInfoBlockProps {
    partner: any; // Using any for now to match the flexibility
}

export const PartnerBasicInfo = ({ partner }: PartnerInfoBlockProps) => {
    const basicInfoItems = [
        {
            icon: ImageResources.BEER,
            label:
                parser.getSingleOption("음주 선호도", partner.characteristics) ??
                "정보 없음",
        },
        {
            icon: ImageResources.SMOKE,
            label:
                parser.getSingleOption("흡연 선호도", partner.characteristics) ??
                "정보 없음",
        },
        {
            icon: ImageResources.TATOO,
            prefix: "문신 : ",
            label:
                parser.getSingleOption("문신 선호도", partner.characteristics) ??
                "정보 없음",
        },
        {
            icon: ImageResources.AGE,
            prefix: "선호 연령 : ",
            label:
                parser.getSingleOption("선호 나이대", partner.preferences) ??
                "상관없음",
        },
    ];

    if (partner.gender === "MALE") {
        basicInfoItems.push({
            icon: ImageResources.ARMY,
            label:
                parser.getSingleOption("군필 여부", partner.characteristics) ??
                "정보 없음",
        });
    }

    return (
        <View className="px-5 py-6">
            <Text
                style={{ color: semanticColors.text.muted }}
                className="text-[18px] mb-4"
            >
                기본 정보
            </Text>
            <View
                style={{ backgroundColor: semanticColors.surface.surface }}
                className="rounded-2xl p-5 flex-row flex-wrap justify-between"
            >
                {basicInfoItems.map((info, index) => (
                    <View key={index} className="w-[48%] flex-row items-center mb-4">
                        <ImageResource resource={info.icon} width={24} height={24} />
                        <Text
                            style={{ color: semanticColors.text.secondary }}
                            className="ml-2 font-medium text-sm flex-1"
                            numberOfLines={1}
                        >
                            {info.prefix && (
                                <Text
                                    style={{
                                        color: semanticColors.text.secondary,
                                        fontSize: 14,
                                    }}
                                >
                                    {info.prefix}
                                </Text>
                            )}
                            {info.label}
                        </Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

export const PartnerMBTI = ({ partner }: PartnerInfoBlockProps) => {
    return (
        <View className="px-5 pb-6">
            <View className="w-full aspect-[280/160]">
                <ImageResource
                    resource={ImageResources[partner.mbti as keyof typeof ImageResources]}
                    width="100%"
                    height="100%"
                />
            </View>
        </View>
    );
};
