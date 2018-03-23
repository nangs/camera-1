import React from 'react'
import styled from 'styled-components'
import {connect} from "react-redux";
import {bindActionCreators} from "redux";
import RTC from "../../rtc";

const Wrapper = styled.div `
    
`

const Video = styled.div `
    width: 320px;
    height: 240px;
    border: 1px solid rgba(0,0, 0, 0.1);
    cursor: pointer;
    &:hover{
        opacity: 0.7;
    }
    video {
        max-width: 100%;
    }
   
`
const Title = styled.h2 `
    font-size: 17px;
`

const logError = (err) => {
    console.log("Log Error:", err);
};

let RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection || window.msRTCPeerConnection;
let RTCSessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.webkitRTCSessionDescription || window.msRTCSessionDescription;
const configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};
const rtc = new RTC();
let pcPeers = {};
let localStream;

class CameraItem extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            streamUrl: null,
            playing: false
        };

        this._onCall = this._onCall.bind(this);
        this.createPeerConnection = this.createPeerConnection.bind(this);
        this.exchange = this.exchange.bind(this);
    }


    createPeerConnection(id, isOffer) {

        const {camera, app} = this.props;

        const socketId = app.clientId;

        const cameraRef = this.cameraRef;

        const exchangeTopic = `camera_exchange_${camera.clientId}_${socketId}`;

        let pc = new RTCPeerConnection(configuration);

        pcPeers[id] = pc;

        const _this = this;

        pc.onicecandidate = function (event) {
            console.log('onicecandidate', event);
            if (event.candidate) {
                //socket.emit('exchange', {'to': socketId, 'candidate': event.candidate});

                _this.props.broadcast(exchangeTopic, {candidate: event.candidate});
            }
        };

        function createOffer() {
            pc.createOffer(function (desc) {
                console.log('createOffer', desc);
                pc.setLocalDescription(desc, function () {
                    console.log('setLocalDescription', pc.localDescription);
                    // socket.emit('exchange', {'to': socketId, 'sdp': pc.localDescription});

                    _this.props.broadcast(exchangeTopic, {sdp: pc.localDescription});

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
            console.log('oniceconnectionstatechange', event);
            if (event.target.iceConnectionState === 'connected') {
                createDataChannel();
            }
        };
        pc.onsignalingstatechange = function (event) {
            console.log('onsignalingstatechange', event);
        };
        pc.onaddstream = function (event) {
            console.log('onaddstream', event);

            /*let element = document.createElement('video');
            element.id = "remoteView" + socketId;
            element.autoplay = 'autoplay';
            element.src = URL.createObjectURL(event.stream);
            remoteViewContainer.appendChild(element);*/

            cameraRef.src = URL.createObjectURL(event.stream);
        };

        // for this project we dont need add local stream because we are only watching camera. no need send the video
        pc.addStream(localStream);


        function createDataChannel() {
            if (pc.textDataChannel) {
                return;
            }
            let dataChannel = pc.createDataChannel("text");
            dataChannel.onerror = function (error) {
                console.log("dataChannel.onerror", error);
            };
            dataChannel.onmessage = function (event) {
                console.log("dataChannel.onmessage:", event.data);

            };
            dataChannel.onopen = function () {
                console.log('dataChannel.onopen');

            };
            dataChannel.onclose = function () {
                console.log("dataChannel.onclose");
            };
            pc.textDataChannel = dataChannel;
        }

        return pc;
    }

    exchange(data) {
        const {camera, app} = this.props;
        const socketId = app.clientId;

        console.log("Got exchange data ", data);
        const _this = this;
        const exchangeTopic = `camera_exchange_${camera.clientId}_${socketId}`;
        const fromId = camera.id;
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

                            _this.props.broadcast(exchangeTopic, {sdp: pc.localDescription});

                        }, logError);
                    }, logError);
            }, logError);
        } else {
            console.log('exchange candidate', data);
            pc.addIceCandidate(new RTCIceCandidate(data.candidate));
        }
    }


    _onCall(camera) {

        if (!this.state.playing) {
            rtc.getUserMedia((err, stream) => {

                console.log("Stream", err, stream);

                localStream = stream;

                const streamURL = window.URL.createObjectURL(stream);


                this.props.call(camera, (data) => {
                    console.log("Got data exchange now !!!", data);
                    this.exchange(data);
                });

                this.setState({
                    playing: true,
                    streamUrl: streamURL
                });
            });

        }

    }


    render() {
        const {camera} = this.props;
        return (
            <Wrapper>
                <Video onClick={() => {
                    this._onCall(camera)
                }}>
                    <video autoPlay={true} ref={(ref) => this.cameraRef = ref} src={null}/>
                </Video>
                <Title>{camera.name}</Title>
            </Wrapper>
        )


    }
}

const mapStateToProps = (state, props) => ({
    app: state.app,
    model: state.model,
});

const mapDispatchToProps = dispatch => bindActionCreators({
    broadcast: (topic, message, cb = null) => {
        return (dispatch, getState, {service, pubSub}) => {
            pubSub.broadcast(topic, message, cb);
        }
    },
    publish: (topic, message, cb = null) => {
        return (dispatch, getState, {service, pubSub}) => {
            pubSub.publish(topic, message, cb);
        }
    },
    subscribe: (topic, cb = null) => {
        return (dispatch, getState, {service, pubSub}) => {
            pubSub.subscribe(topic, cb);
        }
    },
    call: (camera, cb = () => {
    }) => {
        return (dispatch, getState, {service, pubSub}) => {

            const mySocketId = pubSub.id();
            pubSub.broadcast(`camera_join_${camera.id}`, {from: pubSub.id()});


            const exchangeTopic = `camera_exchange_${camera.id}_${mySocketId}`;

            pubSub.unsubscribe(exchangeTopic, null);

            pubSub.subscribe(exchangeTopic, (data) => {
                console.log("Receive exchange from topic:", exchangeTopic, data);
                cb(data);
            });
        }
    },
}, dispatch);


export default connect(
    mapStateToProps,
    mapDispatchToProps
)(CameraItem)