import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from 'react-native';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Ionicons from "react-native-vector-icons/Ionicons";
import AsyncStorage from '@react-native-async-storage/async-storage';

import DateTimePicker from '@react-native-community/datetimepicker';
import Modal from 'react-native-modal';
import * as Animatable from 'react-native-animatable';
import moment from 'moment';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

import { Colors } from '../styles';

const renderGreetingMsg = (currentTime = new Date()) => {
    const currentHour = currentTime.getHours();
    if (currentHour < 12) { return "Good Morning" }
    else if (currentHour >= 12 && currentHour <= 17) { return "Good Afternoon" }
    else if (currentHour >= 17 && currentHour <= 24){ return "Good Evening"; }
    else { return "Welcome"; }
}

const InitialBottomPanel = function(props) {
  const [userName, setUserName] = React.useState('Md Rabiul Islam');
  // const [mobile, setMobile] = React.useState('');

  // const [homeAddress, setHomeAddress] = React.useState();
  // const [workAddress, setWorkAddress] = React.useState();
  // const [savedAddress, setSavedAddress] = React.useState();
  //const [searchMapModal, setSearchMapModal] = React.useState(false);

  const [scheduleModal, setScheduleModal] =  React.useState(false);
  const [date, setDate] =  React.useState(new Date());
  const [mode, setMode] = React.useState('date');
  const [show, setShow] = React.useState(false);


  const getUserData = async () => {
    try {
      const userName = await AsyncStorage.getItem('userName')
      // const mobile = await AsyncStorage.getItem('mobile')
      // const homeAddress = await AsyncStorage.getItem('homeAddress')
      // const workAddress = await AsyncStorage.getItem('workAddress')
      // const savedAddress = await AsyncStorage.getItem('savedAddress')
      
      if(userName !== null) { setUserName( userName ); }
      // if(mobile !== null) { setMobile( mobile ); }
      // if(homeAddress !== null) { setHomeAddress( homeAddress ); }
      // if(workAddress !== null) { setWorkAddress( workAddress ); }
      // if(savedAddress !== null) { setSavedAddress( savedAddress ); }
    } catch (error) { console.error(error); }
  }
  React.useEffect(() => {
    getUserData();
  }, []);

  // const setModalSearchMapVisible = () => {
  //   setSearchMapModal(!searchMapModal);
  // }
  const setModalScheduleVisible = () => {
    setScheduleModal(!setScheduleModal);
  }

  const setDateOnChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShow(Platform.OS === 'ios' ? true : false);
    setDate(currentDate);
  };

  const showMode = currentMode => {
    setShow(true);
    setMode(currentMode);
  };

  const showDatepicker = () => {
    showMode('date');
  };

  const showTimepicker = () => {
    showMode('time');
  };

  const dateFormat = (date) => {
    var days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    let dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const monthShorts = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return dayNames[date.getDay()] +", "+ date.getDate() +" "+ monthShorts[date.getMonth()];
  }

  const timeFormat = (time) => {
    function appendLeadingZeroes(n){ return n <= 9 ? "0" + n : n }
    // let time = new Date();
    let ampm = (time.getHours() >= 12) ? "pm" : "am";
    let hours = time.getHours() > 12 ? (time.getHours() % 12) : 12;  
    return appendLeadingZeroes(hours) +":"+ appendLeadingZeroes(time.getMinutes()) +" "+ ampm;
    // return date.toLocaleString('bn', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC+06', timeZoneName: 'short' });
  }

  const timeFormatPlus = (time) => {
    function appendLeadingZeroes(n){ return n <= 9 ? "0" + n : n }

    let timeNow = new Date(time);
    timeNow.setMinutes( timeNow.getMinutes() + 10 );
    let ampm = (timeNow.getHours() >= 12) ? "pm" : "am";
    let hours = timeNow.getHours() > 12 ? (timeNow.getHours() % 12) : 12;  
    return appendLeadingZeroes(hours) +":"+ appendLeadingZeroes(timeNow.getMinutes()) +" "+ ampm;
    // return date.toLocaleString('bn', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC+06', timeZoneName: 'short' });
    // return time.getHours() +" "+ timeNow.getHours();
  }

  return (
    <View style={styles.container}>
        <Animatable.View animation="slideInUp" iterationCount={1} delay={1000} useNativeDriver={true}>
          <Text style={styles.greetings}>{renderGreetingMsg()}, {userName}</Text>
        </Animatable.View>

        <Animatable.View animation="slideInUp" iterationCount={1} delay={300} useNativeDriver={true} style={styles.innerContainer}>
          <TouchableOpacity style={styles.whereTo} onPress={() => props.showSearchModal()}>
            <Text style={{fontFamily: 'sans-serif', fontSize: 20, color: '#000'}}>Where to?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.schedule} onPress={() => setScheduleModal(true)}>
            <MaterialIcons name="schedule" color='#000000' size={20} style={{width: 25}} />
            <Text>Now</Text>
          </TouchableOpacity>

          
          <Modal isVisible={scheduleModal} animationType='slide'
            onSwipeStart={() => setScheduleModal(false)} swipeDirection={['up','down']} onSwipeComplete={() => setScheduleModal(false)} propagateSwipe={true}
            backdropColor="black" backdropOpacity={0.7} onBackdropPress={() => setScheduleModal(false) } onBackButtonPress={() => setScheduleModal(false)} style={styles.bottomModal}>
            <View style={{height: 280, backgroundColor: '#fff', padding: 0}}>

              <Text style={[styles.schedulePickupItem, {fontSize: 22, textAlign: 'center' }]}>Schedule a trip</Text>

              <TouchableOpacity onPress={showDatepicker} style={styles.schedulePickupItem}>
                <Text style={{fontSize: 16, textAlign: 'center'}}>{dateFormat(date)}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={showTimepicker} style={styles.schedulePickupItem}>
                <Text style={{fontSize: 16, textAlign: 'center'}}>Driver may arive between {timeFormat(date)} - {timeFormatPlus(date)}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.schedulePickupBtn} onPress={() => props.showSearchModal()}>
                <Text style={styles.schedulePickupBtnText}>SET PICK-UP TIME</Text>
              </TouchableOpacity>
            </View>
          </Modal>

          {show && (
            <DateTimePicker testID="dateTimePicker" timeZoneOffsetInMinutes={0} display="default"
            value={date} mode={mode} onChange={setDateOnChange}
            is24Hour={false} dateFormat={"dayofweek day month"} firstDayOfWeek="Saturday"
            minimumDate={new Date()} maximumDate={new Date(new Date().setDate(new Date().getDate()+30))}
              />
          )}
      </Animatable.View>
                
      {/* <TouchableOpacity onPress={() => alert(1)} style={styles.listItem}>
        <FontAwesome name="star" size={20} color="#000" style={styles.leftIcon} />
        <View style={styles.listItemContent}>
          <Text style={styles.locationTitle}>Choose a saved place</Text>
        </View>
        <Ionicons name="ios-arrow-forward" size={20} color={Colors.TEXT_PRIMARY} style={styles.rightIcon} />
      </TouchableOpacity> */}
    </View>
  )
}
export default InitialBottomPanel;

const styles = StyleSheet.create({
  container:{
    position: 'absolute',
    left: 0,
    // top: (SCREEN_HEIGHT-180),
    bottom: 0,
    zIndex: 9,
    width: SCREEN_WIDTH,
    // minHeight: 160,
    paddingBottom: 15,
    borderRadius: 2,
    backgroundColor: 'white',
    alignItems: 'center',
    shadowColor: "#000",
    elevation: 7,
    shadowRadius: 5,
    shadowOpacity: 1.0
  },
  greetings: {
    fontSize: 16,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
    marginBottom: 15,
    paddingVertical: 15,
    width: SCREEN_WIDTH,
    textAlign: 'center',
    fontWeight: 'bold'
  },
  innerContainer:{
    flexDirection: 'row',
    justifyContent: "space-around",
    alignItems: 'center',
    backgroundColor: "#eee",
    width: (SCREEN_WIDTH - 20),
    height: 60
  },
  whereTo: {
    flex: 6,
    marginHorizontal: 10,
  },
  schedule: {
    flex: 2,
    backgroundColor: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginHorizontal: 10,
    flexDirection: 'row',
    justifyContent: "center",
    borderRadius: 30
  },

  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  bottomModal: {
    justifyContent: 'flex-end',
    margin: 0
  },
  schedulePickupBtn: {
    width: (SCREEN_WIDTH - 50),
    marginLeft: 25,
    marginTop: 20,
    backgroundColor: Colors.BUTTON_COLOR,
    borderRadius: 3
  },
  schedulePickupBtnText: {
    textAlign: 'center',
    color: 'white',
    padding: 10,
    fontSize: 16,
    fontWeight: 'bold'
  },
  schedulePickupItem: {
    borderBottomColor: "#eee", 
    borderBottomWidth: 1,
    paddingVertical: 20
  },

  listItem: {
    width: SCREEN_WIDTH,
    backgroundColor: "#fff",
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    marginTop: 5
  },
  leftIcon: {
    backgroundColor: '#ddd',
    borderRadius: 50,
    width: 40,
    height: 40,
    lineHeight: 40,
    textAlign: 'center',
    marginRight: 20,
    marginLeft: 10
  },
  rightIcon: {
    position: 'absolute',
    right: 15,
    top: 20
  },
  listItemContent: {
    paddingVertical: 10,
    width: '100%'
  },
  listItemContentLast: {
    borderBottomWidth: 0
  },
  locationTitle: {
    fontWeight: 'bold',
    fontSize: 18
  }
});