import { initializeApp } from "firebase/app";
import { getMessaging, getToken } from "firebase/messaging";

import store from "./src/store/store";
let getConfig = null;
function render() {
  getConfig =
    store.getState().websiteSetup?.websiteSetup?.payload?.firebase_info;
}
render();
store.subscribe(() => {
  render();
});
const firebaseCloudMessaging = {
  //initializing firebase app
  init: async function () {
    if (!initializeApp.length && getConfig) {
      initializeApp({
        apiKey: getConfig.apiKey,
        authDomain: getConfig.authDomain,
        projectId: getConfig.projectId,
        storageBucket: getConfig.storageBucket,
        messagingSenderId: getConfig.messagingSenderId,
        appId: getConfig.appId,
        measurementId: getConfig.measurementId,
      });

      try {
        const messaging = getMessaging();
        //requesting notification permission from browser
        const status = await Notification.requestPermission();
        if (status && status === "granted") {
          //getting token from FCM
          const fcm_token = await getToken({
            vapidKey: getConfig.certificates,
          });

          if (fcm_token) {
            return fcm_token;
          }
        }
      } catch (error) {
        console.error(error);
        return null;
      }
    }
  },
};

export { firebaseCloudMessaging };
