import { LegendList } from "@legendapp/list";
import { Image } from "expo-image";
import * as MediaLibrary from "expo-media-library";
import React, { useCallback, useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  SlideOutDown,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatCamera from "./camera";

interface GalleryListProps {
  isPhotoClicked: boolean;
}

export default function GalleryList({ isPhotoClicked }: GalleryListProps) {
  const [photos, setPhotos] = useState<MediaLibrary.Asset[]>([firstDummy]);
  const [endCursor, setEndCursor] = useState<string | null>(null);
  const insets = useSafeAreaInsets();
  const [hasNextPage, setHasNextPage] = useState(true);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const heightAnim = useSharedValue(0);
  const [permissionGranted, setPermissionGranted] = useState(false);
  useEffect(() => {
    if (permissionGranted && photos.length === 0) {
      loadPhotos();
    }
  }, [permissionGranted]);

  useEffect(() => {
    requestPermission();
  }, []);

  useEffect(() => {
    if (isPhotoClicked) {
      heightAnim.value = withTiming(760, { duration: 300 });
    } else {
      heightAnim.value = withTiming(0, { duration: 1000 });
    }
  }, [isPhotoClicked]);

  const animatedStyle = useAnimatedStyle(() => {
    return { height: heightAnim.value };
  });

  const requestPermission = async () => {
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync(false, [
        "photo",
      ]);
      console.log("status", status);
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
    if (loading || !hasNextPage) {
      return;
    }

    setLoading(true);
    try {
      const result = await MediaLibrary.getAssetsAsync({
        mediaType: "photo",
        first: 20,
        after: endCursor ?? undefined,
        sortBy: [MediaLibrary.SortBy.creationTime],
      });

      setPhotos((prevPhotos) => {
        const existingIds = new Set(prevPhotos.map((p) => p.id));

        const newPhotos = result.assets.filter(
          (asset) => !existingIds.has(asset.id)
        );

        return [...prevPhotos, ...newPhotos];
      });
      setEndCursor(result.endCursor);
      console.log("result", result);
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
      exiting={SlideOutDown.duration(300)}
      style={[
        {
          backgroundColor: "#fff",
          paddingTop: 12,
          paddingBottom: insets.bottom,
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
          renderItem={({ item, index }) =>
            index === 0 ? <ChatCamera /> : renderItem({ item })
          }
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
    backgroundColor: "rgba(0,0,0,0.5)",
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

const firstDummy = {
  id: "하나_둘_셋_야!",
  filename: "천방지축_어리둥절_빙글빙글_",
  uri: "돌아가는_짱구의_하루",
  mediaType: MediaLibrary.MediaType.photo,
  mediaSubtypes: ["hdr" as MediaLibrary.MediaSubtype],
  width: 4032,
  height: 3024,
  creationTime: 1724644800000,
  modificationTime: 1724644860000,
  duration: 0,
  albumId: "우리의_짱구는_정말_못말려",
};
