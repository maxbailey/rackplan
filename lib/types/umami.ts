declare global {
  interface Window {
    umami?: {
      track: (
        eventName: string,
        eventData?: Record<string, string | number>
      ) => void;
    };
  }
}

export {};
