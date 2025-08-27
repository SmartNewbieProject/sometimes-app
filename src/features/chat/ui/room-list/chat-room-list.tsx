import { LegendList } from "@legendapp/list";
import { FlashList } from "@shopify/flash-list";
import React from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import type { ChatRoom } from "../../types/chat";
import ChatRoomCard from "./chat-room-card";

interface ChatRoomListProps {
  data: ChatRoom[];
}

function ChatRoomList({ data }: ChatRoomListProps) {
  return (
    <View>
      {data.length > 0 &&
        (Platform.OS === "web" ? (
          <FlashList
            data={data}
            estimatedItemSize={80}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ChatRoomCard item={item} />}
          />
        ) : (
          <LegendList
            data={data}
            estimatedItemSize={80}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ChatRoomCard item={item} />}
            recycleItems
          />
        ))}
    </View>
  );
}

export const dummyChatRooms: ChatRoom[] = [
  {
    id: "chatroom-uuid-1",
    lastMessage: "네, 그럼 내일 오후 2시에 뵙겠습니다! 좋은 하루 되세요.",
    lastMessageAt: "2025-08-27T11:05:00.000Z",
    unreadCount: 2,
    partner: {
      profileImage: "https://picsum.photos/seed/1/200/200",
      name: "김민준",
      university: "한밭대학교",
      department: "컴퓨터공학과",
    },
  },
  {
    id: "chatroom-uuid-2",
    lastMessage: "ㅋㅋㅋㅋㅋ 진짜요? 몰랐네요.",
    lastMessageAt: "2025-08-27T10:30:00.000Z",
    unreadCount: 0,
    partner: {
      profileImage: "https://picsum.photos/seed/2/200/200",
      name: "이서연",
      university: "KAIST",
      department: "산업디자인학과",
    },
  },
  {
    id: "chatroom-uuid-3",
    lastMessage: "과제 관련해서 질문 하나만 드려도 될까요?",
    lastMessageAt: "2025-08-27T09:15:00.000Z",
    unreadCount: 1,
    partner: {
      profileImage: "https://picsum.photos/seed/3/200/200",
      name: "박지훈",
      university: "충남대학교",
      department: "기계공학부",
    },
  },
  {
    id: "chatroom-uuid-4",
    lastMessage: "사진 보내주셔서 정말 감사해요!",
    lastMessageAt: "2025-08-26T22:48:00.000Z",
    unreadCount: 0,
    partner: {
      profileImage: "https://picsum.photos/seed/4/200/200",
      name: "최수빈",
      university: "고려대학교",
      department: "미디어학부",
    },
  },
  {
    id: "chatroom-uuid-5",
    lastMessage: "알겠습니다. 확인 후 다시 연락드릴게요.",
    lastMessageAt: "2025-08-26T18:00:00.000Z",
    unreadCount: 0,
    partner: {
      profileImage: "https://picsum.photos/seed/5/200/200",
      name: "정하윤",
      university: "연세대학교",
      department: "영어영문학과",
    },
  },
  {
    id: "chatroom-uuid-6",
    lastMessage: "오늘 발표 정말 멋있었어요! 최고예요👍",
    lastMessageAt: "2025-08-26T15:22:00.000Z",
    unreadCount: 3,
    partner: {
      profileImage: "https://picsum.photos/seed/6/200/200",
      name: "강도현",
      university: "서울대학교",
      department: "화학생명공학부",
    },
  },
  {
    id: "chatroom-uuid-7",
    lastMessage: "좋아요! 저도 그 영화 보고 싶었어요.",
    lastMessageAt: "2025-08-25T20:10:00.000Z",
    unreadCount: 0,
    partner: {
      profileImage: "https://picsum.photos/seed/7/200/200",
      name: "윤지아",
      university: "성균관대학교",
      department: "소프트웨어학과",
    },
  },
  {
    id: "chatroom-uuid-8",
    lastMessage: "다음에 또 봬요!",
    lastMessageAt: "2025-08-25T13:05:00.000Z",
    unreadCount: 0,
    partner: {
      profileImage: "https://picsum.photos/seed/8/200/200",
      name: "임태민",
      university: "한양대학교",
      department: "건축학부",
    },
  },
  {
    id: "chatroom-uuid-9",
    lastMessage: "혹시 스터디 참여 가능하신가요?",
    lastMessageAt: "2025-08-24T16:55:00.000Z",
    unreadCount: 1,
    partner: {
      profileImage: "https://picsum.photos/seed/9/200/200",
      name: "송예은",
      university: "서강대학교",
      department: "경제학과",
    },
  },
  {
    id: "chatroom-uuid-10",
    lastMessage: "넵 ㅎㅎ",
    lastMessageAt: "2025-08-23T19:40:00.000Z",
    unreadCount: 0,
    partner: {
      profileImage: "https://picsum.photos/seed/10/200/200",
      name: "한지우",
      university: "경희대학교",
      department: "정치외교학과",
    },
  },
];

const styles = StyleSheet.create({});

export default ChatRoomList;
