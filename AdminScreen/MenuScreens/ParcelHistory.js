import React, { Component } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Switch, Dimensions, FlatList, ActivityIndicator, SafeAreaView, ToastAndroid, Image } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Feather from "react-native-vector-icons/Feather";
import NoRecordIcon from '../../components/noRecords';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BASE_URL } from '../../config/api';
import { Colors } from '../../styles';
import { Options } from '../../config';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default class ParcelHistory extends Component {
  constructor(props) {
    super(props);
 
    this.state = {
      mobile: '',
      loading: false,
      serverData: [],
      page: 1,
      seed: 1,
      error: null,
      refreshing: false,
      notFound: '',
      hideCanceledRide: false,
      total_record: 0,
      trip_map_path: ''
    };
  }


  getUserData = async () => {
    try {
      const mobile = await AsyncStorage.getItem('mobile')
      if(mobile !== null) { 
        this.setState({ mobile: mobile }); 
        this.makeRemoteRequest();
      }

      const email = await AsyncStorage.getItem('email')
      if(email !== null) { 
        this.setState({ email: email }); 
      }
    } 
    catch (error) { console.error(error); }
  }


  componentDidMount() {
    this.getUserData();
  }
 
  makeRemoteRequest = async () => {
    const { page, seed } = this.state;
    this.setState({ loading: true });

    setTimeout(() => {
      axios.get(`${BASE_URL}/rider-parcel-list/${this.state.mobile}${this.state.hideCanceledRide ? '/hideCanceledRide' : ""}`)
      .then((response) => {
        if(response.data.code === 200) {
          this.setState({
            serverData: page === 1 ? response.data.message : [...this.state.serverData, ...response.data.message],
            error: response.data.error || null,
            loading: false,
            refreshing: false,
            trip_map_path: response.data.trip_map_path,
            total_record: response.data.total_record
          });
        }
      })
      .catch((error) => {
        // ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
        this.setState({ error, loading: false, refreshing: false });
      });
    }, 1500);
  };
 
  handleRefresh = () => {
    this.setState(
      {page: 1, seed: this.state.seed + 1, refreshing: true},
      () => { this.makeRemoteRequest() }
    );
  };
 
  handleLoadMore = () => {
    if(this.state.total_record > this.state.serverData.length) {
      this.setState(
        prevState => ({ page: prevState.page + 1 }),
        () => { this.makeRemoteRequest() }
      );
    }
  }
  
  renderSeparator = () => {
    return <View style={{height: 1, width: "85%", backgroundColor: "#eee", marginLeft: "15%" }} />
  };
  
  renderHeader = () => {
    return <View><Text>Header</Text></View>;
  };
  
  renderFooter = () => {
    if (this.state.loading) {
      return (
        <View style={{paddingVertical: 20}} >
          <ActivityIndicator animating size="large" color='#f00' />
        </View>
      );
    } else {
      return (
        <View style={{paddingVertical: 30}} >
          <Text style={{ textAlign: 'center' }}>Trip history is available for the last 30 days.</Text>
          <Text style={{ textAlign: 'center' }}>The information may take some time to update.</Text>
        </View>
      );
    }
  };

  //View to show when list is empty
  EmptyList = () => {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>No Records Found.</Text>
      </View>
    );
  };
  
  renderItem = ({ item, index, separators }) => (
    <View style={styles.tripsItem} key={item.trip_id}>

      <TouchableOpacity style={styles.detailsButton} 
        onPress={() => this.props.navigation.navigate('TripDetails', {
          tripDate: item.trip_date,
          tripMapScreenshot: item.trip_map_screenshot,
          tripNumber: item.trip_number,
          vehicle: item.vehicle,
          from: item.trip_from,
          to: item.trip_to,
          to: item.trip_to,
          distance: item.distance,
          duration: item.duration,
          paymentMethod: item.payment_method,
          fare: Number(item.fare).toFixed(2),
          paymentAmount: Number(item.payment_amount).toFixed(2),
          tripStatus: item.trip_status,
      })}>
        <Text style={{textTransform: 'uppercase', color: '#fff'}}>Details <Feather name="chevron-right" size={15} /></Text>
      </TouchableOpacity>

      <Text style={styles.trip_date}>{item.trip_date}</Text>

      {item.trip_map_screenshot !== null && (
        <Image source={{uri: item.trip_map_screenshot}} style={styles.ride_map} />
      )}

      {item.trip_map_screenshot == null && (
        <Image source={require('../../assets/images/map.jpg')} style={styles.ride_map} />
      )}

      <Text style={[styles.tripStatus, item.trip_status === "cancelled" ? {backgroundColor: Colors.BUTTON_COLOR, color: '#fff'} : {backgroundColor: Colors.GREEN, color: '#fff'}]}>{item.trip_status}</Text>

      <View style={styles.footerRow}>
        <View>
          <Text style={styles.ride_vehic}><FontAwesome name="car" size={15} color={Colors.PRIMARY} /> {item.vehicle}</Text>
          <Text style={styles.address}><Feather name="map-pin" size={15} color={Colors.PRIMARY} /> {item.trip_from} - {item.trip_to}</Text>
        </View>
        <View>
          <Text style={{fontSize: 16, textAlign: 'right'}}>Trip Total</Text>
          <Text style={{color: 'red', fontWeight: 'bold', fontSize: 16, textAlign: 'right'}}>{Number(item.payment_amount).toFixed(2)}</Text>
        </View>
      </View>
    </View>
  )

  handleHideRide = () => {
    if(this.state.hideCanceledRide){
      this.setState((prevState) => ({ hideCanceledRide: !prevState.hideCanceledRide }));
      this.makeRemoteRequest();
		} else {
      this.setState((prevState) => ({ hideCanceledRide: !prevState.hideCanceledRide }));
      this.makeRemoteRequest();
			ToastAndroid.show('Loaded data successfully!', ToastAndroid.SHORT);
    }
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        {!this.state.serverData.length && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			      <NoRecordIcon title="Parcel Delivery History" reloadFunction={() => this.makeRemoteRequest()} spinner={this.state.loading} />
          </View>
        )}

        {this.state.serverData.length > 0 && (
          <View style={{marginTop: 20}}>
            <View style={styles.headerBg}>
              <Text style={{fontWeight: 'bold', fontSize: 16, color: '#333'}}>Hide Canceled Rides</Text>
              <Switch trackColor={{ false: Colors.GRAY_DARK, true: Colors.PRIMARY_LIGHT }} thumbColor={this.state.hideCanceledRide ? Colors.ORANGE_RED : "#f4f3f4"} ios_backgroundColor="#3e3e3e" onValueChange={this.handleHideRide} value={this.state.hideCanceledRide} />
            </View>

            <FlatList
              data={this.state.serverData}
              //style={{ marginTop: 10 }}
              renderItem={this.renderItem}
              numColumns={1}
              keyExtractor={item => item.trip_id.toString()}
              ItemSeparatorComponent={this.renderSeparator}
              //ListHeaderComponent={this.renderHeader}
              //ListHeaderComponentStyle={{color: 'red'}}
              ListFooterComponent={this.renderFooter}
              ListFooterComponentStyle={{color: 'red'}}
              // contentContainerStyle={{width: SCREEN_WIDTH, backgroundColor: '#FBFBF8', alignItems: 'center', justifyContent: 'center', marginTop: 15 }}
              //ListEmptyComponent={this.EmptyList}
              enableEmptySections={true}
              // ListEmptyComponent={}
              refreshing={this.state.refreshing}
              onRefresh={this.handleRefresh}
              onEndReached={this.handleLoadMore}
              onEndReachedThreshold={.5}
            />
          </View>
        )}
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f1f1',
    justifyContent: 'flex-start',
    width: SCREEN_WIDTH,
    borderTopColor: '#ddd',
    borderTopWidth: 1,
    paddingVertical: 10
  },
  headerBg: {
    backgroundColor: '#fff', 
    padding: 10,
    elevation: 2,
    shadowColor: '#2AC062',
    shadowOpacity: 0.5,
    shadowOffset: { height: 0, width: 0},
    shadowRadius: 25,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginTop: 5
  },
  trip_date: {
    paddingBottom: 10,
    fontSize: 16,
    fontWeight: 'bold'
  },
  ride_vehic: {
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    alignItems: 'baseline'
  },
  address: {
    color: Colors.TEXT_PRIMARY, 
    fontWeight: 'bold'
  },
  ride_map: {
    height: 150,
    width: SCREEN_WIDTH - 30, 
    resizeMode: 'cover', 
    borderRadius: 0,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  tripsItem: {
    backgroundColor: '#fff', 
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 3,
    shadowColor: '#eee', 
    shadowOpacity: 0.5,
    shadowOffset: { height: 0, width: 0},
    shadowRadius: 25, 
    marginBottom: 10
  },
  detailsButton: {
    backgroundColor: Colors.BUTTON_COLOR,
    position: 'absolute',
    right: 15,
    top: 7,
    zIndex: 9999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 3
  },
  tripStatus: { 
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 3,
    textTransform: 'uppercase',
    position: 'absolute',
    left: '40%',
    bottom: 50,
    zIndex: 9999
  }
});
