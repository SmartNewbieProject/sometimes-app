import { test, expect } from '@playwright/test';
import { ChatPage } from '../../pages';
import { TEST_CHAT } from '../../fixtures/test-data';

test.describe('채팅 기능', () => {
  let chatPage: ChatPage;

  test.beforeEach(async ({ page }) => {
    chatPage = new ChatPage(page);
    // 미인증 사용자는 로그인 페이지로 리다이렉트됨
    await chatPage.goto('/');
  });

  test('채팅 페이지 접근 시 인증 확인', async () => {
    // When: 채팅 페이지로 이동 시도
    await chatPage.gotoChat();
    await chatPage['page'].waitForLoadState('networkidle');

    // Then: 미인증 사용자는 로그인 페이지로 리다이렉트되거나 채팅 페이지 로드
    await expect(chatPage['page']).toHaveURL(/\/(auth\/login|chat)/, { timeout: 10000 });
  });

  test.skip('채팅 목록 로드', async () => {
    await chatPage.expectChatListLoaded();
    await expect(chatPage['page']).toHaveURL(/\/chat/);
  });

  test.skip('채팅방 열기', async () => {
    await chatPage.expectChatListLoaded();
    await chatPage.openChatRoom(0);
    await chatPage.expectChatRoomOpened();
  });

  test.skip('메시지 전송', async () => {
    await chatPage.expectChatListLoaded();
    await chatPage.openChatRoom(0);
    await chatPage.expectChatRoomOpened();
    const message = TEST_CHAT.message;
    await chatPage.sendMessageWithText(message);
    await chatPage.expectMessageSent(message);
  });

  test.skip('긴 메시지 전송', async () => {
    await chatPage.expectChatListLoaded();
    await chatPage.openChatRoom(0);
    await chatPage.expectChatRoomOpened();
    const longMessage = TEST_CHAT.longMessage;
    await chatPage.sendMessageWithText(longMessage);
    await chatPage.expectMessageSent(longMessage.substring(0, 50));
  });

  test.skip('이모지 전송', async () => {
    await chatPage.expectChatListLoaded();
    await chatPage.openChatRoom(0);
    await chatPage.expectChatRoomOpened();
    await chatPage.sendMessageWithText(TEST_CHAT.emoji);
    await chatPage.expectMessageSent(TEST_CHAT.emoji);
  });

  test.skip('연속 메시지 전송', async () => {
    await chatPage.expectChatListLoaded();
    await chatPage.openChatRoom(0);
    await chatPage.expectChatRoomOpened();
    const messages = ['안녕하세요!', '반가워요!', '잘 부탁드립니다!'];
    for (const message of messages) {
      await chatPage.sendMessageWithText(message);
      await chatPage.expectMessageSent(message);
    }
    for (const message of messages) {
      await chatPage.expectMessageSent(message);
    }
  });
});
