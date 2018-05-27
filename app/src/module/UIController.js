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

    hudChat(chat){
        this.emit({type: "hud-chat", chat: chat});
    }

    hudTarget(data){
        this.emit({type: "hud-target", data: data});
    }

    hudSelf(data){

    }

    hudSpellTray(state){

    }
};

export default new UIController();