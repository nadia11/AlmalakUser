import React, { Component } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, SafeAreaView, ScrollView, Alert } from "react-native";
import PropTypes from "prop-types";
import Icon from "react-native-vector-icons/FontAwesome5";
import Ionicons from "react-native-vector-icons/Ionicons";

import PaymentMethodsModal from '../AdminScreen/PaymentMethods/PaymentMethodsModal';
import { calculateFare } from '../config/helperFunctions';

import { Colors } from '../styles';
import { BASE_URL, SMS_API_URL } from '../config/api';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;


export default function VehicleSelectionPanel(props) {

  const [databaseData, setDatabaseData] = React.useState();
  const [isLoading, setLoading] = React.useState(true);

  const [vehicleType, setVehicleType] = React.useState('');
  const [selectedDuration, setSelectedDuration] = React.useState('');
  const [selectedPrice, setSelectedPrice] = React.useState('');
  const [selectedDistance, setSelectedDistance] = React.useState('');
  const [paymentMethod, setPaymentMethod] = React.useState('cashPayment');
  const [promoCode, setPromoCode] = React.useState();

  React.useEffect(() => {
    fetch(BASE_URL+'/get-fares-from-database')
      .then((response) => response.json())
      .then((json) => {
        setDatabaseData(json.message);
        //alert(json.message['Bike'].baseFare);
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);


  const fareFromDatabase = {
    "Bike": {
      baseFare: databaseData ? databaseData['Bike'].baseFare : 0, 
      timeRate: databaseData ? databaseData['Bike'].timeRate : 0, 
      distanceRatePerKm: databaseData ? databaseData['Bike'].distanceRatePerKm : 0, 
      surge: 1 
    },
    "Car": {
      baseFare: databaseData ? databaseData['Car'].baseFare : 0, 
      timeRate: databaseData ? databaseData['Car'].timeRate : 0, 
      distanceRatePerKm: databaseData ? databaseData['Car'].distanceRatePerKm : 0, 
      surge: 1 
    },
    "Micro": {
      baseFare: databaseData ? databaseData['Micro'].baseFare : 0, 
      timeRate: databaseData ? databaseData['Micro'].timeRate : 0, 
      distanceRatePerKm: databaseData ? databaseData['Micro'].distanceRatePerKm : 0, 
      surge: 1 
    },
    "Pickup": {
      baseFare: databaseData ? databaseData['Pickup'].baseFare : 0, 
      timeRate: databaseData ? databaseData['Pickup'].timeRate : 0, 
      distanceRatePerKm: databaseData ? databaseData['Pickup'].distanceRatePerKm : 0, 
      surge: 1 
    },
    "Ambulance": {
      baseFare: databaseData ? databaseData['Ambulance'].baseFare : 0, 
      timeRate: databaseData ? databaseData['Ambulance'].timeRate : 0, 
      distanceRatePerKm: databaseData ? databaseData['Ambulance'].distanceRatePerKm : 0, 
      surge: 1 
    },
  }

  // const fareFromDatabase = {
  //   "Bike": { baseFare: 40, timeRate: 3, distanceRate: 18, surge: 1 },
  //   "Car": { baseFare: 50, timeRate: 4, distanceRate: 15, surge: 1 },
  //   "Micro": { baseFare: 60, timeRate: 5, distanceRate: 30, surge: 1 },
  //   "Pickup": { baseFare: 70, timeRate: 6, distanceRate: 35, surge: 1 },
  //   "Ambulance": { baseFare: 80, timeRate: 7, distanceRate: 40, surge: 1 },
  // }


  const getFare = (vehicle) => {
    var fare = calculateFare(
      fareFromDatabase[vehicle].baseFare,
      fareFromDatabase[vehicle].timeRate,
      props.durationValue,
      fareFromDatabase[vehicle].distanceRatePerKm,
      props.distanceValue,
      fareFromDatabase[vehicle].surge
    );
    return Number.parseFloat(fare).toFixed(2);
  }
  
  const tabs = [
    { title: "Bike", seatNumber: "Pay Less", price: getFare("Bike"), duration: props.durationText, distance: props.distanceText, icon: "motorcycle" },
    { title: "Car", seatNumber: "7 Seats", price: getFare("Car"), duration: props.durationText, distance: props.distanceText, icon: "car" },
    { title: "Micro", seatNumber: "14 Seats", price: getFare("Micro"), duration: props.durationText, distance: props.distanceText, icon: "shuttle-van" },
    { title: "Pickup", seatNumber: "2 Seats", price: getFare("Pickup"), duration: props.durationText, distance: props.distanceText, icon: "truck-pickup" },
    { title: "Ambulance", seatNumber: "7 Seats", price: getFare("Ambulance"), duration: props.durationText, distance: props.distanceText, icon: "ambulance" }
  ]

  const fareBreakdown = (vehicle) => {
    props.navigation.navigate('fareBreakdown', {
      baseFare: "BDT "+fareFromDatabase[vehicle].baseFare,
      minimumFare: "BDT "+fareFromDatabase[vehicle].baseFare,
      perMinute: "BDT "+fareFromDatabase[vehicle].timeRate,
      perKilometer: "BDT "+fareFromDatabase[vehicle].distanceRatePerKm
    });
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.footerTop}>
        <TouchableOpacity style={styles.footerEnlargeButton} onPress={() => {}}></TouchableOpacity>
        <Text style={styles.footerTopText}>Chose a vehicle or swipe up for more</Text>
      </View>
        
      <ScrollView style={styles.footerScroll}>
        {tabs.map((obj, index) => {
          return (
            <TouchableOpacity style={[styles.vehicleListItem, (obj.title === vehicleType ? styles.vehicleListItemActive : "")]} key={index} onPress={() => {setVehicleType(obj.title); setSelectedDistance(obj.distance); setSelectedDuration(obj.duration); setSelectedPrice(obj.price); }}>
              <View>
                  <Icon style={styles.vehicleIcon} size={50} name={obj.icon} color={Colors.TEXT_PRIMARY} />
                  <Text style={styles.title}>{obj.title.toLocaleUpperCase()}</Text>
                  <Text style={styles.seatNumber}>{obj.seatNumber}</Text>
                  <Text style={styles.distance}>{obj.distance}</Text>
                  <Text style={styles.price} onPress={() => fareBreakdown(obj.title)}>৳{obj.price}</Text>
                  <Text style={styles.duration}><Ionicons size={20} name="md-time" /> {obj.duration}</Text>
              </View>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      <PaymentMethodsModal {...props} mobile={props.riderMobile} paymentMethod={(type) => {setPaymentMethod(type)}} promoCode={(code) => setPromoCode(code)} />
  
      <TouchableOpacity onPress={() => props.onRequestDriver(selectedDistance, selectedDuration, selectedPrice, paymentMethod, promoCode)} style={[styles.requestButton, { opacity: (vehicleType === '' ? 0.5 : 1) }]} disabled={vehicleType === '' ? true : false}>
        <Text style={styles.requestButtonText}>{props.buttonText}</Text>
      </TouchableOpacity>
    </SafeAreaView >
  );
}

VehicleSelectionPanel.propTypes = {
  onRequestDriver: PropTypes.func.isRequired,
  buttonText: PropTypes.string.isRequired
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: SCREEN_WIDTH,
    backgroundColor: '#fff'
  },
  footerScroll: {
    height: 205,
    width: SCREEN_WIDTH,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 10,
    paddingBottom: 50
  },
  footerTop: {
    backgroundColor:"#fff",
    padding: 10,
    borderBottomColor: '#ccc',
    borderBottomWidth: 1
  },
  footerEnlargeButton: {
    width: 90,
    height: 5,
    backgroundColor: '#333',
    alignSelf: 'center',
    borderRadius: 5,
    marginBottom: 10
  },
  footerTopText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555'
  },
  footerContainer:{
    paddingTop: 5,
    backgroundColor:"#fff"
  },
  vehicleListItem: {
    borderColor: "#ddd",
    borderWidth: 1,
    marginBottom: 10,
    borderRadius: 5,
    paddingVertical: 5,
    paddingHorizontal: 10,
    paddingLeft: 95,
    backgroundColor: '#F7F7F7'
  },
  vehicleListItemActive: {
    borderColor: Colors.PRIMARY,
    borderWidth: 2,
    backgroundColor: 'rgba(255,0,0,0.1)',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY
  },
  vehicleIcon: {
    position: 'absolute',
    top: 10,
    left: -80
  },
  seatNumber:{
    fontSize: 16,
    color: '#555'
  },
  distance: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555'
  },
  price: {
    position: 'absolute',
    top: 5,
    right: 0,
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.PRIMARY,
  },
  duration: {
    position: 'absolute',
    top: 40,
    right: 0,
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY
  },
  requestButton: {
    alignSelf: "center",
    backgroundColor: Colors.BUTTON_COLOR,
    width: SCREEN_WIDTH,
    padding: 15,
    paddingLeft: 30,
    paddingRight: 30,
  },
  requestButtonText : {
    fontSize: 18,
    color: "#fff", 
    textAlign: 'center'
  },
});
