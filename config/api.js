import axios from "axios";

//const BASE_URL = __DEV__ ? 'http://52.220.93.155:3030/api/android/rider' : 'http://admin-panel.almalak.com/api/android/rider';
const BASE_URL = 'https://f73a-27-147-170-201.ngrok-free.app/api/android/rider';
const GOOGLE_API_KEY ='AIzaSyBhwyrgBSaBZcSW1F_kOrfaKkeXjfFse74';
const SOCKET_IO_URL ='https://3feb-27-147-170-201.ngrok-free.app';
//const SMS_API_URL = __DEV__ ? 'http://52.220.93.155:3030/api/send-sms' : 'http://admin-panel.almalak.com/api/send-sms';
const SMS_API_URL = 'https://9049-27-147-170-201.ngrok-free.app/api/android/rider/send-sms';
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