import { Keyboard, Pressable, Text } from "react-native";
import { FlatList } from "react-native-gesture-handler";

const renderItem = ({ item }: { item: { text: string } }) => (
  <Text style={{ height: 80 }}>{item.text}</Text>
);

interface ChatListProps {
  setPhotoClicked: React.Dispatch<React.SetStateAction<boolean>>;
}
const ChatList = ({ setPhotoClicked }: ChatListProps) => {
  const handlePress = () => {
    setTimeout(() => {
      setPhotoClicked(false);
    }, 400);
    Keyboard.dismiss();
  };
  return (
    <Pressable onPress={handlePress}>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 10,
          gap: 10,
        }}
        automaticallyAdjustContentInsets={false}
        inverted={true}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        contentInsetAdjustmentBehavior="never"
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 80,
        }}
        automaticallyAdjustKeyboardInsets={true}
      />
    </Pressable>
  );
};

const data = [
  { id: "1", text: "안녕하세요 감사해요 잘있어요 다시만나요1" },
  { id: "2", text: "안녕하세요 감사해요 잘있어요 다시만나요" },
  { id: "3", text: "안녕하세요 감사해요 잘있어요 다시만나요" },
  { id: "4", text: "안녕하세요 감사해요 잘있어요 다시만나요" },
  { id: "5", text: "안녕하세요 감사해요 잘있어요 다시만나요" },
  { id: "6", text: "안녕하세요 감사해요 잘있어요 다시만나요" },
  { id: "7", text: "안녕하세요 감사해요 잘있어요 다시만나요" },
  { id: "8", text: "안녕하세요 감사해요 잘있어요 다시만나요" },
  { id: "9", text: "안녕하세요 감사해요 잘있어요 다시만나요" },
  { id: "10", text: "안녕하세요 감사해요 잘있어요 다시만나요" },
  { id: "11", text: "잘있어요 다시만나요1" },
  { id: "12", text: "잘있어요 다시만나요2" },
  { id: "13", text: "잘있어요 다시만나요3" },
  { id: "14", text: "잘있어요 다시만나요4" },
  { id: "15", text: "잘있어요 다시만나요5" },
  { id: "16", text: "잘있어요 다시만나요6" },
  { id: "17", text: "잘있어요 다시만나요7" },
];

export default ChatList;
