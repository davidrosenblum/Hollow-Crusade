import React from 'react';
import RequestSender from '../module/RequestSender';
import UIController from '../module/UIController';

import './HudChat.css';

class HudChat extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            chatInput: ""
        };
    }

    onChatInput(evt){
        if(evt.keyCode === 13){
            if(this.state.chatInput){
                if(this.state.chatInput === "/cls"){
                    UIController.hudChatClear();
                }
                else{
                    RequestSender.chat(this.state.chatInput);
                }
            }
            this.setState({chatInput: ""});
            evt.target.value = "";
        }
        else{
            this.setState({chatInput: evt.target.value});
        }
    }

    render(){
        return (
            <div id="hud-chat">
                <div>
                    <textarea id="hud-chat-output" readOnly="readonly" value={this.props.chatOutput}></textarea>
                </div>
                <div>
                    <input id="hud-chat-input" onKeyUp={this.onChatInput.bind(this)} type="text" maxLength="30"/>
                </div>  
            </div>    
        )
    }
}

export default HudChat;