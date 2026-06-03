import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { createClient } from "@/utils/supabase/client";

/**
 * Requests push permission, registers with FCM, and saves the
 * device token to Supabase against the current user.
 *
 * Safe to call on web — exits immediately if not running natively.
 */
export async function registerPush() {
  if (!Capacitor.isNativePlatform()) return;

  const { receive } = await PushNotifications.requestPermissions();
  if (receive !== "granted") return;

  await PushNotifications.register();

  PushNotifications.addListener("registration", async ({ value: token }) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("device_tokens").upsert(
      { user_id: user.id, token },
      { onConflict: "token" }
    );
  });

  PushNotifications.addListener("registrationError", (err) => {
    console.error("Push registration error:", err);
  });

  // Foreground notifications — you can customise this later
  PushNotifications.addListener("pushNotificationReceived", (notification) => {
    console.log("Push received in foreground:", notification);
  });
}
