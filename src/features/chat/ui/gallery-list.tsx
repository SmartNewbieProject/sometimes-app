import { LegendList } from "@legendapp/list";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Animated, {
  KeyboardState,
  Layout,
  LinearTransition,
  runOnJS,
  useAnimatedKeyboard,
  useAnimatedReaction,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function GalleryList() {
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const insets = useSafeAreaInsets();
  const [permissionGranted, setPermissionGranted] = useState(false);
  useEffect(() => {
    if (permissionGranted && photos.length === 0) {
      loadPhotos();
    }
  }, [permissionGranted]);

  useEffect(() => {
    requestPermission();
  }, []);

  const keyboard = useAnimatedKeyboard();

  const animatedStyle = useAnimatedStyle(() => {
    const target = keyboard.height.value > 0 ? keyboard.height.value : 300;
    return { height: target };
  });

  const requestPermission = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === "granted") {
        setPermissionGranted(true);
      } else {
        Alert.alert("권한 필요", "갤러리 접근 권한이 필요합니다.", [
          { text: "확인" },
        ]);
      }
    } catch (error) {
      console.error("Permission request failed:", error);
    }
  };

  const loadPhotos = async () => {
    console.log("check", hasNextPage, loading, permissionGranted, endCursor);
    if (loading || !hasNextPage) {
      return;
    }

    setLoading(true);
    try {
      console.log("check point 1.5");
      const result = await MediaLibrary.getAssetsAsync({
        mediaType: "photo",
        after: endCursor ?? undefined,
        sortBy: [MediaLibrary.SortBy.creationTime],
      });
      console.log("check point2", result.totalCount);

      setPhotos((prevPhotos) => {
        const existingIds = new Set(prevPhotos.map((p) => p.id));

        const newPhotos = result.assets.filter(
          (asset) => !existingIds.has(asset.id)
        );

        return [...prevPhotos, ...newPhotos];
      });
      setEndCursor(result.endCursor);
      console.log("result", result.endCursor);
      setHasNextPage(result.hasNextPage);
    } catch (error) {
      console.error("Failed to load photos:", error);
      Alert.alert("오류", "사진을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = useCallback((uri: string) => {
    setSelected((prev) =>
      prev.includes(uri) ? prev.filter((i) => i !== uri) : [...prev, uri]
    );
  }, []);
  console.log("photo", photos.length);
  const renderItem = ({ item }: { item: MediaLibrary.Asset }) => {
    return (
      <Pressable onPress={() => toggleSelect(item.uri)} style={styles.imageBox}>
        <Image
          source={{ uri: item.uri }}
          style={styles.image}
          resizeMode="cover"
        />
        {selected.includes(item.uri) && (
          <View style={styles.overlay}>
            <Text style={styles.check}>✓</Text>
          </View>
        )}
      </Pressable>
    );
  };

  const handleEndReached = () => {
    console.log("test point");
    loadPhotos();
  };

  if (!permissionGranted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>갤러리 접근 권한이 필요합니다</Text>
      </View>
    );
  }

  return (
    <Animated.View
      layout={LinearTransition}
      style={[
        {
          backgroundColor: "#fff",
        },
        animatedStyle,
      ]}
    >
      {photos.length > 0 && (
        <LegendList
          data={photos}
          numColumns={3}
          onEndReachedThreshold={0.3}
          onEndReached={handleEndReached}
          estimatedItemSize={120}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderItem({ item })}
          recycleItems
        />
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  imageBox: {
    flex: 1,
    aspectRatio: 1,
    margin: 1,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)", // 좀 더 진한 오버레이
    alignItems: "center",
    justifyContent: "center",
  },
  check: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
  },
  permissionContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
});
