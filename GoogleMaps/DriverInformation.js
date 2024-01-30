import React from "react";
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Image, Linking, Platform, Keyboard, TouchableWithoutFeedback, ToastAndroid } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Modal from 'react-native-modal';
import axios from 'axios';
import {Picker} from '@react-native-community/picker';
import moment from 'moment';
import socketIO from 'socket.io-client';

import { BASE_URL, GOOGLE_API_KEY, SOCKET_IO_URL } from '../config/api';
import { Colors } from '../styles';
import { Options } from '../config';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;


export default function DriverInformation(props)
{
  const { tripNumber } = props;
  //const tripNumber = 'TR7H2OKSH3Y6';
  const [riderName, setRiderName] = React.useState("");
  const [driverName, setDriverName] = React.useState("");
  const [driverMobile, setDriverMobile] = React.useState("");
  const [driverPhoto, setDriverPhoto] = React.useState("");
  const [driverPhotoPath, setDriverPhotoPath] = React.useState("");
  const [ratings, setRatings] = React.useState("");
  const [delayCancellationMinute, setDelayCancellationMinute] = React.useState();
  const [delayCancellationFee, setDelayCancellationFee] = React.useState();
  const [destinationChangeFee, setDestinationChangeFee] = React.useState();

  const [vehicleNumber, setVehicleNumber] = React.useState("");
  const [manufacturer, setManufacturer] = React.useState("");
  const [startTime, setStartTime] = React.useState("");
  
  const [vehicleType, setVehicleType] = React.useState("");
  const [seatCapacity, setSeatCapacity] = React.useState("");
  const [vehicleColor, setVehicleColor] = React.useState("");
  const [vehicleImage, setVehicleImage] = React.useState("");
  
  const [reason, setReason] = React.useState('');
  const [modal, setModal] =  React.useState(false);
  const [animating, setAnimating] = React.useState(false);
  let socket = socketIO(SOCKET_IO_URL);

  const getUserData = async () => {
    await axios.get(BASE_URL+'/get-trip-assigned-driver-info/'+tripNumber)
    .then(async response => {
      setDriverName(response.data.driver_info.driver_name);
      setDriverMobile(response.data.driver_info.mobile);
      setDriverPhoto(response.data.driver_info.driver_photo);
      setDriverPhotoPath(response.data.driver_picture_path);
      setRatings(response.data.driver_info.ratings);
      
      setRiderName(response.data.rider_name);
      setStartTime(response.data.trip_info.start_time);

      setDelayCancellationMinute(response.data.fare_info.delay_cancellation_minute);
      setDelayCancellationFee(response.data.fare_info.delay_cancellation_fee);
      setDestinationChangeFee(response.data.fare_info.destination_change_fee);
    
      setVehicleNumber(response.data.vehicle_info.vehicle_reg_number);
      setManufacturer(response.data.vehicle_info.manufacturer);
      setVehicleType(response.data.vehicle_type.vehicle_type);
      setSeatCapacity(response.data.vehicle_type.seat_capacity);
      setVehicleColor(response.data.vehicle_type.vehicle_color);
      setVehicleImage(response.data.vehicle_type.vehicle_photo);
    })
    .catch((error) => {
      console.log('get-trip-assigned-driver-info: '+error.message);
      ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
      setAnimating(false);
    });
  }
  
  React.useEffect(() => {
    getUserData();

    //socket = socketIO(SOCKET_IO_URL);
    socket.on("driverSentRequestToJoinTripChat", request => {
      if(tripNumber === request.tripNumber) {
        console.log("driverSentRequestToJoinTripChat: "+request.room, "tripNumber: "+tripNumber, "request.tripNumber: "+request.tripNumber)
        console.log("riderName: "+riderName, "tripNumber: "+tripNumber, "driverMobile: "+driverMobile, "photo: "+ driverPhotoPath+"/"+driverPhoto);
		    props.navigation.navigate('chatMessage', {name: riderName, room: "room-"+tripNumber, tripNumber: tripNumber, mobile: driverMobile, photo: driverPhotoPath+"/"+driverPhoto});
      }
    });
  }, []);



  const handleCancelRequest = () => {
    var now = moment().format('YYYY-MM-DD HH:mm:ss');
    var minutesPassed = moment().diff(startTime, 'minutes');

    const extraMessage = minutesPassed > delayCancellationMinute ? " If you Cancel Trip right now, then you will be charge "+delayCancellationFee+" Tk in your next ride." : "";

    Alert.alert('Cancel this Request', 'Your driver almost arrived to your Locaton. Do you want to Cancel Ride? '+extraMessage, [
      { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' },
      { text: 'Yes, Cancel', onPress: () => setModal(true)},
    ], { cancelable: true });
  }

  const handleCancelRequestConfirm = async () => {
    await axios.post(BASE_URL+'/cancel-request-by-rider', {
      mobile: props.riderMobile,
      trip_number: tripNumber,
      latitude: props.latitude,
      longitude: props.longitude,
      reason_for_cancellation: reason,
      delay_cancellation_minute: delayCancellationMinute,
      delay_cancellation_fee: delayCancellationFee
    })
    .then(response => {
      if(response.data.code === 200){
        props.handleCancel();
		    ToastAndroid.showWithGravity(response.data.message, ToastAndroid.LONG, ToastAndroid.CENTER);
      }
    })
    .catch((error) => {
      console.log("cancel-request-by-rider: ", error.message);
      ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
      setAnimating(false);
    });
  }

  const handlePhoneCall = () => {
    let dialPad = '';
    if (Platform.OS === 'android') { dialPad = 'tel:${'+driverMobile+'}'; }
    else { dialPad = 'telprompt:${'+driverMobile+'}'; }
    
    Alert.alert('Phone Call?', 'Do you want to Phone Call to Rider?', [
      { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' },
      { text: 'Yes, Call', onPress: () => Linking.openURL(dialPad)},
    ], { cancelable: true });
  }

  const goToMessage = () => {
	  props.navigation.navigate('chatMessage', {
      name: riderName, 
      room: "room-"+tripNumber, 
      tripNumber: tripNumber, 
      mobile: driverMobile, 
      photo: driverPhotoPath+"/"+driverPhoto
    });
  }
  
  const disabledBtn = () => {
    return reason == '' ? 0 : 1;
  }

  return (
    <View style={styles.container}>
        <View style={styles.headerNotification}>
          <Text style={{color: '#fff', fontSize: 20}}>{props.titleText}</Text>
          {props.onTheWay === true && ( <Text style={{color: '#ddd', fontSize: 16}}>Meet at the pickup point</Text> )}
        </View>
          
        <View style={styles.bottomPanel}>
          {props.onTheWay === true && (
            <View style={styles.footerTop}>
              <Text style={styles.footerTopText}>Driver is on the way.</Text>
              <Text style={styles.estimatedTime}>Estimated Arrival Time: {moment(startTime).add(10, 'minutes').format('h:mm A')}</Text>
            </View>
          )}

          <View style={styles.bodyContent}>
            <View>
              <View style={styles.imageWrap}>
                  {driverPhoto !== "" && <Image style={styles.image} source={{uri: driverPhotoPath+"/"+driverPhoto, crop: {left: 30, top: 30, width: 50, height: 50}}} /> }
                  {driverPhoto == "" && <Image style={styles.image} source={require('../assets/avatar.png')} /> }
              </View>
              <Text style={styles.name}>{driverName}</Text>
              <Text style={{fontSize: 18}}>{ratings} <FontAwesome name="star" size={15} color='orange' /></Text>
            </View>

            <View>
              <Image style={styles.vehicleImage} source={require('../assets/images/car.png')} />
              <Text style={styles.model}>{vehicleNumber}</Text>
              <Text style={styles.brand}>{manufacturer}</Text>
            </View>
          </View>

          <View style={{flexDirection: 'row', width: SCREEN_WIDTH, padding: 10, justifyContent: 'space-around', alignItems: 'center'}}>
            <TouchableOpacity onPress={handleCancelRequest} style={styles.cancelRequestButton}>
              <Text style={styles.cancelRequestButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => goToMessage()} style={styles.textMessageButton}>
              <Text style={styles.textMessageButtonText}>Any Pickup notes?</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handlePhoneCall} style={styles.callDriverButton}>
              <Text style={styles.callDriverButtonText}><FontAwesome name="phone" size={25} /></Text>
            </TouchableOpacity>
          </View>
        </View>


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
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    // left: 0,
    zIndex: 999,
    width: SCREEN_WIDTH,
    backgroundColor: '#fff',
    elevation: 10,
    shadowColor: 'red',
    shadowOpacity: 0.5,
    shadowOffset: { height: 0, width: 0},
    shadowRadius: 10
  },
  headerNotification: {
    position: 'absolute',
    top: 30,
    // left: 10,
    width: SCREEN_WIDTH-20,
    backgroundColor: '#000',
    paddingHorizontal: 15,
    paddingVertical: 5
  },
  footerTop: {
    backgroundColor:"#fff",
    marginBottom: 10,
  },
  footerTopText: {
    fontSize: 20,
    textAlign: 'center',
    color: '#333',
    fontWeight: 'bold',
  },
  estimatedTime: {
    paddingBottom: 5,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    textAlign: 'center',
    fontSize: 16
  },
  bodyContent: {
    width: SCREEN_WIDTH,
    height: 120,
    backgroundColor:"#fff",
    paddingHorizontal: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  name: {
    fontSize: 18,
    color: 'dodgerblue'
  },
  imageWrap: {
    height: 60,
    width: 60,
    backgroundColor:"#fff",
    borderBottomColor: '#000',
    borderBottomWidth: 5,
    borderRadius: 100,
    elevation: 5,
    shadowColor: '#333',
    shadowOpacity: 0.5,
    shadowOffset: { height: 0, width: 0},
    shadowRadius: 7
  },
  image: {
    height: 60,
    width: 60,
    // resizeMode: 'contain',
    borderRadius: 50,
    marginTop: 5
  },
  vehicleImage: {
    // height: 50,
    width: 60,
    resizeMode: 'contain',
    alignSelf: 'flex-end'
  },
  model: {
    fontSize: 18,
    textAlign: 'right'
  },
  brand: {
    fontSize: 16,
    textAlign: 'right'
  },
  cancelRequestButton: {
    backgroundColor: "#eee",
    borderWidth: 1,
    borderColor: 'red',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 40,
    marginRight: 10
  },
  cancelRequestButtonText : {
    fontSize: 18,
    color: "#333", 
  },
  textMessageButton: {
    backgroundColor: "#ddd",
    width: SCREEN_WIDTH - 175,
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 40
  },
  textMessageButtonText : {
    fontSize: 18,
    color: "#333", 
  },
  callDriverButton: {
    alignSelf: "center",
    backgroundColor: "red",
    padding: 14,
    width: 50,
    height: 50,
    borderRadius: 100,
    marginLeft: 10
  },
  callDriverButtonText : {
    color: "#fff", 
    textAlign: 'center'
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
  }
});
