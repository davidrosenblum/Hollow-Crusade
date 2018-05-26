import React from 'react';
import Client from '../module/Client';

import './Loading.css';

class Loading extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        if(this.props.currMenu !== "loading"){
            return <span data-name="loading"></span>
        }

        return (
            <div id="loading-menu" data-name="loading">
                <h1>
                    <img id="banner" src="banner.png" alt="Hollow Crusade"/>
                </h1>
                <div className="app-menu">
                    <div>
                        {this.props.message}
                    </div>
                </div>
                <div>
                    v{Client.VERSION}
                </div>
            </div>
        );
    }
}

export default Loading;