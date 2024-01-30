import React, { Component } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, FlatList, ActivityIndicator, SafeAreaView, PermissionsAndroid, Linking } from "react-native";
import CheckBox from '@react-native-community/checkbox';
import { Colors } from '../../styles';
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Modal from 'react-native-modal';
import Feather from "react-native-vector-icons/Feather";
import { ListItem, SearchBar, Avatar } from "react-native-elements";
import Contacts from 'react-native-contacts';


const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

// {route?.params?.owner ? `${route.params.owner}'s Feed` : ''}

colors = ['#0197A6', '#FC5823', '#3E51B7', '#9C28AF', '#109D58', '#683BB2', '#EB1E63', '#DC4439', '#689F37', '#757575'];


export default class InviteFriend extends Component {
  constructor(props) {
    super(props);
 
    this.state = {
      loading: false,
      contacts: [],
      page: 1,
      seed: 1,
      error: null,
      refreshing: false,
      notFound: 'No Data Found.',
      check: {},
      checkedContact: [],
      checkedContactNumber: [],
      searchText: '',
      searchPlaceholder: "",
      //mobile: this.props.route.params.mobile,
      //invitationCode: this.props.route.params.invitationCode,
      //invitationUrl: this.props.route.params.invitationUrl,
      shareMessage: this.props.route.params.shareMessage,
      selectAll: false
    };
    this.arrayholder = [];
  }

  componentDidMount() {
    if (Platform.OS === 'android') {
        PermissionsAndroid.request( PermissionsAndroid.PERMISSIONS.READ_CONTACTS, {
            title: 'Contacts',
            message: ' This app would like to see your contacts'
        })
        .then(() => {
          this.loadContacts();
        });
    } 
    else if(Platform.OS === 'ios') {
      this.loadContacts();
    }
  }

  loadContacts = () => {
    this.setState({ loading: true });

    // Contacts.checkPermission().then(permission => {
    //   // Contacts.PERMISSION_AUTHORIZED || Contacts.PERMISSION_UNDEFINED || Contacts.PERMISSION_DENIED
    //   if (permission === 'undefined') {
    //     Contacts.requestPermission().then(permission => { alert(1); });
    //   }
    //   if (permission === 'authorized') { alert(2); }
    //   if (permission === 'denied') { alert(3); }
    // });

    Contacts.getAll().then(contacts => {
      contacts.sort((a, b) => a.givenName.toLowerCase() > b.givenName.toLowerCase());
      
      this.setState({ contacts: contacts, loading: false });
      //console.log(contacts[21].phoneNumbers[0].number);
    });

    Contacts.getCount().then(count => {
      this.setState({ searchPlaceholder: `Search through all ${count} contacts` });
    });

//     Contacts.getAll((err, contacts) => {
//       contacts.sort((a, b) => a.givenName.toLowerCase() > b.givenName.toLowerCase());
//       if (err === "denied") {
//         console.warn("Permission to access contacts was denied");
//       } 
//       else {
//         this.setState({ contacts: contacts, loading: false });
//         //console.log(contacts[21].phoneNumbers[0].number);
//       }
//     });
  }

  renderSeparator = () => {
    return <View style={{height: 0.5, width: "85%", backgroundColor: "#ddd", marginLeft: "15%" }} />
  };
  
  search = text => console.log(text);
  clear = () => this.search.clear();

  searchFilterFunction = text => {
    const phoneNumberRegex = /\b[\+]?[(]?[0-9]{2,6}[)]?[-\s\.]?[-\s\/\.0-9]{3,15}\b/m;
    const emailAddressRegex = /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i;

    if (text === "" || text === null) {
      this.loadContacts();
    } else if (phoneNumberRegex.test(text)) {
      Contacts.getContactsByPhoneNumber(text, (err, contacts) => {
        contacts.sort((a, b) => a.givenName.toLowerCase() > b.givenName.toLowerCase());
        this.setState({ contacts: contacts, searchText: text });
      });
    } else if (emailAddressRegex.test(text)) {
      Contacts.getContactsByEmailAddress(text, (err, contacts) => {
        this.setState({ contacts: contacts, searchText: text });
      });
    } else {
      Contacts.getContactsMatchingString(text, (err, contacts) => {
        contacts.sort((a, b) => a.givenName.toLowerCase() > b.givenName.toLowerCase());
        this.setState({ contacts: contacts, searchText: text });
      });
    }
    this.setState({ searchText: '' });
  };

  // openContact = (contact) => {
  //   //console.log(JSON.stringify(contact));
  //   Contacts.openExistingContact(contact, () => {})
  // };
  
  renderHeader = () => {
    return <SearchBar 
    round lightTheme 
    clearIcon={{ size: 20 }}
    searchIcon={{ size: 24 }}
    //showLoading={true}
    //loadingProps={{ backgroundColor: 'green' }}
    containerStyle={{ backgroundColor: "#fff", height: 50, paddingTop: 0, borderTopWidth: 0, borderBottomWidth: 0 }}
    inputContainerStyle={{ backgroundColor: "#eee", borderRadius: 50, height: 50 }}
    inputStyle={{ color: "#333", borderColor: 'transparent' }}
    leftIconContainerStyle={{ backgroundColor: "transparent", marginLeft: 15, paddingRight: 0 }}
    rightIconContainerStyle={{ backgroundColor: 'transparent' }}
    onChangeText={text => this.searchFilterFunction(text)} 
    placeholder={this.state.searchPlaceholder} 
    placeholderTextColor="#888"
    value={this.state.searchText} 
    style={{borderRadius: 100}} 
    onClear={ () => this.searchFilterFunction('')}
    ref={search => this.search = search}
    autoCorrect={false} />;
  };

  selectAllContact = () => {
    this.setState({ selectAll: !this.state.selectAll });
    const allContactArray = [];
    
    Contacts.getAll((err, contacts) => {
      contacts.sort((a, b) => a.givenName.toLowerCase() > b.givenName.toLowerCase());    
      contacts.map(item => {
        let a = item.phoneNumbers.map(phone => phone.number.replace('+88', "").replace(/ /g, ""));
        allContactArray.push(a[0]);
      });
      //console.log(allContactArray)
    });
  }

  handelCheckBox = (id, phone_number) => {
    
    const checkCopy = {...this.state.check}
    //const pointCoords = [...this.state.checkedContact, id];

    if (checkCopy[id]){
      checkCopy[id] = false;

      const index = this.state.checkedContact.indexOf(id);
      this.state.checkedContact.splice(index, 1);
      this.state.checkedContactNumber.splice(index, 1);
    } else { 
      checkCopy[id] = true; 
      this.state.checkedContact.push(id);
      this.state.checkedContactNumber.push(phone_number);
    }
    this.setState({ check: checkCopy });
    //console.log(this.state.checkedContactNumber);
  }

  shareCodeToContacts = async () => {
    const separator = Platform.OS === 'ios' ? '&' : '?';
    let url = `sms:${this.state.checkedContactNumber}${separator}body=${this.state.shareMessage}`;
    await Linking.openURL(url);
  }

  EmptyList = () => {
    return (
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
    if (this.state.loading) {
      return (
        <View style={styles.spinnerView}>
          <ActivityIndicator size="large" color={Colors.BUTTON_COLOR} />
          <Text>Loading Contacts...</Text>
        </View>
      );
    }

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={{flexDirection: 'row'}}>
            <CheckBox value={this.state.selectAll} onValueChange={this.selectAllContact} />
            <Text style={styles.selectAll} onPress={this.selectAllContact}>Select All</Text>
          </View>

          {this.state.checkedContact.length > 0 && (
            <Text style={{ fontWeight: 'bold', color: '#fff', marginTop: 5, fontSize: 16}}>{this.state.checkedContact.length} Selected</Text>
          )}

          {this.state.checkedContact.length < 1 && (
            <Text style={{ fontWeight: 'bold', color: '#fff', fontSize: 20}}>Invite Friends</Text>
          )}

          <TouchableOpacity style={{backgroundColor: '#fff', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 20, opacity: (this.state.checkedContact.length === 0 ? 0.7 : 1)}} disabled={this.state.checkedContact.length === 0 ? true : false} onPress={this.shareCodeToContacts}>
            <Text style={{ fontWeight: 'bold', color: '#333'}}>Next</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={this.state.contacts}
          //style={{ marginTop: 10 }}
          renderItem={this.renderItem}
          numColumns={1}
          keyExtractor={item => item.recordID}
          ItemSeparatorComponent={this.renderSeparator}
          ListHeaderComponent={this.renderHeader}
          ListHeaderComponentStyle={{color: 'red'}}
          //ListFooterComponent={this.renderFooter}
          //ListFooterComponentStyle={{color: 'red'}}
          // contentContainerStyle={{width: SCREEN_WIDTH, backgroundColor: '#FBFBF8', alignItems: 'center', justifyContent: 'center', marginTop: 15 }}
          enableEmptySections={true}
          ListEmptyComponent={this.EmptyList}
          //refreshing={this.state.refreshing}
          //onRefresh={this.handleRefresh}
          //onEndReached={this.handleLoadMore}
          //onEndReachedThreshold={.5}
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
  spinnerView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  header: {
    backgroundColor: Colors.HEADER_NAV_COLOR,
    paddingHorizontal: 10, 
    paddingVertical: 15, 
    marginBottom: 10, 
    marginTop: -1,
    flexDirection: 'row', 
    justifyContent: 'space-between'
  },
  selectAll: {
    marginVertical: 5, 
    fontWeight: 'bold', 
    color: '#fff', 
    fontSize: 16
  },
  checkbox: {
    position: 'absolute',
    right: 10,
    top: 20
  }
});
