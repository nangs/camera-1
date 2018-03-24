import React from 'react'
import {StatusBar, StyleSheet, View, TouchableHighlight} from 'react-native'
import styled from 'styled-components'
import RTC from "../rtc";
import WebRTCView from "../rtc/rtc-view";
import {Map} from 'immutable'
import _ from 'lodash'

import {
    RTCPeerConnection,
    RTCMediaStream,
    RTCIceCandidate,
    RTCSessionDescription,
    MediaStreamTrack,
} from 'react-native-webrtc';

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
const StartButtonText = styled.Text `
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

const BackButton = styled.View `
    display: flex;
    position: absolute;
    bottom: 0;
    left: 20px;
    height: 100;
    align-items: center;
    justify-content: center;
`

const BackButtonText = styled.Text `
    color: #FFF;
    font-size: 15;
`
const logError = (err) => {
    console.log("Log Error:", err)
};

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
            remoteList: new Map(),

        };

        this._onAppChange = this._onAppChange.bind(this)
        this._onStart = this._onStart.bind(this);
        this._requestUserMedia = this._requestUserMedia.bind(this);
        this._onStop = this._onStop.bind(this);
        this.createPeerConnection = this.createPeerConnection.bind(this);
        this.exchange = this.exchange.bind(this);

        this._event_start_camera = null;
        this._event_app_change = null;

    }

    _requestUserMedia() {

        rtc.getLocalStream(this.state.isFront, (stream) => {
            this.setState({
                localStreamUrl: stream.toURL(),
            });
        });
    }

    getStats() {
        const pc = pcPeers[Object.keys(pcPeers)[0]];
        if (pc.getRemoteStreams()[0] && pc.getRemoteStreams()[0].getAudioTracks()[0]) {
            const track = pc.getRemoteStreams()[0].getAudioTracks()[0];
            console.log('track', track);
            pc.getStats(track, function (report) {
                console.log('getStats report', report);
            }, logError);
        }
    }

    createPeerConnection(socketId, isOffer) {

        const {camera} = this.state;
        const {store} = this.props;
        const exchangeTopic = `camera_exchange_${camera.clientId}_${socketId}`;
        const pc = new RTCPeerConnection(configuration);
        pcPeers[socketId] = pc;

        const _this = this;
        pc.onicecandidate = function (event) {
            console.log('onicecandidate', event.candidate);
            if (event.candidate) {
                // socket.emit('exchange', {'to': socketId, 'candidate': event.candidate});


                store.broadcast(exchangeTopic, {'candidate': event.candidate});

            }
        };

        function createOffer() {
            pc.createOffer(function (desc) {
                console.log('createOffer', desc);
                pc.setLocalDescription(desc, function () {
                    console.log('setLocalDescription', pc.localDescription);
                    //socket.emit('exchange', {'to': socketId, 'sdp': pc.localDescription});

                    store.broadcast(exchangeTopic, {sdp: pc.localDescription});

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
                    this.getStats();
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
            //container.setState({info: 'One peer join!'});
            console.log("One peer joined!");

            let remoteList = _this.state.remoteList;

            //remoteList = _.setWith(remoteList, socketId, event.stream.toURL());
            remoteList = remoteList.set(socketId, event.stream.toURL());

            _this.setState({
                remoteList: remoteList
            })

            //container.setState({remoteList: remoteList});
        };
        pc.onremovestream = function (event) {
            console.log('onremovestream', event.stream);
        };

        //attach media stream
        pc.addStream(rtc.localStream());

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
                // container.receiveTextData({user: socketId, message: event.data});
            };

            dataChannel.onopen = function () {
                console.log('dataChannel.onopen');
                //container.setState({textRoomConnected: true});
            };

            dataChannel.onclose = function () {
                console.log("dataChannel.onclose");
            };

            pc.textDataChannel = dataChannel;
        }

        return pc;
    }

    exchange(data, fromId) {
        const {store} = this.props;
        const {camera} = this.state;


        const exchangeTopic = `camera_exchange_${camera.clientId}_${fromId}`;

        let pc;
        if (fromId in pcPeers) {
            pc = pcPeers[fromId];
        } else {
            pc = this.createPeerConnection(fromId, false);
        }

        if (data.sdp) {
            console.log('exchange sdp', data);
            pc.setRemoteDescription(new RTCSessionDescription(data.sdp), function () {
                if (pc.remoteDescription.type === "offer")
                    pc.createAnswer(function (desc) {
                        console.log('createAnswer', desc);
                        pc.setLocalDescription(desc, function () {
                            console.log('setLocalDescription', pc.localDescription);
                            //socket.emit('exchange', {'to': fromId, 'sdp': pc.localDescription});

                            store.broadcast(exchangeTopic, {sdp: pc.localDescription});

                        }, logError);
                    }, logError);
            }, logError);
        } else {
            console.log('exchange candidate', data);
            pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    }

    _onStart(bool = true) {

        const {store} = this.props;


        if (bool) {
            rtc.getLocalStream(this.state.isFront, (stream) => {
                console.log("Got stream source", stream);
                this.setState({
                    localStreamUrl: stream.toURL(),
                    live: bool,
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

                            // let create new peer connection when receive request view camera
                            const fromId = params.from;

                            // we got new client want to join to this camera
                            const cameraId = camera.clientId;
                            store.subscribe(`camera_exchange_${cameraId}_${fromId}`, (data) => {
                                console.log("got exchange data between you and partner", data);
                                this.exchange(data, fromId);
                            });

                            let pc = _.get(pcPeers, fromId);
                            if (!pc) {
                                this.createPeerConnection(fromId, true);
                            }


                        });

                        this.setState({
                            camera: camera
                        });

                    })
                });
            });
        } else {
            // let stop

            this.setState({
                live: false
            }, () => {
                this._onStop();
            })
        }


    }

    _onStop() {

        const {store} = this.props;

        const camera = this.state.camera;
        if (camera) {
            store.send({
                action: 'camera_stop',
                payload: camera.clientId
            });

            store.publish(`camera_stop_${camera.clientId}`, {id: camera.clientId});
        }
        if (pcPeers.length) {
            pcPeers.forEach((pc, index) => {
                pc.close();
                delete pcPeers[index];
            });
        }

    }


    /**
     * When app is change to background or active we do need catch this info.
     * @param state
     * @private
     */
    _onAppChange(state) {

        const {store} = this.props;

        switch (state) {

            case 'inactive':

                this.setState({
                    live: false,
                }, () => {
                    this._onStop();
                });

                break;

            case 'active':
                // if video in action is recoding we do need to turn resum.
                if (store.recoding) {
                    this._onStart(true);
                }

                break;


            default:

                break;
        }

    }

    componentDidMount() {

        const {store} = this.props;
        this._requestUserMedia();
        this._event_start_camera = store.event.addListener('start_camera', this._onStart);
        this._event_app_change = store.event.addListener('app_change', this._onAppChange)
    }

    componentWillUnmount() {
        const {store} = this.props;
        console.log("UnMount:", store);
        this._event_app_change.remove();
        this._event_start_camera.remove();

    }


    render() {

        const {store} = this.props;

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

                    {!this.state.live && <BackButton>
                        <TouchableHighlight onPress={() => {
                            this.props.navigation.goBack();
                        }}><BackButtonText>Cancel</BackButtonText>
                        </TouchableHighlight>
                    </BackButton>}

                    <Button isLive={this.state.live} onPress={() => {
                        if (store.recoding) {
                            store.stop_camera();
                        } else {
                            store.start_camera();
                        }

                    }}>
                        <StartButtonText isLive={this.state.live}>{this.state.live ? 'Stop' : 'Start'}</StartButtonText>
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
