import React, { Component, useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, FlatList, ActivityIndicator, SafeAreaView, ScrollView } from "react-native";
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

export default function CountryPickerModal(props) {

  const [animating, setAnimating] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [seed, setSeed] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [countryModal, setCountryModal] = useState(true);
  const [arrayholder, setArrayholder] = useState([]);
  const [notFound, setNotFound] = useState('No Data Found.');


  const flatListRef = React.useRef(null)
  const [letter, setLetter] = useState('')
  const indexLetter = data.map((country) => (country.name).substr(0, 1)).join('');


  const scrollTo = (letter, animated = true) => {
    const index = indexLetter.indexOf(letter);
    setLetter(letter);

    if (flatListRef.current) {
      flatListRef.current.scrollToIndex({ animated, index })
    }
  }

  const onScrollToIndexFailed = ({
    index,
    highestMeasuredFrameIndex,
    averageItemLength
  }) => {
    if (flatListRef.current) {
      flatListRef.current.scrollToEnd()
      scrollTo(letter)
    }
  }

  const uniq = (arr) => Array.from(new Set(arr))
  const lettersA = data.map((country) => (country.name).substr(0, 1).toLocaleUpperCase()).sort((l1, l2) => l1.localeCompare(l2));
  const letters = uniq(lettersA);


  const Letter = ({ letter, scrollTo }) => {  
    return (
      <TouchableOpacity testID={`letter-${letter}`} key={letter} onPress={() => scrollTo(letter)}>
        <View style={styles.letter}>
          <Text style={styles.letterText}>{letter}</Text>
        </View>
      </TouchableOpacity>
    )
  }


  React.useEffect(() => {
    if (data && data.length > 0) {
      scrollTo(letters[0], false)
    }
  }, [])




  React.useEffect(() => {
    loadCountryData();
  }, []);

  const loadCountryData = () => {
    setLoading(true);
    setData(countryList.countries);
    setArrayholder(countryList.countries);
    setLoading(false);
  }

  const renderSeparator = () => {
    return <View style={{height: 0.5, width: "85%", backgroundColor: "#ddd", marginLeft: "15%" }} />
  };
  
  const search = text => console.log(text);
  const clear = () => search.clear();

  const searchFilterFunction = text => {

    const newData = arrayholder.filter( item => {
      const itemData = `${item.name.toUpperCase()}`;
      const searchTextNew = text.toUpperCase();

      //console.warn(itemData, searchText);
      
      return itemData.indexOf(searchTextNew) > -1;
    });

    setData(newData);
    setSearchText(text);
    console.warn(searchText);
  };

  // const handleRefresh = () => {
  //   this.setState(
  //     {page: 1, seed: (seed + 1), refreshing: true},
  //     () => { this.loadCountryData() }
  //   );
  // };
 
  // const handleLoadMore = () => {
  //   this.setState(
  //     prevState => ({ page: prevState.page + 1 }),
  //     () => { this.loadCountryData() }
  //   );
  // }
  
  const renderHeader = () => {
    return (<View style={{flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 5}}>
        <MaterialIcons name="arrow-back" style={{width: 30}} size={25} color="#333" onPress={() => setCountryModal(false)} />

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
        onChangeText={text => searchFilterFunction(text)} 
        placeholder={`Search through all ${data.length} countries`} 
        placeholderTextColor="#888"
        value={searchText} 
        style={{borderRadius: 100}} 
        onClear={() => searchFilterFunction('')}
        ref={search => search = search}
        autoCorrect={false} />

        <FontAwesome5 name="times" style={{width: 30, textAlign: 'center'}} size={15} color="#333" onPress={() => setCountryModal(false)} />
    </View>)
  };

  const EmptyList = () => {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: 'center' }}>{notFound}</Text>
      </View>
    )
  };
    
  const renderItem = ({ item, index, separators }) => (
    <ListItem containerStyle={{ borderBottomWidth: 0 }} onPress={() => {props.handelSelect(item.callingCode); setCountryModal(false); }}>
        <Avatar title={item.name[0]} source={{ uri: item.flag }} rounded />
        <ListItem.Content>
            <ListItem.Title style={{ color: '#333', fontWeight: 'normal', fontSize: 16 }}>{`${item.name} (${item.callingCode})`}</ListItem.Title>
        </ListItem.Content>
        <ListItem.Chevron/>
    </ListItem>
  )

  
  if (loading) {
    return (
      <View style={styles.spinnerView}>
        <ActivityIndicator size="large" color={Colors.BUTTON_COLOR} />
        <Text>Loading Contacts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>      
      <TouchableOpacity onPress={() => setCountryModal(true)} style={styles.rejectButton}>
        <Text style={styles.rejectButtonText}>Cash Collected</Text>
      </TouchableOpacity>

      <Modal isVisible={countryModal} animationType='slide' backdropColor="#000" backdropOpacity={0.7} style={styles.bottomModal} onBackButtonPress={() => setCountryModal(false)} onBackdropPress={() => setCountryModal(false)} deviceWidth={SCREEN_WIDTH} deviceHeight={SCREEN_HEIGHT}>
        <View style={{ backgroundColor: '#fff', height: SCREEN_HEIGHT-50, width: SCREEN_WIDTH-20, borderRadius: 5, margin: 10, flexDirection: 'row', justifyContent: 'space-between' }}>
          <FlatList
            data={data}
            //style={{ marginTop: 10 }}
            onScrollToIndexFailed={onScrollToIndexFailed}
            ref={flatListRef}
            keyboardShouldPersistTaps='handled'
            automaticallyAdjustContentInsets={false}
            scrollEventThrottle={1}
            renderItem={renderItem}
            numColumns={1}
            //getItemLayout={(data, index) => ({ length: itemHeight + borderBottomWidth, offset: (itemHeight + borderBottomWidth) * index, index, })}
            keyExtractor={item => item.code}
            ItemSeparatorComponent={renderSeparator}
            ListHeaderComponent={renderHeader}
            ListHeaderComponentStyle={{color: 'red'}}
            // ListFooterComponent={renderFooter}
            // ListFooterComponentStyle={{color: 'red'}}
            // contentContainerStyle={{width: SCREEN_WIDTH, backgroundColor: '#FBFBF8', alignItems: 'center', justifyContent: 'center', marginTop: 15 }}
            enableEmptySections={true}
            ListEmptyComponent={EmptyList}
            // refreshing={refreshing}
            // onRefresh={handleRefresh}
            // onEndReached={handleLoadMore}
            // onEndReachedThreshold={.5}
            />

        <ScrollView contentContainerStyle={styles.letters} keyboardShouldPersistTaps='always'>
          {letters.map((letter) => (
            <Letter key={letter} {...{ letter, scrollTo }} />
          ))}
        </ScrollView>

        </View>
      </Modal>
    </View >  
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    width: SCREEN_WIDTH,
    borderTopColor: '#ddd',
    borderTopWidth: 1,
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
    width: 30,
    height: SCREEN_HEIGHT-30,
    backgroundColor: '#fff',
    textAlign: 'center',
    paddingTop: 50
  },
  letter: {
    height: 25,
    width: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  letterText: {
    textAlign: 'center',
  },
});
