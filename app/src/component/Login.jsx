import React from 'react';
import Client from '../module/Client';

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

        Client.submitLogin(this.state.username, this.state.password);
    }

    render(){
        if(this.props.currMenu !== "login"){
            return <span data-name="login"></span>;
        }

        return (
            <div data-name="login">
                <form onSubmit={this.submitLogin.bind(this)}>
                    <div>
                        <label>Username</label>
                        <br/>
                        <input onInput={this.updateUsername.bind(this)} type="text"/>
                    </div>
                    <br/>
                    <div>
                        <label>Password</label>
                        <br/>
                        <input onInput={this.updatePassword.bind(this)} type="password"/>
                    </div>
                    <br/>
                    <div>
                        <input type="submit" value="Enter"/>
                    </div>
                </form>
            </div>
        );
    }
}

export default Login;