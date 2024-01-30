import axios from "axios";

const BASE_URL = __DEV__ ? 'http://52.220.93.155:3030/api/android/rider' : 'http://admin-panel.almalak.com/api/android/rider';
const GOOGLE_API_KEY ='AIzaSyC2ShRUtuWJbz7lBH2dJ8MuLvsJk13a8S8';
const SOCKET_IO_URL ='http://52.220.93.155:3030/';
const SMS_API_URL = __DEV__ ? 'http://52.220.93.155:3030/api/send-sms' : 'http://admin-panel.almalak.com/api/send-sms';
const pusher_app_key = 'YOUR PUSHER APP KEY';
const pusher_app_cluster = 'YOUR PUSHER APP CLUSTER';


module.exports = {
    BASE_URL,
    GOOGLE_API_KEY,
    SOCKET_IO_URL,
    SMS_API_URL,
    pusher_app_key,
    pusher_app_cluster
};