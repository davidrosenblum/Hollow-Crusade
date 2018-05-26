import React from 'react';
import UIController from '../module/UIController';
import RequestSender from '../module/RequestSender';

class CharacterCreate extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            name: "",
            currIndex: 0,
            skins: [
                {image: null},
                {image: null},
                {image: null}
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

        RequestSender.createCharacter(this.state.name, this.state.skinID);
    }

    get currSkin(){
        return this.state.skins[this.state.currIndex];
    }

    render(){
        if(this.props.currMenu !== "character-create"){
            return <span data-name="character-create"></span>
        }

        return (
            <div data-name="character-create">
                <div>
                    <input onKeyDown={this.updateName.bind(this)} type="text" placeholder="Enter name..."/>
                </div>
                <div>
                    <img src={this.currSkin.image} alt={`Skin-${this.state.currIndex}`} height="200px"/>
                </div>
                <div>
                    <button onClick={this.prev.bind(this)}>&larr;</button>
                    <button onClick={this.onCancelBtnClick.bind(this)}>Cancel</button>
                    <button onClick={this.submitCharacter.bind(this)}>Create</button>
                    <button onClick={this.next.bind(this)}>&rarr;</button>
                </div>
            </div>
        );
    }
}

export default CharacterCreate;