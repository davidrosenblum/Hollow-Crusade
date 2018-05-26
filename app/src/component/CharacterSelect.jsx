import React from 'react';
import UIController from '../module/UIController';
import Client from '../module/Client';
import RequestSender from '../module/RequestSender';

import './CharacterSelect.css';

class CharacterSelect extends React.Component{
    constructor(props){
        super(props);
    }

    onNewBtnClick(evt){
        UIController.showCharacterCreate();
    }

    onLogoutClick(evt){
        UIController.showLogin();
        RequestSender.logout();
    }

    createRows(){
        let rows = [];
        for(let i = 0, data; i < 6; i++){
            if(this.props.characterList.length > i){
                data = this.props.characterList[i];

                rows.push(
                    <tr key={i}>
                        <td>
                            {data.name}
                        </td>
                        <td>
                            Level {data.level}
                        </td>
                        <td>
                            <button className="action-btn" onClick={evt=>RequestSender.selectCharacter(data.name)}>Select</button>
                        </td>
                        <td>
                            <button className="action-btn" onClick={evt=>RequestSender.deleteCharacter(data.name)}>Delete</button>
                        </td>
                    </tr>
                );
            }
            else{
                rows.push(
                    <tr key={i}>
                        <td colSpan="4">
                            <button className="action-btn" onClick={this.onNewBtnClick.bind(this)}>New Character</button>
                        </td>
                    </tr>
                )
            }
        }
        return rows;
    }

    render(){
        if(this.props.currMenu !== "character-select"){
            return <span data-name="character-select"></span>
        }

        if(this.props.characterListLoading){
            return (
                <div>
                    <div>Fetching characters...</div>
                </div>
            );
        }

        return (
            <div id="character-select-menu" data-name="character-select" className="app-menu">
                <div>
                    <table id="character-table">
                        <tbody>
                            {this.createRows()}
                        </tbody>
                    </table>
                </div>
                <div>
                    <button className="action-btn" onClick={this.onLogoutClick.bind(this)}>Logout</button>
                </div>
            </div>
        );
    }
}

export default CharacterSelect;