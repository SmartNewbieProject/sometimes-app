import {
    ImageResources,
    parser,
} from "@/src/shared/libs";
import { ImageResource, Text } from "@/src/shared/ui";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import { semanticColors } from "@/src/shared/constants/semantic-colors";


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
        <View style={styles.container}>
            <Text
                textColor="muted"
                style={styles.title}
            >
                기본 정보
            </Text>
            <View
                style={[styles.infoCard, { backgroundColor: semanticColors.surface.surface }]}
            >
                {basicInfoItems.map((info, index) => (
                    <View key={index} style={styles.infoItem}>
                        <ImageResource resource={info.icon} width={24} height={24} />
                        <Text
                            textColor="secondary"
                            style={styles.infoText}
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
        <View style={styles.mbtiContainer}>
            <View style={styles.mbtiImageContainer}>
                <ImageResource
                    resource={ImageResources[partner.mbti as keyof typeof ImageResources]}
                    style={styles.mbtiImage}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingVertical: 24,
    },
    title: {
        fontSize: 18,
        marginBottom: 16,
    },
    infoCard: {
        borderRadius: 16,
        padding: 20,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    infoItem: {
        width: '48%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    infoText: {
        marginLeft: 8,
        fontWeight: '500',
        fontSize: 14,
        flex: 1,
    },
    mbtiContainer: {
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    mbtiImageContainer: {
        width: '100%',
        aspectRatio: 280 / 160,
    },
    mbtiImage: {
        width: '100%',
        height: '100%',
    },
});
