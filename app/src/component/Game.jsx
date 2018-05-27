import React from 'react';
import UIController from '../module/UIController';
import RequestSender from '../module/RequestSender';

import './Game.css';

class Game extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            chatOutput: "",
            chatInput: ""
        };
    }

    componentDidMount(){
        UIController.on("hud-chat", this.onHudChat.bind(this));
    }

    componentWillUnmount(){
        UIController.removeListener("hud-chat", this.onHudChat.bind(this));
    }

    onHudChat(evt){
        let updatedOutput = this.state.chatOutput ? `${this.state.chatOutput}\n` : "";
        updatedOutput += evt.chat;

        this.setState({chatOutput: updatedOutput});
    }

    onChatInput(evt){
        if(evt.keyCode === 13){
            if(this.state.chatInput){
                RequestSender.chat(this.state.chatInput);
            }
            this.setState({chatInput: ""});
            evt.target.value = "";
        }
        else{
            this.setState({chatInput: evt.target.value});
        }
    }

    render(){
        if(this.props.currMenu !== "game"){
            return <span data-name="game"></span>
        }

        return (
            <div id="game-menu" data-name="game">
                <div id="canvas-container"></div>

                <div id="hud-container">
                    <div id="hud-chat">
                        <div>
                            <textarea id="hud-chat-output" readOnly="readonly" value={this.state.chatOutput}></textarea>
                        </div>
                        <div>
                            <input id="hud-chat-input" onKeyUp={this.onChatInput.bind(this)} type="text" maxLength="30"/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Game;