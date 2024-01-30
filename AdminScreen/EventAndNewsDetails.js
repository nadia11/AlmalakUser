import React, { Component } from "react";
import { StyleSheet, Text, View, Dimensions, FlatList, ActivityIndicator, SafeAreaView, ScrollView, Image } from "react-native";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Feather from "react-native-vector-icons/Feather";
import { Colors } from '../styles';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

// {route?.params?.owner ? `${route.params.owner}'s Feed` : ''}

export default class EventAndNewsDetails extends Component {
  constructor(props) {
    super(props);
 
    this.state = {
      news_picture: this.props.route.params.news_picture, 
      default_image: this.props.route.params.default_image, 
      news_title: this.props.route.params.news_title, 
      news_body: this.props.route.params.news_body, 
      news_date: this.props.route.params.news_date
    };
  }

  render() {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={{ width: SCREEN_WIDTH, flexGrow: 1, paddingBottom: 50 }}>        

          {this.state.news_picture == "" && (
            <Image source={{uri: this.state.default_image}} style={styles.news_picture_default} />
          )}

          {this.state.news_picture !== "" && (
            <Image source={{ uri: this.state.news_picture }} style={styles.news_picture} />
          )}

          <View>
              <Text style={styles.news_title}>{this.state.news_title} {this.state.news_picture_default}</Text>
              <Text style={styles.news_date}>{this.state.news_date}</Text>
              <Text style={styles.description}>{this.state.news_body}</Text>
          </View>

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
    marginTop: 20,
    padding: 10
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
    marginTop: 10
  },
  description: {
    color: Colors.TEXT_PRIMARY, 
    textAlign: 'justify',
    lineHeight: 20
  },
  news_picture: {
    height: 150,
    width: SCREEN_WIDTH, 
    resizeMode: 'cover', 
    borderRadius: 0,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd'
  },
  news_picture_default: {
    height: 100,
    width: SCREEN_WIDTH - 30, 
    resizeMode: 'contain', 
    borderRadius: 0,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  }
});
