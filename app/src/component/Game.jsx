import React from 'react';

import './Game.css';

class Game extends React.Component{
    render(){
        if(this.props.currMenu !== "game"){
            return <span data-name="game"></span>
        }

        return (
            <div id="game-menu" data-name="game">
                <div id="canvas-container"></div>
            </div>
        );
    }
}

export default Game;