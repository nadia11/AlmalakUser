import React, { Component } from 'react';
import { Text, View, ActivityIndicator, Alert, ToastAndroid, StyleSheet, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
const { width, height } = Dimensions.get('window');
import axios from "axios";

import OtpInputs from './OtpInputs';
import { AuthContext } from './context';
import CustomStatusBar from '../components/CustomStatusBar';
import { BASE_URL, SMS_API_URL } from '../config/api';
import { Colors } from '../styles';
import { Options } from '../config';
//import { SMSReceiver } from '../components/SMSReceiver';

export const OTPVerification = (props) => {
  const { signInToken } = React.useContext(AuthContext);

  // const mobile = '';
  // const OTP_CODE = 123456;
  // const redirectScreen = '';
  const { mobile, callingCode, OTP_CODE, redirectScreen } = props.route.params;
  // {JSON.stringify(mobile)}

  const [counter, setCounter] = React.useState(59);

  const [enteredOTP, setEnteredOTP] = React.useState(0);
  const [userToken, setUserToken] = React.useState(null);
  const [sMSReceived, setSMSReceived] = React.useState([]);
  const [animating, setAnimating] = React.useState(true);
  const [otpVerifyingSpinner, setOtpVerifyingSpinner] = React.useState(false);
  const [otpVerifySuccess, setOtpVerifySuccess] = React.useState(false);

  React.useEffect(() => {
    counter > 0 && setTimeout(() => setCounter(counter - 1), 1000);
  }, [counter]);

  React.useEffect(() => {
    if( enteredOTP.length === 6 ) {
      verify_otp();
    }
  }, [enteredOTP]);

  // React.useEffect(() => {
    // SMSReceiver.requestReadSmsPermission();
  // }, []);


  const verify_otp = () => {
    setAnimating(true);

    if(OTP_CODE == enteredOTP) {
      setOtpVerifyingSpinner(true);

      setTimeout(() => {
        setOtpVerifyingSpinner(false);
        setOtpVerifySuccess(true);
        
        setTimeout( async () => {
          if(redirectScreen === "App"){
            try {
              await AsyncStorage.setItem('userToken', '1');
              setUserToken('1');
              signInToken(); /*This for auto redirect to home page & refresh*/
              props.navigation.navigate('App');
              setOtpVerifySuccess(false);
            } catch (error) { console.error(error); }
          }
          else if(redirectScreen === "SignUpForm"){
            props.navigation.navigate('SignUpForm', { mobile: mobile, OTP_CODE: enteredOTP })
            setOtpVerifySuccess(false);
          }
        }, 500);
      }, 3000);
    }
    else {
      Alert.alert("Error", "Wrong OTP Code entered. Please Try Again");
    }
  }


  const resendOTP = async () => {
    let sms_status_array = {1002 : "Sender Id/Masking Not Found", 1003 : "API Not Found", 1004 : "SPAM Detected", 1005 : "Internal Error", 1006 : "Internal Error", 1007 : "Balance Insufficient", 1008 : "Message is empty", 1009 : "Message Type Not Set (text/unicode)", 1010 : "Invalid User & Password", 1011 : "Invalid User Id" }

    await axios.post(SMS_API_URL, {
      to_number: mobile,
      message: "Your OTP is "+OTP_CODE+" to login Almalak. This OTP will be expired within 1 minutes."
    })
    .then(res => { 
      if(sms_status_array[res.data]) { 
        Alert.alert(sms_status_array[res.data] + " Please contact to App Provider."); 
      }
      setCounter(59);
      ToastAndroid.showWithGravity("OTP Verification Code Sent again", ToastAndroid.LONG, ToastAndroid.BOTTOM);
    })
    .catch((error) => {
      console.log("Submitting Error: "+error); 
      ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
    });
  }

  const disabledBtn = () => {
    return enteredOTP && enteredOTP.length.toString() == 6 ? 0 : 1;
  }

  return (
    <View style={styles.container}>
      <CustomStatusBar />
      
      <View style={{ alignItems: 'center' }}>
        <Text style={{ color: '#555', marginBottom: 10, fontSize: 18, textAlign: 'center' }}>Enter 6-digit verification code sent to you at <Text style={{ fontWeight: 'bold', color: '#333' }}>{"+88"+mobile}</Text></Text>
        { console.log("OTP: "+OTP_CODE+" ---- Entered: "+enteredOTP) }

        <View style={styles.fieldContainer}>
			  {/* <OtpInputs getOtp={(otp) => setEnteredOTP(otp)} SMSReceived={sMSReceived} /> */}
			  {/* <TextInput label="OTP" render={ props => <TextInputMask {...props} mask="+[00] [000] [000] [000]" /> } /> */}
			  <TextInput style={{ borderWidth: 1, width: '90%', borderColor: '#000', fontSize: 20, fontWeight: 'bold', textAlign: 'center' }} 
			  placeholder="" 
			  placeholderTextColor="rgba(0,0,0,.5)" 
			  keyboardType="numeric" 
			  autoCorrect={false} 
			  underlineColorAndroid="transparent" 
			  onChangeText={val => setEnteredOTP( val )} 
			  value={enteredOTP} 
			  />
        </View>

        <TouchableOpacity style={[styles.button, { opacity: (disabledBtn() == 1 ? 0.7 : 1) }]} onPress={ verify_otp } disabled={disabledBtn() == 1 ? true : false}>
          <Text style={styles.btnText}>Verify & Proceed</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flexDirection: "row", justifyContent: 'space-around', alignItems: 'flex-start', marginTop: 0 }}>
        { counter == 0 ? (
          <View style={{ flex: 3, flexDirection: "row", justifyContent: 'space-around' }}>
            <Text style={ {color: "#333"}}>Didn't received the OTP?</Text>
            <TouchableOpacity onPress={resendOTP}>
              <Text style={styles.hyperLinkText}>Resend OTP</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{flexDirection:'row', flexWrap:'wrap'}}>
            <Text style={{ color: "#666" }}>OTP Verification number expire in </Text>
            <Text style={{fontWeight: "bold", color: "#00A968"}}>{ counter }</Text>
          </View>
        )}
      </View>
        
      {otpVerifySuccess && (
        <View style={{ flex: 1, flexDirection: "column", justifyContent: 'flex-end', alignItems: 'center', marginBottom: 20 }}>
          <AntDesign name="checkcircleo" size={40} color="green" />
          <Text>You have successfully verified OTP code</Text>
        </View>
      )}

      {otpVerifyingSpinner && (
        <View style={{ flex: 1, flexDirection: "column", justifyContent: 'flex-end', alignItems: 'center', marginBottom: 20 }}>
          <ActivityIndicator animating={animating} size="large" color='#F53D3D' />
          <Text>Verifying OTP Code...</Text>
        </View>
      )}
    </View>
  )
}


const styles = StyleSheet.create({
  container:{
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#ecf0f1',
    padding: 8,
    marginTop: 80
  },
  fieldContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    width: (width - 10),
    marginLeft: 25,
    height: 75
  },
  button: {
    alignItems: "center",
    justifyContent: "flex-start",
    padding: 8,
    backgroundColor: Colors.BUTTON_COLOR,
    marginVertical: 20,
    marginHorizontal: 5,
    borderRadius: 5,
    height: 40,
    width: (width - 80),
  },
   btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: 'bold'
  },
  hyperLinkText: {
    color: Colors.BUTTON_COLOR,
    fontWeight: 'bold'
  }
});