import React from 'react';
import Client from '../module/Client';
import UIController from '../module/UIController';
import RequestSender from '../module/RequestSender';

import './Login.css';

class Login extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            username: "",
            password: "",
        };
    }

    updateUsername(evt){
        this.setState({username: evt.target.value});
    }

    updatePassword(evt){
        this.setState({password: evt.target.value});
    }

    submitLogin(evt){
        evt.preventDefault();

        if(!this.state.username){
            UIController.modal("Please enter your username.");
            return;
        }

        if(!this.state.password){
            UIController.modal("Please enter your password.");
            return;
        }

        RequestSender.login(this.state.username, this.state.password);
    }

    render(){
        if(this.props.currMenu !== "login"){
            return <span data-name="login"></span>;
        }

        return (
            <div id="login-menu" data-name="login" className="centered">
                <h1>
                    <img id="banner" src="banner.png" alt="Hollow Crusade"/>
                </h1>
                <div className="app-menu">
                    <form onSubmit={this.submitLogin.bind(this)}>
                        <div>
                            <label>Username</label>
                            <br/>
                            <input className="action-input" onInput={this.updateUsername.bind(this)} type="text"/>
                        </div>
                        <br/>
                        <div>
                            <label>Password</label>
                            <br/>
                            <input className="action-input" onInput={this.updatePassword.bind(this)} type="password"/>
                        </div>
                        <br/>
                        <div>
                            <input className="action-btn" type="submit" value="Enter"/>
                        </div>
                    </form>
                </div>
                <div>
                    v{Client.VERSION}
                </div>
            </div>
        );
    }
}

export default Login;