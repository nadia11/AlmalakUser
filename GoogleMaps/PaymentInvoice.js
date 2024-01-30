import React from "react";
import { StyleSheet, Text, TextInput, View, TouchableOpacity, Dimensions, ActivityIndicator, Alert, Image, ScrollView, ToastAndroid, Keyboard } from "react-native";
import axios from 'axios';
import { Rating, AirbnbRating } from 'react-native-ratings';
import socketIO from 'socket.io-client';

import { BASE_URL, GOOGLE_API_KEY, SOCKET_IO_URL } from '../config/api';
import { Colors } from '../styles';
import { Options } from '../config';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;


export default function PaymentInvoice(props)
{
  // const tripNumber = 'TR3TTO6831MC';
  // const riderMobile = '01998369826';
  const tripNumber = props.route.params.tripNumber;
  const riderMobile = props.route.params.riderMobile;

  const [endDistanceText, setEndDistanceText] = React.useState('');
  const [endDurationText, setEndDurationText] = React.useState('');
  const [pickupLocation, setPickupLocation] = React.useState("");
  const [endDropOffLocation, setEndDropOffLocation] = React.useState('');
  const [fare, setFare] = React.useState(0);
  const [paymentMethod, setPaymentMethod] = React.useState('cash');
  const [discountAmount, setDiscountAmount] = React.useState(0);

  const [delayCancellationFee, setDelayCancellationFee] = React.useState(0);
  const [destinationChangeFee, setDestinationChangeFee] = React.useState(0);

  const [animating, setAnimating] = React.useState(false);
  const [ratingsText, setRatingsText] = React.useState('');
  const [ratings, setRatings] = React.useState(3);
  let socket = socketIO(SOCKET_IO_URL);

  const getUserData = async () => 
  {
    await axios.get(BASE_URL+'/get-trip-completed-data-to-payment-screen/'+tripNumber)
    .then((response) => {
      if(response.data.code === 200) {
        setPickupLocation(response.data.pickup_location);
				setEndDropOffLocation(response.data.end_drop_off_location);
				setEndDistanceText(response.data.distance);
				setEndDurationText(response.data.duration);
				setFare(response.data.total_fare);
				setPaymentMethod(response.data.payment_method);

        setDelayCancellationFee(response.data.delay_cancellation_fee);
        setDestinationChangeFee(response.data.destination_change_fee);  
      }
    })
    .catch((error) => {
      setAnimating( false );
      console.log("payment-screen: "+error.message);
      ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
    });
  }

  React.useEffect(() => { 
    getUserData();

    socket.on("driverSentFeedback", result => {
      if(tripNumber === result.tripNumber) {
        alert('Your Driver Sent to you a '+result.ratings+' star Feedback');
        ToastAndroid.show('Your Driver Sent to you a '+result.ratings+' Feedback', ToastAndroid.LONG);
      }
    });
  }, []);
  
  const submitFeedback = async () => {
    await axios.post(BASE_URL+'/send-feedback-to-driver', {
      mobile: riderMobile,
      trip_number: tripNumber,
      trip_ratings: ratings,
      rating_text: ratingsText
    })
    .then(response => {
      if(response.data.code === 200){
      
        socket.emit('riderSentFeedback', { 
          tripNumber: tripNumber, 
          ratings: ratings, 
          rating_text: ratingsText 
        });

        Alert.alert('Thanks for Riding.', 
          'Your Current Trip is successfully finished. Visit Again.', 
          [{ text: 'OK', onPress: () => props.navigation.reset({index: 0, routes: [{name: 'MapScreen'}]})} ]
        );
      }
    })
    .catch((error) => {
      setAnimating( false );
      console.log("send-feedback-to-driver: "+error.message);
      ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
    });
  }
  
  const ratingCompleted = ( rating ) => {
    //console.log( `Rating is: ${rating}` );
    setRatings( rating );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
        <Text style={{color: '#000', fontSize: 18}}>Trip ID# </Text>
        <Text style={{fontWeight: 'bold', color: 'red', fontSize: 18}}>{tripNumber}</Text>
      </View>

      <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 20, justifyContent: 'center'}}>
        <Text style={{color: '#000', fontSize: 18}}>Payment Method: </Text>
        <Text style={{fontWeight: 'bold', color: 'red', fontSize: 18}}>{paymentMethod}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.itemName}>Pickup: </Text>
        <Text style={[styles.itemValue, {width: SCREEN_WIDTH-170}]} numberOfLines={1} ellipsizeMode="tail">{pickupLocation}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.itemName}>Destination:</Text>
        <Text style={[styles.itemValue, {width: SCREEN_WIDTH-170}]} numberOfLines={1} ellipsizeMode="tail">{endDropOffLocation}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.itemName}>Distance</Text>
        <Text style={styles.itemValue}>{endDistanceText}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.itemName}>Duration</Text>
        <Text style={styles.itemValue}>{endDurationText}</Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.itemName, {color: Colors.GREEN, fontWeight: 'bold'}]}>Total Fare</Text>
        <Text style={[styles.itemValue, {color: Colors.GREEN}]}>৳{Number(fare).toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.itemName}>Promocode Discount</Text>
        <Text style={styles.itemValue}>৳{Number(discountAmount).toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.itemName}>Delay Cancellation Fee</Text>
        <Text style={styles.itemValue}>৳{Number(delayCancellationFee).toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.itemName}>Destination Change Fee</Text>
        <Text style={styles.itemValue}>৳{Number(destinationChangeFee).toFixed(2)}</Text>
      </View>
      
      <View style={styles.row}>
        <Text style={[styles.itemName, {color: Colors.GREEN, fontWeight: 'bold'}]}>Payable Amount</Text>
        <Text style={[styles.itemValue, {color: Colors.GREEN}]}>৳{Number(fare - discountAmount + delayCancellationFee + destinationChangeFee).toFixed(2)}</Text>
      </View>

      <View style={{ backgroundColor: '#fff', borderRadius: 5, marginTop: 30 }}>
        <Text style={{paddingHorizontal: 30, fontSize: 18, textAlign: 'center', marginBottom: 10, textTransform: "uppercase", color: '#111', fontWeight: 'bold'}}>How is your Trip?</Text>
        <Text style={{paddingHorizontal: 30, fontSize: 14, textAlign: 'center', marginBottom: 20, color: '#444'}}>Your feedback will help us improve driving experience better.</Text>

        <AirbnbRating count={5} showRating={true}
          reviews={["Poor", "Fair", "Good", "Very Good", "Excellent"]}
          starContainerStyle={{ alignSelf: "center", backgroundColor: "#fff" }} 
          defaultRating={ratings} size={30} selectedColor="#f1c40f" unSelectedColor="#BDC3C7" reviewColor="#f1c40f" reviewSize={25}
          onFinishRating={ratingCompleted}
        />
        {/* <AirbnbRating count={5} showRating={false} isDisabled={true} defaultRating={5} size={30} selectedColor="#BDC3C7" reviewSize={25} /> */}
        {/* <Text style={{paddingHorizontal: 30, fontSize: 16, textAlign: 'center', marginBottom: 20}}>Rate Driver from 1 to 5 Star.</Text> */}
      
        <Text style={{paddingHorizontal: 30, fontSize: 16}}>Write your review here</Text>
        <TextInput keyboardType="default" autoCorrect={false} style={styles.textInput} placeholderTextColor='#444' underlineColorAndroid="transparent" onChangeText={val => setRatingsText(val) } value={ratingsText} multiline={true} />
      </View>

      <TouchableOpacity onPress={() => submitFeedback()} style={styles.acceptButton}>
        <ActivityIndicator animating={animating} color='#fff' size="small" style={{ position: "absolute", left: 60, top: 15}} />
        <Text style={styles.acceptButtonText}>{animating === false ? "Submit Review" : "Submitting..."}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 0,
    paddingHorizontal: 10,
    width: SCREEN_WIDTH,
    backgroundColor: '#fff',
    shadowColor: "#000",
    elevation: 7,
    shadowRadius: 5,
    shadowOpacity: 1.0,
    zIndex: 9999,
    paddingTop: 15
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomColor: '#eee',
    borderBottomWidth: 1
  },
  itemName: {
    color: '#333', 
    fontSize: 16,
    fontWeight: 'bold'
  },
  itemValue: {
    color: '#000', 
    fontSize: 16
  },
  acceptButton: {
    alignSelf: "center",
    backgroundColor: Colors.GREEN_LIGHT,
    width: SCREEN_WIDTH-100,
    padding: 10,
    marginBottom: 40,
    borderRadius: 5
  },
  acceptButtonText : {
    fontSize: 16,
    color: "#fff", 
    textAlign: 'center',
    textTransform: 'uppercase'
  },
  textInput: {
    alignSelf: "stretch",
    fontSize: 16,
    height: 80,
    marginBottom: 25,
    marginLeft: 20,
    color: "#333",
    borderColor: "#ccc",
    borderWidth: 1,
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 5,
    width: SCREEN_WIDTH - 70
  },
});
