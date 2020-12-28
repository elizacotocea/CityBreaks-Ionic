import React, {useEffect, useState} from 'react';
import {IonButton, IonItem, IonLabel} from '@ionic/react';
import {CityBreakProps} from './CityBreakProps';
import {MyModal} from "../animations/MyModal";
import {randomBytes} from "crypto";

interface ItemPropsExt extends CityBreakProps {
    onEdit: (_id?: string) => void;
}

const CityBreak: React.FC<ItemPropsExt> = ({_id, name, price, imgPath, onEdit}) => {
    const [showModal, setShowModal] = useState(false);
    return (
        <IonItem>
            <IonLabel onClick={() => onEdit(_id)}>{name} - {price}$ </IonLabel>
            <IonButton onClick={() => setShowModal(true)}>Show Picture</IonButton>
            <MyModal open={showModal} url={imgPath} showModal={setShowModal}/>
            <img src={imgPath} style={{ height: 50 , width: 80, marginLeft:10}}  alt="image"/>
        </IonItem>
    );
};

export default CityBreak;