import React from 'react';
import Client from '../module/Client';

class Loading extends React.Component{
    constructor(props){
        super(props);
    }

    render(){
        if(this.props.currMenu !== "loading"){
            return <span data-name="loading"></span>
        }

        return (
            <div data-name="loading">
                <div>
                    {this.props.message}
                </div>
                <div>
                    Hollow Crusade | {Client.VERSION}
                </div>
            </div>
        );
    }
}

export default Loading;