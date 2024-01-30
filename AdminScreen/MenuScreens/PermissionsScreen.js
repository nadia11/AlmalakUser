import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, Image, ScrollView, Dimensions } from 'react-native';

export default function PermissionsScreen({ route }) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Permissions Screen</Text>
        <Text>
          {route?.params?.owner ? `${route.params.owner}'s Feed` : ''}
        </Text>
      </View>
    );
  }