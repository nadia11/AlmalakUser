import React, { Component } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, FlatList, ActivityIndicator, SafeAreaView } from "react-native";
import { Colors } from '../../styles';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import Modal from 'react-native-modal';
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Feather from "react-native-vector-icons/Feather";
import { ListItem, SearchBar } from "react-native-elements";
import CheckBox from '@react-native-community/checkbox';


const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

// {route?.params?.owner ? `${route.params.owner}'s Feed` : ''}

export default class InviteFriend extends Component {
  constructor(props) {
    super(props);
 
    this.state = {
      loading: false,
      isListEnd: false,
      fetching_from_server: false,

      serverData: [],
      page: 1,
      seed: 1,
      error: null,
      refreshing: false,
      notFound: 'No Data Found.',
      check: {},
      checkedData: [],
      searchText: '',

      shareMessage: this.props.route.params.shareMessage,
      selectAll: false
    };
    this.arrayholder = [];
  }

  componentDidMount() {
    this.makeRemoteRequest();
  }
 
  makeRemoteRequest = () => {
    const { page, seed } = this.state;
    this.setState({ loading: true });

    if (!this.state.isListEnd) {
      setTimeout(() => {
        // https://api.github.com/users?since=1&per_page=10
        fetch(`https://randomuser.me/api/?seed=${seed}&page=${page}&results=20`)
        .then(res => res.json())
        .then(responseJson => {
          this.setState({
            loading: false,
            refreshing: false,
            error: responseJson.error || null,
            serverData: page === 1 ? responseJson.results : [...this.state.serverData, ...responseJson.results],
          },
          function() {
            this.arrayholder = responseJson.results;
          });
        })
        .catch(error => { 
          this.setState({ error, loading: false, refreshing: false }); 
        });
      }, 1500);
    }
  };
 
  handleRefresh = () => {
    this.setState(
      {page: 1, seed: (this.state.seed + 1), refreshing: true},
      () => { this.makeRemoteRequest() }
    );
  };
 
  handleLoadMore = () => {
    this.setState(
      prevState => ({ page: prevState.page + 1 }),
      //{ page: this.state.page + 1 },
      () => { this.makeRemoteRequest() }
    );
  }
  
  renderSeparator = () => {
    return <View style={{height: 0.5, width: "85%", backgroundColor: "#ddd", marginLeft: "15%" }} />
  };
  
  search = text => console.log(text);
  clear = () => this.search.clear();

  searchFilterFunction = text => {    
    const newData = this.arrayholder.filter( item => {
      const itemData = `${item.name.first.toUpperCase()} ${item.name.last.toUpperCase()}`;
      const textData = text.toUpperCase();
      
      return itemData.indexOf(textData) > -1;
    });
    
    this.setState({ serverData: newData, searchText: text });
  };
  
  renderHeader = () => {
    return <SearchBar 
    round lightTheme 
    clearIcon={{ size: 20 }}
    searchIcon={{ size: 24 }}
    //showLoading={true}
    loadingProps={{ backgroundColor: 'green' }}
    containerStyle={{ backgroundColor: "#fff", height: 50, paddingTop: 0, borderTopWidth: 0, borderBottomWidth: 0 }}
    inputContainerStyle={{ backgroundColor: "#eee", borderRadius: 50, height: 50 }}
    inputStyle={{ color: "#333", borderColor: 'transparent' }}
    leftIconContainerStyle={{ backgroundColor: "transparent", marginLeft: 15, paddingRight: 0 }}
    rightIconContainerStyle={{ backgroundColor: 'transparent' }}
    placeholderTextColor="#666"
    onChangeText={text => this.searchFilterFunction(text)} 
    placeholder="Type Here..." 
    value={this.state.searchText} 
    style={{borderRadius: 100}} 
    onClear={ () => this.searchFilterFunction('')}
    ref={search => this.search = search}
    autoCorrect={false} />;
  };

  renderFooter = () => {
    if (!this.state.loading && this.state.isListEnd) return null;
    
    return (
      <View style={{paddingVertical: 20}} >
        <ActivityIndicator animating size="large" color='#f00' />
      </View>
    );
  };

  handelCheckBox = (id) => {
    const checkCopy = {...this.state.check}

    if (checkCopy[id]){ 
      checkCopy[id] = false; 

      const index = this.state.checkedData.indexOf(id);
      this.state.checkedData.splice(index, 1);
    } else { 
      checkCopy[id] = true; 
      this.state.checkedData.push(id);
    }
    this.setState({ check: checkCopy });
  }

  shareCodeToContacts = async () => {
    const separator = Platform.OS === 'ios' ? '&' : '?';
    let url = `sms:${this.state.serverData}${separator}body=${this.state.shareMessage}`;
    await Linking.openURL(url);
  }

  EmptyList = () => {
    return (
      //View to show when list is empty
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>{this.state.notFound}</Text>
      </View>
    );
  };
  
  renderItem = ({ item, index, separators }) => (
    <View>
      <ListItem bottomDivider containerStyle={{ borderBottomWidth: 0 }} 
        //onPress={() => Contacts.openExistingContact(contact, () => {})}
        //onDelete={() => Contacts.deleteContact(contact, () => { this.loadContacts(); })}
        onPress={() => this.handelCheckBox(item.recordID, ""+item.phoneNumbers.map(phone => phone.number.replace('+88', "").replace(/ /g, ""))) }>
        <Avatar rounded title={item.displayName[0]} source={ item.hasThumbnail && { uri: item.thumbnailPath }} containerStyle={{backgroundColor: colors[index % colors.length]}} />
        <ListItem.Content>
            <ListItem.Title style={{ color: '#333', fontWeight: 'bold', fontSize: 16 }}>{`${item.givenName} ${item.familyName}`}</ListItem.Title>
            <ListItem.Subtitle style={{ color: '#333', fontWeight: 'normal', fontSize: 16 }}>{item.phoneNumbers.length < 2 ? (item.phoneNumbers.map(phone => phone.label.toUpperCase())+": "+item.phoneNumbers.map(phone => phone.number.replace('+88', "").replace(/ /g, ""))) : ( item.phoneNumbers[0].label.toUpperCase()+": "+item.phoneNumbers[0].number.replace('+88', "").replace(/ /g, ""))}</ListItem.Subtitle>
            {/* <ListItem.Subtitle>{item.phoneNumbers[0].number}</ListItem.Subtitle> */}
        </ListItem.Content>
        <ListItem.Chevron />
      </ListItem>

      <CheckBox value={this.state.check[item.recordID]} key={item.recordID} onValueChange={() => this.handelCheckBox(item.recordID, ""+item.phoneNumbers.map(phone => phone.number.replace('+88', "").replace(/ /g, "")))} style={styles.checkbox} />
    </View>
  )

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <View style={{backgroundColor: Colors.HEADER_NAV_COLOR, paddingHorizontal: 10, paddingVertical: 15, marginBottom: 10, marginTop: -1, flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={{flexDirection: 'row'}}>
            <CheckBox value={this.state.selectAll} onValueChange={() => this.setState({selectAll: !this.state.selectAll})} />
            <Text style={{marginVertical: 5, fontWeight: 'bold', color: '#fff', fontSize: 16}}>Select All</Text>
          </View>

          {this.state.checkedData.length > 0 && (
            <Text style={{ fontWeight: 'bold', color: '#fff', marginTop: 5, fontSize: 16}}>{this.state.checkedData.length} Selected</Text>
          )}

          {this.state.checkedData.length < 1 && (
            <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 20}}>Invite Friends</Text>
          )}

          <TouchableOpacity style={{backgroundColor: '#fff', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20, opacity: (this.state.checkedData.length === 0 ? 0.7 : 1)}} disabled={this.state.checkedData.length === 0 ? true : false} onPress={this.shareCodeToContacts}>
            <Text style={{ fontWeight: 'bold', color: '#333'}}>Next</Text>
          </TouchableOpacity>
        </View>
        
        <FlatList
          data={this.state.serverData}
          enableEmptySections={true}
          //style={{ marginTop: 10 }}
          renderItem={this.renderItem}
          numColumns={1}
          keyExtractor={item => item.email}
          ItemSeparatorComponent={this.renderSeparator}
          ListHeaderComponent={this.renderHeader}
          ListHeaderComponentStyle={{color: 'red'}}
          ListFooterComponent={this.renderFooter}
          ListFooterComponentStyle={{color: 'red'}}
          // contentContainerStyle={{width: SCREEN_WIDTH, backgroundColor: '#FBFBF8', alignItems: 'center', justifyContent: 'center', marginTop: 15 }}
          ListEmptyComponent={this.EmptyList}
          refreshing={this.state.refreshing}
          onRefresh={this.handleRefresh}
          //onEndReached={this.handleLoadMore}
          onEndReachedThreshold={.5}
        />
    </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    width: SCREEN_WIDTH,
    borderTopColor: '#ddd',
    borderTopWidth: 1,
    paddingBottom: 10
  },
  paymentMethodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    width: ((SCREEN_WIDTH)/2),
    padding: 5,
    paddingLeft: 30,
    paddingRight: 30,
  },
  paymentButtonText : {
    fontSize: 18,
    color: "#333"
  },
  promoButton: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderColor: '#ccc',
    borderWidth: 1,
    marginRight: 10,
    borderRadius: 3
  },
  bottomModal: {
    justifyContent: 'flex-start',
    margin: 0,
    height: 300
  },
  schedulePickupItem: {
    borderBottomColor: "#eee", 
    borderBottomWidth: 1,
    paddingVertical: 20
  },
  footerScroll: {
    width: SCREEN_WIDTH-0,
    height: SCREEN_HEIGHT,
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginBottom: 30,
    
    elevation: 1,
    shadowColor: '#2AC062',
    shadowOpacity: 0.5,
    shadowOffset: { height: 10, width: 0},
    shadowRadius: 25
  },
  vehicleListItem: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 5,
    height: 70,
    marginBottom: 20,
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    elevation: 2,
    shadowColor: '#2AC062',
    shadowOpacity: 0.5,
    shadowOffset: { height: 0, width: 0},
    shadowRadius: 10,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  vehicleListItemActive: {
    borderColor: Colors.PRIMARY,
    borderWidth: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.TEXT_PRIMARY
  },
  cardExpire: {
    position: 'absolute',
    right: 0,
    top: 0,
    fontWeight: 'bold',
    color: 'green'
  },
  subTitle: {
    fontSize: 15,
    color: '#666'
  },
  vehicleIcon: {
    marginRight: 15
  },
  rightIcon: {
    position: 'absolute',
    right: 20,
    top: 18
  },
  checkbox: {
    position: 'absolute',
    right: 10,
    top: 20
  },
  addButton: {
    alignSelf: "center",
    backgroundColor: Colors.BUTTON_COLOR,
    width: SCREEN_WIDTH-40,
    borderRadius: 3,
    padding: 10,
    marginBottom: 15
  },
  addButtonText : {
    fontSize: 18,
    color: "#fff", 
    textAlign: 'center'
  }
});
