import React from 'react';
import Loading from './Loading.jsx';
import Login from './Login.jsx'
import CharacterSelect from './CharacterSelect.jsx';
import Modal from './Modal.jsx';
import Client from '../module/Client';
import UIController from '../module/UIController';

class App extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            currMenu: "",
            message: "",
            characterList: [],
            characterListLoading: false,
            modalMessage: ""
        };
    }

    onUIChange(evt){
        if(evt.menu === "character-select"){
            this.setState({
                characterList: [], 
                characterListLoading: true
            });

            Client.requestCharacterList();
        }

        this.setState({
            currMenu: evt.menu,
            message: evt.message || ""
        });
    }

    onCharacterList(evt){
        this.setState({
            characterList: evt.data,
            characterListLoading: false
        });
    }

    onModal(evt){
        this.setState({
            modalMessage: evt.message
        });
    }

    componentDidMount(){
        UIController.on("show-menu", this.onUIChange.bind(this));
        UIController.on("character-list", this.onCharacterList.bind(this));
        UIController.on("modal", this.onModal.bind(this));
    }

    componentWillUnmount(){
        UIController.removeAllListeners();
    }

    render(){
        return (
            <div>
                <Loading currMenu={this.state.currMenu} message={this.state.message} />
                <Login currMenu={this.state.currMenu} />
                <CharacterSelect currMenu={this.state.currMenu} characterList={this.state.characterList} characterListLoading={this.state.characterListLoading} />
                <Modal message={this.state.modalMessage}/>
            </div>
        );
    }
}

export default App;