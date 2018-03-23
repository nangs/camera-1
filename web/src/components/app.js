import React, {Component} from 'react'
import styled from 'styled-components'
import {Router, Route, Switch} from 'react-router-dom'
import {history} from "../history";

import UserLogin from './user/login'
import Authenticate from './require-auth'
import CreateUser from './user/create-user'
import UpdateUser from './user/update-user'
import Users from './user'

const Wrapper = styled.div `
    height: 100vh;
`

class App extends Component {

    render() {

        return <Wrapper>
            <Router history={history}>
                <Switch>
                    <Route exact path={'/login'} component={UserLogin}/>
                    <Route exact path={'/users'} component={Authenticate(Users)}/>
                    <Route exact path={'/users/create'} component={Authenticate(CreateUser)}/>
                    <Route exact path={'/users/:id/edit'} component={Authenticate(UpdateUser)}/>
                </Switch>
            </Router>
        </Wrapper>
    }
}


export default App;