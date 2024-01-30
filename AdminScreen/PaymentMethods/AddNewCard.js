import React, { Component } from "react";
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Dimensions, Alert, TouchableWithoutFeedback, Keyboard, ToastAndroid, ActivityIndicator, PermissionsAndroid } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import axios from 'axios';
import {launchCamera, launchImageLibrary} from 'react-native-image-picker';
import {Picker} from '@react-native-community/picker';

import { Colors } from '../../styles';
import { BASE_URL } from '../../config/api';
import { Options } from '../../config';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function AddNewCard(props) {
  const [animating, setAnimating] = React.useState(false);
  const [cardType, setCardType] = React.useState('');
  const [cardHolderName, setCardHolderName] = React.useState('');
  const [cardNumber, setCardNumber] = React.useState('');
  const [expiresAt, setExpiresAt] = React.useState('');
  const [cvvNumber, setCvvNumber] = React.useState('');
  const [icon, setIcon] = React.useState('');
  const [scanCard, setScanCard] = React.useState(null);

  const handleSubmit = async () => {
    setAnimating( true );
    await axios.post(BASE_URL+'/new-credit-card', {
      mobile: props.route.params.mobile,
      card_type: cardType,
      card_holder_name: cardHolderName,
      card_number: cardNumber,
      expires_at: expiresAt,
      cvv_number: cvvNumber,
      icon: icon
    })
    .then(async response => {
      if(response.data.code === 200){
          setAnimating( false );
          ToastAndroid.showWithGravity(response.data.message, ToastAndroid.SHORT, ToastAndroid.BOTTOM);
          props.navigation.goBack();
        }
    })
    .catch((error) => {
      setAnimating( false );
      console.log("Submitting Error: "+error.message);
      ToastAndroid.showWithGravity("Something went wrong. Please try again.", ToastAndroid.SHORT, ToastAndroid.BOTTOM);
    });
  }

  const getCardDataFromCamera = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CAMERA, {
          title: Options.APP_OPTIONS.AppName + " Camera Permission",
          message: Options.APP_OPTIONS.AppName + "App needs access to your camera so you can take your profile pictures.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK"
        }
      );
      
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        selectScanCardTapped();
      } else {
        ToastAndroid.show("Camera permission denied", ToastAndroid.SHORT); 
      }
    } catch (err) { 
      console.warn(err);
      ToastAndroid.show("Error: "+err, ToastAndroid.SHORT);
    }
  };

  const selectScanCardTapped = () => {
    const options = {
      mediaType: 'photo',
      quality: 1,
      maxWidth: 200,
      maxHeight: 300,
      includeBase64: true,
      cameraType: 'back'
    };
    
    launchCamera(options, (response) => {
      if (response.didCancel) {
        console.log('User cancelled image picker');
      } 
      else if (response.errorMessage) {
        alert('ImagePicker Error: ', response.errorMessage);
        console.log('ImagePicker Error: ', response.errorMessage);
      } 
      else if (response.customButton) {
        console.log('User tapped custom button: ', response.customButton);
      } 
      else {
        //console.log("uri: "+ response.uri + ", filename: "+response.fileName + ", fileSize: "+response.fileSize + ", width: "+response.width + ", height: "+response.height + ", type: " + response.type + ", base64: "+ response.base64);
        //setUserImage(response.uri);
      }
    });
  }

  const disabledBtn = () => {
    let fields = cardType && cardHolderName && cardNumber && expiresAt && cvvNumber;
    return fields !== '' ? 0 : 1;
  }

  const handleCardType = (type) => {
    setCardType(type);
    
    if(type == 'VisaCard') { setIcon("credit-card-alt"); }
    else if(type == 'MasterCard') { setIcon("cc-mastercard"); }
    else if(type == 'DebitCard') { setIcon("credit-card"); }
    else if(type == 'American') { setIcon("credit-card"); }
    else if(type == 'DinersClub') { setIcon("credit-card"); }
    else if(type == 'Discover') { setIcon("credit-card"); }
  }

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
          <TouchableOpacity onPress={getCardDataFromCamera} style={styles.scanButton}>
            <Ionicons name="qr-code-outline" size={25} color="#fff" />
            <Text style={styles.scanButtonText}> Scan Card</Text>
          </TouchableOpacity>

          <View style={[styles.textInput, {paddingRight: 0, marginLeft: 10}]}>
            <Picker selectedValue={cardType} onValueChange={(itemValue, itemIndex) => handleCardType(itemValue)}>
              <Picker.Item label="--Select Card Type--" value="" />
              <Picker.Item label="Visa Card" value="VisaCard" />
              <Picker.Item label="Master Card" value="MasterCard" />
              <Picker.Item label="Debit Card" value="DebitCard" />
              <Picker.Item label="American" value="American Express" />
              <Picker.Item label="Diners Club" value="DinersClub" />
              <Picker.Item label="Discover" value="Discover" />
              <Picker.Item label="Others" value="others" />
            </Picker>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.textLabel}>Card Holder Name</Text>
            <TextInput style={styles.textInput} returnKeyType="next" placeholderTextColor="rgba(0,0,0,.5)" autoCorrect={false} underlineColorAndroid="transparent" onChangeText={val => setCardHolderName( val )} value={cardHolderName} />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.textLabel}>Card Number</Text>
            <TextInput keyboardType="number-pad" returnKeyType="next" style={styles.textInput} placeholderTextColor='rgba(0,0,0,.5)' autoCorrect={false} underlineColorAndroid="transparent" onChangeText={val => setCardNumber(val) } value={cardNumber} maxLength={19}></TextInput>
          </View>

          <View style={{flexDirection: 'row'}}>
            <View style={[styles.formGroup, {width: (SCREEN_WIDTH-50)/2}]}>
              <Text style={styles.textLabel}>Expires</Text>
              <TextInput style={[styles.textInput, {width: (SCREEN_WIDTH-50)/2}]} returnKeyType="next" placeholderTextColor="rgba(0,0,0,.5)" autoCorrect={false} underlineColorAndroid="transparent" onChangeText={val => setExpiresAt( val )} value={expiresAt} maxLength={7} />
            </View>

            <View style={[styles.formGroup, {width: (SCREEN_WIDTH-50)/2, marginLeft: 10}]}>
              <Text style={styles.textLabel}>CVV / CVC</Text>
              <TextInput keyboardType="number-pad" style={[styles.textInput, {width: (SCREEN_WIDTH-50)/2}]} placeholderTextColor='rgba(0,0,0,.5)' autoCorrect={false} underlineColorAndroid="transparent" onChangeText={val => setCvvNumber(val) } value={cvvNumber} maxLength={4}></TextInput>
            </View>
          </View>

          <TouchableOpacity style={[styles.addButton, { opacity: (disabledBtn() == 1 ? 0.7 : 1) }]} onPress={ handleSubmit } disabled={disabledBtn() == 1 ? true : false}>
            <Text style={styles.addButtonText}>{animating === false ? "Save" : "Saving..."}</Text>
            <ActivityIndicator animating={animating} color='#fff' size="small" style={{ position: "absolute", left: 30, top: 12}} />
          </TouchableOpacity>
        </View>
      </TouchableWithoutFeedback>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 50,
    backgroundColor: '#fff'
  },
  formGroup: {
    marginTop: 10,
    paddingHorizontal: 10
  },
  textInput: {
    alignSelf: "stretch",
    fontSize: 20,
    height: 45,
    color: Colors.TEXT_PRIMARY,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingLeft: 20,
    marginBottom: 10,
    width: (SCREEN_WIDTH - 40)
  },
  textLabel: {
    fontSize: 16,
    color: Colors.TEXT_PRIMARY,
    textTransform: "uppercase",
    fontWeight: 'bold',
    marginBottom: 2,
    color: '#888'
  },
  addButton: {
    alignSelf: "center",
    backgroundColor: Colors.BUTTON_COLOR,
    width: SCREEN_WIDTH/2,
    borderRadius: 3,
    padding: 10,
    marginBottom: 15,
    marginTop: 30
  },
  addButtonText : {
    fontSize: 18,
    color: "#fff", 
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  scanButton: {
    backgroundColor: Colors.ORANGE_RED,
    width: SCREEN_WIDTH - 200,
    borderRadius: 3,
    padding: 7,
    marginBottom: 15,
    marginLeft: 15,
    flexDirection: 'row',
    justifyContent: 'space-evenly'
  },
  scanButtonText : {
    fontSize: 18,
    color: "#fff", 
    textAlign: 'center',
    textTransform: 'uppercase',
    alignItems: 'center'
  },
});
