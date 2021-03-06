import React, {useContext, useState, useEffect} from "react";
import {RouteComponentProps} from "react-router";
import {Redirect} from "react-router-dom";

import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonButton,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSelect,
    IonSelectOption,
    IonSearchbar, createAnimation,
} from "@ionic/react";

import {add} from "ionicons/icons";
import CityBreak from "./CityBreak";
import {getLogger} from "../core";
import {CityBreakContext} from "./CityBreakProvider";
import {AuthContext} from "../auth";
import {CityBreakProps} from "./CityBreakProps";
import {useNetwork} from "./useNetwork";
import {MyComponent} from "../animations/MyComponent";
const log = getLogger('CityBreakList');

const CityBreakList: React.FC<RouteComponentProps> = ({history}) => {
    useEffect(simpleAnimation, []);

    const {networkStatus} = useNetwork();

    const {cityBreaks, fetching, fetchingError, updateServer} = useContext(CityBreakContext);

    const [disableInfiniteScroll, setDisableInfiniteScroll] = useState<boolean>(
        false
    );
    const [filter, setFilter] = useState<string | undefined>(undefined);

    const [search, setSearch] = useState<string>("");

    const selectOptions = ["Transport included", "Transport excluded", "None"];

    const [cityBreaksShow, setCityBreaksShow] = useState<CityBreakProps[]>([]);

    const [position, setPosition] = useState(10);

    const {logout} = useContext(AuthContext);

    const element = document.getElementsByClassName('addButton');
    console.log(element[0])
    element[0]?.addEventListener("onmouseover",function(){
        simpleAnimation()
    });

    const handleLogout = () => {
        logout?.();
        return <Redirect to={{pathname: "/login"}}/>;
    };


    useEffect(() => {
        if (networkStatus.connected) {
            updateServer && updateServer();
        }
    }, [networkStatus.connected]);

    useEffect(() => {

        if (cityBreaks?.length) {
            setCityBreaksShow(cityBreaks.slice(0, 10));
        }
    }, [cityBreaks]);
    log('render');


    async function searchNext($event: CustomEvent<void>) {
        if (cityBreaks && position < cityBreaks.length) {
            setCityBreaksShow([...cityBreaksShow, ...cityBreaks.slice(position, position + 11)]);
            setPosition(position + 11);
        } else {
            setDisableInfiniteScroll(true);
        }
        ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    useEffect(() => {
        if (filter && cityBreaks) {

            const boolType = filter === "Transport included";

            let list: CityBreakProps[] = [];
            cityBreaks.forEach((cityBreak: any) => {

                let verify = false;
                if (cityBreak.transportIncluded > 0) verify = true;

                if (boolType === verify) {
                    list.push(cityBreak);
                }
            })

            setCityBreaksShow(list);

        }
    }, [filter, cityBreaks]);


    useEffect(() => {
        if (search && cityBreaks) {
            setCityBreaksShow(cityBreaks.filter((cityBreak: any) => {
                if (search !== " ") {
                    return cityBreak.name.startsWith(search)
                } else {
                    return true;
                }
            }).slice(0, 10));
        }
    }, [search, cityBreaks]);

    function simpleAnimation() {
        console.log('in simple')
        const el = document.querySelector('.addButton');
        if (el) {
            const animation = createAnimation()
                .addElement(el)
                .duration(1000)
                .direction('alternate')
                .iterations(Infinity)
                .keyframes([
                    {offset: 0,opacity: '0.6', transform: 'scale(0.7)'},
                    {offset: 1,opacity: '0.99', transform: 'scale(1)'}
                ])
            animation.play();
        }
    }


    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <MyComponent/>
                    <IonButton onClick={handleLogout}>Logout</IonButton>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen>
                <IonLoading isOpen={fetching} message="Fetching cityBreaks"/>
                <IonSearchbar
                    value={search}
                    debounce={500}
                    onIonChange={(e) => {
                        if (e.detail.value!.length > 0) {
                            setSearch(e.detail.value!)
                        } else {
                            setSearch(" ")
                        }
                    }}
                />

                <IonSelect
                    value={filter}
                    placeholder="Transport... "
                    onIonChange={(e) => setFilter(e.detail.value)}
                >
                    {selectOptions.map((option) => (
                        <IonSelectOption key={option} value={option}>
                            {option}
                        </IonSelectOption>
                    ))}
                </IonSelect>

                <div>Network status: {networkStatus.connected ? "online" : "offline"}</div>

                {cityBreaksShow &&
                cityBreaksShow.map((cityBreak: CityBreakProps) => {
                    return (
                        <CityBreak
                            key={cityBreak._id}
                            _id={cityBreak._id}
                            name={cityBreak.name}
                            startDate={cityBreak.startDate}
                            endDate={cityBreak.endDate}
                            price={cityBreak.price}
                            transportIncluded={cityBreak.transportIncluded}
                            userId={cityBreak.userId}
                            status={cityBreak.status}
                            version={cityBreak.version}
                            imgPath={cityBreak.imgPath}
                            latitude={cityBreak.latitude}
                            longitude={cityBreak.longitude}
                            onEdit={(id) => history.push(`/cityBreak/${id}`)}
                        />
                    );
                })}
                <IonInfiniteScroll
                    threshold="100px"
                    disabled={disableInfiniteScroll}
                    onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}
                >
                    <IonInfiniteScrollContent loadingText="Loading..."/>
                </IonInfiniteScroll>

                {fetchingError && (
                    <div>{fetchingError.message || "Failed to fetch cityBreaks"}</div>
                )}
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton className="addButton"
                                  onClick={() => history.push("/cityBreak")}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default CityBreakList;