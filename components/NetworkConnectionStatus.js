import React, { useState, useEffect } from 'react';
import {View, Text, StyleSheet, Dimensions, Linking, TouchableOpacity, Image} from 'react-native';
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";

import { Colors } from '../styles';
import CustomStatusBar from '../components/CustomStatusBar';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function NetworkConnectionStatus(props) {
  const [isConnected, setIsConnected] = useState(true);
  const netinfo = useNetInfo();
  
    useEffect(() => {
      NetInfo.fetch().then(state => {
        console.log("Is connected?", state.isConnected);
        console.log("isWifiEnabled", state.isWifiEnabled);
        console.log("Connection type", state.type);
      });
  
      //cellular, wifi, bluetooth, ethernet, wimax, vpn
      NetInfo.fetch("wifi").then(state => {
        console.log("SSID", state.details.ssid);
        console.log("BSSID", state.details.bssid);
        console.log("Is connected?", state.isConnected);

        //if(state.details.ssid === undefined) {}  
      });
    }, []);
  
    const fetch = () => {
      
    };

    useEffect(() => {
      const unsubscribe = NetInfo.addEventListener(state => {
        setIsConnected(state.isConnected);
        console.log("Connection type", state.type);
        console.log("Is connected?", state.isConnected);
        console.log("strength", state.details.strength);
        console.log("ipAddress", state.details.ipAddress);
        console.log("subnet", state.details.subnet);
        state.isConnected && fetch();
      });
  
      return () => unsubscribe();
    }, []);

    useEffect(() => {
    }, [netinfo.isConnected]);
  


  // componentWillUnmount() {
  //   if (this.unsubscribe != null) this.unsubscribe();
  // }

  // async componentDidMount() {
  //   this.unsubscribe = NetInfo.addEventListener(state => { this.setState({connectionType: state.type, isConnected: state.isConnected}); });
  //   const { isConnected, type, isWifiEnabled } = await NetInfo.fetch();    
  //   alert(type);
  // }

    // const netinfo = useNetInfo();
    // React.useEffect(() => {
    //   if(netinfo.type != 'unknown' && !netinfo.isInternetReachable) {
    //     alert('No Internet Connection!');
    //   }
    // }, []);


    // if (isConnected) {
    //   return (
    //     <View style={[styles.container, {backgroundColor: 'green'}]}>
    //       <Text style={styles.text}>Connected</Text>
    //       <Text>Type: {JSON.stringify(netinfo.type)}</Text>
    //       <Text>Connected: {netinfo.isConnected}</Text>
    //       <Text>Wifi: {JSON.stringify(netinfo.isWifiEnabled)}</Text>
    //     </View>
    //   );
    // }
  
    return (
      <View style={styles.container}>
        <Image source={require('../assets/network-icon.png')} style={styles.icon} />
        <Text style={{color: '#EF0C14', textAlign: 'center', fontWeight: 'bold', fontSize: 24}}>No Internet Connection</Text>
        <Text style={{color: '#333', textAlign: 'center', fontSize: 14, marginBottom: 30}}>Please turn on your Mole Data or Wifi</Text>
        
        {/* <TouchableOpacity onPress={() => Linking.openSettings()} style={{ alignSelf: 'center', backgroundColor: "#EF0C14", padding: 15, width: 200, borderRadius: 5, marginTop: 20, marginBottom: 5}}>
          <Text style={{color: "#fff", textAlign: 'center'}}>Turn on Wifi / Mobile Data</Text>
        </TouchableOpacity> */}
      </View>
    );
  
    // return (
    //   <View style={{backgroundColor: '#EF0C14', height: 70, width: SCREEN_WIDTH, position: 'absolute', top: 5, padding: 10, zIndex: 9999}}>
    //     <CustomStatusBar backgroundColor="red" barStyle="light-content" />

    //     <Text style={{color: 'white', textAlign: 'center', fontWeight: 'bold', fontSize: 22}}>No Internet Connection</Text>
    //     <Text style={{color: 'white', textAlign: 'center', fontSize: 14}}>Please turn on your Mole Data or Wifi</Text>
    //   </View>
    // );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 100,
  },
  text: {
    color: 'white', 
    textAlign: 'center', 
    fontSize: 14
  },
  icon: {
    height: 150,
    width: SCREEN_WIDTH / 2, 
    marginBottom: 20,
    resizeMode: 'cover', 
  },
});