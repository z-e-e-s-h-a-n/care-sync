"use client";

import { useEffect } from "react";
import { primePushNotifications } from "@workspace/ui/hooks/use-notification";

const PushNotificationsBootstrap = () => {
  useEffect(() => {
    void primePushNotifications();
  }, []);

  return null;
};

export default PushNotificationsBootstrap;
