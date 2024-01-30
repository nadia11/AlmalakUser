import React, { Component } from 'react';
import { Text, View, StyleSheet, TextInput, TouchableOpacity, Image, TouchableWithoutFeedback, SafeAreaView, Keyboard, KeyboardAvoidingView, Platform, Dimensions, Alert, ActivityIndicator } from 'react-native';

import Feather from "react-native-vector-icons/Feather";
import Ionicons from "react-native-vector-icons/Ionicons";
// import { Input } from 'react-native-elements';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import moment from 'moment';
import {Picker} from '@react-native-community/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
import { AuthContext } from './context';
import CustomStatusBar from '../components/CustomStatusBar';
import { Colors } from '../styles';
import { BASE_URL } from '../config/api';


export const SignUpForm = (props) => {
  const { navigation } = props;
  const { signInToken } = React.useContext(AuthContext);
  const [userToken, setUserToken] = React.useState(null);

  const [showPass, setShowPass] = React.useState(true);
  const [press, setPress] = React.useState(false);
  const [animating, setAnimating] = React.useState(false);

  const [errorEmail, setErrorEmail] = React.useState('')

  const [date, setDate] =  React.useState(new Date());
  const [mode, setMode] = React.useState('date');
  const [show, setShow] = React.useState(false);

  let emailRef = React.createRef();
  let passwordRef = React.createRef();
  let dobRef = React.createRef();
  let referralCodeRef = React.createRef();
  let referralMobRef = React.createRef();

  /***Submit Form***/
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [gender, setGender] = React.useState('');
  const [dateOfBirth, setDateOfBirth] = React.useState('');
  const [referralCode, setReferralCode] = React.useState('');
  const [referralMobile, setReferralMobile] = React.useState('');
  const [userPhoto, setUserPhoto] = React.useState('');
    
  const setDateOnChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios' ? true : false);
	
	  if(event.type == "set") {
      setDate(currentDate);
      setDateOfBirth(currentDate);
    } else {
      console.log("cancel button clicked");
    }
  };

  const showMode = currentMode => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const isEmailValid = () => {
      let Pattern = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      Pattern.test(String(email).toLowerCase()) ? setErrorEmail('') : setErrorEmail("Invalid Email Address");
  }

  
  const _handleShowPassword = () => {
    if(press == false){ setShowPass(false);  setPress(true); }
    else { setShowPass(true);  setPress(false); }
  }

  const _handleSubmit = async () => {
    setAnimating( true );

    await axios.post(BASE_URL+'/submit-registration-form', {
      full_name: fullName,
      mobile: props.route.params.mobile,
      email: email,
      password: password,
      gender: gender,
      date_of_birth: moment(dateOfBirth).format('DD/MM/YYYY'),
      referral_code: referralCode,
      referral_mobile: referralMobile,
      //user_photo: userPhoto
    })
    .then(async response => {
      //console.log("Response status: "+response.data.status);

      if(response.data.code === 200){
          try {
            await AsyncStorage.setItem('userName', fullName );
            await AsyncStorage.setItem('email', email);
            await AsyncStorage.setItem('userToken', '1');
            await AsyncStorage.setItem('mobile', props.route.params.mobile);
            await AsyncStorage.setItem('userPhoto', userPhoto);

            setUserToken('1');
            signInToken(); /*This for auto redirect to home page & refresh*/
            setAnimating( false );
            props.navigation.navigate('App');
          } catch (error) { console.error(error); }
        }
        else if(response.data.code === 501){
          setAnimating( false );
          Alert.alert('Response Error', response.data.message, [{ text: "OK" }]);
        }
    })
    .catch((error) => console.warn("Submitting Error: "+error));
  }

  const _disabledBtn = () => {
    let fields = fullName && email && password && gender && dateOfBirth;
    return fields !== '' ? 0 : 1;
  }
  
  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : 'height'} style={{ flex: 1, justifyContent: "center" }} >
      <SafeAreaView style={{flex: 1}}>
        <CustomStatusBar />

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.container}>
            <View style={styles.regform}>
              <View>
                <Feather name="user" size={20} style={styles.inputIcon} />
                <TextInput style={styles.textInput} placeholder="Full Name" placeholderTextColor="rgba(0,0,0,.5)" keyboardType="default" returnKeyType="next" autoCorrect={false} underlineColorAndroid="transparent" onChangeText={val => setFullName( val )} value={fullName} onSubmitEditing={() => emailRef.current.focus()} />
              </View>
              {errorEmail !== '' && <Text style={styles.errorEmail}>{errorEmail}</Text> }
              <View>
                <Feather name="mail" size={20} style={styles.inputIcon} />
                <TextInput style={styles.textInput} placeholder="Email Address" placeholderTextColor="rgba(0,0,0,.5)" keyboardType="email-address" returnKeyType="next" autoCorrect={false} underlineColorAndroid="transparent" onChangeText={val => setEmail( val )} value={email} onEndEditing={isEmailValid} ref={emailRef} onSubmitEditing={(event) => passwordRef.current.focus()} />
              </View>

              <View>
                <Feather name="lock" size={20} style={styles.inputIcon} />
                <TextInput style={styles.textInput} placeholder="Enter Password" placeholderTextColor="rgba(0,0,0,.5)" returnKeyType="go" autoCorrect={false} secureTextEntry={showPass} underlineColorAndroid="transparent" onChangeText={val => setPassword( val )} value={password} ref={passwordRef} onSubmitEditing={(event) => dobRef.current.focus()} />
                <TouchableOpacity style={styles.btnEye} onPress={ _handleShowPassword }><Ionicons name={press == false ? 'md-eye' : 'md-eye-off'} size={30} color="rgba(0,0,0,0.3)"></Ionicons></TouchableOpacity>
              </View>

              <View style={{flexDirection: 'row'}}>
                <View>
                  <View style={[styles.textInput, {width: (SCREEN_WIDTH - 30)/2, marginRight: 10, paddingRight: 0}]}>
                    <Ionicons name="md-transgender" size={20} style={styles.inputIcon} />
                    <Picker selectedValue={gender} onValueChange={(itemValue, itemIndex) => setGender(itemValue)}>
                      <Picker.Item label="--Gender--" value="" />
                      <Picker.Item label="Male" value="male" />
                      <Picker.Item label="Female" value="female" />
                      <Picker.Item label="Others" value="others" />
                    </Picker>
                  </View>
                </View>
                <View>
                  <Feather name="calendar" size={20} style={styles.inputIcon} />
                  <TextInput style={[styles.textInput, {width: (SCREEN_WIDTH - 70)/2}]} placeholder="Date of birth" placeholderTextColor="rgba(0,0,0,.5)" keyboardType="number-pad" returnKeyType="go" autoCorrect={false} underlineColorAndroid="transparent" onChangeText={val => setDateOfBirth( val )} value={dateOfBirth ? moment(dateOfBirth).format('DD/MM/YYYY') : ""} onFocus={showDatepicker} ref={dobRef} onSubmitEditing={(event) => referralCodeRef.current.focus()}  />
                </View>
              </View>

              {show && (
                <DateTimePicker testID="dateTimePicker" timeZoneOffsetInMinutes={0} display="default" 
                value={date} mode={mode} onChange={setDateOnChange}
                is24Hour={false} dateFormat={"dayofweek day month"} firstDayOfWeek="Saturday"
                minimumDate={new Date().setFullYear(new Date().getFullYear()-80)} maximumDate={new Date()}
                />
              )}

              <View>
                <Feather name="user-check" size={20} style={styles.inputIcon} />
                <TextInput style={styles.textInput} placeholder="Referral Code (Optional)" placeholderTextColor="rgba(0,0,0,.5)" returnKeyType="go" autoCorrect={false} underlineColorAndroid="transparent" onChangeText={val => setReferralCode( val )} value={referralCode} ref={referralCodeRef} onSubmitEditing={(event) => referralMobRef.current.focus()} />
              </View>

              <View>
                <Feather name="phone" size={20} style={styles.inputIcon} />
                <TextInput style={styles.textInput} placeholder="Referral Mobile (Optional)" placeholderTextColor="rgba(0,0,0,.5)" keyboardType="numeric" returnKeyType="go" autoCorrect={false} underlineColorAndroid="transparent" onChangeText={val => setReferralMobile( val )} value={referralMobile} maxLength={13} ref={referralMobRef} />
              </View>

              <Text style={{ fontSize: 14, lineHeight: 20, color: '#666', paddingVertical: 10, paddingHorizontal: 20, textAlign: 'justify' }}>By tapping continue, I confirm that I have read and agree to the <Text style={styles.hyperLinkText} onPress={ ()=> props.navigation.navigate('TermsAndConditionsModal') }>Terms & Conditions</Text> and <Text style={styles.hyperLinkText} onPress={ ()=> props.navigation.navigate('PrivacyPolicyModal') }>Privacy Policy</Text> of Almalak</Text>

              <TouchableOpacity style={[styles.button, { opacity: (_disabledBtn() == 1 ? 0.7 : 1) }]} onPress={ _handleSubmit } disabled={_disabledBtn() == 1 ? true : false}>
                <Text style={styles.btnText}>{animating === false ? "Complete Registration" : "Submitting..."}</Text>
                <ActivityIndicator animating={animating} color='#fff' size="large" style={{ position: "absolute", left: 65, top: 4}} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingLeft: 20,
    paddingRight: 20,
    paddingTop: 40
  },
  // statusBar: {
  //   backgroundColor: "#C2185B",
  //   height: Constants.statusBarHeight,
  // },
  regform: {
    alignSelf: "stretch",
    textAlign: 'center'
  },
  header: {
    //fontFamily: 'Roboto-Bold',
    fontSize: 22,
    color: '#fff',
    fontWeight: 'bold',
    paddingBottom: 10,
    marginBottom: 30,
    borderBottomColor: '#fff',
    borderBottomWidth: 1
  },
  textInput: {
    alignSelf: "stretch",
    fontSize: 16,
    height: 50,
    marginBottom: 15,
    color: "#333",
    borderColor: "#ccc",
    borderWidth: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingLeft: 45,
    borderRadius: 5,
    width: (SCREEN_WIDTH - 40)
  },
  inputIcon: {
    position: 'absolute',
    left: 15,
    top: 14,
    color: '#00A968',
    zIndex: 999
  },
  button: {
    alignSelf: "center",
    alignItems: "center",
    padding: 12,
    backgroundColor: Colors.BUTTON_COLOR,
    marginTop: 30,
    borderRadius: 5,
    width: (SCREEN_WIDTH - 60)
  },
  btnText: {
    color: "#fff", 
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase',
    //fontFamily: 'Roboto-Bold'
  },
  btnEye: {
    position: 'absolute',
    right: 15,
    top: 8,
  },
  hyperLinkText: {
    color: '#F53D3D',
    // textDecorationLine: 'underline',
    fontWeight: 'bold',
    padding: 3
  },
  errorEmail: {
    fontSize: 12,
    color: 'red',
    marginHorizontal: 20
  }
});
