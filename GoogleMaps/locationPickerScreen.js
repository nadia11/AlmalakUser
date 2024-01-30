import React, { Component } from 'react';
import { Text, View, ActivityIndicator, Button, StyleSheet, Dimensions, TouchableOpacity, Image, ToastAndroid, TextInput, Keyboard, ImageBackground, Linking, StatusBar } from 'react-native';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import AsyncStorage from '@react-native-async-storage/async-storage';

import MapView, { Marker, PROVIDER_GOOGLE, AnimatedRegion, Animated, Callout } from 'react-native-maps';
navigator.geolocation = require('@react-native-community/geolocation');
import DeviceInfo from 'react-native-device-info';
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import _ from 'lodash';
import axios from 'axios';

import { BASE_URL, GOOGLE_API_KEY, SOCKET_IO_URL } from '../config/api';
import { checkAndroidPermissions, geoErr } from '../config/helperFunctions';
import { Options } from '../config';
import customMapStyle from './CustomMapStyle.json';
import { Colors } from '../styles';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
const latitudeDelta = 0.0922;
const longitudeDelta= 0.0421;
const default_region = { latitude: 23.8103, longitude: 90.4125, latitudeDelta: 0.0922, longitudeDelta: 0.0421 };

export default class locationPickerScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      isMapReady: false,
      region: default_region,
      marginTop: 1,
      homePlace: {},
      workPlace: {},
      userLocation: "",
      place_id: "",
      userCurrentLocation: {},
      regionChangeProgress: false,
      locationPredictions: [],
    };
    this.onSearchLocationDebounced = _.debounce(this.onSearchLocation, 1000);
    this.locationEnabled = null;
    this.unsubscribe = null
  }

  async onSearchLocation(location) {
    const apiUrl = `https://maps.googleapis.com/maps/api/place/autocomplete/json?key=${GOOGLE_API_KEY}&input=${location}&location=${this.state.latitude},${this.state.longitude}&radius=2000&components=country:BD&types=geocode&language=en`;
    try {
      const result = await fetch(apiUrl);
      const json = await result.json();
      this.setState({ locationPredictions: json.predictions });
    } 
    catch (error) { console.log(error) }  
  }

  isLocationEnabled = () => {
    DeviceInfo.isLocationEnabled().then((status) => {
      if(status === false) { 
        this.locationEnabled = false 
        console.log('Location Enabled: '+status);
      }
    });
  }

  async componentDidMount() {
    const { isConnected, type, isWifiEnabled } = await NetInfo.fetch();    
    const enableHighAccuracy = (type === "wifi" || undefined) ? false : true;
    this.isLocationEnabled();

    if(this.props.route?.params?.geometry) {
      const region = {
        latitude: this.props.route.params.geometry.location.lat,
        longitude: this.props.route.params.geometry.location.lng,
        latitudeDelta: latitudeDelta,
        longitudeDelta: longitudeDelta
      }
      this.setState({ region: region, userCurrentLocation: region, loading: false });
    } 
    // else if(this.props.route?.params?.geometryLat) {
    //   const region = {
    //     latitude: this.props.route.params.geometryLat,
    //     longitude: this.props.route.params.geometryLng,
    //     latitudeDelta: latitudeDelta,
    //     longitudeDelta: longitudeDelta
    //   }
    //   this.setState({ region: region, userCurrentLocation: region, loading: false });
    // }
    else {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const region = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            latitudeDelta: latitudeDelta,
            longitudeDelta: longitudeDelta
          }
          this.setState({ region: region, userCurrentLocation: region, loading: false, error: null });
        },
        (error) => { geoErr(error); this.setState({ error: error.message, loading: false }) },
        { enableHighAccuracy: enableHighAccuracy, timeout: 20000, maximumAge: 1000 },
      );
    }
  }

  onMapReady = () => {
    this.setState({ isMapReady: true, marginTop: 0 });
  }

  fetchAddress = () => {
    fetch("https://maps.googleapis.com/maps/api/geocode/json?latlng="+ this.state.region.latitude +","+ this.state.region.longitude +"&key="+GOOGLE_API_KEY)
    .then((response) => response.json())
    .then((responseJson) => {
      if (responseJson.status === 'OK') {
        
        var thana = '', district = '', division = '', country = '';
        for (var i = 0; i < responseJson.results.length; i++) {
          if (responseJson.results[i].types[0] === "locality") {
            thana = responseJson.results[i].address_components[0].short_name;
            district = responseJson.results[i].address_components[1].short_name;
            division = responseJson.results[i].address_components[2].short_name;
            country = responseJson.results[i].address_components[3].long_name;
          } 
          else if (responseJson.results[i].types[0] === "neighborhood") {
            var location = responseJson.results[i].address_components[0].short_name;
          }
        }
        
        if(district !== "Dhaka District" || district == "") {
          alert('No Service in this District.');
        }

        let userLocation = '';
        let place_id = '';
        let userLocationFormattedAddress = '';
        
        if(((responseJson.results[0].types[0] !== "street_address") || (responseJson.results[0].address_components[0].types[0] !== "street_number")) && (responseJson.results[0].address_components[0].long_name !== "Unnamed Road")) {
            userLocation = responseJson.results[0].address_components[0].long_name +", "+ responseJson.results[0].address_components[1].long_name;
            place_id = responseJson.results[0].place_id;
            userLocationFormattedAddress = responseJson.results[0].formatted_address;
            //console.log("Named: "+responseJson.results[0].address_components[0].long_name)
        } 
        else {
          userLocation = responseJson.results[1].address_components[0].long_name +", "+ responseJson.results[1].address_components[1].long_name;
          place_id = responseJson.results[1].place_id;
          userLocationFormattedAddress = responseJson.results[1].formatted_address
          //console.log("Unnamed: "+responseJson.results[0].address_components[0].long_name)
        }

        // console.log("address component type: "+responseJson.results[0].address_components[0].types[0]);
        // console.log("types: "+responseJson.results[0].types[0]);
        // console.log("https://maps.googleapis.com/maps/api/geocode/json?latlng="+ this.state.region.latitude +","+ this.state.region.longitude +"&key="+GOOGLE_API_KEY);
        this.setState({
          place_id: place_id,
          userLocation: userLocation,
          regionChangeProgress: false
        });
      } 
      else {
        alert(responseJson.status);
      }
    });
  }

  // Update state on region change
  onRegionChange = region => {
    this.setState({ region, regionChangeProgress: true },
    () => this.fetchAddress());
  }

  onLocationSelect = async () => {
    try {
      if(this.props.route.params.name === "homePlace" ) {
        const homePlace = {main_text: "homePlace", secondary_text: this.state.userLocation, place_id: this.state.place_id, icon: "home", geometry: { location: { lat: this.state.region.latitude, lng: this.state.region.longitude }}};
        await AsyncStorage.setItem('homePlace', JSON.stringify(homePlace))
        ToastAndroid.show('Set Location successfully!', ToastAndroid.SHORT);
        this.props.navigation.popToTop();
      }

      if(this.props.route.params.name === "workPlace" ) { 
        const workPlace = {main_text: "workPlace", secondary_text: this.state.userLocation, place_id: this.state.place_id, icon: "briefcase", geometry: { location: { lat: this.state.region.latitude, lng: this.state.region.longitude }}};
        await AsyncStorage.setItem('workPlace', JSON.stringify(workPlace))
        ToastAndroid.show('Set Location successfully!', ToastAndroid.SHORT);
        this.props.navigation.popToTop();
      }
      
      if(this.props.route.params.name === "addLocation" ) {
        this.props.navigation.navigate('locationPickerSavedForm', {
          userLocation: this.state.userLocation, 
          place_id: this.state.place_id,
          mobile: this.props.route.params.mobile,
          latitude: this.state.region.latitude,
          longitude: this.state.region.longitude
        });
      }
      
      if(this.props.route?.params?.geometryLat) {
        await axios.post(BASE_URL+'/update-rider-favorite-place', {
            favorite_place_id: this.props.route.params.favorite_place_id,
            secondary_text: this.state.userLocation, 
            place_id: this.state.place_id,
            latitude: this.state.region.latitude,
            longitude: this.state.region.longitude
        })
        .then(response => {
          if(response.data.code === 200){
            ToastAndroid.showWithGravity(response.data.message, ToastAndroid.SHORT, ToastAndroid.BOTTOM); 
            this.props.navigation.navigate('Menu', {screen: 'savedPlaces'});
          }
        })
        .catch((error) => {
          console.log("Submitting Error: "+error); 
          ToastAndroid.showWithGravity(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT, ToastAndroid.BOTTOM); 
        });
      }

      if((this.props.route.params.name === "MapScreen") && (this.props.route.params.action === 'locationSearch')) {
        this.props.navigation.navigate('MapScreen', {
          place_id: this.state.place_id, 
          secondary_text: this.state.userLocation,
          destination_lat: this.state.region.latitude,
          destination_long: this.state.region.longitude
        });
        ToastAndroid.show('Set Location & going for Vehicle Selection', ToastAndroid.SHORT);
        this.props.route?.params?.locationSearch();
      }

      if((this.props.route.params.name === "MapScreen") && (this.props.route.params.action === 'changePickupLocationAgain')) {
        this.props.route?.params?.changePickupLocationAgain(this.state.userLocation, this.state.region.latitude, this.state.region.longitude);
        ToastAndroid.show('Change Destination Successfully', ToastAndroid.SHORT);
        this.props.navigation.goBack();
      }

      if((this.props.route.params.name === "MapScreen") && (this.props.route.params.action === 'changeDestinationAgain')) {
        this.props.route?.params?.changeDestinationAgain(this.state.place_id, this.state.userLocation, this.state.region.latitude, this.state.region.longitude);
        ToastAndroid.show('Change Destination Successfully', ToastAndroid.SHORT);
        this.props.navigation.goBack();
      }
    } 
    catch (error) { console.error(error); }
  }

  async setLocationFromSearch(place_id) {
    fetch("https://maps.googleapis.com/maps/api/geocode/json?place_id="+place_id+"&key="+GOOGLE_API_KEY)
    .then((response) => response.json())
    .then((responseJson) => {
      // const userLocation = responseJson.results[0].address_components[0].long_name;
      //const userLocation = responseJson.results[0].structured_formatting.main_text;
      const userLocation = responseJson.results[0].formatted_address;
      const latlng = responseJson.results[0].geometry.location;
      // console.log(json.predictions[0].place_id);
      //const place_id = responseJson.results[0].place_id;

      this.setState({
        place_id: place_id,
        userLocation: userLocation,
        regionChangeProgress: false,
        locationPredictions: [],
        region: { latitude: latlng.lat, longitude: latlng.lng, latitudeDelta: 0.0922, longitudeDelta: 0.0421 },
      });

      this.map.animateToRegion({ latitude: latlng.lat, longitude: latlng.lng, latitudeDelta: 0.0043, longitudeDelta: 0.0043 }, 1000);
    });
    Keyboard.dismiss();
  }

  centerMap() {
    const { latitude, longitude, latitudeDelta, longitudeDelta } = this.state.userCurrentLocation;
    this.map.animateToRegion({ latitude, longitude, latitudeDelta, longitudeDelta });
  }

  render() {

    if(this.locationEnabled === false){
      return (
        <ImageBackground source={require('../assets/map-bg.jpg')} style={{ flex: 1, justifyContent: 'flex-start', alignItems: 'center', resizeMode: 'contain', height: SCREEN_HEIGHT, width: SCREEN_WIDTH, paddingTop: 0 }}>
          <View style={{flex:1, backgroundColor: 'dodgerblue', paddingVertical: 10, paddingHorizontal: 30, position: 'absolute', left: 10, top: "20%", width: SCREEN_WIDTH-20, borderRadius: 5}}>
            <Text style={{color: '#fff', fontSize: 20, lineHeight: 30, textAlign: 'center'}}>To find your pick-up location automatically, turn on location services.</Text>

            <TouchableOpacity onPress={() => Linking.openSettings()} style={{ alignSelf: 'center', backgroundColor: "#333", padding: 15, width: 200, borderRadius: 5, marginTop: 20, marginBottom: 5}}>
              <Text style={{color: "#fff", textAlign: 'center'}}>Enable Location</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      )
    }

    if (this.state.loading) {
      return (
        <View style={styles.spinnerView}>
          <ActivityIndicator size="large" color={Colors.BUTTON_COLOR} />
        </View>
      );
    }

    return (
      <View style={styles.container}>
		    <StatusBar animated={true} backgroundColor="transparent" barStyle="light-content" showHideTransition="fade" translucent={true} />

        <View style={{ flex: 1 }}>
          {!!this.state.region.latitude && !!this.state.region.longitude && (
            <MapView style={{ ...styles.map, marginTop: this.state.marginTop }} 
            provider={this.props.provider} customMapStyle={customMapStyle} 
            initialRegion={this.state.region} showsUserLocation={true} showsMyLocationButton={false}
            onMapReady={this.onMapReady} onRegionChange={() => {}} onRegionChangeComplete={this.onRegionChange} ref={map => {this.map = map}}>

              {/* <MapView.Marker.Animated 
              coordinate={{ "latitude": this.state.region.latitude, "longitude": this.state.region.longitude }} 
              onPress={e => console.log('onPress', e.nativeEvent)} 
              onSelect={e => console.log('onSelect', e.nativeEvent)} 
              onDeselect={e => console.log('onSelect', e.nativeEvent)} 
              onCalloutPress={e => console.log('onSelect', e.nativeEvent)} 
              
              onDragStart={e => console.log('onDragStart', e.nativeEvent)} 
              onDrag={e => console.log('onDrag', e.nativeEvent)} 
              onDragEnd={e => console.log('onDragEnd', e.nativeEvent.coordinate)} 
              draggable={true}
              title="Current Location" 
              description=""
              anchor={{x: 0.5, y: 1}}
              image={require('../assets/images/markerOrigin.png')}
              >
                <Callout style={styles.plainView}><View><Text>This is a plain view</Text></View></Callout>
              </MapView.Marker.Animated> */}
            </MapView>
          )}
          
          <MapView.Marker.Animated coordinate={{ "latitude": this.state.region.latitude, "longitude": this.state.region.longitude }} style={styles.mapMarkerContainer} anchor={{x: 0.5, y: 1}}>
            <Image source={require('../assets/images/markerOrigin.png')} resizeMode="contain" style={{ width: 40, height: 40 }} />
          </MapView.Marker.Animated>
        </View>

        {this.state.region.latitude !== 0 && (
        <View style={styles.currentLocationButton}>
          <MaterialIcons name="my-location" color="#000" size={25} onPress={() => this.centerMap() } />
        </View>
        )}

        <MaterialIcons style={styles.arrowBackButton} name="arrow-back" size={25} color="#000" onPress={() => this.props.navigation.goBack() } />

        <View style={styles.deatilSection}>
          <TextInput ellipsizeMode='tail' numberOfLines={1} selectTextOnFocus={true} style={styles.locationTextInput} value={!this.state.regionChangeProgress ? this.state.userLocation : "Loading..."} onChangeText={location => { console.log(location); this.setState({ location, pointCoords: [] }); this.onSearchLocationDebounced(location); }} />
        </View>

        <View style={styles.searchResultsWrapper}>
          {this.state.locationPredictions.map(prediction => (
          <TouchableOpacity key={prediction.id} style={[styles.searchListItem, styles.searchListItemContent]} onPress={() => this.setLocationFromSearch(prediction.place_id)}>
            <FontAwesome5 name="map-marker-alt" size={22} color="#333" style={styles.searchLeftIcon} />
            <View>
              <Text style={styles.searchPrimaryText}>{prediction.structured_formatting.main_text}</Text>
              <Text style={styles.searchSecondaryText}>{prediction.structured_formatting.secondary_text}</Text>
            </View>
          </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity onPress={this.onLocationSelect} style={styles.btnContainer} disabled={this.state.regionChangeProgress}>
          <Text style={styles.buttonText}>PICK THIS LOCATION</Text>
        </TouchableOpacity>
      </View>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    // ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    flex: 1,
    height: SCREEN_HEIGHT,
    width: SCREEN_WIDTH
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  spinnerView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  mapMarkerContainer: {
    position: 'absolute',
    left: '45%',
    top: '44%'
  },
  deatilSection: {
    width: SCREEN_WIDTH - 40,
    backgroundColor: "#fff",
    padding: 10,
    justifyContent: "flex-start",
    flexDirection: 'row',
    alignItems: 'center',
    position: "absolute",
    bottom: 70,
    left: 20,
  },
  locationTextInput: {
    paddingVertical: 5, 
    paddingHorizontal: 10, 
    backgroundColor: "#eee", 
    color: '#000', 
    fontSize: 16, 
    width: SCREEN_WIDTH-60,
  },
  arrowBackButton: {
    position: "absolute",
    left: 10,
    bottom: SCREEN_HEIGHT-80,
    zIndex: 999,
    width: 40,
    height: 40,
    padding: 7,
    backgroundColor: '#fff',
    borderRadius: 50,
    fontWeight: 'bold'
  },
  searchResultsWrapper: {
    position: "absolute",
    left: 0,
    bottom: 500,
    zIndex: 999999,
    width: SCREEN_WIDTH,
    marginLeft: 0,
    paddingLeft: 5,
    paddingRight: 5,
    backgroundColor: "#fff",
  },
  searchListItem: {
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
  btnContainer: {
    backgroundColor: Colors.BUTTON_COLOR,
    width: SCREEN_WIDTH - 40,
    padding: 10,
    paddingLeft: 30,
    paddingRight: 30,
    borderRadius: 3,
    alignSelf: "center",
    position: "absolute",
    bottom: 20,
    left: 20,
  },
  buttonText : {
    fontSize: 18,
    color: "#fff", 
    textAlign: 'center'
  },
  currentLocationButton:{
    position: "absolute",
    bottom: 150,
    right: 20,
    width: 40,
    height: 40,
    backgroundColor: '#fff',
    borderRadius: 50,
    shadowColor: "#000000",
    elevation: 7,
    shadowRadius: 5,
    shadowOpacity: 1.0,
    alignItems: 'center',
    justifyContent: 'center'
  },
});