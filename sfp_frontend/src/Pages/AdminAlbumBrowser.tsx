import { useApolloClient } from '@apollo/client';
import { faArrowTurnUp, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Fragment, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Button, Col, Container, Dropdown, DropdownButton, Form, Row, Stack } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import DirPhotoViewBoxStyleAdmin from '../Components/DirPhotoViews/DirPhotoViewBoxStyleAdmin';
import DirPhotoViewListStyleAdmin from '../Components/DirPhotoViews/DirPhotoViewListStyleAdmin';
import { ItemViewTypes } from '../Components/ItemViewTypes';
import OnLoadComponent from '../Components/OnLoadComponent';
import { ContextMenuContext, ContextMenuInfoType, ContextMenuOptionType } from '../Contexts/ContextMenuContext';
import { ModalContext } from '../Contexts/ModalContext';
import { getNavbarHeight, NavbarContext } from '../Contexts/NavbarContext';
import { createPhotoLink, GetBackendServlet, isAlphanumeric, isSafeDirectoryName, UserDispContext } from '../Contexts/UserDisplayContext';
import { Album, Directory, Photo } from '../CrossServerTypes/DataTypes';
import { mutAddAlbum, mutDeleteAlbumBunch, mutDeleteDirectoryBunch, mutDeletePhotoBunch, mutMakeDirectory, mutPrepareForPhotoUpload } from '../CrossServerTypes/GraphMutations';
import { AllAlbums, AttemptAdminLogin, DirectoriesPhotosFromAlbumCode } from '../CrossServerTypes/GraphQueries';

const AdminAlbumBrowser = () => {

    const {dispInfo, setDispInfo} = useContext(UserDispContext);
    const {navbarInfo, setNavbarInfo} = useContext(NavbarContext);
    const {modalInfo, setModalInfo} = useContext(ModalContext);
    const {contextMenuInfo, setContextMenuInfo} = useContext(ContextMenuContext);

    const graphClient = useApolloClient();
    const cookies = new Cookies();
    const [CBP_SESSID, setCBP_SESSID] = useState(cookies.get("CBP_SESSID") !== undefined ? cookies.get("CBP_SESSID") : "");
    const navigate = useNavigate();

    const [currentPathArr, setCurrentPathArr] = useState<Array<string>>(["albums"]);
    const [itemViewType, setItemViewType] = useState<string>(ItemViewTypes[0]);
    const [canQueryForData, setCanQueryForData] = useState<boolean>(false);

    const currentPathArrRef = useRef(["albums"]);
    const mustHardReloadAlbumsPage = useRef(false);

    const [selectedMedia, setSelectedMedia] = useState<Array<Directory | Photo | Album>>([]);
    const [pathDirectoryData, setPathDirectoryData] = useState<Array<Directory | Album>>([]);
    const [pathPhotosData, setPathPhotosData] = useState<Array<Photo>>([]);

    const popDirectory = (newIt: number) => {
        if(newIt >= 0){
            let newArr = currentPathArr.slice(0, newIt+1);
            setCurrentPathArr(newArr);
        }
    };

    const getCurrentDescendenceInAlbum = () => {
        if(currentPathArr.length <= 1){
            return undefined;
        }
        let ret = "/";
        for(let i = 2; i < currentPathArr.length; i++){
            ret += currentPathArr[i] + "/";
        }
        let splitBaseAlbumIndex = currentPathArr[1].lastIndexOf(" - ");
        let endingCode = currentPathArr[1].substring(splitBaseAlbumIndex+3);
        return {albumCode: endingCode, descendence: ret};
    };

    const getCurrentDescendenceInAlbumRef = () => {
        if(currentPathArrRef.current.length <= 1){
            return undefined;
        }
        let ret = "/";
        for(let i = 2; i < currentPathArrRef.current.length; i++){
            ret += currentPathArrRef.current[i] + "/";
        }
        let splitBaseAlbumIndex = currentPathArrRef.current[1].lastIndexOf(" - ");
        let endingCode = currentPathArrRef.current[1].substring(splitBaseAlbumIndex+3);
        return {albumCode: endingCode, descendence: ret};
    };

    const reloadPageOption = {text:"Reload",callback:(cmEvent:MouseEvent | undefined, event: React.SyntheticEvent) => {
        refreshPage(true, getCurrentDescendenceInAlbumRef());
    }};

    const rightClickPhotoOption = {text: "Show Photo", callback: (cmEvent: MouseEvent | undefined, event: React.SyntheticEvent) => {
        let photoCheck = checkIfMouseEventOnPhoto(cmEvent);
        let [imgElem, imgElemSearchParam] = photoCheck!;

        let photo: Photo = {id: parseInt(imgElemSearchParam.get("id")!), parent_directory_id_fk: parseInt(imgElemSearchParam.get("parent_directory_id_fk")!), album_id_fk: parseInt(imgElemSearchParam.get("album_id_fk")!), path: imgElemSearchParam.get("path")!, created_at: "", __typename: "Photo"}

        setModalInfo!({
            ...modalInfo!,
            modalSize: (((imgElem!.naturalHeight * 1.1) > imgElem!.naturalWidth) ? "lg" : "xl"),
            modalShown: true,
            modalHeader: "Image Download",
            canClose: true,
            modalContent:
            <Fragment>
                <Stack direction="horizontal" gap={2}>
                    <img className="img-fluid bg-accent p-2 w-75" src={createPhotoLink(photo, "internet")} />
                    <Stack className="text-responsive-2" direction="vertical" gap={3}>
                        <h5 className="m-0 text-responsive">Choose Resolution</h5>

                        <div>
                            <p className="m-0">Full Sized</p>
                            <a href={createPhotoLink(photo, "full")} download={photo.id}>
                                <Button size={"sm"} className="m-0 btn-block" variant="primary">Download</Button>
                            </a>
                        </div>
                        <div>
                            <p className="m-0">Internet Sized (compressed)</p>
                            <a href={createPhotoLink(photo, "internet")} download={photo.id}>
                                <Button size={"sm"} className="m-0 btn-block align-middle" variant="primary">Download</Button>
                            </a>
                        </div>
                        
                    </Stack>
                </Stack>
            </Fragment>
        });

    }};

    const onContextMenu = (event: MouseEvent, currentOptions:ContextMenuOptionType[]) => {
        if(event.button === 2){
            currentOptions.push(reloadPageOption);
            if(checkIfMouseEventOnPhoto(event)){
                currentOptions.push(rightClickPhotoOption);
            }
        }
    };

    useEffect(() => {
        setNavbarInfo!({...navbarInfo!, yOffset: 0});
    }, []);

    useEffect(() => {
        let callbacks = [onContextMenu];
        if(contextMenuInfo!.onContextMenuCallbacks !== callbacks){
            setContextMenuInfo!({...contextMenuInfo!, onContextMenuCallbacks: callbacks});
        }
        
        return () => {
            setContextMenuInfo!({...contextMenuInfo!, onContextMenuCallbacks: []});
        };
    }, [contextMenuInfo]);

    useEffect(() => {
        currentPathArrRef.current = currentPathArr;
    }, [currentPathArr]);

    useEffect(() => {
        if(CBP_SESSID.length == 31){
            //possibly logged in
            graphClient.query({
                query:AttemptAdminLogin,
                variables:{
                    sess_id: CBP_SESSID
                }
            }).then(res => {
                if(!res.data.AttemptAdminLogin){
                    navigate("/admin");
                    return;
                }
                if(!res.data.AttemptAdminLogin.login_success){
                    navigate("/admin");
                    return;
                }

                setCanQueryForData(true);
            });
        }
        else{
            //not logged in
            navigate("/admin");
        }
    }, [CBP_SESSID]);

    const DirectoryClicked = (e:React.SyntheticEvent, dir: Directory | Album) => {
        e.preventDefault();

        if(dir.__typename === "Directory"){
            setCurrentPathArr([...currentPathArr, dir.name]);
        }
        else{
            let albumObj = dir as Album;
            setCurrentPathArr([...currentPathArr, `${albumObj.name} - ${albumObj.code}`]);
        }
        
    };

    const mediaSelected = (e: React.SyntheticEvent, media: Directory | Album | Photo) => {
        if(selectedMedia.includes(media)){
            let newSelectedMedia = [...selectedMedia];
            newSelectedMedia.splice(selectedMedia.indexOf(media), 1);
            setSelectedMedia(newSelectedMedia);
        }
        else{
            setSelectedMedia([...selectedMedia, media]);
        }
    };

    const checkIfMouseEventOnPhoto = (cmEvent: MouseEvent | undefined): undefined | [HTMLImageElement, URLSearchParams] => {
        if(!cmEvent){
            return undefined;
        }
        let imgElem = undefined;
        if(cmEvent!.target instanceof HTMLImageElement){
            imgElem = cmEvent!.target as HTMLImageElement;

        }
        else{
            if(!(cmEvent!.target instanceof HTMLDivElement)){
                return undefined;
            }
            let containingParent = cmEvent!.target.parentElement?.parentElement;
            if(!containingParent){
                return undefined;
            }
            if((containingParent as HTMLDivElement).id !== "photoContentRow"){
                return undefined;
            }

            let possibleImages = containingParent!.querySelectorAll("#listViewImageActive");
            if(possibleImages.length < 1){
                return undefined;
            }
            imgElem = possibleImages[0] as HTMLImageElement;
        }
        let imgElemSearchParam = (new URL(imgElem!.src)).searchParams;
        let necessaryInclusions = ["id", "path", "album_id_fk"];

        for(let i = 0; i < necessaryInclusions.length; i++){
            if(!imgElemSearchParam.get(necessaryInclusions[i])){
                return undefined;
            }
        }
        return [imgElem, imgElemSearchParam];
    };

    const PhotoClicked = (e:React.SyntheticEvent, photo: Photo) => {
        e.preventDefault();

        let clickButton = (e.nativeEvent as any).button;
        if(clickButton === 0){
            mediaSelected(e, photo);
        }
    };

    const updateDirectoriesPhotos = (graphqlQuery: {data: any}) => {
        if(graphqlQuery.data){
            if(graphqlQuery.data.AllAlbums){
                if(!graphqlQuery.data.AllAlbums.login_info.login_success){
                    navigate("/admin");
                    return;
                }
                if(graphqlQuery.data.AllAlbums.albums){
                    setPathDirectoryData(graphqlQuery.data.AllAlbums.albums);
                }
                else{
                    setPathDirectoryData([]);
                }
                setPathPhotosData([]);
            }
            if(graphqlQuery.data.DirectoriesPhotosFromAlbumCode){
                if(graphqlQuery.data.DirectoriesPhotosFromAlbumCode.directories){
                    setPathDirectoryData(graphqlQuery.data.DirectoriesPhotosFromAlbumCode.directories);
                }
                else{
                    setPathDirectoryData([]);
                }   
                if(graphqlQuery.data.DirectoriesPhotosFromAlbumCode.photos){
                    setPathPhotosData(graphqlQuery.data.DirectoriesPhotosFromAlbumCode.photos);
                }
                else{
                    setPathPhotosData([]);
                }
                
            }
        }
        else{
            if(pathPhotosData.length != 0){
                setPathPhotosData([]);
            }
            if(pathDirectoryData.length != 0){
                setPathDirectoryData([]);
            }
        }
    };

    const refreshPage = (hardRefresh?: boolean, currentDesc = getCurrentDescendenceInAlbum()) => {
        setSelectedMedia([]);
        if(currentDesc == undefined){
            graphClient.query({
                query: AllAlbums,
                variables: {
                    sess_id: CBP_SESSID
                },
                fetchPolicy: hardRefresh ? "network-only" : undefined
            }).then((res) => {
                updateDirectoriesPhotos(res);
            }).catch(err => {
                updateDirectoriesPhotos({data: undefined});
            });
        }
        else{
            graphClient.query({
                query: DirectoriesPhotosFromAlbumCode, 
                variables: {
                    code: currentDesc.albumCode,
                    descendence: currentDesc.descendence
                },
                fetchPolicy: hardRefresh ? "network-only" : undefined
            }).then((res) => {
                updateDirectoriesPhotos(res);
            }).catch(err => {
                updateDirectoriesPhotos({data: undefined});
            });
        }
    };

    useEffect(() => {
        if(canQueryForData){
            if(currentPathArr.length === 1 && mustHardReloadAlbumsPage.current){
                refreshPage(true);
            }
            else{
                refreshPage();
            }
        }
    }, [currentPathArr, canQueryForData]);

    const invertSelect = () => {

        let tmpAllMedia = [...pathDirectoryData, ...pathPhotosData];
        let unselectedMedia = [];

        for(let i = 0; i < tmpAllMedia.length; i++){
            if(!selectedMedia.includes(tmpAllMedia[i])){
                unselectedMedia.push(tmpAllMedia[i]);
            }
        }

        setSelectedMedia(unselectedMedia);

    };

    const createAlbumFormSubmitted = (event: React.SyntheticEvent) => {

        event.preventDefault();

        let frmData = new FormData(event.nativeEvent.target as HTMLFormElement);
        let albumName = frmData.get("albumName")?.toString();
        let albumCode = frmData.get("albumCode")?.toString();

        closeModal();

        if(!albumName || albumName.length < 1 || !albumCode || albumCode.length < 1 || !isAlphanumeric(albumCode)){
            setModalInfo!({
                ...modalInfo!,
                modalSize: "sm",
                modalShown: true,
                modalHeader: "Error",
                canClose: true,
                modalContent:
                <Fragment>
                    <p>Album Name and Album Code must be at least one character. Album Code must be alphanumeric.</p>
                </Fragment>
            });
            return;
        }

        graphClient.mutate({mutation: mutAddAlbum, variables:{
            sess_id: CBP_SESSID,
            album_name:albumName,
            album_code:albumCode
        }}).then(res => {
            if(!res.data){
                return;
            }
            if(!res.data.AddAlbum){
                return;
            }
            if(!res.data.AddAlbum.success){
                return;
            }
            setModalInfo!({
                ...modalInfo!,
                modalSize: "sm",
                modalShown: true,
                modalHeader: "Success",
                canClose: true,
                modalContent:
                <Fragment>
                    <p>{albumName} with code {albumCode} was successfully added</p>
                </Fragment>
            });
            mustHardReloadAlbumsPage.current = true;
            refreshPage(true);
        });

    };

    const createAlbum = () => {

        setModalInfo!({
            ...modalInfo!,
            modalSize: "lg",
            modalShown: true,
            modalHeader: "Create Album",
            canClose: true,
            modalContent:
            <Fragment>
                <Form onSubmit={(e) => createAlbumFormSubmitted(e)}>
                    <Form.Group className="mb-3">
                        <Form.Label>Album Name</Form.Label>
                        <Form.Control name="albumName" placeholder="Enter album name" />
                        <Form.Text className="text-muted">
                            This will be the name the users see
                        </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Album Code</Form.Label>
                        <Form.Control name="albumCode" placeholder="Enter album code" />
                        <Form.Text className="text-muted">
                            This will be the code the users have to access the album
                        </Form.Text>
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Create
                    </Button>
                </Form>
            </Fragment>
        });

    };

    const makeDirectoryFormSubmitted = (event: React.SyntheticEvent) => {

        event.preventDefault();
        let currentDesc = getCurrentDescendenceInAlbum();

        let frmData = new FormData(event.nativeEvent.target as HTMLFormElement);
        let directoryName = frmData.get("directoryName")?.toString();

        closeModal();

        if(!directoryName || directoryName.length < 1 || !isSafeDirectoryName(directoryName)){
            setModalInfo!({
                ...modalInfo!,
                modalSize: "sm",
                modalShown: true,
                modalHeader: "Error",
                canClose: true,
                modalContent:
                <Fragment>
                    <p>Directory name must be at least one character and not have special characters</p>
                </Fragment>
            });
            return;
        }

        graphClient.mutate({mutation: mutMakeDirectory, variables:{
            sess_id: CBP_SESSID,
            directory_name:directoryName,
            descendence:currentDesc!.descendence,
            album_code:currentDesc!.albumCode
        }}).then(res => {
            if(!res.data){
                return;
            }
            if(!res.data.MakeDirectory){
                return;
            }
            if(!res.data.MakeDirectory.success){
                return;
            }
            setModalInfo!({
                ...modalInfo!,
                modalSize: "sm",
                modalShown: true,
                modalHeader: "Success",
                canClose: true,
                modalContent:
                <Fragment>
                    <p>{directoryName} was successfully created</p>
                </Fragment>
            });
            refreshPage(true);
        });

    };

    const makeDirectory = () => {
        let currentDesc = getCurrentDescendenceInAlbum();
        if(!currentDesc){
            setModalInfo!({
                ...modalInfo!,
                modalSize: "sm",
                modalShown: true,
                modalHeader: "Error",
                canClose: true,
                modalContent:
                <Fragment>
                    <p>You must be in an album to create a directory</p>
                </Fragment>
            });
            return;
        }

        setModalInfo!({
            ...modalInfo!,
            modalSize: "lg",
            modalShown: true,
            modalHeader: "Create Directory",
            canClose: true,
            modalContent:
            <Fragment>
                <Form onSubmit={(e) => makeDirectoryFormSubmitted(e)}>
                    <Form.Group className="mb-3">
                        <Form.Label>Directory Name</Form.Label>
                        <Form.Control name="directoryName" placeholder="Enter directory name" />
                        <Form.Text className="text-muted">
                            This will be the name the users see
                        </Form.Text>
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Create
                    </Button>
                </Form>
            </Fragment>
        });
    };

    const synchronouslyUploadPhotos = (photosArr: File[], curIt: number, albumCode: string, descendence: string) => {
        if(curIt >= photosArr.length){
            return;
        }

        let divElem = modalInfo!.modalContentElem.current?.querySelector(`#fileUploadingF${curIt}`)!;
        let uplStatusElem = divElem.querySelector("#uplStatus")!;
        uplStatusElem.innerHTML = "UPLOADING...";

        graphClient.mutate({
            mutation: mutPrepareForPhotoUpload,
            variables:{
                sess_id: CBP_SESSID,
                album_code: albumCode,
                descendence: descendence,
                image_type: photosArr[curIt].type
            }
        }).then(res => {
            if(!res.data){
                return;
            }
            if(!res.data.PrepareForPhotoUpload){
                return;
            }
            let uplId = res.data.PrepareForPhotoUpload.upload_id;
            let frmData = new FormData();
            frmData.append('File', photosArr[curIt]);
            fetch(GetBackendServlet(`uploadPhoto?upload_id=${uplId}&sess_id=${CBP_SESSID}`),{
                method: "POST",
                body: frmData
            }).then(response => response.json()).then(result => {
                //do something w result
                if(curIt + 1 < photosArr.length){
                    uplStatusElem.classList.remove("uploading-yellow-text");
                    uplStatusElem.classList.add("uploaded-green-text");
                    uplStatusElem.innerHTML = "UPLOADED";
                    synchronouslyUploadPhotos(photosArr, curIt+1, albumCode, descendence);
                }
                else{
                    setModalInfo!({
                        ...modalInfo!,
                        modalShown:false
                    });
                    refreshPage(true);
                }
            });

        });
    };

    const uploadPhotosFormSubmitted = (event: React.SyntheticEvent) => {
        event.preventDefault();
        let currentDesc = getCurrentDescendenceInAlbum();
        if(!currentDesc){
            return;
        }

        let frmData = new FormData(event.nativeEvent.target as HTMLFormElement);
        let allFiles: File[] = frmData.getAll("uploadFiles") as File[];

        setModalInfo!({
            ...modalInfo!,
            modalSize: "lg",
            modalShown: true,
            modalHeader: "Uploading...",
            canClose: false,
            modalContent:
            <Fragment>
                <OnLoadComponent onLoadCallback={() => {
                    synchronouslyUploadPhotos(allFiles, 0, currentDesc!.albumCode, currentDesc!.descendence);
                }}>
                    {allFiles.map((file, fileIndex) => (
                        <Fragment key={`${file.name}_${fileIndex}`}>
                            <Stack direction="vertical">
                                <div id={`fileUploadingF${fileIndex}`}>
                                    <Stack direction="horizontal">
                                        <h5 id="uplName">{file.name}</h5>
                                        <h5 id="uplStatus" className="ms-auto uploading-yellow-text">WAITING...</h5>
                                    </Stack>
                                </div>
                            </Stack>
                        </Fragment>
                    ))}
                </OnLoadComponent>
            </Fragment>
        });

        
    };

    const uploadPhotos = () => {
        let currentDesc = getCurrentDescendenceInAlbum();
        if(!currentDesc){
            setModalInfo!({
                ...modalInfo!,
                modalSize: "sm",
                modalShown: true,
                modalHeader: "Error",
                canClose: true,
                modalContent:
                <Fragment>
                    <p>You must be in an album to upload photos</p>
                </Fragment>
            });
            return;
        }

        setModalInfo!({
            ...modalInfo!,
            modalSize: "lg",
            modalShown: true,
            modalHeader: "Select Photos",
            canClose: true,
            modalContent:
            <Fragment>
                <Form onSubmit={(e) => uploadPhotosFormSubmitted(e)}>
                    <Form.Group className="mb-3">
                        <Form.Label>Select photos to upload</Form.Label>
                        <Form.Control name="uploadFiles" type="file" multiple />
                    </Form.Group>

                    <Button variant="primary" type="submit">
                        Upload
                    </Button>
                </Form>
            </Fragment>
        });
    };

    const closeModal = () => {
        setModalInfo!({
            ...modalInfo!,
            modalShown:false
        });
    };

    const generateMultipleQueryWaiter = (numberQueries: number, finalCallback: (allRes: any[]) => void) => {
        let queriesRecv: any[] = [];
        return (res: any) => {
            queriesRecv.push(res);
            if(queriesRecv.length >= numberQueries){
                finalCallback(queriesRecv);
            }
        };
    };

    const deleteSelectedFormSubmitted = () => {
        closeModal();

        let currentDesc = getCurrentDescendenceInAlbum();
        if(currentDesc){
            let directoriesToDeleteIDs = [];
            let photosToDeleteIDs = [];
            for(let i = 0; i < selectedMedia.length; i++){
                if(selectedMedia[i].__typename === "Directory"){
                    directoriesToDeleteIDs.push(selectedMedia[i].id);
                }
                if(selectedMedia[i].__typename === "Photo"){
                    photosToDeleteIDs.push(selectedMedia[i].id);
                }
            }

            let successCallback = (wasSuccessful: boolean) => {
                if(wasSuccessful){
                    setModalInfo!({
                        ...modalInfo!,
                        modalSize: "sm",
                        modalShown: true,
                        modalHeader: "Success",
                        canClose: true,
                        modalContent:
                        <Fragment>
                            <p>Items successfully deleted</p>
                        </Fragment>
                    });
                }
                else{
                    setModalInfo!({
                        ...modalInfo!,
                        modalSize: "sm",
                        modalShown: true,
                        modalHeader: "Error",
                        canClose: true,
                        modalContent:
                        <Fragment>
                            <p>Internal Error</p>
                        </Fragment>
                    });
                }

                graphClient.resetStore().then(() => {
                    refreshPage(true);
                });
            }

            if(directoriesToDeleteIDs.length > 0 && photosToDeleteIDs.length > 0){
                let queryWait = generateMultipleQueryWaiter(2, (allRes: any[]) => {
                    let realRes: Array<{name:string, data?:any}> = [{name:"DeleteDirectoryBunch"},{name:"DeletePhotoBunch"}];
    
                    for(let i = 0; i < allRes.length; i++){
                        if(!allRes[i].data){
                            continue;
                        }
                        for(let j = 0; j < realRes.length; j++){
                            if(!allRes[i].data[realRes[j].name]){
                                continue;
                            }
                            realRes[j].data = allRes[i].data[realRes[j].name];
                        }
                    }
    
                    let wasSuccessful = true;
                    for(let i = 0; i < realRes.length; i++){
                        if(!realRes[i].data || !realRes[i].data.success){
                            wasSuccessful = false;
                            break;
                        }
                    }
    
                    successCallback(wasSuccessful);
                });
    
                graphClient.mutate({
                    mutation: mutDeleteDirectoryBunch,
                    variables:{
                        sess_id: CBP_SESSID,
                        directory_ids: directoriesToDeleteIDs
                    }
                }).then((res) => {
                    queryWait(res);
                });
    
                graphClient.mutate({
                    mutation: mutDeletePhotoBunch,
                    variables:{
                        sess_id: CBP_SESSID,
                        photo_ids: photosToDeleteIDs
                    }
                }).then(res => {
                    queryWait(res);
                });
            }
            else if(directoriesToDeleteIDs.length > 0){
                graphClient.mutate({
                    mutation: mutDeleteDirectoryBunch,
                    variables:{
                        sess_id: CBP_SESSID,
                        directory_ids: directoriesToDeleteIDs
                    }
                }).then((res) => {
                    successCallback((!res.data || !res.data.DeleteDirectoryBunch.success) ? false : true);
                });
            }
            else if(photosToDeleteIDs.length > 0){
                graphClient.mutate({
                    mutation: mutDeletePhotoBunch,
                    variables:{
                        sess_id: CBP_SESSID,
                        photo_ids: photosToDeleteIDs
                    }
                }).then(res => {
                    successCallback((!res.data || !res.data.DeletePhotoBunch.success) ? false : true);
                });
            }

            
        }
        else{
            let albumsToDeleteIDs = [];
            for(let i = 0; i < selectedMedia.length; i++){
                if(selectedMedia[i].__typename === "Album"){
                    albumsToDeleteIDs.push(selectedMedia[i].id);
                }
            }

            graphClient.mutate({
                mutation: mutDeleteAlbumBunch,
                variables:{
                    sess_id: CBP_SESSID,
                    album_ids: albumsToDeleteIDs
                }
            }).then((res) => {
                if(!res.data){
                    setModalInfo!({
                        ...modalInfo!,
                        modalSize: "sm",
                        modalShown: true,
                        modalHeader: "Error",
                        canClose: true,
                        modalContent:
                        <Fragment>
                            <p>Internal Error</p>
                        </Fragment>
                    });
                    refreshPage(true);
                    return;
                }
                if(!res.data.DeleteAlbumBunch.success){
                    setModalInfo!({
                        ...modalInfo!,
                        modalSize: "sm",
                        modalShown: true,
                        modalHeader: "Error",
                        canClose: true,
                        modalContent:
                        <Fragment>
                            <p>Internal Error</p>
                        </Fragment>
                    });
                    refreshPage(true);
                    return;
                }

                setModalInfo!({
                    ...modalInfo!,
                    modalSize: "sm",
                    modalShown: true,
                    modalHeader: "Success",
                    canClose: true,
                    modalContent:
                    <Fragment>
                        <p>Albums successfully deleted</p>
                    </Fragment>
                });
                graphClient.resetStore().then(() => {
                    refreshPage(true);
                });
            });
        }
    };
    

    const deleteSelected = () => {

        if(selectedMedia.length == 0){
            setModalInfo!({
                ...modalInfo!,
                modalSize: "sm",
                modalShown: true,
                modalHeader: "Error",
                canClose: true,
                modalContent:
                <Fragment>
                    <p>Nothing selected</p>
                </Fragment>
            });
            return;
        }

        let photoNum = 0;
        let dirNum = 0;
        let albumNum = 0;
        let currentDesc = getCurrentDescendenceInAlbum();
        for(let i = 0; i < selectedMedia.length; i++){
            if(selectedMedia[i].__typename === "Album"){
                albumNum++;
            }
            if(selectedMedia[i].__typename === "Directory"){
                dirNum++;
            }
            if(selectedMedia[i].__typename === "Photo"){
                photoNum++;
            }
        }

        if(currentDesc){
            setModalInfo!({
                ...modalInfo!,
                modalSize: "lg",
                modalShown: true,
                modalHeader: "Confirmation",
                canClose: true,
                modalContent:
                <Fragment>
                    <p>Are you sure you want to delete {photoNum} photos and {dirNum} directories? They can not be recovered.</p>
                    <Stack direction="horizontal" gap={2}>
                        <Button onClick={deleteSelectedFormSubmitted} variant="danger">Yes</Button>
                        <Button onClick={closeModal}>No</Button>
                    </Stack>
                </Fragment>
            });
        }
        else{
            setModalInfo!({
                ...modalInfo!,
                modalSize: "lg",
                modalShown: true,
                modalHeader: "Confirmation",
                canClose: true,
                modalContent:
                <Fragment>
                    <p>Are you sure you want to delete {albumNum} albums? They can not be recovered.</p>
                    <Stack direction="horizontal" gap={2}>
                        <Button onClick={deleteSelectedFormSubmitted} variant="danger">Yes</Button>
                        <Button onClick={closeModal}>No</Button>
                    </Stack>
                </Fragment>
            });
        }


    };

    return (
        <Fragment>
            <div style={{height: `${navbarInfo!.yOffset + getNavbarHeight(navbarInfo!)}px`}}></div>

            <Container className="my-3">
                <Row className="my-2">
                    <Stack direction="horizontal">
                        <h1>Admin Album Browser</h1>
                        <div className={`ms-auto d-inline-block user-select-none m-1`}>
                            <Stack direction="horizontal" gap={2}>
                                <Button onClick={invertSelect}>Invert Selection</Button>
                                <DropdownButton title="Media Actions">
                                    <Dropdown.Item onClick={createAlbum}>Create Album</Dropdown.Item>
                                    <Dropdown.Item onClick={makeDirectory}>Create Directory</Dropdown.Item>
                                    <Dropdown.Item onClick={uploadPhotos}>Upload Photos</Dropdown.Item>
                                    <Dropdown.Item onClick={deleteSelected} className="dropdown-item-danger">Delete Selected</Dropdown.Item>
                                </DropdownButton>
                            </Stack>
                        </div>
                    </Stack>
                </Row>

                <Row className="my-2">
                    <Col>
                        <Stack direction="horizontal" gap={2}>
                            {currentPathArr.map((smPath, smPathIndex) => 
                                <Fragment key={smPath}>
                                    <div role="button" onClick={() => {popDirectory(smPathIndex)}} className='user-select-none bg-accent text-dark p-1'>
                                        {smPath}
                                    </div>
                                    <div className='user-select-none text-dark'>/</div>
                                </Fragment>
                            )}

                            <DropdownButton className="ms-auto bg-accent align-items-center" title={`View - ${itemViewType}`}>
                                {ItemViewTypes.map((viewType, viewTypeIndex) => 
                                    <Dropdown.Item onClick={(e) => setItemViewType(viewType)} className="justify-content-center d-inline-block" key={viewType}><Stack direction="horizontal">{viewType}{itemViewType === viewType ? <FontAwesomeIcon className="ms-auto" icon={faCheck} /> : <></>}</Stack></Dropdown.Item>
                                )}
                            </DropdownButton>

                            <div className="vr" />

                            <div className="col-xs-3">
                                <Stack direction="horizontal" gap={2}>
                                    <FontAwesomeIcon role="button" onClick={() => {popDirectory(currentPathArr.length - 2)}} size="2x" icon={faArrowTurnUp} className="text-dark" />
                                </Stack>
                            </div>
                        </Stack>
                    </Col>
                </Row>
            </Container>

            <Container className="my-3">
                
                
                {itemViewType === "Boxes" ? (<DirPhotoViewBoxStyleAdmin pathDirectoryData={pathDirectoryData} pathPhotosData={pathPhotosData} DirectoryClicked={DirectoryClicked} PhotoClicked={PhotoClicked} selectedMedia={selectedMedia} setSelectedMedia={setSelectedMedia} />) : (<></>)}
                {itemViewType === "List" ? (<DirPhotoViewListStyleAdmin pathDirectoryData={pathDirectoryData} pathPhotosData={pathPhotosData} DirectoryClicked={DirectoryClicked} PhotoClicked={PhotoClicked} selectedMedia={selectedMedia} setSelectedMedia={setSelectedMedia} />) : (<></>)}
                

            </Container>
        </Fragment>
    );
};

export default AdminAlbumBrowser;