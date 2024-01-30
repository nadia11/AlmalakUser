import React from 'react';
import { StyleSheet } from 'react-native';
import { Content, Item, Input } from 'native-base';
import { Grid, Col } from 'react-native-easy-grid';
import { Colors } from '../styles';


export default class OtpInputs extends React.Component {
    state={otp:[]};
    otpTextInput = [];

    componentDidMount() {
        this.otpTextInput[0]._root.focus();
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if (prevState.SMSReceived !== nextProps.SMSReceived) {
            console.log("nextProps.coordinate", nextProps.SMSReceived);
        }
    }


    renderInputs() {
        const inputs = Array(6).fill(0);
        const txt = inputs.map(
            (i, j) => <Col key={j} style={styles.txtMargin}>
                <Item regular>
                    <Input
                        style={styles.inputRadius}
                        keyboardType="numeric"
                        returnKeyType="go"
                        onChangeText={v => this.focusNext(j, v)}
                        onKeyPress={e => this.focusPrevious(e.nativeEvent.key, j)}
                        ref={ref => this.otpTextInput[j] = ref} maxLength={1}
                    />
                </Item>
            </Col>
        );
        return txt;
    }

    focusPrevious(key, index) {
        if (key === 'Backspace' && index !== 0)
            this.otpTextInput[index - 1]._root.focus();
    }

    focusNext(index, value) {
        if (index < this.otpTextInput.length - 1 && value) {
            this.otpTextInput[index + 1]._root.focus();
        }
        if (index === this.otpTextInput.length - 1) {
            this.otpTextInput[index]._root.blur();
        }
        const otp = this.state.otp;
        otp[index] = value;
        this.setState({ otp });
        this.props.getOtp(otp.join(''));
    }

    render() {
        return (
            <Content padder>
                <Grid style={styles.gridPad}>
                    {this.renderInputs()}
                </Grid>
            </Content>
        );
    }
}

const styles = StyleSheet.create({
    gridPad: {
        padding: 0
    },
    txtMargin: {
        margin: 3
    },
    inputRadius: {
        fontSize: 24,
        height: 45,
        width: 70,
        padding: 8,
        borderColor: Colors.PRIMARY,
        borderWidth: 1,
        borderRadius: 3,
        textAlign: 'center',
        backgroundColor: '#eee',
        fontWeight: 'bold'
    }
});
