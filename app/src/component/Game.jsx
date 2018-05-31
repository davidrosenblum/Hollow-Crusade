import React from 'react';
import UIController from '../module/UIController';
import RequestSender from '../module/RequestSender';

import './Game.css';
import HudChat from './HudChat';
import HudTarget from './HudTarget';
import HudSelf from './HudSelf';

class Game extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            chatOutput: "",
            targetData: null
        };
    }

    componentDidMount(){
        UIController.on("hud-target", this.onHudTarget.bind(this));
        UIController.on("hud-self", this.onHudSelf.bind(this));
        UIController.on("hud-chat", this.onHudChat.bind(this));
        UIController.on("hud-chat-clear", this.onHudChatClear.bind(this));
    }

    componentWillUnmount(){
        UIController.removeListener("hud-target", this.onHudTarget.bind(this));
        UIController.removeListener("hud-self", this.onHudSelf.bind(this));
        UIController.removeListener("hud-chat", this.onHudChat.bind(this));
        UIController.removeListener("hud-chat-clear", this.onHudChatClear.bind(this));
    }

    onHudTarget(evt){
        this.setState({targetData: evt.data});
    }

    onHudSelf(evt){
        this.setState({selfData: evt.data});
    }

    onHudChat(evt){
        let updatedOutput = this.state.chatOutput ? `${this.state.chatOutput}\n` : "";
        updatedOutput += evt.chat;

        this.setState({chatOutput: updatedOutput});
    }

    onHudChatClear(evt){
        this.setState({chatOutput: ""});
    }

    render(){
        if(this.props.currMenu !== "game"){
            return <span data-name="game"></span>
        }

        return (
            <div id="game-menu" data-name="game">
                <div id="canvas-container"></div>

                <div id="hud-container">
                    <HudTarget targetData={this.state.targetData}/>

                    <HudSelf selfData={this.state.selfData}/>

                    <HudChat chatOutput={this.state.chatOutput}/>
                </div>
            </div>
        );
    }
}

export default Game;