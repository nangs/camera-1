import React from 'react'
import {StatusBar, StyleSheet} from 'react-native'
import styled from 'styled-components'
import RTC from "../rtc";
import WebRTCView from "../rtc/rtc-view";

const LiveContainer = styled.View `
    flex: 1;
    background-color: #000;
    position: relative;
    align-items: center;
    display: flex;
    flex-direction: column;
    
`
const Button = styled.TouchableHighlight `
    width: 70;
    height: 70;
    border-radius: 35;
    border-color: ${props => props.isLive ? '#e74c3c' : 'rgba(255,255,255,0.8)'};
    border-width: 2;
    justify-content: center;
`
const Text = styled.Text `
    color: ${props => props.isLive ? '#e74c3c' : "#FFF"};
    width: 70;
    font-size: 18;
    border-radius: 35;
    text-align: center;
    justify-content: center;
    font-weight: bold;
`

const Input = styled.TextInput `
    position: absolute;
    top: 0;
    font-size: 25;
    color: #FFF;
    height: 60;
    border-width: 0;
    width: 100%;
    text-align: center;
    background: rgba(0,0,0,0.8);
    display: flex;
    align-items: center;
`
const Controls = styled.View`
    position: absolute;
    bottom: 0;
    height: 100;
    width: 100%;
    flex-direction: row;
    align-items: center;
    justify-content: center;
`

const rtc = new RTC();
let pcPeers = {};

export default class Live extends React.Component {

    constructor(props) {
        super(props);

        this.state = {

            title: "",
            live: false,
            localStreamUrl: null,
            isFront: false
        };

        this._onStart = this._onStart.bind(this);
        this._requestUserMedia = this._requestUserMedia.bind(this);
        this._onStop = this._onStop.bind(this);
    }

    _requestUserMedia() {

        rtc.getLocalStream(this.state.isFront, (stream) => {
            this.setState({
                localStreamUrl: stream.toURL(),
            });
        });
    }

    _onStart() {

        const {live} = this.state;
        if (!live) {
            rtc.getLocalStream(this.state.isFront, (stream) => {
                console.log("Got stream source", stream);

                this.setState({
                    localStreamUrl: stream.toURL(),
                    live: true,
                });
            });
        } else {

            this.setState({
                live: false
            }, () => {
                this._onStop();
            });
        }

    }

    _onStop() {

    }

    componentDidMount() {
        this._requestUserMedia();
    }


    render() {

        return (
            <LiveContainer>
                <StatusBar hidden={true}/>
                <WebRTCView customStyle={styles.localStreamView} streamURL={this.state.localStreamUrl}/>
                {!this.state.live && <Input
                    placeholderTextColor={"#FFF"}
                    placeholder={"What is your camera title?"}
                    onChangeText={(text) => {
                        this.setState({
                            title: text,
                        })
                    }}
                    value={this.state.title}/>
                }
                <Controls>
                    <Button isLive={this.state.live} onPress={this._onStart}>
                        <Text isLive={this.state.live}>{this.state.live ? 'Stop' : 'Start'}</Text>
                    </Button>
                </Controls>
            </LiveContainer>
        )
    }
}

const styles = StyleSheet.create({

    localStreamView: {
        backgroundColor: "#000",
        flex: 1,
        flexGrow:1,
        width: '100%',
        height: '100%',
        ...StyleSheet.absoluteFillObject,
    }
})
