import { useCallback, useEffect, useRef } from 'react';
import { useChatStore } from '../store/chat';
import type { 
  ChatSocketEventName, 
  ChatSocketEventPayloads, 
  EventCallback 
} from '../types/socket-events';
import { nanoid } from 'nanoid';

interface EventSubscription {
  id: string;
  callback: EventCallback<any>;
}

class SocketEventManager {
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private socket: any = null;
  private registeredEvents = new Set<string>();

  setSocket(socket: any) {
    // 소켓 변경 시 기존 이벤트 정리 후 재등록
    if (this.socket !== socket) {
      this.cleanup();
      this.socket = socket;
      this.initializeEvents();
    }
  }

  subscribe<T extends ChatSocketEventName>(
    eventName: T, 
    callback: (data: ChatSocketEventPayloads[T]) => void
  ): string {
    const id = `${eventName}_${nanoid(4)}`;
    
    if (!this.subscriptions.has(eventName)) {
      this.subscriptions.set(eventName, []);
    }
    
    this.subscriptions.get(eventName)!.push({ id, callback });
    
    if (!this.registeredEvents.has(eventName) && this.socket) {
      this.registerSocketListener(eventName);
    }
    
    return id;
  }

  unsubscribe(eventName: string, subscriptionId: string) {
    const subs = this.subscriptions.get(eventName);
    if (!subs) return;
    
    const newSubs = subs.filter(sub => sub.id !== subscriptionId);
    
    if (newSubs.length === 0) {
      this.subscriptions.delete(eventName);
      if (this.socket && this.registeredEvents.has(eventName)) {
        this.socket.off(eventName);
        this.registeredEvents.delete(eventName);
      }
    } else {
      this.subscriptions.set(eventName, newSubs);
    }
  }

  private registerSocketListener(eventName: string) {
    if (!this.socket) {
      return;
    }
    
    // 기존 리스너 정리
    this.socket.off(eventName);
    
    this.socket.on(eventName, (data: any) => {
      const subs = this.subscriptions.get(eventName);
      if (subs) {
        subs.forEach(sub => {
          try {
            sub.callback(data);
          } catch (error) {
            console.error(`Error in ${eventName} callback:`, error);
          }
        });
      }
    });
    
    this.registeredEvents.add(eventName);
  }

  initializeEvents() {
    if (!this.socket) return;
    
    for (const eventName of this.subscriptions.keys()) {
      if (!this.registeredEvents.has(eventName)) {
        this.registerSocketListener(eventName);
      }
    }
  }

  cleanup() {
    if (this.socket) {
      for (const eventName of this.registeredEvents) {
        this.socket.off(eventName);
      }
    }
    this.registeredEvents.clear();
  }
}

const eventManager = new SocketEventManager();

export const useSocketEventManager = () => {
  const { socket } = useChatStore();
  const subscriptionsRef = useRef<Map<string, string>>(new Map());

  useEffect(() => {
    if (socket) {
      eventManager.setSocket(socket);
      eventManager.initializeEvents();
    }
  }, [socket]);

  const subscribe = useCallback(<T extends ChatSocketEventName>(
    eventName: T, 
    callback: (data: ChatSocketEventPayloads[T]) => void
  ) => {
    const subscriptionId = eventManager.subscribe(eventName, callback);
    subscriptionsRef.current.set(eventName, subscriptionId);
    
    return () => {
      eventManager.unsubscribe(eventName, subscriptionId);
      subscriptionsRef.current.delete(eventName);
    };
  }, []);

  useEffect(() => {
    return () => {
      subscriptionsRef.current.forEach((subscriptionId, eventName) => {
        eventManager.unsubscribe(eventName, subscriptionId);
      });
      subscriptionsRef.current.clear();
    };
  }, []);

  return { subscribe };
};
