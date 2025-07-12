const admin = require("firebase-admin");
const axios = require("axios");
const cron = require("node-cron");
const express = require("express");

const serviceAccount = require("./path-to-your-firebase-service-account.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const WEATHER_API_URL = "https://api.weatherapi.com/v1/current.json";
const WEATHER_API_KEY = "b0a7bad410d5400c8c3145734251107";

const userSubscriptions = [];

cron.schedule("0 7 * * *", async () => {
  console.log("Sending daily weather notifications...");
  for (const { token, location } of userSubscriptions) {
    try {
      const weatherResponse = await axios.get(WEATHER_API_URL, {
        params: {
          q: location,
          key: WEATHER_API_KEY
        }
      });
      const weather = weatherResponse.data;
      const message = {
        notification: {
          title: `Morning Weather for ${weather.location.name}`,
          body: `It's ${weather.current.temp_c}°C with ${weather.current.condition.text}.`
        },
        token: token
      };
      await admin.messaging().send(message);
      console.log(`Notification sent to ${location}`);
    } catch (error) {
      console.error(`Error sending notification to ${location}:`, error);
    }
  }
});

const app = express();
app.use(express.json());

app.post("/subscribe", (req, res) => {
  const { token, location } = req.body;
  userSubscriptions.push({ token, location });
  console.log(`Subscribed user with token: ${token} for location: ${location}`);
  res.status(200).send("Subscribed");
});

app.listen(3000, () => console.log("Server running on port 3000"));