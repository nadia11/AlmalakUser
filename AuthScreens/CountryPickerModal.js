import React, { Component } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, FlatList, Image, ScrollView } from "react-native";
import { Colors } from '../styles';
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Modal from 'react-native-modal';
import { ListItem, SearchBar, Avatar } from "react-native-elements";

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

const regions = ["Asia","Europe","Africa","Oceania","Americas","Antarctic"];
const subregions = ["Southern Asia","Southern Europe","Northern Africa","Polynesia","Middle Africa","Caribbean","","South America","Western Asia","Australia and New Zealand","Western Europe","Eastern Europe","Central America","Western Africa","North America","Southern Africa","Eastern Africa","South-Eastern Asia","Eastern Asia","Northern Europe","Melanesia","Micronesia","Central Asia","Central Europe"];
import countryList from './CountriesArray.json';

// const [countryCode, setCountryCode] = useState('FR')
// const [country, setCountry] = useState(null)
// const [alphaFilter, setAlphaFilter] = useState(false)
// const [callingCode, setCallingCode] = useState(false)

export default class CountryPickerModal extends Component {
  constructor(props) {
    super(props);
 
    this.state = {
      loading: false,
      data: [],
      page: 1,
      seed: 1,
      error: null,
      refreshing: false,
      notFound: 'No Data Found.',
      searchText: '',
      countryModal: false,
      flag: '',
      initialLetter: ''
    };
    this.arrayholder = [];
    this.flatListRef = React.createRef(null);
  }

  componentDidMount() {
    this.loadCountryData();
  }

  loadCountryData = () => {
      this.setState({ loading: true });
      
      this.setState({ 
        data: countryList.countries,
        loading: false
     },
     function() {
        this.arrayholder = countryList.countries;
    });
  }

  renderSeparator = () => {
    return <View style={{height: 0.5, width: "85%", backgroundColor: "#ddd", marginLeft: "15%" }} />
  };
  
  search = text => console.log(text);
  clear = () => this.search.clear();


  searchFilterFunction = text => {
    const newData = this.arrayholder.filter( item => {
      const itemData = `${item.name.toUpperCase()}`;
      const searchText = text.toUpperCase();

      //console.warn(itemData, searchText);
      return itemData.indexOf(searchText) > -1;
    });
    
    this.setState({ data: newData, searchText: text });
  };

  handleRefresh = () => {
    this.setState(
      {page: 1, seed: (this.state.seed + 1), refreshing: true},
      () => { this.loadCountryData() }
    );
  };
 
  handleLoadMore = () => {
    this.setState(
      prevState => ({ page: prevState.page + 1 }),
      //{ page: this.state.page + 1 },
      () => { this.loadCountryData() }
    );
  }


  renderHeader = () => {
    return (<View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 5}}>
        <MaterialIcons name="arrow-back" style={{width: 30}} size={25} color="#333" onPress={() => this.setState({ countryModal: false })} />

        <SearchBar 
        round lightTheme 
        clearIcon={{ size: 20 }}
        searchIcon={{ size: 24 }}
        // showLoading={true}
        // loadingProps={{ backgroundColor: 'green' }}
        containerStyle={{ backgroundColor: "#eee", height: 40, width: SCREEN_WIDTH-90, padding: 0, borderTopWidth: 0, borderBottomWidth: 0, borderRadius: 5 }}
        inputContainerStyle={{ backgroundColor: "#eee", borderRadius: 5, height: 40, padding: 0 }}
        inputStyle={{ color: "#333", borderColor: 'transparent' }}
        leftIconContainerStyle={{ backgroundColor: "transparent", marginLeft: 10, paddingRight: 0 }}
        rightIconContainerStyle={{ backgroundColor: 'transparent' }}
        onChangeText={text => this.searchFilterFunction(text)} 
        placeholder={`Search through all ${this.state.data.length} countries`} 
        placeholderTextColor="#888"
        value={this.state.searchText} 
        style={{borderRadius: 100}} 
        onClear={ () => this.searchFilterFunction('')}
        ref={search => this.search = search}
        autoCorrect={false} />

        <FontAwesome5 name="times" style={{width: 30, textAlign: 'center'}} size={15} color="#333" onPress={() => this.setState({ countryModal: false })} />
    </View>)
  };

  EmptyList = () => {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>{this.state.notFound}</Text>
      </View>
    )
  };
    
  renderItem = ({ item, index, separators }) => (
    <ListItem containerStyle={{ borderBottomWidth: 0 }} onPress={() => {this.props.handelSelect(item.callingCode); this.setState({ flag: item.flag, countryModal: false }); }}>
        <Avatar title={item.code} source={{ uri: item.flag }} containerStyle={{width: 40, height: 25}} />
        <ListItem.Content>
            <ListItem.Title style={{ color: '#333', fontWeight: 'normal', fontSize: 16 }}>{`${item.name} (${item.callingCode})`}</ListItem.Title>
        </ListItem.Content>
    </ListItem>
  )

  render() {
    const indexLetter = this.state.data.map((country) => (country.name).substr(0, 1)).join('');

    const scrollTo = (letter, animated = true) => {
      const index = indexLetter.indexOf(letter);
      this.setState({initialLetter: letter});
      
      if (this.flatListRef.current) {
        this.flatListRef.current.scrollToIndex({ animated, index })
      }
    }
  
    const onScrollToIndexFailed = ({index, highestMeasuredFrameIndex, averageItemLength }) => {
      if (this.flatListRef.current) {
        this.flatListRef.current.scrollToEnd();
        //scrollTo(this.state.initialLetter);
      }
    }
  
    const uniq = (arr) => Array.from(new Set(arr))
    const lettersA = this.state.data.map((country) => (country.name).substr(0, 1).toLocaleUpperCase()).sort((l1, l2) => l1.localeCompare(l2));
    const uniqueLetters = uniq(lettersA);
    // if (this.state.data && this.state.data.length > 0) {
    //   scrollTo(uniqueLetters[0], false);
    // }

    // if (this.state.loading) {
    //   return (
    //     <View style={styles.spinnerView}>
    //       <ActivityIndicator size="large" color={Colors.BUTTON_COLOR} />
    //       <Text>Loading Contacts...</Text>
    //     </View>
    //   );
    // }

    return (
      <View style={styles.container}>
        <TouchableOpacity onPress={() => this.setState({ countryModal: true })} style={styles.rejectButton}>
          {this.props.initialCode === '+880' && (
            <Image style={styles.flag} source={require('../assets/bangladesh-flag.png')} />
          )}

          {this.props.initialCode !== '+880' && (
            <Image style={styles.flag} source={{uri: this.state.flag}} />
          )}
          <Text style={{fontSize: 18}}>{this.props.initialCode}</Text>
        </TouchableOpacity>

        <Modal isVisible={this.state.countryModal} animationType='slide' backdropColor="#000" backdropOpacity={0.7} style={styles.bottomModal} onBackButtonPress={() => this.setState({ countryModal: false })} onBackdropPress={() => this.setState({ countryModal: false })} deviceWidth={SCREEN_WIDTH} deviceHeight={SCREEN_HEIGHT}>
          <View style={{ backgroundColor: '#fff', height: SCREEN_HEIGHT, width: SCREEN_WIDTH, borderRadius: 0, margin: 0, flexDirection: 'row', justifyContent: 'space-between' }}>
            <FlatList
              data={this.state.data}
              style={{ marginBottom: 20 }}
              onScrollToIndexFailed={onScrollToIndexFailed}
              ref={this.flatListRef}
              keyboardShouldPersistTaps='handled'
              automaticallyAdjustContentInsets={false}
              scrollEventThrottle={1}  
              renderItem={this.renderItem}
              numColumns={1}
              //getItemLayout={(data, index) => ({ length: itemHeight + borderBottomWidth, offset: (itemHeight + borderBottomWidth) * index, index, })}
              keyExtractor={item => item.code}
              ItemSeparatorComponent={this.renderSeparator}
              ListHeaderComponent={this.renderHeader}
              ListHeaderComponentStyle={{color: 'red'}}
              // ListFooterComponent={this.renderFooter}
              // ListFooterComponentStyle={{color: 'red'}}
              // contentContainerStyle={{width: SCREEN_WIDTH, backgroundColor: '#FBFBF8', alignItems: 'center', justifyContent: 'center', marginTop: 15 }}
              enableEmptySections={true}
              ListEmptyComponent={this.EmptyList}
              // refreshing={this.state.refreshing}
              // onRefresh={this.handleRefresh}
              // onEndReached={this.handleLoadMore}
              // onEndReachedThreshold={.5}
              />

            <ScrollView contentContainerStyle={styles.letters} keyboardShouldPersistTaps='always'>
              {uniqueLetters.map((letter) => (
                <TouchableOpacity testID={`letter-${letter}`} style={styles.letter} key={letter} onPress={() => scrollTo(letter)}>
                  <Text style={this.state.initialLetter == letter ? {color: 'red'} : ""}>{letter}</Text>
                </TouchableOpacity> 
              ))}
            </ScrollView>

          </View>
        </Modal>
      </View >  
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    width: SCREEN_WIDTH,
    // paddingVertical: 10
  },
  spinnerView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  bottomModal: {
    justifyContent: 'flex-start',
    margin: 0
  },
  letters: {
    width: 25,
    height: SCREEN_HEIGHT-10,
    paddingTop: 50
  },
  letter: {
    height: 25,
    width: 25,
  },
  letterText: {
    fontSize: 16,
    textAlign: 'center'
  },
  rejectButton: {
    flexDirection: 'row',
    flexWrap: 'nowrap'
  },
  flag: {
    height: 24,
    width: 24,
    resizeMode: 'contain'
  },
});
