importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.14.1/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyAZ2L1mSRsAKFNWDqVY2mN1iqRAmkFh61k",
  authDomain: "epita-weather-app.firebaseapp.com",
  projectId: "epita-weather-app",
  storageBucket: "epita-weather-app.firebasestorage.app",
  messagingSenderId: "922267620293",
  appId: "1:922267620293:web:290ea0e273957d3a0bf1ac"
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/weather-icon.png' // Optional: Add a weather-related icon in /public
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});