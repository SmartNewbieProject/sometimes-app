import React, { useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import useLiked from "../../like/hooks/use-liked";
import ChatHeader from "./chat-header";
import ChatSearch from "./chat-search";
import ChatLikeCollapse from "./room-list/chat-like-collapse";
import ChatRoomList, { dummyChatRooms } from "./room-list/chat-room-list";

function Chat() {
  const { showCollapse } = useLiked();
  const [keyword, setKeyword] = useState("");
  const collapse = showCollapse();

  const filteredData = dummyChatRooms.filter((item) => {
    return item.partner.name.includes(keyword);
  });
  return (
    <>
      <ChatHeader />
      <ScrollView>
        {collapse && (
          <ChatLikeCollapse type={collapse.type} collapse={collapse.data} />
        )}
        <View style={{ height: 18 }} />
        <ChatSearch keyword={keyword} setKeyword={setKeyword} />
        <ChatRoomList data={filteredData} />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({});

export default Chat;
