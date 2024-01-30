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

export default class RecentTransactionData extends Component {
  constructor(props) {
    super(props);
 
    this.state = {
      mobile: '',
      loading: false,
      serverData: [],
      tabsData: [],
      page: 1,
      seed: 1,
      refreshing: false,
      notFound: '',
      total_record: 0,
      tabType: 'debit'
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

    this.unsubscribe = this.props.navigation.addListener('tabPress', e => {
      //e.preventDefault(); //prevent tab navigation
      this.handleFilterTab(this.props.tabType);
      this.setState({tabType: this.props.tabType});
    });
  }

  componentWillUnmount() {
    if (this.unsubscribe != null) this.unsubscribe();
  }
 
  makeRemoteRequest = async () => {
    const { page, seed } = this.state;
    this.setState({ loading: true });

    setTimeout(() => {
      axios.get(`${BASE_URL}/rider-transactions/${this.state.mobile}`)
      .then((response) => {
        if(response.data.code === 200) {
          this.setState({
            serverData: page === 1 ? response.data.message : [...this.state.serverData, ...response.data.message],
            tabsData: [...this.state.tabsData, ...response.data.message],
            loading: false,
            refreshing: false,
            total_record: response.data.total_record
          });

          // const allCategories = ['All', ...new Set(response.data.message.map(item => item.payment_status))];
          // console.log(allCategories);
        }
      })
      .catch((error) => {
	      console.log("rider-transactions Error: "+error.message);
        ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
        this.setState({ loading: false, refreshing: false });
      });
    }, 1500);
  };

  handleFilterTab = (filtered) => {
    if(filtered === 'All') {
      this.setState({ tabsData: this.state.serverData });
      return;
    }

    const filteredData = this.state.serverData.filter(item => item.payment_status ===  filtered);
    this.setState({ tabsData: filteredData });
  }  
 
  handleRefresh = () => {
    this.setState(
      {page: 1, seed: this.state.seed + 1, refreshing: true},
      () => { this.makeRemoteRequest() }
    );
  };
 
  handleLoadMore = () => {
    // console.log("total_record"+this.state.total_record, this.state.serverData.length);
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
    // console.log(this.state.loading, this.state.page, this.state.total_record);
    
    if (this.state.loading === true) {
      return (
        <View style={{paddingVertical: 60}} >
          <ActivityIndicator animating size="large" color='#f00' />
        </View>
      );
    } else {
      return (
        <View style={{paddingVertical: 30}} >
          <Text style={{ textAlign: 'center' }}>Transaction history is available for the last 30 days.</Text>
          <Text style={{ textAlign: 'center' }}>The information may take some time to update.</Text>
        </View>
      );
    }
  };

  EmptyList = () => {
    return (
      //View to show when list is empty
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>No Records Found.</Text>
      </View>
    );
  };
  
  renderItem = ({ item, index, separators }) => (
    <View style={styles.transactionsItem} key={item.transaction_id}>
      <View style={styles.footerRow}>
        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
          <Feather name="arrow-up" size={20} color="#fff" style={{backgroundColor: '#4BB85B', padding: 5, marginRight: 15, borderRadius: 3}} />
          <View>
            <Text style={styles.title}>Trip Payment</Text>
            <Text style={styles.transaction_date}>{item.transaction_date}</Text>
          </View>
        </View>

        <Text style={styles.amount}>{Number(item.total_earnings).toFixed(2)}</Text>
      </View>
    </View>
  )

  render() {
    return (
      <SafeAreaView style={styles.container}>
        {!this.state.tabsData.length && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <NoRecordIcon title="Transaction History" reloadFunction={() => this.makeRemoteRequest()} spinner={this.state.loading} />
          </View>
        )}

        {this.state.tabsData.length > 0 && (
          <View style={{marginTop: 0}}>
            <FlatList
              data={this.state.tabsData}
              //style={{ marginTop: 10 }}
              renderItem={this.renderItem}
              numColumns={1}
              initialNumToRender={5}
              keyExtractor={item => item.transaction_id.toString()}
              ItemSeparatorComponent={this.renderSeparator}
              ListFooterComponent={this.renderFooter}
              ListFooterComponentStyle={{color: 'red'}}
              enableEmptySections={true}
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
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 5
  },
  transaction_date: {
    paddingBottom: 10,
    fontSize: 16,
    color: '#444'
  },
  amount: {
    color: '#222', 
    fontWeight: 'bold', 
    fontSize: 20, 
    textAlign: 'right'
  },
  title: {
    color: Colors.TEXT_PRIMARY,
    fontSize: 20,
    fontWeight: 'bold'
  },
  transactionsItem: {
    backgroundColor: '#fff', 
    paddingHorizontal: 15,
    paddingVertical: 10,
    elevation: 3,
    shadowColor: '#eee', 
    shadowOpacity: 0.5,
    shadowOffset: { height: 0, width: 0},
    shadowRadius: 7, 
    marginBottom: 10,
    marginHorizontal: 10
  },
});
