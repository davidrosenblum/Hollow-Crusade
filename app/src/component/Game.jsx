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
        UIController.on("hud-self", this.onHudSelf.bind(this));
        UIController.on("hud-chat", this.onHudChat.bind(this));
    }

    componentWillUnmount(){
        UIController.removeListener("hud-target", this.onHudTarget.bind(this));
        UIController.removeListener("hud-self", this.onHudSelf.bind(this));
        UIController.removeListener("hud-chat", this.onHudChat.bind(this));
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

    generateHUDSelf(){
        if(!this.state.selfData){
            return;
        }

        let data = this.state.selfData,
            lvl = data.level,
            hp = data.health.toFixed(0),
            hpCap = data.healthCap.toFixed(0),
            hpPercent = ((data.health / data.healthCap) * 100).toFixed(2),
            mp = data.mana.toFixed(0),
            mpCap = data.manaCap.toFixed(0),
            mpPercent = ((data.mana / data.manaCap) * 100).toFixed(2),
            xp = data.xp.toFixed(0),
            xpNeeded = data.xpNeeded.toFixed(0),
            xpPercent = ((data.xp / data.xpNeeded) * 100).toFixed(2);

        return ( 
            <div id="hud-self">
                <table>
                    <tbody>
                        <tr>
                            <td>Level</td>
                            <td colSpan="2">{`${lvl}`}</td>
                        </tr>
                        <tr>
                            <td>Health</td>
                            <td>{`${hp} / ${hpCap}`}</td>
                            <td>{`(${hpPercent}%)`}</td>
                        </tr>
                        <tr>
                            <td>Mana</td>
                            <td>{`${mp} / ${mpCap}`}</td>
                            <td>{`(${mpPercent}%)`}</td>
                        </tr>
                        <tr>
                            <td>XP</td>
                            <td>{`${xp} / ${xpNeeded}`}</td>
                            <td>{`(${xpPercent}%)`}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }

    generateHUDTarget(){
        if(!this.state.targetData){
            return;
        }

        let data = this.state.targetData,
            name = data.name,
            lvl = data.level || null,
            hp = data.health.toFixed(1),
            hpCap = data.healthCap.toFixed(1),
            mp = data.mana.toFixed(1),
            mpCap = data.manaCap.toFixed(1),
            defP = (data.defensePhysical * 100).toFixed(2),
            defE = (data.defenseElemental * 100).toFixed(2),
            resP = (data.resistancePhysical * 100).toFixed(2),
            resE = (data.resistanceElemental * 100).toFixed(2),
            dmgMult = (data.damageMultiplier * 100).toFixed(0),
            critMod = (data.criticalModifier * 100).toFixed(0),
            critMult = (data.criticalMultiplier * 100).toFixed(0);

        return (
            <div id="hud-target">
                <div>
                    <table>
                        <tbody>
                            <tr className="centered">
                                <td colSpan="2">{name} {(lvl ? `(${lvl})` : "")}</td>
                            </tr>
                            <tr>
                                <td>Health</td>
                                <td>{`${hp} / ${hpCap}`}</td>
                            </tr>
                            <tr>
                                <td>Mana</td>
                                <td>{`${mp} / ${mpCap}`}</td>
                            </tr>
                            <tr>
                                <td>Defense</td>
                                <td>{`P: ${defP}%\t\tE: ${defE}%`}</td>
                            </tr>
                            <tr>
                                <td>Resistance</td>
                                <td>{`P: ${resP}%\t\tE: ${resE}%`}</td>
                            </tr>
                            <tr>
                                <td>Damage</td>
                                <td>{`${dmgMult}%`}</td>
                            </tr>
                            <tr>
                                <td>Criticals</td>
                                <td>{`${critMult}% (+${critMod}% chance) `}</td>
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

                    {this.generateHUDSelf()}

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