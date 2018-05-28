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
            lvl:        data.level,
            hp:         data.health.toFixed(0),
            hpCap:      data.healthCap.toFixed(0),
            hpPercent:  ((data.health / data.healthCap) * 100).toFixed(2),
            mp:         data.mana.toFixed(0),
            mpCap:      data.manaCap.toFixed(0),
            mpPercent:  ((data.mana / data.manaCap) * 100).toFixed(2),
            xp:         data.xp.toFixed(0),
            xpNeeded:   data.xpNeeded.toFixed(0),
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
                            <td>Level</td>
                            <td colSpan="3">{`${data.lvl}`}</td>
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