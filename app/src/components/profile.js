import React from 'react'
import styled from 'styled-components'
import {
    Container,
    Header,
    Content,
    Thumbnail,
    Text,
    Left,
    Body,
    Icon,
    Title,
    Right,
    List,
    ListItem,
    ActionSheet
} from 'native-base'
import {TouchableHighlight, TouchableOpacity} from 'react-native'
import {NavigationActions} from 'react-navigation'
import ImagePicker from 'react-native-image-picker';

const UserAvatarView = styled.View `
    padding: 20px;
    display: flex;
    align-items: center;
    flex-direction: column;
`

export default class Profile extends React.Component {

    constructor(props) {
        super(props);

        this._goBack = this._goBack.bind(this);
        this._selectPhoto = this._selectPhoto.bind(this);

        this.state = {
            avatarSource: null
        };

    }

    _goBack() {
        this.props.navigation.dispatch(NavigationActions.back());
    }

    _selectPhoto() {
        const {store} = this.props;
        const options = {
            quality: 1.0,
            maxWidth: 500,
            maxHeight: 500,
            storageOptions: {
                skipBackup: true
            }
        };

        ImagePicker.showImagePicker(options, (response) => {
            console.log('Response = ', response);

            if (response.didCancel) {
                console.log('User cancelled photo picker');
            }
            else if (response.error) {
                console.log('ImagePicker Error: ', response.error);
            }
            else if (response.customButton) {
                console.log('User tapped custom button: ', response.customButton);
            }
            else {
                let source = {uri: response.uri};

                // You can also display the image using data:
                // let source = { uri: 'data:image/jpeg;base64,' + response.data };



                store.updateUserAvatar(response).then((result) => {
                    console.log("got result", result);
                });
                this.setState({
                    avatarSource: source
                });
            }
        });
    }

    render() {
        return (
            <Container>
                <Header>
                    <Left>
                        <TouchableHighlight underlayColor={"#FFF"} onPress={this._goBack}>
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
                        <TouchableOpacity onPress={this._selectPhoto}>
                            <Thumbnail large
                                       source={this.state.avatarSource}/>
                        </TouchableOpacity>
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
