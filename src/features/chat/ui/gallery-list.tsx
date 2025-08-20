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

export default function GalleryList() {
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);

  useEffect(() => {
    requestPermission();
  }, []);

  const requestPermission = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status === "granted") {
        setPermissionGranted(true);
        console.log("check point1");
        await loadPhotos();
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
    if (!hasNextPage || loading || !permissionGranted) return;

    setLoading(true);
    try {
      console.log("check point 1.5");
      const result = await MediaLibrary.getAssetsAsync({
        first: 30,
        mediaType: "photo",
        after: endCursor ?? undefined,
        sortBy: [MediaLibrary.SortBy.creationTime],
      });
      console.log("check point2");

      setPhotos((prev) => [...prev, ...result.assets]);
      setEndCursor(result.endCursor);
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

  const renderItem = useCallback(
    ({ item }: { item: MediaLibrary.Asset }) => (
      <Pressable onPress={() => toggleSelect(item.uri)} style={styles.imageBox}>
        <Image
          source={{ uri: item.uri }}
          style={styles.image}
          resizeMode="cover" // 이미지가 박스에 맞게 조정
        />
        {selected.includes(item.uri) && (
          <View style={styles.overlay}>
            <Text style={styles.check}>✓</Text>
          </View>
        )}
      </Pressable>
    ),
    [selected, toggleSelect]
  );

  const handleEndReached = useCallback(() => {
    loadPhotos();
  }, [hasNextPage, loading, permissionGranted]);

  if (!permissionGranted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>갤러리 접근 권한이 필요합니다</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={photos}
      numColumns={3}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      getItemLayout={(data, index) => ({
        length: 120, // 예상 아이템 높이 (화면 너비 / 3)
        offset: Math.floor(index / 3) * 120,
        index,
      })}
      removeClippedSubviews={true} // 성능 최적화
      maxToRenderPerBatch={18} // 한 번에 렌더링할 최대 아이템 수 (6줄)
      windowSize={10} // 렌더링 윈도우 크기
      initialNumToRender={18} // 초기 렌더링 아이템 수
    />
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
