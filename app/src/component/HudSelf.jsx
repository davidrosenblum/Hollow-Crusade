import React from 'react';

import './HudSelf.css';

class HudSelf extends React.Component{
    constructor(props){
        super(props);
    }

    extractSelfData(){
        let data = this.props.selfData;
        if(!data){
            return null;
        }

        return {
            name:       data.name,
            lvl:        data.level,
            hp:         parseFloat(data.health || 0).toFixed(1),
            hpCap:      parseFloat(data.healthCap || 0).toFixed(1),
            hpPercent:  ((data.health / data.healthCap) * 100).toFixed(2),
            mp:         parseFloat(data.mana || 0).toFixed(1),
            mpCap:      parseFloat(data.manaCap || 0).toFixed(1),
            mpPercent:  ((data.mana / data.manaCap) * 100).toFixed(2),
            xp:         parseFloat(data.xp).toFixed(0),
            xpNeeded:   parseFloat(data.xpNeeded).toFixed(0),
            xpPercent:  ((data.xp / data.xpNeeded) * 100).toFixed(2)
        };
    }

    render(){
        let data = this.extractSelfData();
        if(!data){
            return <span></span>;
        }

        return ( 
            <div id="hud-self">
                <table>
                    <tbody>
                        <tr>
                            <td colSpan="3">{data.name} (lev {data.lvl})</td>
                        </tr>
                        <tr>
                            <td>Health</td>
                            <td>{`${data.hp} / ${data.hpCap}`}</td>
                            <td>{`(${data.hpPercent}%)`}</td>
                        </tr>
                        <tr>
                            <td>Mana</td>
                            <td>{`${data.mp} / ${data.mpCap}`}</td>
                            <td>{`(${data.mpPercent}%)`}</td>
                        </tr>
                        <tr>
                            <td>XP</td>
                            <td>{`${data.xp} / ${data.xpNeeded}`}</td>
                            <td>{`(${data.xpPercent}%)`}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    }
}

export default HudSelf;