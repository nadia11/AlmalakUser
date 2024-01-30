import React, { Component } from "react";
import { StyleSheet, Text, View, TouchableOpacity, Dimensions, Alert } from "react-native";
import { Colors } from '../styles';
import styled, { css } from 'styled-components';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function FareBreakdown(props) {
    return (
      <View style={styles.container}>
          <Text style={{color: '#666', fontSize: 16, lineHeight: 25, marginBottom: 30, textAlign: 'justify'}}>Your fare will be the price presented before the trip or based on the rates below and other applicable surcharge and adjustments.</Text>
          <ListItemView><ListItemText>Base fare</ListItemText><ListItemText>{props.route.params?.baseFare}</ListItemText></ListItemView>
          <ListItemView><ListItemText>Minimum fare</ListItemText><ListItemText>{props.route.params?.minimumFare}</ListItemText></ListItemView>
          <ListItemView><ListItemText>+ Per Minute</ListItemText><ListItemText>{props.route.params?.perMinute}</ListItemText></ListItemView>
          <ListItemView><ListItemText>+ Per Kilometer</ListItemText><ListItemText>{props.route.params?.perKilometer}</ListItemText></ListItemView>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'center',
    width: SCREEN_WIDTH,
    padding: 20
  }
});


const ListItemView = styled.View`
  background: #fff;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
`;

const ListItemText = styled.Text`
  margin: 3px 10px;
  font-size: 16px;
  color: #000;
`;