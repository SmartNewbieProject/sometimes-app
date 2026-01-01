import {
    ImageResources,
    parser,
} from "@/src/shared/libs";
import { ImageResource, Text } from "@/src/shared/ui";
import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";
import { semanticColors } from "@/src/shared/constants/semantic-colors";
import { useTranslation } from "react-i18next";
import { MBTICard } from "@/src/widgets/mbti-card";
import type { MBTIType } from "@/src/widgets/mbti-card";


interface PartnerInfoBlockProps {
    partner: any; // Using any for now to match the flexibility
}

export const PartnerBasicInfo = ({ partner }: PartnerInfoBlockProps) => {
    const { t } = useTranslation();
    const basicInfoItems = [
        {
            icon: ImageResources.BEER,
            label:
                parser.getSingleOption(t("ui.음주_선호도"), partner.characteristics) ??
                t("features.match.ui.partner_info_block.no_info"),
        },
        {
            icon: ImageResources.SMOKE,
            label:
                parser.getSingleOption(t("ui.흡연_선호도"), partner.characteristics) ??
                t("features.match.ui.partner_info_block.no_info"),
        },
        {
            icon: ImageResources.TATOO,
            prefix: t("features.match.ui.partner_info_block.tattoo_prefix"),
            label:
                parser.getSingleOption(t("ui.문신_선호도"), partner.characteristics) ??
                t("features.match.ui.partner_info_block.no_info"),
        },
        {
            icon: ImageResources.AGE,
            prefix: t("features.match.ui.partner_info_block.preferred_age_prefix"),
            label:
                parser.getSingleOption(t("ui.선호_나이대"), partner.preferences) ??
                t("features.match.ui.partner_info_block.doesnt_matter"),
        },
    ];

    if (partner.gender === "MALE") {
        basicInfoItems.push({
            icon: ImageResources.ARMY,
            label:
                parser.getSingleOption(t("ui.군필_여부"), partner.characteristics) ??
                t("features.match.ui.partner_info_block.no_info"),
        });
    }

    return (
        <View style={styles.container}>
            <Text
                textColor="muted"
                style={styles.title}
            >
                {t("features.match.ui.partner_info_block.basic_info_title")}
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
    if (!partner.mbti) {
        return null;
    }

    return (
        <View style={styles.mbtiContainer}>
            <MBTICard
                mbti={partner.mbti as MBTIType}
                showCompatibility={true}
            />
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
});
