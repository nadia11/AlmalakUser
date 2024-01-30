import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, ScrollView, Dimensions, TouchableOpacity, ToastAndroid } from 'react-native';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import { Colors } from '../../styles';
import { BASE_URL } from '../../config/api';
import axios from 'axios';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function myWalletMenu({ route, navigation }) {
  const [walletBalance, setWalletBalance] = React.useState(0.00);

  const getUserData = async () => {
    axios.get(BASE_URL+'/get-wallet-balance/' + route?.params?.mobile)
    .then((response) => {
      if(response.data.code === 200){
        setWalletBalance(response.data.wallet_balance);
      }
      else if(response.data.code === 501){
        ToastAndroid.show("501 Error: "+response.data.message, ToastAndroid.SHORT);
      }
    })
    .catch((error) => {
      console.log("Submitting Error: "+error); 
      ToastAndroid.showWithGravity(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT, ToastAndroid.BOTTOM); 
    });
  }
  React.useEffect(() => { getUserData() }, []);

    return (
      <View style={styles.container}>
        <Text style={{textTransform: 'uppercase'}}>Current Credit</Text>
        <Text style={{fontSize: 30, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#ccc', width: SCREEN_WIDTH-100, textAlign: 'center', paddingBottom: 5, marginBottom: 10}}>৳ {Number(walletBalance).toFixed(2)}</Text>
        <Text style={{fontSize: 16}}>Soft Limit: <Text style={{color: 'orange'}}>৳50.00</Text> | Hard Limit: <Text style={{color: 'red'}}>৳100.00</Text></Text>
        <TouchableOpacity onPress={() => navigation.navigate('recentTransaction', {mobile: route?.params?.mobile})} style={styles.addButton}>
          <FontAwesome5 name="clock" size={20} color="#fff" style={{marginRight: 10}} />
          <Text style={styles.addButtonText}>Recent Transaction</Text>
        </TouchableOpacity>
      </View>
    );
  }

  
const styles = StyleSheet.create({
  container: {
    flex: 1, 
    justifyContent: 'flex-start', 
    alignItems: 'center',
    marginBottom: 100,
    marginTop: 50
  },
  scrollView: {
      width: SCREEN_WIDTH-0,
      height: SCREEN_HEIGHT,
      paddingHorizontal: 20,
      marginBottom: 10
  },
  addButton: {
    alignSelf: "center",
    backgroundColor: Colors.BUTTON_COLOR,
    width: SCREEN_WIDTH-100,
    borderRadius: 3,
    padding: 10,
    marginBottom: 15,
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center'
  },
  addButtonText : {
    fontSize: 18,
    color: "#fff", 
    textAlign: 'center',
    textTransform: 'uppercase'
  },
});