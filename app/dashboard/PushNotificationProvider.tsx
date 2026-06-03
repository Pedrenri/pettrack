"use client";

import { useEffect } from "react";
import { registerPush } from "@/utils/pushNotifications";

/**
 * Drop this anywhere inside the authenticated layout.
 * It registers for push once on mount — no-ops on web.
 */
export default function PushNotificationProvider() {
  useEffect(() => {
    registerPush();
  }, []);

  return null;
}
