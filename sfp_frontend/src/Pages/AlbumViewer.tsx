import React, { Fragment, useContext, useEffect, useRef, useState } from "react";
import { UserDispContext, GetBackendServlet, GetDateFormatMMDDYYYY, createPhotoLink } from "../Contexts/UserDisplayContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowTurnUp, faCheck, faFolder, faFile } from "@fortawesome/free-solid-svg-icons";

import { useParams } from "react-router-dom";
import { Directory, Photo } from "../CrossServerTypes/DataTypes";
import { Container, Row, Col, Stack, Form, Button, Alert, Dropdown, DropdownButton } from "react-bootstrap";

import { useApolloClient } from '@apollo/client';
import { AlbumInfoFromAlbumCode, DirectoriesPhotosFromAlbumCode } from "../CrossServerTypes/GraphQueries";
import Masonry from "masonry-layout";
import { NavbarContext, getNavbarHeight } from "../Contexts/NavbarContext";
import { ModalContext } from "../Contexts/ModalContext";
import { ItemViewTypes } from "../Components/ItemViewTypes";
import DirPhotoViewBoxStyle from "../Components/DirPhotoViews/DirPhotoViewBoxStyle";
import DirPhotoViewListStyle from "../Components/DirPhotoViews/DirPhotoViewListStyle";

const AlbumViewer = () => {

    const {dispInfo, setDispInfo} = useContext(UserDispContext);
    const {navbarInfo, setNavbarInfo} = useContext(NavbarContext);
    const {modalInfo, setModalInfo} = useContext(ModalContext);

    const graphClient = useApolloClient();
    
    useEffect(() => {
        
        setNavbarInfo!({...navbarInfo!, yOffset: 0});

        graphClient.query({query: DirectoriesPhotosFromAlbumCode, variables: {
            code: servedAlbumCode,
            descendence: getCurrentDescendence()
        }}).then((res) => {
            updateDirectoriesPhotos(res);
        });

        graphClient.query({query: AlbumInfoFromAlbumCode, variables: {
            code: servedAlbumCode
        }}).then((res) => {
            setAlbumName(res.data.AlbumInfoFromAlbumCode.name);
        });

    }, []);

    const {albumCode} = useParams();
    const servedAlbumCode = albumCode || "000000";
    const [albumName, setAlbumName] = useState("Album");

    const [pathDirectoryData, setPathDirectoryData] = useState<Array<Directory>>([]);
    const [pathPhotosData, setPathPhotosData] = useState<Array<Photo>>([]);
    const [currentPathArr, setCurrentPathArr] = useState<Array<string>>([servedAlbumCode]);
    
    const [itemViewType, setItemViewType] = useState<string>(ItemViewTypes[0]);

    const getCurrentDescendence = () => {
        let ret = "/";
        for(let i = 1; i < currentPathArr.length; i++){
            ret += currentPathArr[i] + "/";
        }
        return ret;
    };

    const refreshPage = () => {
        graphClient.query({query: DirectoriesPhotosFromAlbumCode, variables: {
            code: servedAlbumCode,
            descendence: getCurrentDescendence()
        }}).then((res) => {
            updateDirectoriesPhotos(res);
        });
    };
    
    const popDirectory = (newIt: number) => {
        if(newIt >= 0){
            let newArr = currentPathArr.slice(0, newIt+1);
            setCurrentPathArr(newArr);
        }
    };

    const PhotoClicked = (e:React.SyntheticEvent, photo: Photo) => {
        e.preventDefault();

        let imgHTML: HTMLImageElement | undefined = undefined;

        if(e.target instanceof HTMLDivElement){
            imgHTML = e.target.children[0] as HTMLImageElement;
        }
        else{
            imgHTML = e.target as HTMLImageElement;
        }

        setModalInfo!({
            ...modalInfo!,
            modalSize: (((imgHTML.naturalHeight * 1.1) > imgHTML.naturalWidth) ? "lg" : "xl"),
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

    };

    const DirectoryClicked = (e:React.SyntheticEvent, dir: Directory) => {
        e.preventDefault();

        setCurrentPathArr([...currentPathArr, dir.name]);
    };

    const updateDirectoriesPhotos = (graphqlQuery: {data: any}) => {
        if(graphqlQuery.data){
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
    };

    useEffect(() => {
        refreshPage();
    }, [currentPathArr]);

    return(
        <Fragment>

            <div style={{height: `${navbarInfo!.yOffset + getNavbarHeight(navbarInfo!)}px`}}></div>

            <Container className="my-3">
                <Row className="my-2">
                    <h1>Album Browser - {albumName}</h1>
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
                
                {itemViewType === "Boxes" ? (<DirPhotoViewBoxStyle pathDirectoryData={pathDirectoryData} pathPhotosData={pathPhotosData} DirectoryClicked={DirectoryClicked} PhotoClicked={PhotoClicked} />) : (<></>)}
                {itemViewType === "List" ? (<DirPhotoViewListStyle pathDirectoryData={pathDirectoryData} pathPhotosData={pathPhotosData} DirectoryClicked={DirectoryClicked} PhotoClicked={PhotoClicked} />) : (<></>)}

            </Container>
            
        </Fragment>
    );
};

export default AlbumViewer;