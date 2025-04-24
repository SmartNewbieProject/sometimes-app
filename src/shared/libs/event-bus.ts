type Listener = (...args: any[]) => void;

class EventBus {
  private events: Map<string, Listener[]> = new Map();

  emit(event: string, ...args: any[]) {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => listener(...args));
    }
  }

  on(event: string, callback: Listener) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(callback);

    // cleanup 함수 반환
    return () => {
      const listeners = this.events.get(event);
      if (listeners) {
        this.events.set(event, listeners.filter(listener => listener !== callback));
      }
    };
  }
}

export const eventBus = new EventBus();