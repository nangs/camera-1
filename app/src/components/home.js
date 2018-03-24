import React from 'react'
import {Container, Header, Left, Right, Body, Text, Title} from 'native-base'
import {Image, TouchableHighlight, View, StyleSheet} from 'react-native'
import logo from '../resouces/logo.png'
import iconVideo from '../resouces/icon_video.png'
import iconAvatar from '../resouces/icon_avatar.png'

export default class Home extends React.Component {

    render() {
        return (
            <Container>
                <Header>
                    <Left>
                        <Image style={{width: 25, height: 25}} source={logo}/>
                    </Left>
                    <Body>
                    <Title>Camera</Title>
                    </Body>
                    <Right>
                        <View style={styles.rightActionView}>
                            <TouchableHighlight>
                                <Image style={{width: 20, height: 20}} source={iconVideo}/>
                            </TouchableHighlight>
                        </View>
                        <View style={styles.rightActionView}>
                            <TouchableHighlight>
                                <Image style={styles.avatar} source={iconAvatar}/>
                            </TouchableHighlight>
                        </View>
                    </Right>
                </Header>
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    rightActionView: {
        paddingLeft: 15,
    },
    avatar: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#333333",
        backgroundColor: "#333333"
    }
})