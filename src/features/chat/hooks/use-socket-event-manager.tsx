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
    this.socket = socket;
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
    if (!this.socket) return;
    
    this.socket.on(eventName, (data: any) => {
      const subs = this.subscriptions.get(eventName);
      if (subs) {
        subs.forEach(sub => sub.callback(data));
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
    this.subscriptions.clear();
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
