import React, { Component } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Switch, Dimensions, FlatList, ActivityIndicator, SafeAreaView, ToastAndroid, Image } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Feather from "react-native-vector-icons/Feather";
import Modal from 'react-native-modal';
import { ListItem, SearchBar } from "react-native-elements";
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { BASE_URL } from '../../config/api';
import NoRecordIcon from '../../components/noRecords';
import { Colors } from '../../styles';
import { Options } from '../../config';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default class Coupons extends Component {
  constructor(props) {
    super(props);
 
    this.state = {
      loading: false,
      serverData: [],
      page: 1,
      seed: 1,
      error: null,
      refreshing: false,
      notFound: '',
      total_record: 0,
    };
  }

  componentDidMount() {
    this.makeRemoteRequest();
  }

  componentWillUnmount() {
    this.makeRemoteRequest();
  }
 
  makeRemoteRequest = async () => {
    if(this.state.total_record > this.state.page) return null;

    const { page, seed } = this.state;
    this.setState({ loading: true });

    axios.get(BASE_URL+'/get-promocode-info')
    .then((response) => {
      if(response.data.code === 200) {
        //console.log(response.data.message);
        this.setState({
          serverData: page === 1 ? response.data.message : [...this.state.serverData, ...response.data.message],
          error: response.data.error || null,
          loading: false,
          refreshing: false,
          total_record: response.data.total_record,
        });
      }
    })
    .catch((error) => {
      ToastAndroid.show(Options.APP_OPTIONS.NETWORK_ERROR_MESSAGE, ToastAndroid.SHORT); 
      this.setState({ error, loading: false, refreshing: false });
    });
  };
 
  handleRefresh = () => {
    this.setState(
      {page: 1, seed: this.state.seed + 1, refreshing: true},
      () => { this.makeRemoteRequest() }
    );
  };
 
  handleLoadMore = () => {
    //console.log("record: "+this.state.total_record +", Page: "+this.state.page+", seed: "+this.state.seed);
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
    return (
      <View style={styles.header}>
        <Text style={styles.headerCell}>Coupon Code</Text>
        <Text style={styles.headerCell}>Expire Date</Text>
        <Text style={styles.headerCell}>Amount</Text>
      </View>
    );
  };
  
  renderFooter = () => {
    if (!this.state.loading) return null;
    
    return (
      <View style={{paddingVertical: 20}} >
        <ActivityIndicator animating size="large" color='#f00' />
      </View>
    );
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
    <View style={styles.footerRow} key={item.promo_code_id}>
      <Text style={styles.rowCell}>{item.promo_code}</Text>
      <Text style={styles.rowCell}>{item.expiry_date}</Text>
      <Text style={styles.rowCell}>{Number(item.promo_amount).toFixed(2)}</Text>
    </View>
  )

  render() {
    return (
      <SafeAreaView style={styles.container}>
        {!this.state.serverData.length && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <NoRecordIcon title="Coupons" reloadFunction={() => this.makeRemoteRequest()} spinner={this.state.loading} />
          </View>
        )}

        {this.state.serverData.length > 0 && (
          <View style={{marginTop: 20}}>
            <FlatList
              data={this.state.serverData}
              //style={{ marginTop: 10 }}
              renderItem={this.renderItem}
              numColumns={1}
              keyExtractor={item => item.promo_code_id.toString()}
              ItemSeparatorComponent={this.renderSeparator}
              ListHeaderComponent={this.renderHeader}
              ListHeaderComponentStyle={{color: 'red'}}
              ListFooterComponent={this.renderFooter}
              ListFooterComponentStyle={{color: 'red'}}
              // contentContainerStyle={{width: SCREEN_WIDTH, backgroundColor: '#FBFBF8', alignItems: 'center', justifyContent: 'center', marginTop: 15 }}
              //ListEmptyComponent={this.EmptyList}
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
  header: {
    padding: 10, 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#ddd', 
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#eee', 
    shadowOpacity: 0.5,
    shadowOffset: { height: 0, width: 0},
    shadowRadius: 25
  },
  headerCell: {
    fontSize: 16, 
    fontWeight: 'bold'
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 20,
    borderBottomWidth: 1, 
    borderBottomColor: '#ccc'
  },
  rowCell: {
    fontSize: 16,
  },
});
