import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, Dimensions, ToastAndroid, Alert, ActivityIndicator, LayoutAnimation, UIManager, Platform } from 'react-native';
import Feather from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import axios from 'axios';

import { BASE_URL } from '../../config/api';
import { Colors } from '../../styles';
import { Options } from '../../config';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function savedPlaceScreenModal(props) {
  const { navigation } = props;
  const [animating, setAnimating] = React.useState(false);
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
      }
    })
    .catch((error) => {
      setAnimating(false);
      setTotalRecord(0);
      console.log("Submitting Error: "+error);
      ToastAndroid.showWithGravity(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT, ToastAndroid.BOTTOM); 
    });
  }

  React.useEffect(() => { 
    getPlacedData();
  }, []);

  const redirectMapScreen = (place_id, secondary_text) => {
      props.navigation.navigate('MapScreen', {place_id: place_id, secondary_text: secondary_text});
      ToastAndroid.show('Set Location & going for Vehicle Selection', ToastAndroid.SHORT);
      props.route?.params?.locationSearch();
  }

  return (
    <SafeAreaView style={styles.SubScreencontainer}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.savedPlace}>
          <Text style={{textAlign: 'center', fontSize: 18, marginTop: 0, marginBottom: 10, fontWeight: 'bold'}}>Saved Places</Text>

          {totalRecord === 0 && (<Text style={{textAlign: 'center', fontSize: 16}}>No Saved Places found. Add New Location to use as shortcut on Google Map Page.</Text>)}
          {animating && (<ActivityIndicator animating={animating} color='red' size="large" />)}

          {placeData.map(place => (
            <TouchableOpacity key={place.main_text} onPress={() => redirectMapScreen(place.place_id, place.secondary_text)} key={place.favorite_place_id} activeOpacity={0.6} style={styles.savedPlaceItem}>
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
    marginBottom: 15,
    elevation: 3,
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