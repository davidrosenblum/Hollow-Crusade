import React from 'react';
import UIController from '../module/UIController';
import Client from '../module/Client';

class CharacterSelect extends React.Component{
    constructor(props){
        super(props);
    }

    onNewBtnClick(evt){
        UIController.showCharacterCreate();
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
                            <button className="action-btn" onClick={Client.requestCharacterSelect(data.name)}>Select</button>
                        </td>
                        <td>
                            <button className="action-btn" onClick={evt=>Client.requestCharacterDelete(data.name)}>Delete</button>
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

        return (
            <div data-name="character-select">
                <table>
                    <tbody>
                        {rows}
                    </tbody>
                </table>
            </div>
        );
    }
}

export default CharacterSelect;