import { Platform } from 'react-native';
// import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification, { Importance } from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { BASE_URL } from '../config/api';
import { Colors } from '../styles';

class NotifyServiceClass {
  // constructor(onRegister, onNotification) {
  //   this.createDefaultChannels();

  //   // Clear badge number at start
  //   PushNotification.getApplicationIconBadgeNumber(function (number) {
  //     if (number > 0) {
  //       PushNotification.setApplicationIconBadgeNumber(0);
  //     }
  //   });

  //   PushNotification.getChannels(function(channels) {
  //     console.log("channels", channels);
  //   });
  // }

  configure(onNotificationOpenedApp) {
      PushNotification.configure({
          onRegister: async function (token) {
              // console.log('TOKEN data', token);
              console.log('onRegister TOKEN:', token.token);
              const deviceToken = token.token;

              try {
                  const mobile = await AsyncStorage.getItem('mobile');
                  const storageToken = await AsyncStorage.getItem('deviceToken');
                  // AsyncStorage.removeItem('deviceToken');

                  if ((mobile !== null) && (deviceToken !== storageToken)) {
                      await axios.post(BASE_URL + '/save-android-device-token-to-database', {
                          mobile: mobile,
                          fcm_token: deviceToken,
                      })
                      .then(async response => {
                          if (response.data.code === 200) {
                              console.log('FCM Token ' + deviceToken + ' saved to database.');
                              await AsyncStorage.setItem('deviceToken', deviceToken).then(() => console.debug('save deviceToken done'));
                          }
                      })
                      .catch((error) => console.log(error));
                  }

                  if (token == null) {
                      await AsyncStorage.setItem('deviceToken', deviceToken).then(() => console.debug('save deviceToken done'));
                  }
              }
              catch (error) { console.error('onRegister TOKEN' + error); }
          },

          onNotification: function (notification) {
              console.log('onNotification:', notification);
              // NOTIFICATION: {"channelId": "fcm_default_channel", "color": null, "data": {}, "finish": [Function finish], "foreground": true, "id": "-1056068364", "message": "Test Notification  Test Notification Test Notification ", "priority": "high", "sound": null, "tag": "campaign_collapse_key_1795688087607728448", "title": "Test Notification ", "userInteraction": false, "visibility": "private"}

              if (Platform.OS === 'ios') {
                  notification.userInteraction = notification.data.openedInForeground ? true : false;
              } else {
                  notification.userInteraction = true;
              }

              //Open Link
              onNotificationOpenedApp();

              // if(notification.userInteraction) {
              //     this.onNotification(notification);
              // }

              if (notification.foreground === true) {

              }

              // required on iOS only.
              //notification.finish(PushNotificationIOS.FetchResult.NoData);
          },

          onAction: function (notification) {
              console.log('ACTION:', notification.action);
              console.log('Notification received:', notification);

              if (notification.action === 'Yes') {
                  PushNotification.invokeApp(notification);
              }

              if (notification.action === 'ReplyInput') {
                  console.log('tex-to', notification.reply_text);
              }
          },

          onRegistrationError: function(err) {
              console.error(err.message, err);
          },

          permissions: { alert: true, badge: true, sound: true },
          popInitialNotification: true,
          requestPermissions: true,
      });

      //if requestPermissions: false
      //PushNotification.requestPermissions();

      PushNotification.createChannel(
          {
              channelId: 'notifChannel',
              channelName: 'notifChannel',
              channelDescription: 'A default channel',
              playSound: true,
              soundName: 'default', //`soundName`
              importance: Importance.HIGH,
              vibrate: true,
          },
          (created) => console.log(`createChannel 'not1' returned '${created}'`)
      );

      PushNotification.createChannel(
          {
              channelId: 'fcm_default_channel',
              channelName: 'fcm_default_channel',
              channelDescription: 'A default channel',
              playSound: true,
              soundName: 'default', //`soundName`
              importance: Importance.HIGH,
              vibrate: true,
          },
          (created) => console.log(`createChannel 'fcm_default_channel' returned '${created}'`)
      );


      // this.lastChannelCounter++;
      // PushNotification.createChannel(
      //     {
      //     channelId: "custom-channel-id", // (required)
      //     channelName: `Custom channel - Counter: ${this.lastChannelCounter}`, // (required)
      //     channelDescription: `A custom channel to categories your custom notifications. Updated at: ${Date.now()}`,
      //     soundName: "default",
      //     importance: 4,
      //     vibrate: true,
      //     },
      //     (created) => console.log(`createChannel returned '${created}'`)
      // );

      PushNotification.popInitialNotification((notification) => {
        console.log('Initial Notification', notification);
      });

      // Clear badge number at start
      PushNotification.getApplicationIconBadgeNumber(function (number) {
        console.log('badge number: ', number);
        if (number > 0) {
            PushNotification.setApplicationIconBadgeNumber(0);
        }
      });
  }


  localNotify = (id, title, message, data = {}, options = {}) => {
    //subText, message, bigText

    PushNotification.localNotification({
      ...this.buildAndroidNotification(title, message, data, options),
      channelId: 'not1',
      id: id,
      title: title || '',
      message: message || '',

      ignoreInForeground: false,
      invokeApp: true, //foreground or stay in background

      visibility: options.visibility || 'private', //private, public, secret
      playSound: options.playSound || false,
      soundName: options.soundName || 'default',
      tag: 'some_tag',
      userInfo: { sceen: 'Home' },
      shortcutId: 'shortcut-id',
      messageId: 'google:message_id',
      // actions: ["Yes", "No"],
    });
  }

  buildAndroidNotification = (title, message, data = {}, options = {}) => {
    return {
      autoCancel: true,
      smallIcon: options.smallIcon || 'ic_notification',
      largeIcon: options.largeIcon || 'ic_notification',
      // largeIconUrl: "https://www.example.tld/picture.jpg",
      // bigPictureUrl: "https://www.example.tld/picture.jpg",
      // bigLargeIcon: "ic_launcher",
      // bigLargeIconUrl: "https://www.example.tld/bigicon.jpg",

      bigText: message || 'My big text that will be shown when notification',
      sebText: title || 'This is a subText',
      ticker: title || 'Notification Ticker',
      vibrate: options.vibrate || 300, // milliseconds
      priority: options.priority || 'high',
      importance: options.importance || 'high',
      color: Colors.NOTIFICATION_COLOR,
      data: data,

      //number: 10,
      onlyAlertOnce: false,
      //group: "group",
      groupSummary: false,
    };
  }

  scheduleNotify = (id, title, message, data = {}, options = {}) => {
    PushNotification.localNotificationSchedule({
      ...this.buildAndroidNotification(title, message, data, options),
      channelId: 'not1',
      id: id,
      title: title || '',
      message: message || '',
      color: Colors.NOTIFICATION_COLOR,
      invokeApp: false,
      playSound: options.playSound || false,
      soundName: options.soundName || 'default',
      //tag: 'some_tag',
      userInfo: { sceen: 'Home' },

      actions: ['Yes', 'No'],
      //when: null,
      //usesChronometer: false,
      //timeoutAfter: null,

      date: new Date(Date.now() + 30 * 1000), // in 30 secs
      repeatType: Platform.OS === 'ios' ? 'day' : 'daily',
      allowWhileIdle: false,
      repeatTime: 2,
    });
  }


  getChatNotify = (id, title, message, data = {}, options = {}) => {
    PushNotification.localNotification({
      ...this.buildAndroidNotification(title, message, data, options),
      channelId: 'not1',
      id: id,
      title: title || '',
      message: message || '',

      color: Colors.NOTIFICATION_COLOR,
      ignoreInForeground: false,
      invokeApp: true, //foreground or stay in background

      visibility: options.visibility || 'private', //private, public, secret
      playSound: options.playSound || false,
      soundName: options.soundName || 'default',
      tag: 'some_tag',
      userInfo: {},

      shortcutId: 'shortcut-id',
     // when: null,
      //timeoutAfter: null,
      messageId: 'google:message_id',
      // actions: ["Yes", "No", "Accept", "Reject"],
      actions: ['ReplyInput'],
      reply_placeholder_text: 'Write your response...',
      reply_button_text: 'Reply',
    });
  }

  ongoingNotify = (id, title, message, data = {}, options = {}) => {
    PushNotification.localNotification({
      ...this.buildAndroidNotification(title, message, data, options),
      channelId: 'not1',
      id: id,
      title: title || '',
      message: message || '',

      color: Colors.NOTIFICATION_COLOR,
      ignoreInForeground: false,
      invokeApp: true, //foreground or stay in background

      visibility: options.visibility || 'private', //private, public, secret
      playSound: options.playSound || false,
      soundName: options.soundName || 'default',
      tag: 'some_tag',
      userInfo: {},

      ongoing: true,
      shortcutId: 'shortcut-id',
      //when: null,
      //timeoutAfter: null,
      messageId: 'google:message_id',
      // actions: ["Yes", "No", "Accept", "Reject"],
    });
  }

  checkPermission = (cbk) => {
    return PushNotification.checkPermissions(cbk);
  }

  requestPermissions = () => {
    return PushNotification.requestPermissions();
  }

  abandonPermissions = () => {
    PushNotification.abandonPermissions();
  }

  cancelLocalNotify = (id) => {
    PushNotification.cancelLocalNotifications({id: id});
  }

  cancelAllNotify = () => {
    if (Platform.OS === 'ios') {
      //PushNotificationIOS.removeAllDeliveredNotifications();
    } else {
      PushNotification.cancelAllLocalNotifications();
    }
  }

  removeDeliveredNotificationByID = notificationId => {
    PushNotification.cancelAllLocalNotifications({id: `${notificationId}`});
    console.log( '[LocalNotificationService] removeDeliveredNotificationByID: ', notificationId );
  };

  removeDeliveredNotify = (identifiers) => {
    PushNotification.removeDeliveredNotifications(identifiers);
  }

  removeAllDeliveredNotify = () => {
    PushNotification.removeAllDeliveredNotifications();
  }

  getDeliveredNotify = (callback) => {
    PushNotification.getDeliveredNotifications(callback);
  }

  getScheduledNotify = (callback) => {
    PushNotification.getScheduledLocalNotifications(callback);
  };

  channelList = () => {
    PushNotification.getChannels(function (channel_ids) {
      console.log(channel_ids); // ['channel_id_1']
    });
  };

  channelExists = (channel_id) => {
    PushNotification.channelExists(channel_id, function (exists) {
      console.log(exists); // true/false
    });
  };

  channelBlocked = (channel_id) => {
    PushNotification.channelBlocked(channel_id, function (blocked) {
      console.log(blocked); // true/false
    });
  }

  deleteChannel = (channel_id) => {
    PushNotification.deleteChannel(channel_id);
  }
}

export const NotifyService = new NotifyServiceClass();
