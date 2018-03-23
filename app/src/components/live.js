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
const configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};

export default class Live extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            title: "",
            live: false,
            localStreamUrl: null,
            isFront: false,
            camera: null,

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

    createPeerConnection(socketId, isOffer) {

        const pc = new RTCPeerConnection(configuration);
        pcPeers[socketId] = pc;

        pc.onicecandidate = function (event) {
            console.log('onicecandidate', event.candidate);
            if (event.candidate) {
                socket.emit('exchange', {'to': socketId, 'candidate': event.candidate});
            }
        };

        function createOffer() {
            pc.createOffer(function (desc) {
                console.log('createOffer', desc);
                pc.setLocalDescription(desc, function () {
                    console.log('setLocalDescription', pc.localDescription);
                    socket.emit('exchange', {'to': socketId, 'sdp': pc.localDescription});
                }, logError);
            }, logError);
        }

        pc.onnegotiationneeded = function () {
            console.log('onnegotiationneeded');
            if (isOffer) {
                createOffer();
            }
        }

        pc.oniceconnectionstatechange = function (event) {
            console.log('oniceconnectionstatechange', event.target.iceConnectionState);
            if (event.target.iceConnectionState === 'completed') {
                setTimeout(() => {
                    getStats();
                }, 1000);
            }
            if (event.target.iceConnectionState === 'connected') {
                createDataChannel();
            }
        };
        pc.onsignalingstatechange = function (event) {
            console.log('onsignalingstatechange', event.target.signalingState);
        };

        pc.onaddstream = function (event) {
            console.log('onaddstream', event.stream);
            container.setState({info: 'One peer join!'});

            const remoteList = container.state.remoteList;
            remoteList[socketId] = event.stream.toURL();
            container.setState({remoteList: remoteList});
        };
        pc.onremovestream = function (event) {
            console.log('onremovestream', event.stream);
        };

        pc.addStream(localStream);

        function createDataChannel() {
            if (pc.textDataChannel) {
                return;
            }
            const dataChannel = pc.createDataChannel("text");

            dataChannel.onerror = function (error) {
                console.log("dataChannel.onerror", error);
            };

            dataChannel.onmessage = function (event) {
                console.log("dataChannel.onmessage:", event.data);
                container.receiveTextData({user: socketId, message: event.data});
            };

            dataChannel.onopen = function () {
                console.log('dataChannel.onopen');
                container.setState({textRoomConnected: true});
            };

            dataChannel.onclose = function () {
                console.log("dataChannel.onclose");
            };

            pc.textDataChannel = dataChannel;
        }

        return pc;
    }

    _onStart() {

        const {store} = this.props;

        const {live} = this.state;
        if (!live) {
            rtc.getLocalStream(this.state.isFront, (stream) => {
                console.log("Got stream source", stream);

                console.log(this.state.title);

                this.setState({
                    localStreamUrl: stream.toURL(),
                    live: true,
                }, () => {
                    // ready to publish
                    store.send({
                        action: 'camera_ready',
                        payload: {
                            name: this.state.title ? this.state.title : 'My Camera',
                        }
                    }, (camera) => {
                        console.log("Your camera is ready", camera);

                        // let publish to camera channel
                        store.publish('camera_ready', camera);

                        // listen for someone join to this camera

                        store.subscribe(`camera_join_${camera.clientId}`, (params) => {

                            console.log("Somone want to see your camera", params);

                            // we got new client want to join to this camera
                            const cameraId = camera.clientId;
                            store.subscribe(`camera_exchange_data_${cameraId}_${params.from}`, (data) => {
                                console.log("got exchange data between you and partner", data);
                            });


                        });

                        this.setState({
                            camera: camera
                        });

                    })
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

        const {store} = this.props;

        const camera = this.state.camera;
        if (camera) {
            store.publish(`camera_stop_${camera.clientId}`);
        }

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
        flexGrow: 1,
        width: '100%',
        height: '100%',
        ...StyleSheet.absoluteFillObject,
    }
})
