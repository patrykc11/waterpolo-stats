interface QueuedRequest {
  id: string;
  url: string;
  options: RequestInit;
  timestamp: number;
  retries: number;
  localEventId?: string; // For tracking events added offline
}

const MAX_RETRIES = 3;
const QUEUE_KEY = "offline_queue";
const HEARTBEAT_INTERVAL = 5000; // 5 seconds

class OfflineQueue {
  private queue: QueuedRequest[] = [];
  private heartbeatTimer: NodeJS.Timeout | null = null;
  private isOnline = navigator.onLine;

  constructor() {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] 🚀 OFFLINE QUEUE: Initializing`);
    this.loadQueue();
    this.setupListeners();
    this.startHeartbeat();

    if (this.queue.length > 0) {
      console.log(
        `[${timestamp}] 📦 QUEUE: Loaded ${this.queue.length} pending requests from storage`
      );
    }
  }

  private loadQueue() {
    try {
      const stored = localStorage.getItem(QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to load offline queue:", e);
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(QUEUE_KEY, JSON.stringify(this.queue));
    } catch (e) {
      console.error("Failed to save offline queue:", e);
    }
  }

  private setupListeners() {
    window.addEventListener("online", () => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 🌐 CONNECTION: Back online`);
      this.isOnline = true;
      this.processQueue();
    });

    window.addEventListener("offline", () => {
      const timestamp = new Date().toISOString();
      console.log(`[${timestamp}] 📴 CONNECTION: Gone offline`);
      this.isOnline = false;
    });
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(async () => {
      const wasOnline = this.isOnline;

      // Test actual connectivity with a lightweight request
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout

        await fetch("/api/bootstrap", {
          method: "HEAD",
          cache: "no-store",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        this.isOnline = true;

        if (!wasOnline) {
          const timestamp = new Date().toISOString();
          console.log(`[${timestamp}] 🌐 HEARTBEAT: Connection restored`);
        }

        // Always try to process queue when online
        if (this.isOnline && this.queue.length > 0) {
          this.processQueue();
        }
      } catch (error) {
        this.isOnline = false;

        if (wasOnline) {
          const timestamp = new Date().toISOString();
          console.log(`[${timestamp}] 📴 HEARTBEAT: Connection lost`);
        }
      }
    }, HEARTBEAT_INTERVAL);
  }

  async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    // Add timestamp to bust cache
    const cacheBustUrl = `${url}${
      url.includes("?") ? "&" : "?"
    }t=${Date.now()}`;

    const timestamp = new Date().toISOString();
    const method = options.method || "GET";
    const endpoint = url.split("?")[0]; // Remove query params for cleaner logging

    console.log(`[${timestamp}] 🌐 ONLINE REQUEST: ${method} ${endpoint}`);

    try {
      // Try to fetch normally
      const response = await fetch(cacheBustUrl, {
        ...options,
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache",
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      console.log(
        `[${timestamp}] ✅ SUCCESS: ${method} ${endpoint} (${response.status})`
      );

      // Update online status on successful request
      this.isOnline = true;

      // Try to process any queued requests
      if (this.queue.length > 0) {
        this.processQueue();
      }

      return response;
    } catch (error) {
      // If fetch fails, queue the request
      console.warn(
        `[${timestamp}] ❌ OFFLINE: ${method} ${endpoint} - queuing for retry:`,
        error
      );

      // Update offline status immediately when request fails
      this.isOnline = false;

      const queuedRequest: QueuedRequest = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: cacheBustUrl,
        options,
        timestamp: Date.now(),
        retries: 0,
      };

      this.queue.push(queuedRequest);
      this.saveQueue();

      // Attach queue info to error
      const enhancedError = error as Error & { queued: boolean };
      enhancedError.queued = true;

      // Throw error to let caller know it failed
      throw enhancedError;
    }
  }

  private async processQueue() {
    const timestamp = new Date().toISOString();
    console.log(
      `[${timestamp}] 🔍 PROCESS QUEUE: isOnline=${this.isOnline}, queueLength=${this.queue.length}`
    );

    if (!this.isOnline || this.queue.length === 0) {
      console.log(
        `[${timestamp}] ⏸️ PROCESS QUEUE: Skipping - offline or empty queue`
      );
      return;
    }

    const processed: string[] = [];

    console.log(
      `[${timestamp}] 🔄 RETRYING: Processing ${this.queue.length} queued requests`
    );

    for (const request of this.queue) {
      const endpoint = request.url.split("?")[0];
      const method = request.options.method || "GET";

      try {
        console.log(
          `[${timestamp}] 🔄 RETRY: ${method} ${endpoint} (attempt ${
            request.retries + 1
          })`
        );

        const response = await fetch(request.url, {
          ...request.options,
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
            ...request.options.headers,
          },
        });

        if (response.ok) {
          processed.push(request.id);
          console.log(
            `[${timestamp}] ✅ RETRY SUCCESS: ${method} ${endpoint} (${response.status})`
          );
        } else {
          request.retries++;
          if (request.retries >= MAX_RETRIES) {
            console.error(
              `[${timestamp}] ❌ MAX RETRIES: ${method} ${endpoint} (${request.retries} attempts)`
            );
            processed.push(request.id);
          } else {
            console.warn(
              `[${timestamp}] ⚠️ RETRY FAILED: ${method} ${endpoint} (${response.status}) - will retry later`
            );
          }
        }
      } catch (error) {
        request.retries++;
        if (request.retries >= MAX_RETRIES) {
          console.error(
            `[${timestamp}] ❌ MAX RETRIES: ${method} ${endpoint} (${request.retries} attempts) - error:`,
            error
          );
          processed.push(request.id);
        } else {
          console.warn(
            `[${timestamp}] ⚠️ RETRY ERROR: ${method} ${endpoint} (${request.retries} attempts) - will retry later:`,
            error
          );
        }
      }
    }

    // Remove processed requests
    this.queue = this.queue.filter((req) => !processed.includes(req.id));
    this.saveQueue();

    if (processed.length > 0) {
      console.log(
        `[${timestamp}] 📤 SYNC COMPLETE: Processed ${processed.length} queued requests`
      );
      // Trigger a custom event to notify the UI
      window.dispatchEvent(
        new CustomEvent("queueProcessed", {
          detail: { count: processed.length },
        })
      );
    }
  }

  getConnectionStatus(): "online" | "offline" {
    return this.isOnline ? "online" : "offline";
  }

  getQueueLength(): number {
    return this.queue.length;
  }

  clearQueue() {
    this.queue = [];
    this.saveQueue();
  }

  removeFromQueue(eventId: string) {
    // Remove any queued requests that contain this eventId
    const initialLength = this.queue.length;
    this.queue = this.queue.filter((request) => {
      // Check by localEventId first (most reliable)
      if (request.localEventId === eventId) {
        return false; // Remove this request
      }

      // Fallback: check by body content
      try {
        const body = JSON.parse((request.options.body as string) || "{}");
        return body.eventId !== eventId && body.events?.[0]?.id !== eventId;
      } catch {
        return true; // Keep request if we can't parse body
      }
    });

    if (this.queue.length < initialLength) {
      this.saveQueue();
      console.log(
        `Removed ${
          initialLength - this.queue.length
        } queued requests for event ${eventId}`
      );
    }
  }

  addToQueueWithLocalId(
    url: string,
    options: RequestInit,
    localEventId: string
  ): string {
    const requestId = `${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    const queuedRequest: QueuedRequest = {
      id: requestId,
      url,
      options,
      timestamp: Date.now(),
      retries: 0,
      localEventId, // Store the local event ID
    };

    this.queue.push(queuedRequest);
    this.saveQueue();

    console.log(`Added request to queue with localEventId: ${localEventId}`);
    return requestId;
  }

  destroy() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
    }
  }
}

// Singleton instance
let instance: OfflineQueue | null = null;

export function getOfflineQueue(): OfflineQueue {
  if (!instance) {
    instance = new OfflineQueue();
  }
  return instance;
}
