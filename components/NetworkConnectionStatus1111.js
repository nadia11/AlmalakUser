import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, Dimensions} from 'react-native';
import NetInfo from '@react-native-community/netinfo';
const {height, width} = Dimensions.get('window');

export default class NetworkStatus extends Component {
  NetInfoSubscription = null;

  constructor(props){
    super(props)
    this.state = {
      connection_status: false,
      isConnected: true,
      connection_type: null,
      connection_net_reachable: false,
      connection_wifi_enabled: false,
      details: null
    }
  }
  componentDidmount() {
    this.NetInfoSubscription = NetInfo.addEventListener(
      this._handleConnectivityChange,
    )
  }

  componentUnwillMount() {
    this.NetInfoSubscription && this.NetInfoSubscription();
  }

  _handleConnectivityChange = (state) => {
    this.state({ 
      connection_status: state.isConnected,
      connection_type: state.type,
      connection_net_reachable: state.isInternetReachable,
      connection_wifi_enabled: state.isWifiEnabled,
      connection_details: state.details,
    })
  }
 
  
  render(){
      return (
        <View style={[styles.container, {backgroundColor: 'green'}]}>
          <Text style={styles.text}>{this.state.connection_status ? "No Internet Connection" : ""}</Text>
          <Text style={styles.text}>Connection Type: {this.state.connection_type}</Text>
          <Text style={styles.text}>Internet Reachable: {this.state.connection_net_reachable ? "YES" : "NO"}</Text>
          <Text style={styles.text}>Wifi Enabled: {this.state.connection_wifi_enabled ? "YES" : "NO"}</Text>

          <Text style={styles.buttonText}>
          Connection Details : {'\n'}
          {this.state.connection_type == 'wifi' ?
            (this.state.connection_details.isConnectionExpensive ? 'Connection Expensive: YES' : 'Connection Expensive: NO')
              + '\n'
              + 'ssid: ' + this.state.connection_details.ssid
              + '\n'
              + 'bssid: ' + this.state.connection_details.bssid
              + '\n'
              + 'strength: ' + this.state.connection_details.strength
              + '\n'
              + 'ipAddress: ' + this.state.connection_details.ipAddress
              + '\n'
              + 'subnet: ' + this.state.connection_details.subnet
              + '\n'
              + 'frequency: ' + this.state.connection_details.frequency
            :
            this.state.connection_type == 'cellular' ?
              (this.state.connection_details.isConnectionExpensive ? 'Connection Expensive: YES' : 'Connection Expensive: NO')
                + '\n'
                + 'cellularGeneration: ' + this.state.connection_details.cellularGeneration
                +'\n'
                +'carrier: '+this.state.connection_details.carrier
              :
              '---'
          }
        </Text>
        </View>
      );
  }
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#b52424',
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    width: width,
    position: 'absolute',
    top: 30
  },
  text: {
    color: 'white',
  },
});