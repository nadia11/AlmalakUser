import React, { Component } from 'react';
import { Text, View, ActivityIndicator, TextInput, StyleSheet, Dimensions, TouchableOpacity, ToastAndroid, Alert } from 'react-native';
import axios from 'axios';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;
import CustomStatusBar from '../components/CustomStatusBar';
import { BASE_URL } from '../config/api';
import { Options } from '../config';

export default function locationPickerSavedForm(props) {
  const [animating, setAnimating] = React.useState(false);
  const [locationName, setLocationName] = React.useState('');

  const handleSubmit = async () => {
    setAnimating( true );

    await axios.post(BASE_URL+'/new-rider-favorite-place', {
        mobile: props.route.params.mobile,
        main_text: locationName,
        secondary_text: props.route.params.userLocation,
        place_id: props.route.params.place_id,
        latitude: props.route.params.latitude,
        longitude: props.route.params.longitude
      }
    )
    .then(async response => {
      if(response.data.code === 200){
        try {
          setAnimating( false );
          props.navigation.navigate('Menu');
          ToastAndroid.show('Set Location successfully!', ToastAndroid.SHORT);
        } 
        catch (error) { console.error(error); }
      }
    })
    .catch((error) => {
      console.log("Submitting Error: "+error); 
      ToastAndroid.showWithGravity(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT, ToastAndroid.BOTTOM); 
      setAnimating( false );
    });
  }

  const disabledBtn = () => {
    let fields = locationName;
    return fields !== '' ? 0 : 1;
  }

  return (
    <View style={styles.container}>
      <CustomStatusBar />

      <TextInput style={styles.textInput} placeholder="Location Name" placeholderTextColor="rgba(0,0,0,.5)" keyboardType="default" returnKeyType="next" autoCorrect={false} underlineColorAndroid="transparent" onChangeText={val => setLocationName( val )} value={locationName} />

      <TouchableOpacity style={[styles.button, { opacity: (disabledBtn() == 1 ? 0.7 : 1) }]} onPress={ handleSubmit } disabled={disabledBtn() == 1 ? true : false}>
        <Text style={styles.btnText}>{animating === false ? "Save LOCATION" : "Submitting..."}</Text>
        <ActivityIndicator animating={animating} color='#fff' size="small" style={{ position: "absolute", left: 15, top: 12}} />
      </TouchableOpacity>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    flex: 1,
    paddingTop: 50
  },
  buttonText : {
    fontSize: 18,
    color: "#fff", 
    textAlign: 'center'
  },
  textInput: {
    alignSelf: "center",
    fontSize: 16,
    height: 50,
    marginBottom: 15,
    color: "#333",
    borderColor: "#ccc",
    borderWidth: 1,
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingLeft: 20,
    borderRadius: 5,
    width: (SCREEN_WIDTH - 60)
  },
  button: {
    alignSelf: "center",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#EF0C14",
    marginTop: 30,
    borderRadius: 5,
    paddingHorizontal: 50
  },
  btnText: {
    color: "#fff", 
    fontWeight: 'bold',
    fontSize: 16,
    textTransform: 'uppercase'
  },
});