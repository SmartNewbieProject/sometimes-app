import { expect, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { fillInput, findByText } from '../helpers/test-helpers';

/**
 * 채팅 관련 Page Object
 */
export class ChatPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  // Selectors
  private selectors = {
    chatList: '[data-testid="chat-list"]',
    chatRoomItem: '[data-testid="chat-room-item"]',
    messageInput: '[data-testid="message-input"]',
    sendButton: '[data-testid="send-button"]',
    messageList: '[data-testid="message-list"]',
    chatRoomHeader: '[data-testid="chat-room-header"]',
  };

  /**
   * 채팅 목록으로 이동
   */
  async gotoChatList() {
    await this.goto('/chat');
  }

  /**
   * 특정 채팅방으로 이동 (인덱스 기반)
   */
  async openChatRoom(index: number = 0) {
    const chatRooms = this.page.locator(this.selectors.chatRoomItem);
    await chatRooms.nth(index).click();
    await this.waitForNavigation();
  }

  /**
   * 메시지 입력
   */
  async typeMessage(message: string) {
    await fillInput(this.page, this.selectors.messageInput, message);
  }

  /**
   * 메시지 전송
   */
  async sendMessage() {
    await this.page.locator(this.selectors.sendButton).click();
    await this.page.waitForTimeout(1000);
  }

  /**
   * 메시지 입력 및 전송
   */
  async sendMessageWithText(message: string) {
    await this.typeMessage(message);
    await this.sendMessage();
  }

  /**
   * 메시지가 전송되었는지 확인
   */
  async expectMessageSent(message: string) {
    const messageElement = await findByText(this.page, message);
    await expect(messageElement).toBeVisible({ timeout: 5000 });
  }

  /**
   * 채팅 목록이 로드되었는지 확인
   */
  async expectChatListLoaded() {
    const chatList = this.page.locator(this.selectors.chatList);
    await expect(chatList).toBeVisible({ timeout: 5000 });
  }

  /**
   * 채팅방이 열렸는지 확인
   */
  async expectChatRoomOpened() {
    const header = this.page.locator(this.selectors.chatRoomHeader);
    await expect(header).toBeVisible({ timeout: 5000 });
  }
}
