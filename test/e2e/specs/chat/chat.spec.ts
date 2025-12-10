import { test, expect } from '@playwright/test';
import { ChatPage } from '../../pages';
import { TEST_CHAT } from '../../fixtures/test-data';

test.describe('채팅 기능', () => {
  let chatPage: ChatPage;

  test.beforeEach(async ({ page }) => {
    chatPage = new ChatPage(page);
    // TODO: 로그인 상태로 만들기
    await chatPage.gotoChatList();
  });

  test('채팅 목록 로드', async () => {
    // When: 채팅 목록 페이지 접근
    await chatPage.expectChatListLoaded();

    // Then: 채팅 목록이 표시됨
    await expect(chatPage['page']).toHaveURL(/\/chat/);
  });

  test('채팅방 열기', async () => {
    // Given: 채팅 목록이 로드됨
    await chatPage.expectChatListLoaded();

    // When: 첫 번째 채팅방 클릭
    await chatPage.openChatRoom(0);

    // Then: 채팅방이 열림
    await chatPage.expectChatRoomOpened();
  });

  test('메시지 전송', async () => {
    // Given: 채팅방이 열려있음
    await chatPage.expectChatListLoaded();
    await chatPage.openChatRoom(0);
    await chatPage.expectChatRoomOpened();

    // When: 메시지 입력 및 전송
    const message = TEST_CHAT.message;
    await chatPage.sendMessageWithText(message);

    // Then: 메시지가 채팅창에 표시됨
    await chatPage.expectMessageSent(message);
  });

  test('긴 메시지 전송', async () => {
    // Given: 채팅방이 열려있음
    await chatPage.expectChatListLoaded();
    await chatPage.openChatRoom(0);
    await chatPage.expectChatRoomOpened();

    // When: 긴 메시지 전송
    const longMessage = TEST_CHAT.longMessage;
    await chatPage.sendMessageWithText(longMessage);

    // Then: 긴 메시지가 전송됨
    await chatPage.expectMessageSent(longMessage.substring(0, 50)); // 일부만 검증
  });

  test('이모지 전송', async () => {
    // Given: 채팅방이 열려있음
    await chatPage.expectChatListLoaded();
    await chatPage.openChatRoom(0);
    await chatPage.expectChatRoomOpened();

    // When: 이모지 전송
    await chatPage.sendMessageWithText(TEST_CHAT.emoji);

    // Then: 이모지가 전송됨
    await chatPage.expectMessageSent(TEST_CHAT.emoji);
  });

  test('연속 메시지 전송', async () => {
    // Given: 채팅방이 열려있음
    await chatPage.expectChatListLoaded();
    await chatPage.openChatRoom(0);
    await chatPage.expectChatRoomOpened();

    // When: 여러 메시지 연속 전송
    const messages = ['안녕하세요!', '반가워요!', '잘 부탁드립니다!'];
    for (const message of messages) {
      await chatPage.sendMessageWithText(message);
      await chatPage.expectMessageSent(message);
    }

    // Then: 모든 메시지가 전송됨
    for (const message of messages) {
      await chatPage.expectMessageSent(message);
    }
  });
});
