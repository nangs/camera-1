import React from 'react'
import styled from 'styled-components'
import {Container, Header, Content, Thumbnail, Text, Left, Body, Icon, Title, Right, List, ListItem} from 'native-base'
import {TouchableHighlight} from 'react-native'
import {NavigationActions} from 'react-navigation'

const UserAvatarView = styled.View `
    padding: 20px;
    display: flex;
    align-items: center;
    flex-direction: column;
`

export default class Profile extends React.Component {


    render() {
        return (
            <Container>
                <Header>
                    <Left>
                        <TouchableHighlight underlayColor={"#FFF"} onPress={() => {
                            console.log("Need go baack")
                            this.props.navigation.dispatch(NavigationActions.back());
                        }}>
                            <Icon name='close'/>
                        </TouchableHighlight>
                    </Left>
                    <Body>
                    <Title>My Account</Title>
                    </Body>
                    <Right/>


                </Header>
                <Content>
                    <UserAvatarView>
                        <Thumbnail large
                                   source={{uri: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mm&f=y'}}/>
                    </UserAvatarView>

                    <List>
                        <ListItem>
                            <TouchableHighlight underlayColor={"#FFF"} style={{
                                flex: 1,
                                padding: 3
                            }} onPress={() => {
                                console.log("Need change avatar");
                            }}>
                                <Text>toan@tabvn.com</Text>
                            </TouchableHighlight>
                        </ListItem>

                        <ListItem>
                            <TouchableHighlight underlayColor={"#FFF"} style={{
                                flex: 1,
                                padding: 3
                            }} onPress={() => {
                                console.log("Need change avatar");
                            }}>
                                <Text>Sign Out</Text>
                            </TouchableHighlight>
                        </ListItem>
                    </List>

                </Content>
            </Container>
        )
    }
}
