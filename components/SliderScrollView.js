import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, ScrollView, Animated, Platform, ActivityIndicator } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { Colors } from '../styles';

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default class Slider extends Component {
    scrollRef = React.createRef();

    constructor(props) {
        super(props);
        
        this.state= {
            selectedIndex: 0,
            loading: false
        }
    }

    componentDidMount(){
        setInterval( () => {
            this.setState(prev => ({
                selectedIndex: prev.selectedIndex === this.props.images.length - 1 ? 0 : prev.selectedIndex + 1 
            }),
            () => { 
                this.scrollRef.current.scrollTo({ y: 0, x: SCREEN_WIDTH * this.state.selectedIndex, animated: true })
            })
        }, 3000);
    }
  
    onScroll = ({ nativeEvent }) => {
        const slider = Math.ceil(nativeEvent.contentOffset.x / nativeEvent.layoutMeasurement.width);
        if(slider !== this.state.selectedIndex ) {
            this.setState({ selectedIndex: slider });
        }
    }

    selectedIndex = event => {
        //get current position of the scrollview
        const contentOffset = event.nativeEvent.contentOffset.x;

        //width of the viewsize
        const viewsize = event.nativeEvent.layoutMeasurement.width;

        const selectedIndex = Math.floor(contentOffset / viewsize);
        this.setState({ selectedIndex });
    }

    render() {
        const { sliderHeight, dotPosition } = this.props;
        const { selectedIndex } = this.state;

        return (
            <View style={[styles.container, {height: sliderHeight ? sliderHeight : 300}]}>
                {this.state.loading && (
                    <View style={{justifyContent: 'center', alignItems: 'center', width: SCREEN_WIDTH, height: sliderHeight}}>
                        <ActivityIndicator animating={true} color={Colors.BUTTON_COLOR} size="large" />
                        <Text style={{fontSize: 18}}>Loading, please wait...</Text>
                    </View>
                )}

                {this.props.images.length < 1 && (
                    <View style={{justifyContent: 'center', alignItems: 'center', width: SCREEN_WIDTH, height: sliderHeight}}>
                        <Text style={{fontSize: 18}}>No Image</Text>
                    </View>
                )}

                <Animated.ScrollView horizontal pagingEnabled 
                scrollEnabled 
                //onMomentumScrollEnd={this.selectedIndex} 
                onScroll={this.onScroll} scrollEventThrottle={16}
                showsHorizontalScrollIndicator={false} 
                snapToAlignment="center" decelerationRate="fast"
                bounces={false} snapToInterval={SCREEN_WIDTH}
                style={{width: SCREEN_WIDTH, height: sliderHeight}}
                ref={this.scrollRef}>

                    {this.props.images.map((image, index) => (
                        this.props.fromUrl ? (
                            <Image key={image} source={{uri: image}} style={{ width: SCREEN_WIDTH, height: sliderHeight, resizeMode: 'stretch' }} />
                        ) : (
                            <Image key={image} source={image} style={{ width: SCREEN_WIDTH, height: sliderHeight, resizeMode: 'stretch' }} />
                        )
                    ))}
                </Animated.ScrollView>

                <View style={dotPosition === "bottom" ? styles.paginationOutside : styles.paginationInside}>
                    {this.props.images.map((image, i) => (<View key={image} style={[styles.paginTextOutside, (i === selectedIndex ? styles.paginActiveTextOutside : styles.paginActiveTextInside)]}></View>))}
                </View>
                {/* <TouchableOpacity onPress={() => this.scrollRef.current.scrollTo({ y: 0, x: SCREEN_WIDTH * (this.state.selectedIndex-1), animated: true })} style={{backgroundColor: 'red', height: 20, width: 50}}><Text>Back</Text></TouchableOpacity> */}
                {/* <TouchableOpacity onPress={() => this.scrollRef.current.scrollTo({ y: 0, x: SCREEN_WIDTH * (this.state.selectedIndex+1), animated: true })} style={{backgroundColor: 'red', height: 20, width: 50}}><Text>Next</Text></TouchableOpacity> */}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        marginTop: 0, 
        marginBottom: 50,
        borderColor: '#fff',
        borderWidth: 1,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0.8, height: 0.8 },
        shadowOpacity: 0.5,
        shadowRadius: 10
    },
    paginationInside: {
        position: 'absolute', 
        bottom: 15,
        height: 10,
        width: '100%',
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginTextInside: {
        // fontSize: (SCREEN_WIDTH / 30), 
        // color: '#888', 
        // margin: 3 
        width: 6,
        height: 6,
        borderRadius: 3,
        margin: 5,
        backgroundColor: '#fff'
    },
    paginationOutside: {
        position: 'absolute', 
        bottom: -20,
        height: 10,
        width: '100%',
        display: 'flex', 
        flexDirection: 'row', 
        justifyContent: 'center',
        alignItems: 'center',
    },
    paginActiveTextInside: {
        fontSize: (SCREEN_WIDTH / 30), 
        color: '#fff', 
        margin: 3 
    },
    paginTextOutside: {
        // fontSize: (SCREEN_WIDTH / 30), 
        // color: '#888', 
        // margin: 3 
        width: 10,
        height: 10,
        borderRadius: 5,
        margin: 5,
        backgroundColor: '#aaa'
    },
    paginActiveTextOutside: {
        fontSize: (SCREEN_WIDTH / 30), 
        margin: 3,
        width: 30,
        backgroundColor: Colors.BUTTON_COLOR
    },
});