import React from 'react';
import './Modal.css';

class Modal extends React.Component{
    constructor(props){
        super(props);

        this.state = {
            message: this.props.message || ""
        }
    }

    close(){
        this.setState({message: ""});
    }

    componentWillReceiveProps(props){
        this.setState({message: props.message});
    }

    render(){
        if(!this.state.message){
            return <span data-name="modal"></span>;
        }

        return (
            <div data-name="modal">
                <div id="modal-shadow"></div>
                <div id="modal-container">
                    <div id="modal-content">
                        <div id="modal-body">
                            {this.state.message}
                        </div>
                        <div id="modal-footer">
                            <button className="action-btn" onClick={this.close.bind(this)}>Close</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default Modal;