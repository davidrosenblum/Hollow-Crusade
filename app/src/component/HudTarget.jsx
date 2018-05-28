import React from 'react';

import './HudTarget.css';

class HudTarget extends React.Component{
    constructor(props){
        super(props);
    }

    extractTargetData(){
        let data = this.props.targetData || null;
        if(!data){
            return null;
        }

        return {
            name:       data.name,
            lvl:        data.level || "",
            hp:         data.health.toFixed(1),
            hpCap:      data.healthCap.toFixed(1),
            mp:         data.mana.toFixed(1),
            mpCap:      data.manaCap.toFixed(1),
            defP:       (data.defensePhysical * 100).toFixed(2),
            defE:       (data.defenseElemental * 100).toFixed(2),
            resP:       (data.resistancePhysical * 100).toFixed(2),
            resE:       (data.resistanceElemental * 100).toFixed(2),
            dmgMult:    (data.damageMultiplier * 100).toFixed(0),
            critMod:    (data.criticalModifier * 100).toFixed(0),
            critMult:   (data.criticalMultiplier * 100).toFixed(0)
        };
    }

    render(){
        let data = this.extractTargetData();
        if(!data){
            return <span></span>;
        }

        return (
            <div id="hud-target">
                <div>
                    <table>
                        <tbody>
                            <tr>
                                <td colSpan="2">{data.name} {data.lvl}</td>
                            </tr>
                            <tr>
                                <td>Health</td>
                                <td>{`${data.hp} / ${data.hpCap}`}</td>
                            </tr>
                            <tr>
                                <td>Mana</td>
                                <td>{`${data.mp} / ${data.mpCap}`}</td>
                            </tr>
                            <tr>
                                <td>Defense</td>
                                <td>{`P: ${data.defP}%\t\tE: ${data.defE}%`}</td>
                            </tr>
                            <tr>
                                <td>Resistance</td>
                                <td>{`P: ${data.resP}%\t\tE: ${data.resE}%`}</td>
                            </tr>
                            <tr>
                                <td>Damage</td>
                                <td>{`${data.dmgMult}%`}</td>
                            </tr>
                            <tr>
                                <td>Criticals</td>
                                <td>{`${data.critMult}% (+${data.critMod}% chance) `}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }
}

export default HudTarget;