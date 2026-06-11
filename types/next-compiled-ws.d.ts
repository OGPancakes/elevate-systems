declare module "next/dist/compiled/ws" {
  type WebSocketOptions = {
    headers?: Record<string, string>;
  };

  export default class WebSocket {
    constructor(url: string, options?: WebSocketOptions);
    on(event: "open", listener: () => void): this;
    on(event: "message", listener: (data: { toString(): string }) => void): this;
    on(event: "error", listener: (error: Error) => void): this;
    on(event: "close", listener: () => void): this;
    send(data: string): void;
    close(): void;
  }
}
