import dark from '../lib/dark';
import Client from './Client';

let UIController = class UIController extends dark.EventEmitter{
    constructor(){
        super();
    }

    showLoading(message){
        this.emit({type: "show-menu", menu: "loading", message: message});
    }

    showLogin(){
        this.emit({type: "show-menu", menu: "login"});
    }

    showCharacterSelect(){
        this.emit({type: "show-menu", menu: "character-select"});
    }

    showCharacterCreate(){
        this.emit({type: "show-menu", menu: "character-create"});
    }

    showGame(){
        this.emit({type: "show-menu", menu: "game"});
    }

    displayCharacterList(data){
        this.emit({type: "character-list", data: data});
    }

    modal(message){
        this.emit({type: "modal", message: message});
    }
};

export default new UIController();