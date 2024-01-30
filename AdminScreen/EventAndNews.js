import React, { Component } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Switch, Dimensions, FlatList, ActivityIndicator, SafeAreaView, ToastAndroid, Image } from "react-native";
import Feather from "react-native-vector-icons/Feather";
import NoRecordIcon from '../components/noRecords';
import axios from 'axios';

import { BASE_URL } from '../config/api';
import { Colors } from '../styles';
import { Options } from '../config';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default class EventAndNews extends Component {
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
      news_picture_path: '',
      default_image: ''
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

    axios.get(BASE_URL+'/get-event-and-news')
    .then((response) => {
      if(response.data.code === 200) {
        //console.log(response.data.message);
        this.setState({
          serverData: page === 1 ? response.data.message : [...this.state.serverData, ...response.data.message],
          error: response.data.error || null,
          loading: false,
          refreshing: false,
          total_record: response.data.total_record,
          news_picture_path: response.data.news_picture_path,
          default_image: response.data.default_image,
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


  addViewCount = async (news_id) => {
    console.log(BASE_URL+'/add-news-view-count');

    await axios.post(BASE_URL+'/add-news-view-count', { news_id: news_id })
    .then(response => {
      if(response.data.code === 200){
        console.log("add-view-count Success: "+response.data.message);
      }
    })
    .catch((error) => {
      console.log("add-view-count Error: "+error.message);
    });
  }
  
  renderSeparator = () => {
    return <View style={{height: 1, width: "85%", backgroundColor: "#eee", marginLeft: "15%" }} />
  };
  
  renderHeader = () => {
    return <View><Text>Header</Text></View>;
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
    <View style={styles.newsItem} key={item.news_id}>
      {item.news_picture == "" && (
        <Image source={{uri: this.state.default_image}} style={styles.news_picture_default} />
      )}

      {item.news_picture !== "" && (
        <Image source={{ uri: this.state.news_picture_path +"/"+ item.news_picture }} style={styles.news_picture} />
      )}

      <View>
          <Text style={styles.news_title}>{item.news_title}</Text>
          <Text style={styles.news_date}>{item.news_date}</Text>
          <Text style={styles.description}>{item.news_body_short}</Text>
      </View>

      <View style={styles.footerRow}>
        <Text>{item.view_count ? item.view_count : 0} View</Text>
        <TouchableOpacity style={styles.detailsButton} onPress={() => {
            this.addViewCount(item.news_id); 
            this.props.navigation.navigate('EventAndNewsDetails', {
            news_picture: item.news_picture ? this.state.news_picture_path +"/"+ item.news_picture : "",
            news_title: item.news_title,
            default_image: this.state.default_image,
            news_body: item.news_body,
            news_date: item.news_date,
        })}}>
          <Text style={{textTransform: 'uppercase', color: '#fff'}}>Details <Feather name="chevron-right" size={15} /></Text>
        </TouchableOpacity>
      </View>
    </View>
  )

  render() {
    return (
      <SafeAreaView style={styles.container}>
        {!this.state.serverData.length && (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <NoRecordIcon title="Events & News" reloadFunction={() => this.makeRemoteRequest()} spinner={this.state.loading} />
          </View>
        )}

        {this.state.serverData.length > 0 && (
          <View style={{marginTop: 10}}>
            <FlatList
              data={this.state.serverData}
              //style={{ marginTop: 10 }}
              renderItem={this.renderItem}
              numColumns={1}
              keyExtractor={item => item.news_id.toString()}
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
  newsItem: {
    backgroundColor: '#fff', 
    paddingHorizontal: 10,
    paddingVertical: 10,
    elevation: 3,
    shadowColor: '#eee', 
    shadowOpacity: 0.5,
    shadowOffset: { height: 0, width: 0},
    shadowRadius: 25, 
    marginBottom: 20
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
  news_date: {
    paddingBottom: 10,
    fontSize: 16,
    color: '#333'
  },
  news_title: {
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    alignItems: 'baseline',
    marginVertical: 5
  },
  description: {
    color: Colors.TEXT_PRIMARY, 
    textAlign: 'justify'
  },
  news_picture: {
    height: 150,
    width: SCREEN_WIDTH-20, 
    resizeMode: "cover", 
    borderRadius: 0,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  news_picture_default: {
    height: 100,
    width: SCREEN_WIDTH, 
    resizeMode: 'cover', 
    borderRadius: 0,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  detailsButton: {
    backgroundColor: Colors.BUTTON_COLOR,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 3
  }
});
