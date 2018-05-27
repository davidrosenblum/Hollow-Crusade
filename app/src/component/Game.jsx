import React from 'react';
import UIController from '../module/UIController';
import RequestSender from '../module/RequestSender';

import './Game.css';

class Game extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            targetData: null,
            chatOutput: "",
            chatInput: ""
        };
    }

    componentDidMount(){
        UIController.on("hud-target", this.onHudTarget.bind(this));
        UIController.on("hud-chat", this.onHudChat.bind(this));
    }

    componentWillUnmount(){
        UIController.removeListener("hud-target", this.onHudTarget.bind(this));
        UIController.removeListener("hud-chat", this.onHudChat.bind(this));
    }

    onHudTarget(evt){
        this.setState({targetData: evt.data});
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

    generateHUDTarget(){
        if(!this.state.targetData){
            return;
        }
        
        console.log(this.state.targetData);
        return (
            <div id="hud-target">
                <div>
                    <table>
                        <tbody>
                            <tr className="centered">
                                <td colSpan="2">{this.state.targetData.name} {(this.state.targetData.level ? `(${this.state.targetData.level})` : "")}</td>
                            </tr>
                            <tr>
                                <td>Health</td>
                                <td>{`${this.state.targetData.health} / ${this.state.targetData.healthCap}`}</td>
                            </tr>
                            <tr>
                                <td>Mana</td>
                                <td>{`${this.state.targetData.mana} / ${this.state.targetData.manaCap}`}</td>
                            </tr>
                            <tr>
                                <td>Defense</td>
                                <td>{`P: ${this.state.targetData.defensePhysical * 100}%\t\tE: ${this.state.targetData.defenseElemental * 100}%`}</td>
                            </tr>
                            <tr>
                                <td>Resistance</td>
                                <td>{`P: ${this.state.targetData.resistancePhysical * 100}%\t\tE: ${this.state.targetData.resistanceElemental * 100}%`}</td>
                            </tr>
                            <tr>
                                <td>Damage</td>
                                <td>{`${this.state.targetData.damageMultiplier * 100}%`}</td>
                            </tr>
                            <tr>
                                <td>Criticals</td>
                                <td>{`x${this.state.targetData.criticalMultiplier} (+${this.state.targetData.criticalModifier * 100}% chance) `}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    render(){
        if(this.props.currMenu !== "game"){
            return <span data-name="game"></span>
        }

        return (
            <div id="game-menu" data-name="game">
                <div id="canvas-container"></div>

                <div id="hud-container">
                    {this.generateHUDTarget()}

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