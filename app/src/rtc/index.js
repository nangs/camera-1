import {Platform} from 'react-native'
import {
    RTCPeerConnection,
    RTCMediaStream,
    RTCIceCandidate,
    RTCSessionDescription,
    RTCView,
    MediaStreamTrack,
    getUserMedia,
} from 'react-native-webrtc'
import {production} from "../config"

const configuration = {"iceServers": [{"url": "stun:stun.l.google.com:19302"}]};

const logError = (err) => {
    console.log("An error", err);
};

let localStream;

export default class RTC {

    constructor() {

        this.isFront = true;
    }

    getLocalStream(isFront = false, cb) {

        if (isFront === this.isFront && localStream) {
            return cb(localStream);
        }
        this.isFront = isFront;

        let videoSourceId;
        if (Platform.OS === 'ios') {
            MediaStreamTrack.getSources(sourceInfos => {

                sourceInfos.forEach((value, key) => {

                    console.log("Source item", value, key);

                    let facing = isFront ? 'front' : 'back';
                    const source = value.find((v) => v.facing === facing && v.kind === 'video');
                    if (source) {
                        videoSourceId = source.id;
                    }
                    console.log("Got source", source, videoSourceId);
                });
            });
        }
        getUserMedia(production ? {
            audio: true,
            video: {
                mandatory: {
                    minWidth: 240,
                    minHeight: 120,
                    minFrameRate: 30,
                },
                facingMode: (isFront ? "user" : "environment"),
                optional: (videoSourceId ? [{sourceId: videoSourceId}] : []),
            }
        } : {
            audio: true,
            video: false
        }, function (stream) {
            if (localStream) {
                localStream.release();
            }
            localStream = stream;
            cb(stream);
        }, logError);
    }

    close() {
        if (localStream) {
            localStream.release();
        }
        console.log("Close RTC Connection");

    }
}