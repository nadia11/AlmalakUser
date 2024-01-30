import React, { Component } from "react";
import { StyleSheet, Text, View, Dimensions, SafeAreaView, ScrollView, Image, TouchableOpacity } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import MapView, { Polyline, Marker } from 'react-native-maps';
import { Colors } from '../../styles';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default class TripDetails extends Component {
  constructor(props) {
    super(props);
 
    this.state = {
      tripNumber: this.props.route.params.tripNumber, 
      tripDate: this.props.route.params.tripDate, 
      tripMapScreenshot: this.props.route.params.tripMapScreenshot, 
      vehicle: this.props.route.params.vehicle, 
      from: this.props.route.params.from, 
      to: this.props.route.params.to, 
      distance: this.props.route.params.distance,
      duration: this.props.route.params.duration,
      fare: this.props.route.params.fare, 
      tripStatus: this.props.route.params.tripStatus,
      cancelledBy: this.props.route.params.cancelledBy,
      reasonForCancellation: this.props.route.params.reasonForCancellation,
      discount: this.props.route.params.fare - this.props.route.params.paymentAmount,
      totalFare: this.props.route.params.paymentAmount,
      paymentMethod: this.props.route.params.paymentMethod,
      originLat: this.props.route.params.originLat,
      originLong: this.props.route.params.originLong,
      endLat: this.props.route.params.endLat,
      endLong: this.props.route.params.endLong,
      delayCancellationFee: this.props.route.params.delayCancellationFee,
      destinationChangeFee: this.props.route.params.destinationChangeFee,
    };
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ width: SCREEN_WIDTH, flexGrow: 1, paddingBottom: 50 }}>

          {this.state.tripMapScreenshot !== null && (
            <Image source={{uri: this.state.tripMapScreenshot}} style={styles.ride_map} />
          )}

          {(this.state.trip_map_screenshot == null && this.state.endLat !== null) && (
            <MapView liteMode key={`map_${this.state.trip_id}`} style={{height: 200}} initialRegion={{latitude: this.state.originLat, longitude: this.state.originLong, latitudeDelta: 0.015, longitudeDelta: 0.0121}}>
                <Polyline coordinates={[{ latitude: this.state.originLat, longitude: this.state.originLong }, { latitude: this.state.endLat, longitude: this.state.endLong }]} strokeColor="red" strokeWidth={3} />
                <Marker coordinate={{ latitude: this.state.originLat, longitude: this.state.originLong }} />
                <Marker coordinate={{ latitude: this.state.endLat, longitude: this.state.endLong }} />
            </MapView>
          )}

          {(this.state.trip_map_screenshot == null && this.state.endLat == null) && (
            <Image source={require('../../assets/images/map.jpg')} style={styles.ride_map} />
          )}

          <Text style={[styles.tripStatus, (this.state.tripStatus === "cancelled" ? {backgroundColor: Colors.BUTTON_COLOR, color: '#fff'} : this.state.tripStatus === "ride_request" ? {backgroundColor: Colors.WARNING, color: '#000'} : this.state.tripStatus === "active" ? {backgroundColor: "#007bff", color: '#fff'} : {backgroundColor: Colors.GREEN, color: '#fff'} )]}>
            {(this.state.tripStatus).replace('_', ' ')}
          </Text>

          <View style={styles.section}>
            <View style={styles.flexRow}>
              <Text style={{color: "#333", fontWeight: 'bold', fontSize: 18}}>{this.state.tripDate}</Text>
              <Text style={{color: Colors.PRIMARY, fontWeight: 'bold', fontSize: 20, textAlign: 'right'}}>{this.state.totalFare}</Text>
            </View>

            <View style={styles.flexRow}>
              <Text style={styles.item_name}>Trip Number:</Text>
              <Text style={styles.item_value}>{this.state.tripNumber}</Text>
            </View>

            <View style={styles.flexRow}>
              <Text style={styles.item_name}>Pickup: </Text>
              <Text style={[styles.item_value, {width: SCREEN_WIDTH-130}]} numberOfLines={1} ellipsizeMode="tail">{this.state.from}</Text>
            </View>

            <View style={styles.flexRow}>
              <Text style={styles.item_name}>Destination: </Text>
              <Text style={[styles.item_value, {width: SCREEN_WIDTH-130}]} numberOfLines={1} ellipsizeMode="tail">{this.state.to}</Text>
            </View>

            <View style={styles.flexRow}>
              <Text style={styles.item_name}>Distance:</Text>
              <Text style={styles.item_value}>{this.state.distance}</Text>
            </View>

            <View style={styles.flexRow}>
              <Text style={styles.item_name}>Duration:</Text>
              <Text style={styles.item_value}>{this.state.duration}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={{fontWeight: 'bold', fontSize: 18, marginTop: 10}}>Billing Details</Text>
            <View style={styles.billItem}>
              <Text style={styles.item_name}>Payment Method</Text>
              <Text>{this.state.paymentMethod}</Text>
            </View>

            <View style={styles.billItem}>
              <Text style={styles.item_name}>Ride Fare</Text>
              <Text>{this.state.fare}</Text>
            </View>

            <View style={styles.billItem}>
              <Text style={styles.item_name}>Delay Cancellation Fee</Text>
              <Text>{Number(this.state.delayCancellationFee).toFixed(2)}</Text>
            </View>

            <View style={styles.billItem}>
              <Text style={styles.item_name}>Destination Change Fee</Text>
              <Text>{Number(this.state.destinationChangeFee).toFixed(2)}</Text>
            </View>

            <View style={styles.billItem}>
              <Text style={styles.item_name}>Discount</Text>
              <Text>{Number(this.state.discount).toFixed(2)}</Text>
            </View>
            
            <View style={[styles.billItem, {borderTopColor: '#eee', borderTopWidth: 1}]}>
              <Text style={{fontWeight: 'bold', fontSize: 20, marginTop: 5}}>Total Bill</Text>
              <Text style={{fontWeight: 'bold', fontSize: 20, marginTop: 5}}>{this.state.totalFare}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.ride_vehic}><FontAwesome name="car" size={15} /> Vehicle Type: {this.state.vehicle ? this.state.vehicle : "Not Assigned."}</Text>
          </View>

            {this.state.tripStatus === "cancelled" && (
              <View style={styles.section}>
                <Text style={{textAlign: 'center', fontSize: 14, marginTop: 15}}>This ride cancelled by {this.state.cancelledBy === "Rider" ? "You." : "Driver"}</Text>
                {this.state.reasonForCancellation && (<Text style={{textAlign: 'center', fontSize: 14, marginTop: 15}}>Reason: {this.state.reasonForCancellation}</Text>)}
                <TouchableOpacity onPress={() => {this.props.navigation.navigate('MapScreen', {action: 'requestAgainFromTripPage', originLat: this.state.originLat, originLong: this.state.originLong, endLat: this.state.endLat, endLong: this.state.endLong }); }} style={{alignSelf: 'center', backgroundColor: Colors.BUTTON_COLOR, paddingVertical: 5, paddingHorizontal: 20, borderRadius: 5, marginTop: 20, marginBottom: 20}}>
                  <Text style={{textAlign: 'center', color: '#fff', fontSize: 16}}>Request Again</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    justifyContent: 'flex-start',
    marginTop: 20
  },
  section: {
    width: SCREEN_WIDTH,
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    elevation: 2,
    shadowColor: '#2AC062',
    shadowOpacity: 0.5,
    shadowOffset: { height: 0, width: 0},
    shadowRadius: 25,
    marginBottom: 10,
  },
  flexRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5
  },
  billItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7
  },
  item_name: {
    fontSize: 14,
    color: '#333'
  },
  item_value: {
    fontSize: 14,
    color: '#000',
    textAlign: 'right'
  },
  ride_vehic: {
    fontSize: 14,
    textTransform: 'uppercase',
    paddingVertical: 15,
  },
  ride_map: {
    height: 150,
    width: SCREEN_WIDTH, 
    resizeMode: 'cover', 
    borderRadius: 0,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  pickUpLocation: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    padding: 10,
    marginLeft: 30,
    fontSize: 18,
    color: '#333'
  },
  destination: {
    padding: 10,
    marginLeft: 30,
    fontSize: 18,
    color: '#333'
  },
  tripStatus: {
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
    textTransform: 'uppercase',
    position: 'absolute',
    right: "40%",
    top: 0,
    zIndex: 9999
  }
});
