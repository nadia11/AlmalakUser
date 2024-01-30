import React, { Component, Fragment } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, TextInput, Dimensions, Keyboard, Platform, ActivityIndicator, ToastAndroid, ImageBackground, Linking, Alert, StatusBar } from 'react-native';
import * as Animatable from 'react-native-animatable';
import Ionicons from 'react-native-vector-icons/Ionicons'
import { ProgressBar, Colors as paperColors } from 'react-native-paper';
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import Modal from 'react-native-modal';
import axios from 'axios';

import MapView, { Marker, PROVIDER_GOOGLE, AnimatedRegion, Animated, Polyline } from 'react-native-maps';
// import Geocoder from 'react-native-geocoder';
navigator.geolocation = require('@react-native-community/geolocation');
import _ from 'lodash';
import PolyLine from '@mapbox/polyline';
import socketIO from 'socket.io-client';
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';

import { Colors } from '../styles';
import { Options } from '../config';
import { GOOGLE_API_KEY, SOCKET_IO_URL, BASE_URL } from '../config/api';
import { getPixelSize, checkAndroidPermissions, getLatLonDiffInMeters, geoErr } from '../config/helperFunctions';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

import VehicleSelectionPanel from "./VehicleSelectionPanel";
import InitialBottomPanel from './InitialBottomPanel';
import { CurrentLocationButton } from './CurrentLocationButton';
import FindingDriverScreen from './FindingDriverScreen';
import DriverInformation from './DriverInformation';
import customMapStyle from './CustomMapStyle.json';
import NearbyDrivers from './NearbyDrivers';
import BatteryLowMessage from '../components/BatteryLowMessage';
import { Back, LocationBox, LocationText, LocationTimeBox, LocationTimeText, LocationTimeTextSmall } from "./styledComponents";
// import MapViewDirections from './MapViewDirections';
// import BottomButton from "../GoogleMaps/BottomButton";
// import { CountriesLatLng } from './CountriesLatLng';

// const default_region = { latitude: 23.8103, longitude: 90.4125, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };
const default_region = { latitude: 23.8103, longitude: 90.4125, latitudeDelta: 0.015, longitudeDelta: 0.0121 };


export default class MapScreen extends Component {
  constructor(props){
    super(props)
    this.state = {
      animating: false,
      barLoading: true,
      searchLoading: false,
      currentLocationButtonText: '',
      homePlace: "",
      workPlace: "",
      mobile: "",
      latitude: 0,
      longitude: 0,
      latitudeDelta: default_region.latitudeDelta,
      longitudeDelta: default_region.longitudeDelta,
      region: default_region,

      startLocationPred: null,
      endLocationPred: null,
      from: '',
      to: '',
      riderLocationPred: null,
      hikerLocationPred: null,

      pickUpLocation: "",
      pickUpPredictions: [],
      destination: "",
      destinationPlaceId: "",
      destPredictions: [],
      destinationCoords: [],
      routeResponse: {},
      tripNumber: "",

      initialBottomPanelShow: true,
      modalSearchMapVisible: false,
      distance: {text: '', value: ''},
      duration: {text: '', value: ''},
      selectVehicleModal: false,
      lookingForDriver: false,
      driverIsOnTheWay: false,
      trackDriver: false,
      driverLocation: ''
    }
    this.onChangePickUpDebounced = _.debounce(this.onChangePickUpLocation, 1000);
    this.onChangeDestinationDebounced = _.debounce(this.onChangeDestination, 1000);
    this.locationEnabled = null;
    this.socket = null;
    this.unsubscribe = null;
    this.driverMarkerIcon = null;
  }

  isLocationEnabled = () => {
    DeviceInfo.isLocationEnabled().then((status) => {
      if(status === false) { 
        this.locationEnabled = false 
      }
    });
  }

  handleLocationEnable = () => {
    if (Platform.OS === 'android') {
      RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({interval: 10000, fastInterval: 5000})
      .then(data => {
        this.props.navigation.replace( 'MapScreen', null, null );
      })
      .catch(err =>  alert("Error " + err.message + ", Code : " + err.code));
    }
  }

  async componentDidMount() {
    this.unsubscribe = NetInfo.addEventListener(state => { this.setState({connectionType: state.type, isConnected: state.isConnected}); });
    const { isConnected, type, isWifiEnabled } = await NetInfo.fetch();    
    const enableHighAccuracy = (type === "wifi" || undefined) ? false : true;
    this.isLocationEnabled();
    this.retrieveDataFromStorage();

    let granted = false;
    if (Platform.OS === "ios") { granted = true; } else { granted = await checkAndroidPermissions(); }

    if (granted){
      navigator.geolocation.getCurrentPosition(
        position => {
          this.setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            region: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            },
          });
          this.getReverseGeocoding();
        },
        error => geoErr(error),
        { enableHighAccuracy: enableHighAccuracy, timeout: 20000, maximumAge: 1000 }
      );
      
      //enableHighAccuracy: true, get more accurate location
      this.watchId = navigator.geolocation.watchPosition(
        position => {
          this.setState({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            region: { 
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            },
          });
        },
        error => geoErr(error),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000, distanceFilter: 10 }
      );
    }
  }

  
  componentWillUnmount() {
    if (this.watchId) { navigator.geolocation.clearWatch(this.watchId); }
    if (this.unsubscribe != null) this.unsubscribe();
  }

  componentDidUpdate() {

  }

  // static getDerivedStateFromProps(nextProps, prevState) {
  //   const duration = 500
  //   console.log("nextProps.coordinate", nextProps.driverLocation);
  //   console.log("prevState.coordinate", prevState.driverLocation);

  //   if (prevState.driverLocation !== nextProps.driverLocation) {
  //     if (Platform.OS === 'android') {
  //       // if (this.driverMarkerIcon) {
  //         //this.driverMarkerIcon.animateMarkerToCoordinate( nextProps.driverLocation, duration );
  //       // }
  //     } else {
  //       prevState.driverLocation.timing({ ...nextProps.driverLocation, duration }).start();
  //     }
  //   }
  // }

  retrieveDataFromStorage = async () => {
    try {
      const homePlace = await AsyncStorage.getItem('homePlace');
      if(homePlace !== null) { this.setState({homePlace: JSON.parse(homePlace)}) }
      
      const workPlace = await AsyncStorage.getItem('workPlace');
      if(workPlace !== null) { this.setState({workPlace: JSON.parse(workPlace)}) }

      const mobile = await AsyncStorage.getItem('mobile');
      if(mobile !== null) { this.setState({mobile: mobile}) }

    } catch (error) { console.error(error); }
  }

  propsLocationSearch() {
    setTimeout(() => {
        if(this.props.route?.params?.place_id) {
          this.setState({ modalSearchMapVisible: false });
          this.getRouteDirections(this.props.route?.params?.place_id, this.props.route?.params?.secondary_text);
        }
    }, 1000);
  }

  changePickupLocationAgain(pickUpLocation, pickup_lat, pickup_lon) {
    if(pickUpLocation) {
      this.setState({ latitude: pickup_lat, longitude: pickup_lon });

      setTimeout(() => {
        this.getRouteDirections(this.state.workPlace.destinationPlaceId, this.state.workPlace.destinationName);
      }, 1000);
    }
  }

  async changeDestinationAgain(place_id, secondary_text, destination_lat, destination_long) {
    if(this.state.tripNumber === "") {
      this.getRouteDirections(place_id, secondary_text);
    } 
    else {
      await axios.post(`${BASE_URL}/change-trip-destination-again`, {
        trip_number: this.state.tripNumber,
        destination_lat: destination_lat,
        destination_long: destination_long,
        location_name: secondary_text,
        //distance: distance,
        //duration: duration,
        //fare: fare
      })
      .then(response => {
        if(response.data.code === 200) {
          this.getRouteDirections(place_id, secondary_text);
        }
      })
      .catch((error) => {
        console.log('change-destination-again: '+error.message);
        ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
      });
    }
  }

  async getReverseGeocoding() {
    await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${this.state.latitude},${this.state.longitude}&key=${GOOGLE_API_KEY}`)
    .then(async response => {
      if (response.data.status === 'OK') {
        let pickUpLocation = '';
        
        if(((response.data.results[0].types[0] !== "street_address") || (response.data.results[0].address_components[0].types[0] !== "street_number")) && (response.data.results[0].address_components[0].long_name !== "Unnamed Road")) {
          pickUpLocation = response.data.results[0].address_components[0].long_name +", "+ response.data.results[0].address_components[1].long_name;
        } 
        else {
          pickUpLocation = response.data.results[1].address_components[0].long_name +", "+ response.data.results[1].address_components[1].long_name;
        }

        // console.log("address component type: "+response.data.results[0].address_components[0].types[0]);
        // console.log("types: "+response.data.results[0].types[0]);
        this.setState({pickUpLocation: pickUpLocation, currentLocationButtonText: pickUpLocation, barLoading: false});
      } 
      else {
        alert(response.data.status);
      }
    })
    .catch((error) => console.warn(error));
  }


  async getRouteDirections(destinationPlaceId, destinationName) {
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/directions/json?origin=${this.state.latitude},${this.state.longitude}&destination=place_id:${destinationPlaceId}&key=${GOOGLE_API_KEY}`);
      const json = await response.json();

      if(this.state.pickUpLocation && json.routes.length !==0) {
        const points = PolyLine.decode(json.routes[0].overview_polyline.points);
        
        const destinationCoords = points.map(point => {
          return { latitude: point[0], longitude: point[1] }
        });

        // console.log("Pickup Latitude: "+this.state.latitude + "Destination Latitude: "+destinationCoords[0].latitude);

        this.setState({
          initialBottomPanelShow: false,
          modalSearchMapVisible: false,
          selectVehicleModal: true,
          destinationCoords,
          destPredictions: [],
          destination: destinationName,
          destinationPlaceId: destinationPlaceId,
          routeResponse: json
        });
        Keyboard.dismiss();
        // this.map.fitToCoordinates(destinationCoords, { edgePadding: {top: 20, bottom: 150, left: 20, right: 20}, animated: true });
        this.map.fitToCoordinates(destinationCoords, { edgePadding: {top: getPixelSize(20), bottom: getPixelSize(150), left: getPixelSize(20), right: getPixelSize(20)}, animated: true });
        this.getRouteDistance(destinationPlaceId);
      }
    } 
    catch (error) { console.log(error) }
  }

  async getRouteDistance(destinationPlaceId) {
    try {
      const response = await fetch(`https://maps.googleapis.com/maps/api/distancematrix/json?origins=${this.state.latitude},${this.state.longitude}&destinations=place_id:${destinationPlaceId}&key=${GOOGLE_API_KEY}&mode=driving`);
      const json = await response.json();
      this.setState({
        distance: {text: json.rows[0].elements[0].distance.text, value: json.rows[0].elements[0].distance.value},
        duration: {text: json.rows[0].elements[0].duration.text, value: json.rows[0].elements[0].duration.value}
      });
    } catch (error) { console.log(error) }
  }

  async onChangePickUpLocation(pickUpLocation) {
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${GOOGLE_API_KEY}&input=${pickUpLocation}&location=${this.state.latitude},${this.state.longitude}&radius=2000&components=country:BD`;
    //&types=geocode&language=bn
    try {
      const result = await fetch(apiUrl);
      const json = await result.json();
      this.setState({ pickUpPredictions: json.predictions });
    } 
    catch (error) { console.log(error) }
  }

  async onChangeDestination(destination) {
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${GOOGLE_API_KEY}&input=${destination}&location=${this.state.latitude},${this.state.longitude}&radius=2000&components=country:BD&types=geocode&language=en`;
    try {
      const result = await fetch(apiUrl);
      const json = await result.json();
      this.setState({ destPredictions: json.predictions, searchLoading: false });
    } 
    catch (error) { console.log(error) }  
  }

  async requestDriver(distance, duration, fare, paymentMethod, promoCode) {
    this.socket = socketIO.connect(SOCKET_IO_URL);
    this.socket.on('connect', () => {
      console.log('Someone sent Request for a . Socket id: '+this.socket.id);
    });
    
    if(this.state.tripNumber === "") {
      //console.log("mobile: "+this.state.mobile +"pickUpLocation: "+ this.state.pickUpLocation +"destination: "+ this.state.destination  +"latitude: "+ this.state.latitude  +"longitude: "+ this.state.longitude  +"distance: "+ distance  +"duration: "+ duration  +"fare: "+ fare  +"paymentMethod: "+ paymentMethod  +"promoCode: "+ promoCode);

      await axios.post(BASE_URL+'/ride-request-send', {
        mobile: this.state.mobile,
        trip_from: this.state.pickUpLocation,
        trip_to: this.state.destination,
        startLocationLat: this.state.latitude,
        startLocationLong: this.state.longitude,
        endLocationLat: this.state.destinationCoords[0].latitude,
        endLocationLong: this.state.destinationCoords[0].longitude,
        distance: distance,
        duration: duration,
        fare: fare,
        payment_method: paymentMethod,
        promo_code: promoCode
      })
      .then(async response => {
        if(response.data.code === 200) {
          this.setState({
            lookingForDriver: true,
            initialBottomPanelShow: false,
            selectVehicleModal: false,
            tripNumber: response.data.trip_number,
            animating: false,
            requestDriverAgainData: {
              routeResponse: this.state.routeResponse, 
              tripNumber: response.data.trip_number, 
              destinationPlaceId: this.state.destinationPlaceId
            }
          });
          
          this.socket.emit('Request', {
            routeResponse: this.state.routeResponse, 
            tripNumber: response.data.trip_number, 
            destinationPlaceId: this.state.destinationPlaceId
          });
          //console.log("Mobile: "+this.state.mobile+", trip_from: "+this.state.pickUpLocation+", trip_to: "+this.state.destination+", startLocationLat: "+this.state.latitude+ ", startLocationLong:"+ this.state.longitude+", distance: "+ this.state.distance.text+", duration: "+ this.state.duration.text);
        }
      })
      .catch((error) => {
        console.log('ride-request-send: '+error.message);
        ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
        this.setState({ animating: false });
      });
    }

    this.socket.on("driverLocation", driverLocation => {
      const destinationCoords = [...this.state.destinationCoords, driverLocation];
      this.map.fitToCoordinates(destinationCoords, {
        edgePadding: {top: getPixelSize(140), bottom: getPixelSize(20), left: getPixelSize(20), right: getPixelSize(20)}, 
        animated: true
      });

      this.setState({
        lookingForDriver: false, 
        driverIsOnTheWay: true, 
        driverLocation,
        titleText: "Your driver is arriving now."
      });
    });

    this.socket.on("assignedDriverMobile", mobile => {
      this.setState({
        assignedDriverMobile: mobile.driverMobile,
        selectVehicleModal: false
      });
    });
    
    this.socket.on("cancelTripByDriver", () => {
      ///this.requestDriverAgain();

      if(number.tripNumber === this.state.tripNumber) {
        this.props.navigation.reset({index: 0, routes: [{name: 'MapScreen'}]});
      }
    });

    //Update Driver Locations
    this.socket.on("updateDriverCurrentLocation", driverLocation => {
      if(driverLocation.tripNumber === this.state.tripNumber) {
        let driverLatitude = driverLocation.latitude;
        let driverLongitude = driverLocation.longitude;
        let markerHeading = driverLocation.markerHeading;

        this.setState({ driverLocation: {driverLatitude, driverLongitude, markerHeading} });

        let diff_in_meters = getLatLonDiffInMeters(this.state.latitude, this.state.longitude, driverLatitude, driverLongitude);

        if(diff_in_meters <= 200){
          Alert.alert('Driver is in 200 meter', 'Driver is around 200 meters from your current location');
        } else if(diff_in_meters <= 50){
          Alert.alert('Driver is almost near', 'Driver is around 50 meters from your current location');
        }
      }
    });
    
    this.socket.on("arriveDriver", (arrive) => {
      Alert.alert('Driver Arrived', 'Your driver arrived at your Pickup Location', 
        [{ text: 'Done', onPress: () => console.log("Driver Arrive: "+arrive.driverArrive) }]
      );

      this.setState({ titleText: "Driver arrived to your pickup point." });
    });
    
    this.socket.on("startTrip", driverLocation => {
      this.setState({ 
        driverIsOnTheWay: false,
        trackDriver: true,
        driverLocation,
        titleText: "Ongoing Ride."
      });
	  
	    ToastAndroid.showWithGravity("Your ride is started. Time is counting from now.", ToastAndroid.LONG, ToastAndroid.CENTER);
    });

  
    this.socket.on("completeTrip", fare => {
      Alert.alert('Your Ride is Finished', 'Your driver completed your ride. Please Check your Payment Invoice.', 
        [{ text: 'Finish', onPress: () => {
          this.setState({ driverIsOnTheWay: false, trackDriver: false });
          this.props.navigation.navigate('PaymentInvoice', { tripNumber: this.state.tripNumber, riderMobile: this.state.mobile });
        }}]
      );
    });
  }

  requestDriverAgain() {
    const { requestDriverAgainData } = this.state;
    
    this.socket.emit('Request', {
      routeResponse: requestDriverAgainData.routeResponse, 
      tripNumber: requestDriverAgainData.tripNumber, 
      destinationPlaceId: requestDriverAgainData.destinationPlaceId
    });
  }

  handleCancel() {
    this.socket.emit('cancelTripByRider', {tripNumber: this.state.tripNumber});

    this.setState({
      destination: "",
      destPredictions: [],
      destinationCoords: [],
      routeResponse: {},
      lookingForDriver: false,
      driverIsOnTheWay: false,
      modalSearchMapVisible: false,
      initialBottomPanelShow: true,
      selectVehicleModal: false,
	    tripNumber: ''
    });
	
    this.map.animateToRegion({ latitude: this.state.latitude, longitude: this.state.longitude, latitudeDelta: this.state.latitudeDelta, longitudeDelta: this.state.longitudeDelta }, 700);
  }
  
  centerMap() {
    this.map.animateToRegion({ latitude: this.state.region.latitude, longitude: this.state.region.longitude, latitudeDelta: this.state.region.latitudeDelta, longitudeDelta: this.state.region.longitudeDelta }, 700);
    // this.map.fitToCoordinates(destinationCoords, { edgePadding: {top: 20, bottom: 150, left: 20, right: 20}, animated: true });
    this.setState({ locationButton: false });
  }

  render() {
    // const { region, destination, duration, location } = this.state;
    //if (!this.state.latitude) return null; /**Remove blue screen on load map**/

    let selectVehicleModal = null;
    let routeDirection = null;
    let findingDriver = null;
    let driverMarker = null;
    let driverInformation = null;

    if((this.state.driverIsOnTheWay===true) || (this.state.trackDriver===true)) {
      driverMarker = (
        <Marker.Animated coordinate={this.state.driverLocation} flat={true} ref={marker => { this.driverMarkerIcon = marker }} anchor={{ x: 0, y: 0 }}>
          <Image source={require('../assets/images/bike.png')} resizeMode="contain" style={{ width: 25, height: 25, transform: [{ rotate: `${this.state.driverLocation.markerHeading ? this.state.driverLocation.markerHeading : 0}deg` }] }} />
        </Marker.Animated>
      )

      driverInformation = (
        <DriverInformation 
        {...this.props} 
        tripNumber={this.state.tripNumber}
        latitude= {this.state.latitude}
        longitude= {this.state.longitude}
        titleText={this.state.titleText} 
        onTheWay={this.state.driverIsOnTheWay} 
        handleCancel={() => this.handleCancel()}
        riderMobile={this.state.mobile}
        />
      );
    }
    
    if(this.state.destinationCoords.length > 1) {
      routeDirection = (
        <Fragment>
          <Marker coordinate={this.state.destinationCoords[this.state.destinationCoords.length - 1]} anchor={{ x: 0, y: 0 }} onPress={() => this.props.navigation.navigate('locationPickerScreen', {name: "MapScreen", action: "changeDestinationAgain", 'tripLat': this.state.destinationCoords[0].latitude, 'tripLng': this.state.destinationCoords[0].longitude, changeDestinationAgain: this.changeDestinationAgain.bind(this)})}>
            <Image source={require('../assets/images/markerDest.png')} style={{ width: 15, height: 15 }} />
            <LocationBox>
              <LocationText>{this.state.destination ? (this.state.destination).substr(0, 20)+"..." : ""}</LocationText>
              <Feather name="chevron-right" size={15} color="#000" style={{marginTop: 10, marginRight: 5}} />
            </LocationBox>
          </Marker>

          <Marker coordinate={{ latitude: this.state.latitude, longitude: this.state.longitude }} anchor={{ x: .5, y: 1 }} onPress={() => this.props.navigation.navigate('locationPickerScreen', {name: "MapScreen", action: "changePickupLocationAgain", 'tripLat': this.state.longitude, 'tripLng': this.state.longitude, changePickupLocationAgain: this.changePickupLocationAgain.bind(this)})}>
            <Image source={require('../assets/images/marker.png')} style={{ width: 15, height: 15 }} />
            <LocationBox>
              <LocationTimeBox>
                <LocationTimeText>{Math.floor(this.state.duration.value / 60)}</LocationTimeText>
                <LocationTimeTextSmall>MIN</LocationTimeTextSmall>
              </LocationTimeBox>
              <LocationText>{this.state.pickUpLocation ? (this.state.pickUpLocation).substr(0, 20)+"..." : ""}</LocationText>
              <Feather name="chevron-right" size={15} color="#000" style={{marginTop: 10, marginRight: 5}} />
            </LocationBox>
          </Marker>
          {driverMarker}
        </Fragment>
      )
      
      if(this.state.selectVehicleModal) {
        selectVehicleModal = (
          <VehicleSelectionPanel 
            {...this.props} 
            onRequestDriver={(distance, duration, fare, paymentMethod, promoCode ) => this.requestDriver(distance, duration, fare, paymentMethod, promoCode)} 
            buttonText="REQUEST RIDE" 
            distanceText={this.state.distance.text} 
            distanceValue={this.state.distance.value} 
            durationText={this.state.duration.text} 
            durationValue={this.state.duration.value}
            riderMobile={this.state.mobile}
          />
        );
      }
      
      if(this.state.lookingForDriver) {
        findingDriver = (
          <FindingDriverScreen 
          {...this.props} 
          tripNumber={this.state.tripNumber} 
          latitude= {this.state.latitude}
          longitude= {this.state.longitude}  
          requestDriverAgain={() => this.requestDriverAgain()} 
          handleCancel={() => this.handleCancel()} 
          riderMobile={this.state.mobile}
          lookingForDriver={this.state.lookingForDriver}
          />
        )
      }
    }
    
	  if(this.locationEnabled === false) {
      return (
        <ImageBackground source={require('../assets/map-bg.jpg')} style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', resizeMode: 'contain', height: SCREEN_HEIGHT, width: SCREEN_WIDTH, paddingTop: 0 }}>
          <View style={{flex:1, backgroundColor: 'dodgerblue', paddingVertical: 10, paddingHorizontal: 30, position: 'absolute', left: 10, top: "15%", width: SCREEN_WIDTH-20, borderRadius: 5}}>
            <Ionicons name="swap-vertical" size={100} color="red" style={{textAlign: 'center'}} />
            <Text style={{color: '#fff', fontSize: 18, lineHeight: 30, textAlign: 'center'}}>To find your pick-up location automatically, turn on location services (Mobile Data).</Text>

            <TouchableOpacity onPress={this.handleLocationEnable} style={{ alignSelf: 'center', fontSize: 16, backgroundColor: "#333", padding: 15, width: 200, borderRadius: 5, marginTop: 20, marginBottom: 5}}>
              <Text style={{color: "#fff", textAlign: 'center'}}>Enable Location</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      )
    }

    return (
      <View style={styles.container}>
		    <StatusBar animated={true} backgroundColor="transparent" barStyle="llight-content" showHideTransition="fade" translucent={true} />
        <BatteryLowMessage {...this.props} />
        
        {this.state.initialBottomPanelShow && (
          <InitialBottomPanel showSearchModal={() => this.setState({ modalSearchMapVisible: true }) } /> 
        )}
        
        {this.state.locationButton && (
          <CurrentLocationButton cb={() => this.centerMap() } bottom={900} />
        )}

        {this.state.region.latitude === 0 && (
          <View style={styles.spinnerView}>
            <ActivityIndicator size="large" color={Colors.BUTTON_COLOR} />
          </View>
        )}
        
        {this.state.region.latitude !== 0 && (
          <MapView style={styles.mapStyle} provider={PROVIDER_GOOGLE} customMapStyle={customMapStyle}
            initialRegion={this.state.region}
            rotateEnabled={false} zoomEnabled={true} zoomControlEnabled={true} showsCompass={true} scrollEnabled={true}
            showsUserLocation={true} followsUserLocation={true} showsMyLocationButton={false} 
            loadingEnabled={true} loadingIndicatorColor="red" loadingBackgroundColor="#eeeeee"
            onPress={() => this.setState({ locationButton: true })}
            onMapReady={e => console.log("Map is ready")} onRegionChange={(region) => {}} ref={map => {this.map = map}}
            >
            <Polyline coordinates={this.state.destinationCoords} strokeWidth={3} strokeColor="#EF0C14" />
            {routeDirection}
            {driverMarker}
            
            {(this.state.initialBottomPanelShow === true || this.state.selectVehicleModal === true || this.state.lookingForDriver === true) && (
              <NearbyDrivers LatLong={{ latitude: this.state.latitude, longitude: this.state.longitude }} />
            )}
          </MapView>
        )}

        {selectVehicleModal}
        {findingDriver}
        {driverInformation}

        <Modal isVisible={this.state.modalSearchMapVisible} animationType='slide'
          //onSwipeStart={() => this.setState({ modalSearchMapVisible: false })} swipeDirection={['up','down']} onSwipeComplete={() => this.setState({ modalSearchMapVisible: false })}
          backdropColor="white" backdropOpacity={1} onBackdropPress={() => this.setState({ modalSearchMapVisible: false })} onBackButtonPress={() => this.setState({ modalSearchMapVisible: false })}
          deviceWidth={SCREEN_WIDTH} deviceHeight={SCREEN_HEIGHT} propagateSwipe={true}>
          <View style={{flex: 1, backgroundColor: '#fff', padding: 0}}>
            {/* <View style={{width: '100%', backgroundColor: '#fff', paddingBottom: 5}}>
              <Feather name="arrow-left" size={25} color="#000" style={{}} onPress={() => this.setState({ modalSearchMapVisible: false })} />
            </View> */}

            <View style={styles.locationInputWrap}>
              <View>
                <Text style={{ position: 'absolute', left: -4, top: 11.5, backgroundColor: '#fff', width: 20, height: 20, borderColor: 'green', borderWidth: 2, borderRadius: 100}}></Text>
                <FontAwesome name="circle" size={13} color={Colors.GREEN_DEEP} style={{ position: 'absolute', left: 0, top: 15 }} />
                <View style={{borderWidth: 1, borderColor: '#333', borderStyle: 'dashed', width: 44, borderRadius: 1, position: 'absolute', left: -17, top: 55, transform:[{ rotate: '90deg'}] }} />
                {this.state.barLoading === true && (<ProgressBar progress={0.5} indeterminate={true} color={Colors.BLUE} style={styles.barLoading} />)}
                <TextInput selectTextOnFocus={true} clearButtonMode="always" returnKeyType="search" placeholder="Enter Pick-Up Location" value={this.state.pickUpLocation} onChangeText={pickUpLocation => {this.setState({ pickUpLocation, pickUpPredictions: [] }); this.onChangePickUpDebounced(pickUpLocation); }} onFocus={() => this.setState({showCurLocationBtnOnSearchModal: true})} onBlur={() => this.setState({showCurLocationBtnOnSearchModal: false})} style={styles.pickUpLocationInput} />
              </View>

              <View>
                <FontAwesome5 name="map-marker-alt" size={22} color={Colors.PRIMARY} style={{ position: 'absolute', left: -3, top: 25}} />
                <TextInput returnKeyType="search" clearButtonMode="always" placeholder="Enter Destination" value={this.state.destination} onChangeText={destination => {this.setState({ destination, destinationCoords: [], searchLoading: true }); this.onChangeDestinationDebounced(destination); }} style={styles.destinationInput} />
                <ActivityIndicator size="small" color="red" style={styles.searchLoading} animating={this.state.searchLoading} />
              </View>
            </View>

            <View style={{borderBottomColor: '#ddd', borderBottomWidth: 1, width: (SCREEN_WIDTH+30), marginLeft: -20, marginVertical: 5 }}></View>

            <View style={styles.listItemContainer}>
              <View style={styles.searchResultsWrapper}>
                {this.state.pickUpPredictions.map(prediction => (
                  <TouchableOpacity key={prediction.place_id} style={styles.searchListItem} onPress={() => this.setState({pickUpPredictions: [], pickUpLocation: prediction.structured_formatting.main_text})}>
                    <FontAwesome5 name="map-marker-alt" size={22} color="#333" style={styles.searchLeftIcon} />
                    <View style={styles.searchListItemContent}>
                      <Text style={styles.searchPrimaryText}>{prediction.structured_formatting.main_text}</Text>
                      <Text style={styles.searchSecondaryText}>{prediction.structured_formatting.secondary_text}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
			  
              <View style={[styles.searchResultsWrapper, {top: 0}]}>
                {this.state.destPredictions.map(prediction => (
                  <TouchableOpacity key={prediction.place_id} style={[styles.searchListItem, styles.searchListItemContent]} onPress={() => this.getRouteDirections(prediction.place_id, prediction.structured_formatting.main_text)}>
                    <FontAwesome5 name="map-marker-alt" size={22} color="#333" style={styles.searchLeftIcon} />
                    <View>
                      <Text style={styles.searchPrimaryText}>{prediction.structured_formatting.main_text}</Text>
                      <Text style={styles.searchSecondaryText}>{prediction.structured_formatting.secondary_text}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              {this.state.showCurLocationBtnOnSearchModal === true && (
                <TouchableOpacity onPress={() => {this.setState({ showCurLocationBtnOnSearchModal: false, pickUpLocation: this.state.currentLocationButtonText }); }} style={[styles.listItem]}>
                  <MaterialIcons name="my-location" size={20} color="#222" style={styles.leftIcon} />
                  <View>
                    <Text style={styles.locationTitle}>Current Location</Text>
                    <Text style={{color: '#444', width: SCREEN_WIDTH-100}} numberOfLines={1} ellipsizeMode="tail">{this.state.currentLocationButtonText}</Text>
                  </View>
                </TouchableOpacity>
              )}

              {(this.state.destination == "" && this.state.homePlace !== "") && (
                <TouchableOpacity style={[styles.listItem, styles.listItemContent]} onPress={() => {this.setState({ modalSearchMapVisible: false }); this.getRouteDirections(this.state.homePlace.place_id, this.state.homePlace.secondary_text) }}>
                  <Feather name="home" size={20} color="#fff" style={[styles.leftIcon, {backgroundColor: '#007bff'}]} />
                  <Text ellipsizeMode='tail' numberOfLines={1} style={styles.locationTitle}>{this.state.homePlace ? this.state.homePlace.secondary_text : "Home"}</Text>
                </TouchableOpacity>
              )}
              
              {(this.state.destination == "" && this.state.workPlace !== "") && (
                <TouchableOpacity style={[styles.listItem, styles.listItemContent]} onPress={() => {this.setState({ modalSearchMapVisible: false }); this.getRouteDirections(this.state.workPlace.place_id, this.state.workPlace.secondary_text) }}>
                  <Feather name="briefcase" size={20} color="#fff" style={[styles.leftIcon, {backgroundColor: '#007bff'}]} />
                  <Text ellipsizeMode='tail' numberOfLines={1} style={styles.locationTitle}>{this.state.workPlace ? this.state.workPlace.secondary_text : "Work"}</Text>
                </TouchableOpacity>
              )}

              {this.state.destination == "" && (
                <TouchableOpacity onPress={() => {this.setState({ modalSearchMapVisible: false }); this.props.navigation.push('savedPlaceModal', {mobile: this.state.mobile, locationSearch: this.propsLocationSearch.bind(this)}); }} style={[styles.listItem]}>
                  <FontAwesome name="star" size={20} color="#333" style={styles.leftIcon} />
                  <Text style={styles.locationTitle}>Saved places</Text>
                  <Feather name="chevron-right" size={20} color="#333" style={styles.rightIcon} />
                </TouchableOpacity>
              )}

              {this.state.destination == "" && ( 
                <View style={{backgroundColor: '#ddd', height: 8, width: (SCREEN_WIDTH+30), marginLeft: -20, marginTop: 0, marginBottom: 0 }}></View> 
              )}

              <TouchableOpacity onPress={() => {this.setState({ modalSearchMapVisible: false }); this.props.navigation.navigate('locationPickerScreen', {name: "MapScreen", action: "locationSearch", locationSearch: this.propsLocationSearch.bind(this)}); }} style={[[styles.listItem, styles.listItemContent]]}>
                <FontAwesome name="map-pin" size={20} color="#333" style={styles.leftIcon} />
                <Text style={styles.locationTitle}>Set location on Map</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: "#F5FCFF",
  },
  mapStyle: {
    ...StyleSheet.absoluteFillObject,
  },
  spinnerView: {
    position: 'absolute',
    top: (SCREEN_HEIGHT / 2 ) - 50,
    left: (SCREEN_WIDTH / 2) - 10,
  },

  /***** Map Search *****/
  locationInputWrap: {
    backgroundColor: '#fff',
    paddingBottom: 15
  },
  barLoading: {
    width: '92%',
    height: 2, 
    marginTop: 30, 
    backgroundColor: '#BBDEFB', 
    position: 'absolute', left: 30, top: 20
  },
  pickUpLocationInput: {
    // position: 'absolute',
    // top: 50,
    // left: 15,
    width: '92%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginBottom: 10,
    marginLeft: 30,
    backgroundColor: "#f5f5f5",
    fontSize: 16
  },
  destinationInput: {
    // position: 'absolute',
    // top: 100,
    // left: 15,
    width: '92%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    marginTop: 10,
    marginLeft: 30,
    backgroundColor: "#f5f5f5",
    fontSize: 16
  },
  searchResultsWrapper:{
    // position: "absolute",
    // left: 0,
    // top: 60,
    // zIndex: 999999,
    width: (SCREEN_WIDTH+20),
    marginLeft: -20,
    // overflow: 'hidden',
    paddingLeft: 5,
    paddingRight: 10
  },
  searchListItem: {
    backgroundColor: "#fff",
    alignItems: 'center',
    flexDirection: 'row'
  },
  searchLeftIcon: {
    backgroundColor: '#eee',
    borderRadius: 50,
    width: 40,
    height: 40,
    lineHeight: 40,
    textAlign: 'center',
    marginRight: 20,
    marginLeft: 10
  },
  searchListItemContent: {
    borderBottomColor: "#eee", 
    borderBottomWidth: 1,
    paddingVertical: 10,
    width: '100%'
  },
  searchPrimaryText:{
    fontSize: 18,
    color:"#111"
  },
  searchSecondaryText:{
    color:"#7D7D7D",
    fontSize: 14
  },
  searchLoading: {
    position: "absolute",
    right: 5,
    top: 25,
    zIndex: 999,
  },
  listItemContainer: {
    backgroundColor: '#fff',
    marginTop: 0
  },
  listItem: {
    backgroundColor: "#fff",
    flexDirection: 'row',
    alignItems: 'center',
    width: (SCREEN_WIDTH - 40),
    height: 65
  },
  leftIcon: {
    backgroundColor: '#eee',
    borderRadius: 50,
    width: 40,
    height: 40,
    lineHeight: 40,
    textAlign: 'center',
    marginRight: 20,
    marginLeft: 0
  },
  rightIcon: {
    position: 'absolute',
    right: 0,
    top: 20
  },
  listItemContent: {
    borderBottomColor: "#eee", 
    borderBottomWidth: 1,
    paddingVertical: 10,
    // width: '100%'
  },
  locationTitle: {
    fontSize: 16,
    color: '#000',
    width: SCREEN_WIDTH-100
  },
  findDriver: {
    backgroundColor: "black",
    marginTop: "auto",
    margin: 20,
    padding: 15,
    paddingLeft: 30,
    paddingRight: 30,
    alignSelf: "center"
  },
  findDriverText: {
    fontSize: 20,
    color: "white",
    fontWeight: "600"
  }
});