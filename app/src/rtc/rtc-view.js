import React from 'react'
import {RTCView} from 'react-native-webrtc'

export default class WebRTCView extends React.Component {

    render() {
        const {streamURL, customStyle} = this.props;
        return (
            <RTCView objectFit={'contain'} streamURL={streamURL} style={customStyle ? customStyle : {}}/>
        )
    }
}
