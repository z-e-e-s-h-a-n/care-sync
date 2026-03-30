"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { ApiException } from "@workspace/sdk";
import * as notification from "@workspace/sdk/notification";
import { parseDuration } from "@workspace/shared/utils";
import type { ConfigurePushNotificationsType } from "@workspace/contracts/notification";

const STALE_TIME = parseDuration("5m");
const PUSH_PROVIDER = "fcm" as const;
const FIREBASE_SW_URL = "/firebase-messaging-sw.js";

type FirebaseBrowserConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  vapidKey: string;
  measurementId?: string;
};

const queryDefaults = {
  staleTime: STALE_TIME,
  gcTime: STALE_TIME,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  retry: false,
};

export function useNotifications(enabled = true) {
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: notification.getAllNotification,
    select: (res) => res.data,
    enabled,
    ...queryDefaults,
  });

  const unreadCount = query.data?.filter((item) => !item.readAt).length ?? 0;

  return {
    unreadCount,
    data: query.data,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    fetchError: query.error as ApiException,
  };
}

export function useNotificationActions() {
  const queryClient = useQueryClient();

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notification.markAsRead(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const updatePushMutation = useMutation({
    mutationFn: (enabled: boolean) => configurePushNotifications(enabled),
  });

  return {
    markAsReadAsync: markAsReadMutation.mutateAsync,
    isPending: markAsReadMutation.isPending,
    mutateError: markAsReadMutation.error as ApiException | null,

    updatePushNotificationsAsync: updatePushMutation.mutateAsync,
    isPushPending: updatePushMutation.isPending,
    pushError: updatePushMutation.error as ApiException | Error | null,
  };
}

export const primePushNotifications = async () => {
  try {
    await ensurePushSupported();
    await registerPushServiceWorker();
  } catch {
    // Priming should stay silent; enable flow will surface actionable errors.
  }
};

const configurePushNotifications = async (enabled: boolean) => {
  if (enabled) {
    const token = await getBrowserPushToken();

    return notification.updatePushNotifications({
      enabled: true,
      token,
      provider: PUSH_PROVIDER,
    });
  }

  await clearBrowserPushToken();

  return notification.updatePushNotifications({
    enabled: false,
  } satisfies ConfigurePushNotificationsType);
};

const getFirebaseConfig = (): FirebaseBrowserConfig => {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
  };

  const missing = Object.entries(config)
    .filter(([key, value]) => key !== "measurementId" && !value)
    .map(([key]) => key);

  if (missing.length) {
    throw new Error(
      `Firebase push is not configured. Missing: ${missing.join(", ")}`,
    );
  }

  return config as FirebaseBrowserConfig;
};

const ensurePushSupported = async () => {
  if (typeof window === "undefined") {
    throw new Error(
      "Push notifications can only be configured in the browser.",
    );
  }

  if (!("Notification" in window)) {
    throw new Error("This browser does not support notifications.");
  }

  if (!("serviceWorker" in navigator)) {
    throw new Error("This browser does not support service workers.");
  }

  const { isSupported } = await import("firebase/messaging");

  if (!(await isSupported())) {
    throw new Error("Firebase messaging is not supported in this browser.");
  }
};

const getMessagingClient = async () => {
  await ensurePushSupported();

  const config = getFirebaseConfig();
  const [{ getApp, getApps, initializeApp }, { getMessaging }] =
    await Promise.all([import("firebase/app"), import("firebase/messaging")]);

  const appConfig = {
    apiKey: config.apiKey,
    authDomain: config.authDomain,
    projectId: config.projectId,
    storageBucket: config.storageBucket,
    messagingSenderId: config.messagingSenderId,
    appId: config.appId,
    measurementId: config.measurementId,
  };

  const app = getApps().length ? getApp() : initializeApp(appConfig);

  return {
    config,
    messaging: getMessaging(app),
  };
};

const registerPushServiceWorker = async () =>
  navigator.serviceWorker.register(FIREBASE_SW_URL, {
    updateViaCache: "none",
  });

const getBrowserPushToken = async () => {
  const { config, messaging } = await getMessagingClient();
  const permission = await Notification.requestPermission();

  if (permission !== "granted") {
    throw new Error("Browser notification permission was not granted.");
  }

  const { getToken } = await import("firebase/messaging");
  const serviceWorkerRegistration = await registerPushServiceWorker();

  const token = await getToken(messaging, {
    vapidKey: config.vapidKey,
    serviceWorkerRegistration,
  });

  if (!token) {
    throw new Error("Unable to create a browser push token.");
  }

  return token;
};

const clearBrowserPushToken = async () => {
  try {
    const [{ deleteToken }, { messaging }] = await Promise.all([
      import("firebase/messaging"),
      getMessagingClient(),
    ]);

    await deleteToken(messaging);
  } catch {
    // Clearing the server session token is the important part for disable.
  }
};
