import React from 'react';
import UIController from '../module/UIController';
import RequestSender from '../module/RequestSender';

import playerSkin1 from '../img/player1.png';
import playerSkin2 from '../img/player2.png';
import playerSkin3 from '../img/player3.png';

import './CharacterCreate.css';

class CharacterCreate extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            name: "",
            currIndex: 0,
            skins: [
                playerSkin1,
                playerSkin2,
                playerSkin3
            ]
        };
    }

    onCancelBtnClick(evt){
        UIController.showCharacterSelect();
    }

    updateName(evt){
        this.setState({name: evt.target.value});
    }

    prev(){
        let index = this.state.currIndex - 1;
        if(index < 0){
            index = this.state.skins.length - 1;
        }
        this.setState({currIndex: index});
    }

    next(){
        let index = this.state.currIndex + 1;
        if(index >= this.state.skins.length){
            index = 0;
        }
        this.setState({currIndex: index});
    }

    submitCharacter(){
        if(!this.state.name){
            UIController.modal("Please enter a name.");
            return;
        }

        RequestSender.createCharacter(this.state.name, this.state.currIndex+1);
    }

    get currSkin(){
        return this.state.skins[this.state.currIndex];
    }

    render(){
        if(this.props.currMenu !== "character-create"){
            return <span data-name="character-create"></span>
        }

        return (
            <div id="character-create-menu" data-name="character-create" className="app-menu">
                <div>
                    <input className="action-input" onInput={this.updateName.bind(this)} type="text" placeholder="Enter name..."/>
                </div>
                <br/>
                <div>
                    <img src={this.currSkin} alt={`Skin-${this.state.currIndex}`} height="200px"/>
                </div>
                <br/>
                <div>
                    <button className="action-btn" onClick={this.prev.bind(this)}>&larr;</button>
                    <button className="action-btn" onClick={this.onCancelBtnClick.bind(this)}>Cancel</button>
                    <button className="action-btn" onClick={this.submitCharacter.bind(this)}>Create</button>
                    <button className="action-btn" onClick={this.next.bind(this)}>&rarr;</button>
                </div>
            </div>
        );
    }
}

export default CharacterCreate;