import React from 'react';
import UIController from '../module/UIController';

class CharacterCreate extends React.Component{
    constructor(props){
        super(props);
    }

    onCancelBtnClick(evt){
        UIController.showCharacterSelect();
    }

    render(){
        if(this.props.currMenu !== "character-create"){
            return <span data-name="character-create"></span>
        }

        return (
            <div data-name="character-create">
                <div>
                    <button onClick={this.onCancelBtnClick.bind(this)}>Cancel</button>
                    <button>Create</button>
                </div>
            </div>
        );
    }
}

export default CharacterCreate;