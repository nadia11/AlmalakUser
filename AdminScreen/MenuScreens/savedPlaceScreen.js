import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Dimensions, ToastAndroid, Alert, ActivityIndicator, LayoutAnimation, UIManager, Platform } from 'react-native';
import Feather from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

import { BASE_URL } from '../../config/api';
import { Colors } from '../../styles';
import { Options } from '../../config';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const layoutAnimConfig = {
  duration: 300,
  update: { type: LayoutAnimation.Types.easeInEaseOut },
  delete: { duration: 100, type: LayoutAnimation.Types.easeInEaseOut, property: LayoutAnimation.Properties.opacity }
};

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function savedPlaceScreen(props) {
  const { navigation } = props;
  const [animating, setAnimating] = React.useState(false);
  const [homePlace, setHomePlace] = React.useState();
  const [workPlace, setWorkPlace] = React.useState();
  const [totalRecord, setTotalRecord] = React.useState();
  const [placeData, setPlaceData] = React.useState([]);
  const mobile = props.route?.params?.mobile;

  const getPlacedData = async () => {
    setAnimating( true );

    axios.get(BASE_URL+'/get-rider-favorite-place-list/' + mobile)
    .then((response) => {
      if(response.data.code === 200){
        setPlaceData(response.data.message);
        setTotalRecord(response.data.total_record);
        setAnimating(false);
        LayoutAnimation.configureNext(layoutAnimConfig);
      }
    })
    .catch((error) => {
      setAnimating(false);
      setTotalRecord(0);
      console.log("Submitting Error: "+error);
      ToastAndroid.showWithGravity(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT, ToastAndroid.BOTTOM); 
    });
  }

  const retrieveData = async () => {
    try {
      const homePlace = await AsyncStorage.getItem('homePlace');
      if(homePlace !== null) { setHomePlace(JSON.parse(homePlace)) }

      const workPlace = await AsyncStorage.getItem('workPlace');
      if(workPlace !== null) { setWorkPlace(JSON.parse(workPlace)) }

    } catch (error) { console.error(error); }
  }
  React.useEffect(() => { 
    setTimeout(() => {
      getPlacedData();
      retrieveData();
    }, 1000);
    
   }, []);

  // const savedPlaceArray = [
  //   { main_text: "Home", secondary_text: "Set Home Location", icon: "home", geometry: { location: { lat: 48.8152937, lng: 2.4597668 } } },
  //   { main_text: "Work", secondary_text: "Set Work Location", icon: "briefcase", geometry: { location: { lat: 48.8152937, lng: 2.4597668 } } },
  //   { main_text: "Work2", secondary_text: "Set Work Location", icon: "briefcase", geometry: { location: { lat: 48.8152937, lng: 2.4597668 } } },
  //   { main_text: "Work3", secondary_text: "Set Work Location", icon: "briefcase", geometry: { location: { lat: 48.8152937, lng: 2.4597668 } } },
  // ]

  const deletePlace = (place_id) => {
    Alert.alert('Delete', 'Are you sure, you want to delete this Location from your favourite List?', [
      { text: 'No', onPress: () => console.log('No Pressed'), style: 'cancel' },
      { text: 'Yes', onPress: () => confirmDelete(place_id)},
    ], { cancelable: true });
  }

  const confirmDelete = (place_id) => {
    axios.delete(BASE_URL+`/delete-favorite-place/${place_id}`)
    .then(response => {
      if(response.data.code === 200){
        let data = placeData.filter(item => item.favorite_place_id !== place_id);

        setPlaceData(data);
        setTotalRecord(data.length);
        setAnimating(false);
        ToastAndroid.show(response.data.message, ToastAndroid.SHORT); 
        LayoutAnimation.configureNext(layoutAnimConfig);
      }
    })
    .catch((error) => {
      setAnimating( false );
      console.log("delete-favorite-place: ", error.message);
      ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
    });
  }


  return (
    <SafeAreaView style={styles.SubScreencontainer}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.savedPlace}>
          <Text style={{textAlign: 'center', fontSize: 18, marginBottom: 10, fontWeight: 'bold'}}>Your Favourite Places</Text>
          
          <TouchableOpacity onPress={() => navigation.navigate('locationPickerScreen', {name: "homePlace", geometry: (homePlace ? homePlace.geometry : "")})} style={styles.savedPlaceItem}>
            <Feather name="home" size={20} color={homePlace ? "#007bff" : "#000"} style={styles.savedPlaceLeftIcon} />
            <View style={styles.savedPlaceItemContent}>
              <Text style={styles.savedPlaceLocationTitle}>Home</Text>
              <Text ellipsizeMode='tail' numberOfLines={1} style={{width: SCREEN_WIDTH-110}}>{homePlace ? homePlace.secondary_text : "Set Location"}</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('locationPickerScreen', {name: "workPlace", geometry: (workPlace ? workPlace.geometry : "")})} style={styles.savedPlaceItem}>
            <Feather name="briefcase" size={20} color={workPlace ? "#007bff" : "#000"} style={styles.savedPlaceLeftIcon} />
            <View style={styles.savedPlaceItemContent}>
              <Text style={styles.savedPlaceLocationTitle}>Work</Text>
              <Text ellipsizeMode='tail' numberOfLines={1} style={{width: SCREEN_WIDTH-110}}>{workPlace ? workPlace.secondary_text : "Set Location"}</Text>
            </View>
          </TouchableOpacity>

          <Text style={{textAlign: 'center', fontSize: 18, marginTop: 30, marginBottom: 10, fontWeight: 'bold'}}>Other Saved Places</Text>

          {totalRecord === 0 && (<Text style={{textAlign: 'center', fontSize: 16}}>No Saved Places found. Add New Location to use as shortcut on Google Map Page.</Text>)}
          {animating && (<ActivityIndicator animating={animating} color='red' size="large" />)}

          {placeData.map(place => (
            <TouchableOpacity key={place.main_text} onPress={() => navigation.navigate('locationPickerScreen', {name: place.main_text, favorite_place_id: place.favorite_place_id, geometryLat: parseFloat(place.latitude, 7), geometryLng: parseFloat(place.longitude, 7)})} key={place.favorite_place_id} onLongPress={() => deletePlace(place.favorite_place_id)} activeOpacity={0.6} style={styles.savedPlaceItem}>
              <FontAwesome name="star" size={20} color="#000" style={styles.savedPlaceLeftIcon} />
              <View style={styles.savedPlaceItemContent}>
                <Text style={styles.savedPlaceLocationTitle}>{place.main_text}</Text>
                <Text ellipsizeMode='tail' numberOfLines={1} style={{width: SCREEN_WIDTH-110}}>{place.secondary_text}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

        <TouchableOpacity onPress={() => navigation.navigate('locationPickerScreen', {name: "addLocation", mobile: mobile })} style={{marginVertical: 20, backgroundColor: "#ddd", paddingHorizontal: 50, paddingVertical: 10, borderRadius: 3}}>
          <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
            <Feather name="plus" size={25} color={Colors.BUTTON_COLOR} />
            <Text style={{fontSize: 16}}> Add New Place</Text>
          </View>
        </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor: "#fff",
    marginBottom: 100
  },
  scrollView: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      paddingHorizontal: 15,
      marginBottom: 10
  },
  SubScreencontainer: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 20
  },

  savedPlace: {
    padding: 2,
    marginTop: 15
  },
  savedPlaceItem: {
    backgroundColor: "#fff",
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    borderRadius: 3,
    elevation: .5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  savedPlaceLeftIcon: {
    backgroundColor: '#ddd',
    borderRadius: 50,
    width: 40,
    height: 40,
    lineHeight: 40,
    textAlign: 'center',
    marginRight: 20,
    marginLeft: 10
  },
  savedPlaceItemContent: {
    borderBottomColor: "#eee", 
    borderBottomWidth: 1,
    paddingVertical: 10,
    width: '100%'
  },
  savedPlaceItem2: {
    paddingVertical: 12
  },
  savedPlaceItemContentLast: {
    borderBottomWidth: 0
  },
  savedPlaceLocationTitle: {
    fontWeight: 'bold',
    fontSize: 18
  }
});