import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyAZ2L1mSRsAKFNWDqVY2mN1iqRAmkFh61k",
  authDomain: "epita-weather-app.firebaseapp.com",
  projectId: "epita-weather-app",
  storageBucket: "epita-weather-app.appspot.com",
  messagingSenderId: "922267620293",
  appId: "1:922267620293:web:290ea0e273957d3a0bf1ac"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export const requestFCMToken = async () => {
  try {
    const token = await getToken(messaging, { vapidKey: "YOUR_VAPID_PUBLIC_KEY" });
    return token;
  } catch (err) {
    console.error("FCM token error:", err);
    return null;
  }
};

export { messaging };