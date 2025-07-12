import React, { useEffect, useState } from "react";

const Notifications = () => {
  const [permission, setPermission] = useState(Notification.permission);

  useEffect(() => {
    if (permission === "default") {
      Notification.requestPermission().then(setPermission);
    }
  }, [permission]);

  const showNotification = () => {
    if (permission === "granted") {
      new Notification("Check today's weather!", {
        body: "Tap to see the latest weather update.",
        icon: "/weather-icon.png"
      });
    }
  };

  return (
    <button onClick={showNotification} disabled={permission !== "granted"}>
      Show Weather Notification
    </button>
  );
};

export default Notifications;