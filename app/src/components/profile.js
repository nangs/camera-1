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
import _ from 'lodash'

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
        this.getAvatarUrl = this.getAvatarUrl.bind(this)

        this.state = {
            avatar: null
        };

    }

    componentDidMount() {

        this.setState({
            avatar: _.get(this.props.store.user, 'avatar', null)
        })
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
                store.updateUserAvatar(response).then((result) => {

                    this.setState({
                        avatar: result
                    })
                });

            }
        });
    }

    getAvatarUrl() {

        const {avatar} = this.state;
        return `https://s3.amazonaws.com/camera.tabvn.com/${avatar}`;
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
                            <Thumbnail style={{backgroundColor: "#EEE"}} large
                                       source={{uri: this.getAvatarUrl()}}/>
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
