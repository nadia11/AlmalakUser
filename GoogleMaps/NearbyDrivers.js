import React, { Component } from 'react';
import { View, Image, ToastAndroid, Animated } from 'react-native';
import MapView, { AnimatedRegion, Marker } from 'react-native-maps';
import axios from 'axios';
import * as Animatable from 'react-native-animatable';

import { BASE_URL, GOOGLE_API_KEY, SOCKET_IO_URL } from '../config/api';
import { Colors } from '../styles';
import { Options } from '../config';


export default function NearbyDrivers(props)
{
  const [animating, setAnimating] = React.useState(false);
  const [driverList, setDriverList] = React.useState([]);
  const { latitude, longitude } = props;
  let marketRef = '';

  const getUserData = async () => {
    //Request failed with status code 429 means Too Many Requests
    await axios.get(`${BASE_URL}/get-nearby-drivers/${latitude}/${longitude}`)
    .then(response => {
      setDriverList(response.data.driver_list);
      //console.log('nearby-drivers: ', response.data.driver_list);
    })
    .catch((error) => {
      setAnimating(false);
      console.log('get-nearby-drivers: '+error.message);
      ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
    });
  }

  React.useEffect(() => { 
    getUserData();

    // runs every 20 seconds.
    // const interval = setInterval(getUserData, 20000); 
    // return () => clearInterval(interval);
  }, []);

  
  // constructor (props) {
  //   super(props)

  //   const driver = this.props.driver ? this.props.driver : {uid: "noDriverPassed", location: { latitude: 0, longitude: 0 } }

  //   const coordinate = new MapView.AnimatedRegion({
  //     latitude: driver.location.latitude,
  //     longitude: driver.location.longitude
  //   });

  //   this.state = {
  //     driver: driver,
  //     coordinate: coordinate
  //   }
  // }

  return (
    <View>
      {driverList.map((marker, index) => 
        <Marker.Animated 
        key={marker.driver_id.toString()} 
        ref={marker => {marketRef = marker}} 
        flat={true}
        coordinate={{latitude: marker.latitude ? marker.latitude : 0, longitude: marker.longitude ? marker.longitude : 0}} 
        anchor={{x: 0.35, y: 0.32}} 
        title={marker.title} 
        description={marker.description}>
          <Animatable.View animation="pulse" easing="ease-in-out" iterationCount="infinite" style={{ width: 25, height: 25, justifyContent: 'center', alignItems: 'center' }}>
            <Animated.Image style={{ width: 25, height: 25, transform:[{ rotate: `${marker.marker_heading ? marker.marker_heading : 0}deg` }] }} resizeMode="contain" source={require('../assets/images/bike.png')} />
          </Animatable.View>
        </Marker.Animated>
      )}
    </View>
  )
}