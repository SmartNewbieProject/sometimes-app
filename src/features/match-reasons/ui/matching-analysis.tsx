import { semanticColors } from "@/src/shared/constants/colors";
import { Image } from "expo-image";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    Easing,
} from "react-native-reanimated";

interface Props {
    imageUrl?: string;
}

const ANALYSIS_STEPS = [
    "미호가 연결고리를 찾고 있어요!",
    "어떤 점이 통했는지 분석 중...",
    "숨겨진 매력 포인트를 발견했어요!",
    "두 분이 연결된 이유를 알려드릴게요!",
];

export default function MatchingAnalysis({ imageUrl }: Props) {
    const [stepIndex, setStepIndex] = useState(0);
    const scanPosition = useSharedValue(0);

    useEffect(() => {
        console.log("MatchingAnalysis mounted");
        // Text rotation logic
        const interval = setInterval(() => {
            setStepIndex((prev) => (prev + 1) % ANALYSIS_STEPS.length);
        }, 1000);

        // Scanning animation
        scanPosition.value = withRepeat(
            withTiming(1, { duration: 2000, easing: Easing.linear }),
            -1,
            true
        );

        return () => clearInterval(interval);
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ translateY: scanPosition.value * 120 }], // 120 is the height
    }));

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                {imageUrl && (
                    <Image
                        source={{ uri: imageUrl }}
                        style={styles.image}
                        contentFit="cover"
                    />
                )}
                <View style={styles.overlay} />
                <Animated.View style={[styles.scanLine, animatedStyle]} />
            </View>
            <Text style={styles.text}>{ANALYSIS_STEPS[stepIndex]}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 24,
        gap: 24,
    },
    imageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        overflow: "hidden",
        borderWidth: 2,
        borderColor: semanticColors.brand.primary,
        position: "relative",
    },
    image: {
        width: "100%",
        height: "100%",
        opacity: 0.8,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    scanLine: {
        position: "absolute",
        left: 0,
        right: 0,
        height: 2,
        backgroundColor: semanticColors.brand.accent,
        shadowColor: semanticColors.brand.accent,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 5,
        zIndex: 10,
    },
    text: {
        fontSize: 24,
        fontWeight: "600",
        color: semanticColors.text.primary,
        minWidth: 150,
        textAlign: "center",
    },
});
