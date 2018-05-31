import React from 'react';
import Client from '../module/Client';

import './Loading.css';

class Loading extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            showBtn: false
        };
    }

    componentWillReceiveProps(props){
        this.setState({
            showBtn: props.showBtn || false
        });
    }

    reconnect(){
        Client.connect()
        this.setState({showBtn: false});
    }

    render(){
        if(this.props.currMenu !== "loading"){
            return <span data-name="loading"></span>
        }

        let reconnectBtn = (
            <div>
                <br/>
                <button className="action-btn" onClick={this.reconnect.bind(this)}>Retry</button>
            </div>
        );
        
        if(!this.state.showBtn){
            reconnectBtn = "";
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
                    <div>
                        {reconnectBtn}
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