import React, { useState } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import { Text } from "@/src/shared/ui";
import { semanticColors } from "@/src/shared/constants/colors";
import Feather from "@expo/vector-icons/Feather";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
    measure,
    runOnUI,
    useAnimatedRef,
} from "react-native-reanimated";

interface MatchingReasonCardProps {
    reasons: string[];
    keywords: string[];
}

export const MatchingReasonCard = ({
    reasons,
    keywords,
}: MatchingReasonCardProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const height = useSharedValue(0);

    const toggleExpand = () => {
        setIsExpanded(!isExpanded);
        // Simple toggle for now, can be animated better with layout transitions or measured height
    };

    return (
        <View style={styles.container}>
            {/* Main Reason */}
            <View style={styles.reasonContainer}>
                {reasons.map((reason, index) => (
                    <Text key={index} style={styles.reasonText} textColor="primary">
                        {reason}
                    </Text>
                ))}
            </View>

            {/* Divider */}
            <View style={styles.divider} />

            {/* Analysis Basis Header */}
            <Pressable onPress={toggleExpand} style={styles.basisHeader}>
                <Text style={styles.basisTitle} textColor="secondary">
                    분석 키워드
                </Text>
                <View style={styles.expandButton}>
                    <Text style={styles.expandText} textColor="secondary">
                        {isExpanded ? "접기" : "더보기"}
                    </Text>
                    <Feather
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={16}
                        color={semanticColors.text.secondary}
                    />
                </View>
            </Pressable>

            {/* Keywords (Collapsible) */}
            {isExpanded && (
                <View style={styles.keywordsContainer}>
                    {keywords.map((keyword, index) => (
                        <View key={index} style={styles.keywordTag}>
                            <Text style={styles.keywordText} textColor="secondary">
                                #{keyword}
                            </Text>
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: semanticColors.surface.surface,
        borderRadius: 16,
        padding: 20,
        marginHorizontal: 20,
        marginBottom: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    header: {
        marginBottom: 12,
    },
    headerTitle: {
        fontSize: 14,
        fontWeight: "600",
    },
    reasonContainer: {
        marginBottom: 16,
    },
    reasonText: {
        fontSize: 18,
        fontWeight: "700",
        lineHeight: 26,
        marginBottom: 12,
    },
    divider: {
        height: 1,
        backgroundColor: semanticColors.border.default,
        marginBottom: 16,
    },
    basisHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    basisTitle: {
        fontSize: 14,
        fontWeight: "600",
    },
    expandButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    expandText: {
        fontSize: 12,
    },
    keywordsContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 12,
    },
    keywordTag: {
        backgroundColor: semanticColors.surface.background,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: semanticColors.border.default,
    },
    keywordText: {
        fontSize: 13,
    },
});
