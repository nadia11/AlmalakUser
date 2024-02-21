import React, { Component, useState } from 'react';
import { View, Text, StyleSheet, TextInput, Image, ImageBackground, TouchableOpacity, Animated, Dimensions, Keyboard, Platform, Linking, Alert, ActivityIndicator, ToastAndroid } from 'react-native';

import * as Animatable from 'react-native-animatable';
//import { Container, Header, Content, Button } from 'native-base';
// import { Button } from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from "axios";
import CustomStatusBar from '../components/CustomStatusBar';
import { BASE_URL, SMS_API_URL } from '../config/api';
import { Options } from '../config';
import CountryPickerModal from './CountryPickerModal';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default class SignUpMobile extends Component {
  constructor(props) {
    super(props)

    this.state = {
      placeholderText: "Enter Mobile Number",
      mobileNumber: '',
      username: "",
      password: "",
      userToken: "",
      digitOtpCode: '',
      // callingCode: "",
      otpId: null,
      isLoading: false,
      animating: false,
      country: {
        cca2: 'BD',
        callingCode: '+880',
    },
    }
    this.getUserData();
  }
  sendOTP(RECEIVER_NUMBER, OTP_CODE) {
    let sms_status_array = {1002 : "Sender Id/Masking Not Found", 1003 : "API Not Found", 1004 : "SPAM Detected", 1005 : "Internal Error", 1006 : "Internal Error", 1007 : "Balance Insufficient", 1008 : "Message is empty", 1009 : "Message Type Not Set (text/unicode)", 1010 : "Invalid User & Password", 1011 : "Invalid User Id" }

    axios.post(SMS_API_URL + 'send-sms', {
      to_number: RECEIVER_NUMBER,
      message: "Your O.TP is "+OTP_CODE+" to login Uder. This O.TP will be expired within 1 minutes."
    })
        .then(response => {
          if (response.data && response.data.otp_id) {
            console.log("OTP ID:", response.data.otp_id);
            this.setState({ otpId: response.data.otp_id });
          } else {
            console.error("OTP ID not found in response:", response.data);
            // Handle the case where OTP ID is not found in the response
          }
        })
        .catch((error) => {
          console.log("Submitting Error: "+error);
          ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT);
        });
  }

  getUserData = async () => {
    try {
      const userToken = await AsyncStorage.getItem('userToken')
      const mobile = await AsyncStorage.getItem('mobile')
      const callingCode = await AsyncStorage.getItem('callingCode')
      await AsyncStorage.removeItem('language');
      if(userToken !== null) { this.setState({ userToken: userToken }); }
      if(mobile !== null) { this.setState({ mobileNumber: mobile }); }
      if(callingCode !== null) { this.setState({ callingCode: callingCode }); }
    } catch (error) { console.error(error); }
  }
  
  checkLogin = async () => {
    this.setState({ animating: true });

    if(this.state.mobileNumber === ""){
      Alert.alert('Error', 'Must provide a Mobile number to register in.', [{ text: "OK" }]);
      this.setState({ animating: false });
    }else{
        await fetch(BASE_URL+'/registration-by-mobile', {
        method: 'POST', headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: this.MOBILE_WITH_ZERO(this.state.mobileNumber) })
      })
      .then((response) => response.json())
      .then(async (responseJson) => {
        
        if(responseJson.code === 200){
          this.GENERATE_DIGIT_OTP(6); //OTP execute

          //let GENERATE_DIGIT_OTP = Math.floor(Math.random() * 1000000) + 1;
          this.sendOTP(this.MOBILE_WITH_ZERO(this.state.mobileNumber), this.state.digitOtpCode); //Send OTP Message to Entered Mobile Number
          this.setState({ userToken: '1' });

          try {
            await AsyncStorage.setItem('mobile', this.MOBILE_WITH_ZERO(this.state.mobileNumber));
            await AsyncStorage.setItem('callingCode', "+88");

            this.props.navigation.navigate('OTPVerification', {
              mobile: this.MOBILE_WITH_ZERO(this.state.mobileNumber),
              callingCode: this.state.country.callingCode,
              OTP_CODE: this.state.digitOtpCode,
              redirectScreen: "SignUpForm"
            });

            this.setState({ animating: false });
          } 
          catch (error) { console.error(error); }
        } else
        if(responseJson.code === 501){
          Alert.alert('Error', responseJson.message, [{ text: "OK" }]);
          this.setState({ animating: false });
        }
      })
      .catch((error) => {
        console.log("Submitting Error: "+error); 
        ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
      });
    }
  }

  GENERATE_DIGIT_OTP = (length = 6) => { 
    //let RandOTP = Math.floor(Math.random() * 1000000) + 1;
    var digits = '0123456789'; 
    let OTP = ''; 
    for (let i = 0; i <length; i++ ) { 
      OTP += digits[Math.floor(Math.random() * 10)]; 
    }
    this.setState({digitOtpCode: OTP}); 
  }

  GENERATE_STRING_OTP = (length=10) => { 
    var string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'; 
    let OTP = ''; 
    for (let i = 0; i <length; i++ ) {
      OTP += string[Math.floor(Math.random() * string.length)];
    } 
    this.setState({stringOtpCode: OTP.toUpperCase()});
  }
  componentDidUpdate(prevProps, prevState) {
    // Check if yourVariable is set
    if (this.state.otpId !== prevState.otpId)  {
      this.props.navigation.navigate('OTPVerification', {
        mobile: this.MOBILE_WITH_ZERO(this.state.mobileNumber),
        callingCode: this.state.country.callingCode,
        OTP_ID: this.state.otpId,
        redirectScreen: "SignUpForm"
      });
      this.setState({ animating: false });}
  }

  UNSAFE_componentWillMount() {
    // this.keyboardWillShowListener = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow)
    // this.keyboardWillHideListener = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide)
    // this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardWillShow)
    // this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardWillHide)
    
    this.loginHeight = new Animated.Value(150)
    this.keyboardHeight = new Animated.Value(0)
    this.forwardArrowOpacity = new Animated.Value(0)
    this.borderBottomWidth = new Animated.Value(0)
  }

  keyboardWillShow = (event) => {
      if (Platform.OS == "android") { duration = 100 } else { duration = event.duration }

    Animated.parallel([
      Animated.timing(this.keyboardHeight, {
        duration: duration + 100,
        toValue: event.endCoordinate.height + 10
      }),
      Animated.timing(this.forwardArrowOpacity, {
        duration: duration,
        toValue: 1
      }),
      Animated.timing(this.borderBottomWidth, {
        duration: duration,
        toValue: 1
      })
    ]).start()
  }

  keyboardWillHide = (event) => {
    if (Platform.OS == "android") { duration = 100 } else { duration = event.duration }

    Animated.parallel([
      Animated.timing(this.keyboardHeight, {
        duration: duration + 100,
        toValue: 0
      }),
      Animated.timing(this.forwardArrowOpacity, {
        duration: duration,
        toValue: 0
      }),
      Animated.timing(this.borderBottomWidth, {
        duration: duration,
        toValue: 0
      })
    ]).start()
  }

  // increaseHeightOfLogin = () => {
  //   this.setState({ placeholderText: "01XXX-XXXXXX" })

  //   Animated.timing(this.loginHeight, {
  //     toValue: SCREEN_HEIGHT,
  //     duration: 500,
  //     useNativeDriver: true
  //   }).start(() => {

  //     //this.refs.textInputMobile.focus();
  //   })
  // }

  decreaseHeightOfLogin = () => {
    Keyboard.dismiss();

    Animated.timing(this.loginHeight, {
      toValue: 150,
      duration: 500,
      useNativeDriver: true
    }).start()
  }

  MOBILE_WITH_ZERO = (number) => {
    return this.state.mobileNumber.charAt(0) == 0 ? number : 0+number;
  }

  disabledBtn = () => {
    let length = this.state.mobileNumber.charAt(0) == 0 ? length = 11 : length = 10;
    return this.state.mobileNumber && this.state.mobileNumber.length.toString() == length ? 0 : 1;
  }

  handelSelect = (callingCode, flag) => {
    this.setState({ country: {callingCode: "+"+callingCode} });
  }

  render() {
    const headerTextOpacity = this.loginHeight.interpolate({
      inputRange: [150, SCREEN_HEIGHT],
      outputRange: [1, 0]
    })

    const marginTop = this.loginHeight.interpolate({
      inputRange: [150, SCREEN_HEIGHT],
      outputRange: [2, 100]
    })

    const headerBackArrowOpacity = this.loginHeight.interpolate({
      inputRange: [150, SCREEN_HEIGHT],
      outputRange: [0, 1]
    })

    const titleTextLeft = this.loginHeight.interpolate({
      inputRange: [150, SCREEN_HEIGHT],
      outputRange: [100, 25]
    })
    const titleTextBottom = this.loginHeight.interpolate({
      inputRange: [150, 400, SCREEN_HEIGHT],
      outputRange: [0, 0, 100]
    })
    const titleTextOpacity = this.loginHeight.interpolate({
      inputRange: [150, SCREEN_HEIGHT],
      outputRange: [0, 1]
    })

    return (
      <View style={styles.container}>
          <CustomStatusBar />
		  
		 <ImageBackground source={require('../assets/signup-bg.jpeg')} style={{ flex: 4, justifyContent: 'center', alignItems: 'flex-start', resizeMode: 'contain', height: SCREEN_HEIGHT-200, width: SCREEN_WIDTH, marginBottom: 120, paddingTop: 0 }}>
			{/* <Animatable.View animation="zoomIn" iterationCount={1} style={{ height: 140, width: 140, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', padding: 15, borderRadius: 5, marginTop: 30 }}>
			  <Image style={{ height: 130, width: 130, resizeMode: 'contain' }} source={require('../assets/logo.png')} />
			</Animatable.View> */}
		</ImageBackground>


          <Animatable.View animation="slideInUp" iterationCount={1} useNativeDriver={true} style={{flex:4, paddingBottom: 40, backgroundColor: "#fff" }}>
            <Animated.View style={{ height: this.loginHeight, backgroundColor: 'white' }}>
              <Animated.View style={{ opacity: headerTextOpacity, alignItems: 'flex-start', paddingHorizontal: 25, marginTop: marginTop }}>
                <Text style={{ fontSize: 24, marginVertical: 15 }}>Welcome to Uder Ride</Text>
              </Animated.View>

              <TouchableOpacity onPress={() => {}}>
                <Animated.View style={{ marginTop: marginTop, paddingHorizontal: 25, flexDirection: 'row' }}>
                  <Animated.Text style={{ fontSize: 18, color: '#333', fontWeight: '500', position: 'absolute', bottom: 40, left: titleTextLeft, opacity: titleTextOpacity }}>Enter Your Mobile Number</Animated.Text>

                  <Animated.View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
                    <CountryPickerModal initialCode={this.state.country.callingCode} handelSelect={(callingCode, flag) => this.handelSelect(callingCode, flag)} />
                    <TextInput keyboardType="numeric" style={styles.textInput} placeholderTextColor='#444' placeholder={this.state.placeholderText} underlineColorAndroid="transparent" onChangeText={val => this.setState({ mobileNumber: val })} value={this.state.mobileNumber} maxLength={this.state.mobileNumber.charAt(0) == 0 ? 11 : 10}></TextInput>
                  </Animated.View>
                </Animated.View>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.button, { opacity: (this.disabledBtn() == 1 ? 0.7 : 1) }]} onPress={ this.checkLogin } disabled={this.disabledBtn() == 1 ? true : false}>
  		          <Text style={styles.btnText}>{this.state.animating === false ? "Continue" : "Checking..."}</Text>
                <ActivityIndicator animating={this.state.animating} color='#fff' size="large" style={{ position: "absolute", left: 70, top: 5}} />
              </TouchableOpacity>
            </Animated.View>

            <Text style={{ fontSize: 12, lineHeight: 20, color: '#666', paddingVertical: 10, paddingHorizontal: 30, textAlign: 'center', opacity: this.titleTextOpacity, marginTop: 5 }}>By tapping continue, I confirm that I have read and agree to the <Text style={styles.hyperLinkText} onPress={ ()=> this.props.navigation.navigate('TermsAndConditionsModal') }>Terms & Conditions</Text> and <Text style={styles.hyperLinkText} onPress={ ()=> this.props.navigation.navigate('PrivacyPolicyModal') }>Privacy Policy</Text> of Uder</Text>
          </Animatable.View>{ /*Bottom Part*/ }

          <View style={{ flex: 1, height: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', borderLeftWidth: 0, borderRightWidth: 0, borderTopColor: '#e8e8ec', borderWidth: 1 }}>
              <Text style={{ color: "#444" }}>Already have an Account? <Text style={styles.hyperLinkText} onPress={ () => this.props.navigation.navigate('LoginMobile') }>Login</Text></Text>
          </View>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    // alignItems: 'center',
    // justifyContent: 'center',
    backgroundColor: '#00C497',
    overflow: 'hidden',
    //paddingTop: ( Platform.OS === 'ios' ) ? 20 : 0
  },
  flag: {
    height: 24,
    width: 24,
    resizeMode: 'contain'
  },
  textInput: {
    fontSize: 20,
    color: "#333",
    backgroundColor: '#F2FBF8',
    paddingHorizontal: 15,
    paddingVertical: 5,
    height: 40,
    width: SCREEN_WIDTH - 135,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 3
  },
  button: {
    alignSelf: "center",
    padding: 12,
    backgroundColor: "#EF0C14",
    marginTop: 14,
    width: SCREEN_WIDTH - 50,
    borderRadius: 5
  },
  btnText: {
    color: "#fff", 
    fontWeight: 'bold',
    textAlign: 'center'
  },
  hyperLinkText: {
    color: '#F53D3D',
    fontWeight: 'bold',
    padding: 3
  }
});
