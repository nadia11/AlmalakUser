import React from "react";
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, ActivityIndicator, Keyboard, TouchableWithoutFeedback, Alert, ToastAndroid } from "react-native";
import {Picker} from '@react-native-community/picker';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import Modal from 'react-native-modal';
import axios from 'axios';

import { Colors } from '../styles';
import { BASE_URL } from '../config/api';
import { Options } from '../config';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function FindingDriverScreen(props){
  const [reason, setReason] = React.useState('');
  const [modal, setModal] =  React.useState(false);
  const [animating, setAnimating] = React.useState(false);
  const [timeOut, setTimeOut] = React.useState(false);
  const search_timeout_ms = 1000 * 60 * 1; 
  
  const handleCancelRequest = () => {
    Alert.alert('Cancel this Request?', 'We are almost finished finding your ride. Do you want to Cancel this Request?', [
      { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' },
      { text: 'Yes, Cancel', onPress: () => setModal(true)},
    ],
    { cancelable: true });
  }


  React.useEffect(() => { 
    var interval = setInterval(() => {
      // props.requestDriverAgain();
      // console.log('requestSendingLoop');
      // if(props.lookingForDriver === false) {
      //   clearInterval(interval);
      // }
    }, 10000);

    setTimeout(() => {
      clearInterval(interval);
      setTimeOut(true);
      console.log('requestSendingLoop cleared.');
    }, search_timeout_ms);

    return () => clearInterval(interval);
  }, []);



  const handleCancelRequestConfirm = async () => {
    setAnimating( true );

    await axios.post(BASE_URL+'/cancel-request-by-rider', {
      mobile: props.riderMobile,
      trip_number: props.tripNumber,
      latitude: props.latitude,
      longitude: props.longitude,
      reason_for_cancellation: reason
    })
    .then(response => {
      if(response.data.code === 200){
        props.handleCancel();
        setAnimating( false );
        ToastAndroid.show(response.data.message, ToastAndroid.SHORT);
      }
    })
    .catch((error) => {
      setAnimating( false );
      console.log("cancel-request-by-rider: ", error.message);
      ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
    });
  }
  
  const disabledBtn = () => {
    return reason == '' ? 0 : 1;
  }

  return (
    <View style={styles.container}>
        {timeOut === false && (
        <View>
          <ActivityIndicator size="large" animating={true} color="red" />
          <Text style={styles.footerTop}>Please Wait...</Text>
          <Text style={styles.footerTopText}>We are finding the Vehicle for you.</Text>

          <TouchableOpacity onPress={handleCancelRequest} style={styles.RequestRideButton}>
            <Text style={styles.bottomButtonText}>Cancel Request</Text>
          </TouchableOpacity>
        </View>
        )}

        {timeOut === true && (
        <View>
          <MaterialCommunityIcons name="car-off" size={40} color="red" style={{textAlign: 'center'}} />
          <Text style={styles.noDriverFound}>No Driver found. Please try again.</Text>
          <TouchableOpacity onPress={() => {props.requestDriverAgain(); setTimeOut(false); }} style={[styles.RequestRideButton]}>
            <Text style={styles.bottomButtonText}>Request Again...</Text>
          </TouchableOpacity>
        </View>
        )}

        <Modal isVisible={modal} animationType='slide' backdropColor="#000" backdropOpacity={0.3} style={styles.bottomModal} onBackButtonPress={() => setModal(false)} onBackdropPress={() => setModal(false)} deviceWidth={SCREEN_WIDTH} deviceHeight={SCREEN_HEIGHT}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={{ backgroundColor: '#fff', height: 300 }}>
              <Text style={styles.title}>Reason for Ride Cancellation</Text>
              <Text style={{paddingHorizontal: 30, paddingBottom: 20, fontSize: 16}}>Please specify that, why you are cancel ride?</Text>
              
              <View style={[styles.textInput, {width: (SCREEN_WIDTH - 60), marginLeft: 30, paddingRight: 0}]}>
                <Picker selectedValue={reason} onValueChange={(itemValue, itemIndex) => setReason(itemValue)}>
                  <Picker.Item label="--Select Reason--" value="" />
                  <Picker.Item label="Changed Mined" value="ChangedMined" />
                  <Picker.Item label="Driver Not Found" value="DriverNotFound" />
                  <Picker.Item label="Driver Did not Came" value="DriverDidnotCame" />
                  <Picker.Item label="My pickup/destination location was incorrect" value="locationIncorrect" />
                  <Picker.Item label="I do not need a ride right now." value="doNotNeedRideRightNow" />
                  <Picker.Item label="Vehicle/Person was not the same." value="vehicleNotSame" />
                  <Picker.Item label="Driver denied to go at mentioned destination" value="DriverDenied" />
                  <Picker.Item label="Driver's behaviour was bad" value="DriversBehaviourWasBad" />
                  <Picker.Item label="Others" value="others" />
                </Picker>
              </View>

              <TouchableOpacity onPress={() => handleCancelRequestConfirm()} style={[styles.addButton, { opacity: (disabledBtn() == 0 ? 0.7 : 1) }]} disabled={disabledBtn() == 0 ? true : false}>
                <Text style={styles.addButtonText}>Confirm Cancel Request</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
    </View>       
  );
}


const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: SCREEN_WIDTH,
    backgroundColor: '#fff',
    paddingTop: 10
  },
  footerTop: {
    backgroundColor:"#fff",
    textAlign: 'center',
    fontSize: 30,
    fontWeight: 'bold'
  },
  footerTopText: {
    fontSize: 18,
    textAlign: 'center',
    paddingBottom: 10
  },
  RequestRideButton: {
    alignSelf: "center",
    backgroundColor: Colors.BUTTON_COLOR,
    width: SCREEN_WIDTH,
    padding: 15,
    paddingLeft: 30,
    paddingRight: 30,
  },
  bottomButtonText : {
    fontSize: 18,
    color: "#fff", 
    textAlign: 'center',
	textTransform: 'uppercase'
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
    color: Colors.PRIMARY
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0
  },
  promoButton: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderColor: '#ccc',
    borderWidth: 1,
    marginRight: 10,
    borderRadius: 3
  },
  addButton: {
    alignSelf: "center",
    backgroundColor: Colors.BUTTON_COLOR,
    width: SCREEN_WIDTH-60,
    borderRadius: 3,
    padding: 10,
    marginBottom: 15
  },
  addButtonText : {
    fontSize: 18,
    color: "#fff", 
    textAlign: 'center'
  },
  textInput: {
    alignSelf: "stretch",
    fontSize: 16,
    height: 50,
    marginBottom: 50,
    color: "#333",
    borderColor: "#ccc",
    borderWidth: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingLeft: 45,
    borderRadius: 5,
    width: (SCREEN_WIDTH - 40)
  },
  noDriverFound: {
    fontSize: 18,
    lineHeight: 50,
    color: "#333", 
    textAlign: 'center'
  }
});
