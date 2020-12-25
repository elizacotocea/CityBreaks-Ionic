import React, {useContext, useEffect, useState} from 'react';
import Moment from 'moment'
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput, IonItem,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonLabel,
    IonDatetime,
    IonCheckbox, IonFabButton, IonFab, IonIcon, IonActionSheet
} from '@ionic/react';
import {getLogger} from '../core';
import {CityBreakContext} from './CityBreakProvider';
import {RouteComponentProps} from 'react-router';
import {CityBreakProps} from './CityBreakProps';
import {AuthContext} from "../auth";
import {useNetwork} from "./useNetwork";
import {Photo, usePhotoGallery} from "./useImageGallery";
import { camera, trash, close } from "ionicons/icons";
import {MapComponent} from "./MapComponent";

const log = getLogger('CityBreakEdit');

interface CityBreakEditProps extends RouteComponentProps<{
    id?: string;
}> {
}

export const CityBreakEdit: React.FC<CityBreakEditProps> = ({history, match}) => {
    const {cityBreaks, saving, savingError, saveCityBreak, deleteCityBreak, getServerCityBreak, oldCityBreak} = useContext(CityBreakContext);
    const {networkStatus} = useNetwork();
    const [itemV2, setItemV2] = useState<CityBreakProps>();
    const [status, setStatus] = useState(1);
    const [version, setVersion] = useState(-100);
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [price, setPrice] = useState(0);
    const [transportIncluded, setTransportIncluded] = useState(false);
    const [imgPath, setImgPath] = useState("");
    const [latitude, setLatitude] = useState(46.7533824);
    const [longitude, setLongitude] = useState(23.5831296);
    const [cityBreak, setCityBreak] = useState<CityBreakProps>();
    const {_id} = useContext(AuthContext);
    const [userId, setUserId] = useState(_id);

    const { photos,takePhoto,deletePhoto } = usePhotoGallery();
    const [photoDeleted, setPhotoDeleted] = useState<Photo>();

    useEffect(() => {
        setItemV2(oldCityBreak);
        log("setOldItem: " + JSON.stringify(oldCityBreak));
    }, [oldCityBreak]);


    useEffect(() => {
        log('useEffect');
        const routeId = match.params.id || '';
        const cityBreak = cityBreaks?.find((it) => it._id === routeId);
        setCityBreak(cityBreak);
        if (cityBreak) {
            setName(cityBreak.name);
            setStartDate(cityBreak.startDate);
            setEndDate(cityBreak.endDate);
            setPrice(cityBreak.price);
            setTransportIncluded(cityBreak.transportIncluded);
            setStatus(cityBreak.status);
            setVersion(cityBreak.version);
            setImgPath(cityBreak.imgPath);
            getServerCityBreak && getServerCityBreak(match.params.id!, cityBreak?.version);
            if (cityBreak.latitude) setLatitude(cityBreak.latitude);
            if (cityBreak.longitude) setLongitude(cityBreak.longitude);
        }
    }, [match.params.id, cityBreaks, getServerCityBreak]);


    const handleSave = () => {
        const editedCityBreak = cityBreak ? {
            ...cityBreak,
            name,
            startDate,
            endDate,
            price,
            transportIncluded,
            userId,
            status: 0,
            version: cityBreak.version ? cityBreak.version + 1 : 1,
            imgPath,
            latitude,
            longitude
        } : {name, startDate, endDate, price, transportIncluded, userId, status: 0, version: 1,imgPath, latitude, longitude};
        saveCityBreak && saveCityBreak(editedCityBreak,
            networkStatus.connected
        ).then(() => {
            if (itemV2 === undefined) history.goBack();
        });
    }


    const handleConflict_keepVersion = () => {
        if (oldCityBreak) {
            const editedItem = {
                ...cityBreak,
                name,
                startDate,
                endDate,
                price,
                transportIncluded,
                userId,
                status: 0,
                version: oldCityBreak?.version + 1,
                imgPath,
                latitude,
                longitude
            };
            saveCityBreak && saveCityBreak(editedItem, networkStatus.connected).then(() => {
                history.goBack();
            });
        }
    };


    const handleConflict_updateVersion = () => {
        if (oldCityBreak) {
            const editedItem = {
                ...cityBreak,
                name: oldCityBreak?.name,
                startDate: oldCityBreak?.startDate,
                endDate: oldCityBreak?.endDate,
                price: oldCityBreak?.price,
                transportIncluded: oldCityBreak?.transportIncluded,
                userId: oldCityBreak?.userId,
                status: oldCityBreak?.status,
                version: oldCityBreak?.version,
                imgPath: oldCityBreak?.imgPath,
                latitude: oldCityBreak?.latitude,
                longitude: oldCityBreak?.longitude
            };
            saveCityBreak && editedItem && saveCityBreak(editedItem, networkStatus.connected).then(() => {
                history.goBack();
            });
        }
    };


    const handleDelete = () => {
        const deletedCityBreak = cityBreak
            ? {...cityBreak, name, startDate, endDate, price, transportIncluded, userId, status: 0, version: 0, imgPath, latitude, longitude}
            : {name, startDate, endDate, price, transportIncluded, userId, status: 0, version: 0, imgPath, latitude, longitude};
        deleteCityBreak && deleteCityBreak(deletedCityBreak, networkStatus.connected).then(() => history.goBack());
    };
    log('render');
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>Edit1</IonTitle>
                        <IonButtons slot="end">
                            <IonButton onClick={handleSave}>Save</IonButton>
                            <IonButton onClick={handleDelete}>Delete</IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <IonItem>
                        <IonLabel>City name: </IonLabel>
                        <IonInput
                            value={name}
                            onIonChange={(e) => setName(e.detail.value || "")}
                        />
                    </IonItem>
                    <IonItem>
                        <IonLabel>Price</IonLabel>
                        <IonInput
                            value={price}
                            onIonChange={(e) => setPrice(Number(e.detail.value))}
                        />
                    </IonItem>

                    <IonItem>
                        <IonLabel>Transport included: </IonLabel>
                        <IonCheckbox
                            checked={transportIncluded}
                            onIonChange={(e) => setTransportIncluded(e.detail.checked)}
                        />
                    </IonItem>
                    <IonLabel>Start date: </IonLabel>
                    <IonDatetime value={Moment(new Date(startDate)).format('MM/DD/YYYY')}
                                 onIonChange={e => setStartDate(e.detail.value ? new Date(e.detail.value) : new Date())}/>
                    <IonLabel>End date: </IonLabel>
                    <IonDatetime value={Moment(new Date(endDate)).format('MM/DD/YYYY')}
                                 onIonChange={e => setEndDate(e.detail.value ? new Date(e.detail.value) : new Date())}/>
                    <img src ={cityBreak?.imgPath} alt="image2"/>
                    <MapComponent
                        lat={latitude}
                        lng={longitude}
                        onMapClick={(location: any) => {
                            setLatitude(location.latLng.lat());
                            setLongitude(location.latLng.lng());
                        }}
                    />

                    {itemV2 && (
                        <>
                            <IonItem>
                                <IonLabel>City name: {itemV2.name}</IonLabel>
                            </IonItem>
                            <IonItem>
                                <IonLabel>Price: {itemV2.price}</IonLabel>
                            </IonItem>
                            <IonItem>
                                <IonLabel>Transport included: {itemV2.transportIncluded}</IonLabel>
                            </IonItem>

                            <IonItem>
                                <IonLabel>Start date: {itemV2.startDate}</IonLabel>
                            </IonItem>

                            <IonItem>
                                <IonLabel>End date: {itemV2.endDate}</IonLabel>
                            </IonItem>

                            <IonButton onClick={handleConflict_keepVersion}>Keep your version</IonButton>
                            <IonButton onClick={handleConflict_updateVersion}>Update to new version</IonButton>
                        </>
                    )}


                    <IonLoading isOpen={saving}/>
                    {savingError && (
                        <div>{savingError.message || "Failed to save cityBreak"}</div>
                    )}
                    <IonFab vertical="bottom" horizontal="center" slot="fixed">
                        <IonFabButton
                            onClick={() => {
                                const photoTaken = takePhoto();
                                photoTaken.then((data) => {
                                    setImgPath(data.webviewPath!);
                                });
                            }}
                        >
                            <IonIcon icon={camera} />
                        </IonFabButton>
                    </IonFab>
                    <IonActionSheet
                        isOpen={!!photoDeleted}
                        buttons={[
                            {
                                text: "Delete",
                                role: "destructive",
                                icon: trash,
                                handler: () => {
                                    if (photoDeleted) {
                                        deletePhoto(photoDeleted);
                                        setPhotoDeleted(undefined);
                                    }
                                },
                            },
                            {
                                text: "Cancel",
                                icon: close,
                                role: "cancel",
                            },
                        ]}
                        onDidDismiss={() => setPhotoDeleted(undefined)}
                    />
                </IonContent>
            </IonPage>
        );
    };
export default CityBreakEdit;
