import { useModal } from "@/src/shared/hooks/use-modal";
import { convertToJpeg, isHeicBase64 } from "@/src/shared/utils/image";
import BulbIcon from "@assets/icons/bulb.svg";
import SendChatIcon from "@assets/icons/send-chat.svg";
import { useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import * as MediaLibrary from "expo-media-library";
import { useLocalSearchParams } from "expo-router";
import type React from "react";
import { type ChangeEvent, useRef, useState } from "react";
import { Alert, Linking, Platform } from "react-native";
import { useAuth } from "../../auth";
import PhotoPickerModal from "../../mypage/ui/modal/image-modal";
import useKeyboardResizeEffect from "../hooks/use-keyboard-resize-effect";
import useChatRoomDetail from "../queries/use-chat-room-detail";
import useChatTips from "../queries/use-chat-tips";
import { chatEventBus } from "../services/chat-event-bus";
import { generateTempId } from "../utils/generate-temp-id";
import ChatTipsModal from "./chat-tips-modal";

function WebChatInput() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [chat, setChat] = useState("");
  const { data: roomDetail, isError } = useChatRoomDetail(id);
  const queryClient = useQueryClient();
  const { my: user } = useAuth();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cloneRef = useRef<HTMLTextAreaElement>(null);
  const { showModal, showErrorModal } = useModal();
  const [isImageModal, setImageModal] = useState(false);
  const [isTipsModalVisible, setTipsModalVisible] = useState(false);
  const { mutate: fetchTips, data: tipsData, isPending: isTipsLoading } = useChatTips();

  const handleTipsButton = () => {
    if (roomDetail?.hasLeft) return;

    showModal({
      showLogo: true,
      customTitle: (
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%"
        }}>
          <div style={{
            color: "#000000",
            fontWeight: 700,
            fontSize: 20,
            fontFamily: "Pretendard-Bold"
          }}>
            대화 주제를 추천해드려요
          </div>
          <div style={{
            color: "#000000",
            fontWeight: 700,
            fontSize: 20,
            fontFamily: "Pretendard-Bold"
          }}>
            구슬 1개가 사용됩니다
          </div>
        </div>
      ),
      children: (
        <div style={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          alignItems: "center",
          marginTop: 5
        }}>
          <div style={{
            color: "#999999",
            fontSize: 12,
            fontFamily: "Pretendard-Regular"
          }}>
            AI가 프로필을 기반으로
          </div>
          <div style={{
            color: "#999999",
            fontSize: 12,
            fontFamily: "Pretendard-Regular"
          }}>
            대화 주제를 추천해드려요
          </div>
        </div>
      ),
      primaryButton: {
        text: "사용하기",
        onClick: () => {
          setTipsModalVisible(true);
          fetchTips(id);
        },
      },
      secondaryButton: {
        text: "취소",
        onClick: () => {},
      },
    });
  };

  const handleSelectTip = (question: string) => {
    setChat(question);
  };
  const handlePress = async () => {
    setImageModal(true);
  };
  useKeyboardResizeEffect();
  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "사진을 가져오기 위해서는 권한이 필요합니다.", [
        { text: "설정 열기", onPress: () => Linking.openSettings() },
        {
          text: "닫기",
        },
      ]);
      setImageModal(false);
      return null;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      selectionLimit: 1,
    });

    console.log(result);

    if (!result.canceled) {
      const pickedUri = result.assets[0].uri;
      if (Platform.OS === "web" && isHeicBase64(pickedUri)) {
        showErrorModal(
          "이미지 형식은 jpeg, jpg, png 형식만 가능해요",
          "announcement"
        );
        setImageModal(false);
        return null;
      }

      if (roomDetail?.partnerId && user?.id) {
        chatEventBus.emit({
          type: "IMAGE_UPLOAD_REQUESTED",
          payload: {
            to: roomDetail.partnerId,
            chatRoomId: id,
            senderId: user.id,
            file: pickedUri,
            tempId: generateTempId(),
          },
        });
      }
      setImageModal(false);
    }

    setImageModal(false);
    return null;
  };

  const takePhoto = async () => {
    let { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("권한 필요", "카메라 사용을 위해서 권한이 필요합니다", [
        { text: "설정 열기", onPress: () => Linking.openSettings() },
        {
          text: "닫기",
        },
      ]);
      setImageModal(false);
      return null;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsMultipleSelection: false,
      selectionLimit: 1,
    });
    status = (await MediaLibrary.requestPermissionsAsync()).status;
    if (status === "granted" && result.assets?.[0].uri) {
      MediaLibrary.saveToLibraryAsync(result.assets[0].uri);
    }

    if (!result.canceled) {
      const pickedUri = result.assets[0].uri;
      if (Platform.OS === "web" && isHeicBase64(pickedUri)) {
        showErrorModal(
          "이미지 형식은 jpeg, jpg, png 형식만 가능해요",
          "announcement"
        );
        setImageModal(false);
        return null;
      }
      if (roomDetail?.partnerId && user?.id) {
        chatEventBus.emit({
          type: "IMAGE_UPLOAD_REQUESTED",
          payload: {
            to: roomDetail.partnerId,
            chatRoomId: id,
            senderId: user.id,
            file: pickedUri,
            tempId: generateTempId(),
          },
        });

        setImageModal(false);
      } else {
        setImageModal(false);
      }
      queryClient.refetchQueries({ queryKey: ["chat-list", id] });
    } else {
      setImageModal(false);
    }
    return null;
  };
  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setChat(e.target.value);
    const elem = textareaRef.current;
    const cloneElem = cloneRef.current;
    if (!elem || !cloneElem) return;
    cloneElem.value = elem.value;

    elem.rows = Math.min(
      Math.max(Math.floor(cloneElem.scrollHeight / cloneElem.clientHeight), 1),
      3
    );
  };

  const handleSend = () => {
    console.log("chat", chat);
    if (
      !textareaRef.current ||
      chat === "" ||
      !roomDetail?.partnerId ||
      !user.id
    ) {
      return;
    }

    chatEventBus.emit({
      type: "MESSAGE_SEND_REQUESTED",
      payload: {
        to: roomDetail.partnerId,
        chatRoomId: id,
        senderId: user.id,
        content: chat,
        tempId: generateTempId(),
      },
    });
    setChat("");
  };

  return (
    <>
      <div style={webStyles.container}>
        <PhotoPickerModal
          showGuide={false}
          visible={isImageModal}
          onClose={() => setImageModal(false)}
          onTakePhoto={takePhoto}
          onPickFromGallery={pickImage}
        />
        <button
          onClick={handlePress}
          type="button"
          style={webStyles.plusButton}
        >
          <PlusIcon />
        </button>

        <button
          onClick={handleTipsButton}
          type="button"
          disabled={roomDetail?.hasLeft}
          style={{
            ...webStyles.tipsButton,
            opacity: roomDetail?.hasLeft ? 0.5 : 1,
          }}
          aria-label="대화 주제 추천"
        >
          <BulbIcon width={24} height={24} />
        </button>

        <div style={webStyles.inputWrapper}>
          <textarea
            ref={textareaRef}
            value={chat}
            onChange={handleChange}
            rows={1}
            readOnly={roomDetail?.hasLeft}
            placeholder={
              roomDetail?.hasLeft ? "대화가 종료되었어요" : "메세지를 입력하세요"
            }
            style={webStyles.textarea}
          />
          <textarea
            style={webStyles.hiddenTextarea}
            readOnly
            ref={cloneRef}
            rows={1}
          />

          {chat !== "" ? (
            <button
              type="button"
              onClick={handleSend}
              style={webStyles.sendButton}
              aria-label="Send message"
            >
              <SendChatIcon width={20} height={20} />
            </button>
          ) : (
            <div style={webStyles.sendButtonPlaceholder} />
          )}
        </div>
      </div>

      <ChatTipsModal
        visible={isTipsModalVisible}
        onClose={() => setTipsModalVisible(false)}
        tips={tipsData?.tips ?? []}
        isLoading={isTipsLoading}
        onSelectTip={handleSelectTip}
        onRefresh={() => fetchTips(id)}
      />
    </>
  );
}

const webStyles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    width: "100%",
    alignItems: "center",
    backgroundColor: "#F7F5FA",
    padding: 16,
    boxSizing: "border-box",
  },
  plusButton: {
    display: "flex",
    height: 32,
    width: 32,
    border: "none",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    backgroundColor: "#F7F5FA",
    cursor: "pointer",
  },
  tipsButton: {
    display: "flex",
    height: 40,
    width: 40,
    marginLeft: 8,
    marginRight: 8,
    border: "none",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    backgroundColor: "#FFF9E6",
    cursor: "pointer",
  },
  inputWrapper: {
    position: "relative",
    marginLeft: 12,
    display: "flex",
    flex: 1,
    alignItems: "center",
    borderRadius: 9999,
    backgroundColor: "#FFFFFF",
    paddingTop: 8,
    paddingBottom: 8,
    paddingRight: 8,
    paddingLeft: 16,
  },
  textarea: {
    flex: 1,
    lineHeight: "18px",
    resize: "none",
    overflowY: "hidden",
    backgroundColor: "transparent",
    margin: 0,
    padding: 0,
    fontSize: 16,
    color: "#374151",
    border: "none",
    outline: "none",
  },
  hiddenTextarea: {
    lineHeight: "18px",
    boxSizing: "border-box",
    width: "100%",
    resize: "none",
    overflowY: "scroll",
    margin: 0,
    padding: 0,
    position: "absolute",
    top: -9999,
    left: -9999,
    zIndex: -10,
  },
  sendButton: {
    display: "flex",
    height: 32,
    width: 32,
    flexShrink: 0,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-end",
    borderRadius: "50%",
    backgroundColor: "#7A4AE1",
    color: "#FFFFFF",
    border: "none",
    cursor: "pointer",
  },
  sendButtonPlaceholder: {
    height: 32,
    width: 32,
  },
};

function PlusIcon() {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 15"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13.125 14.75H0.875V0.75H13.125V14.75Z" />
      <path
        d="M7.875 2.9375C7.875 2.45352 7.48398 2.0625 7 2.0625C6.51602 2.0625 6.125 2.45352 6.125 2.9375V6.875H2.1875C1.70352 6.875 1.3125 7.26602 1.3125 7.75C1.3125 8.23398 1.70352 8.625 2.1875 8.625H6.125V12.5625C6.125 13.0465 6.51602 13.4375 7 13.4375C7.48398 13.4375 7.875 13.0465 7.875 12.5625V8.625H11.8125C12.2965 8.625 12.6875 8.23398 12.6875 7.75C12.6875 7.26602 12.2965 6.875 11.8125 6.875H7.875V2.9375Z"
        fill="#7A4AE1"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: <explanation>
    <svg
      width="20"
      height="20"
      viewBox="0 0 28 28"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.35569 12.79C9.66961 10.314 13.2071 8.66881 14.9835 7.87063C20.0393 5.60645 21.1022 5.21551 21.7854 5.19922C21.9372 5.19922 22.2712 5.2318 22.4989 5.42727C22.6811 5.59016 22.7267 5.80192 22.7571 5.96481C22.7875 6.1277 22.8178 6.46977 22.7875 6.7304C22.5141 9.82534 21.3299 17.3346 20.7225 20.7879C20.4645 22.2539 19.9634 22.7426 19.4776 22.7915C18.4149 22.8892 17.6101 22.0422 16.5929 21.3254C14.9835 20.2015 14.0878 19.5011 12.5239 18.3934C10.7172 17.1229 11.8862 16.4224 12.9187 15.2821C13.1919 14.989 17.8531 10.428 17.9442 10.0208C17.9593 9.97193 17.9593 9.77646 17.8531 9.67873C17.7468 9.58099 17.5949 9.61357 17.4735 9.64616C17.3065 9.67873 14.7558 11.5031 9.79107 15.103C9.0623 15.6405 8.40945 15.9012 7.81733 15.8848C7.16447 15.8686 5.9195 15.4939 4.97818 15.1682C3.83947 14.7772 2.92851 14.5655 3.00442 13.8813C3.04997 13.5229 3.50545 13.1646 4.35569 12.79Z"
        fill="white"
      />
    </svg>
  );
}

export default WebChatInput;
