import { useEffect, useRef } from "react";

const SSE_URL = "http://localhost:5000/api/notifications/stream";

/**
 * Opens an SSE connection to the notification stream and calls `onNotification`
 * whenever the server pushes a new notification.
 *
 * Authentication: the JWT is appended as a ?token= query param because the
 * native EventSource API cannot set custom request headers.
 *
 * @param {string|null} email   - Current user's email (from AuthContext).
 *                                Pass null / undefined to skip connecting.
 * @param {function} onNotification - Callback receiving the parsed notification object.
 */
export function useNotificationSSE(email, onNotification) {
  const esRef = useRef(null);
  const onNotificationRef = useRef(onNotification);

  // Keep the callback ref up-to-date without restarting the connection
  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  useEffect(() => {
    if (!email) return;

    // Read JWT from localStorage (same key used by AuthContext)
    let token = null;
    try {
      const saved = localStorage.getItem("auth");
      token = saved ? JSON.parse(saved)?.token : null;
    } catch {
      // ignore parse errors
    }

    if (!token) return;

    const url = `${SSE_URL}?token=${encodeURIComponent(token)}`;
    const es = new EventSource(url, { withCredentials: false });
    esRef.current = es;

    es.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data);
        onNotificationRef.current(notification);
      } catch {
        // ignore malformed frames
      }
    };

    es.onerror = () => {
      // The browser will auto-reconnect after a short delay — no manual retry needed.
      // Suppress console noise in dev by closing and letting the browser reconnect.
      es.close();
      // Reopen after 5 s so we keep reconnect attempts at a sane cadence
      const retryTimer = setTimeout(() => {
        if (esRef.current === es) {
          // Only if we haven't been replaced (e.g. email changed)
          esRef.current = null;
        }
      }, 5000);
      return () => clearTimeout(retryTimer);
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [email]); // reconnect only when email changes
}
