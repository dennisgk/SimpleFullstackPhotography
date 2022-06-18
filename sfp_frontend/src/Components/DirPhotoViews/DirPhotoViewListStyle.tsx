import { faFolder, faFile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { Fragment, useContext, useEffect, useRef, useState } from "react";
import { Row, Stack } from "react-bootstrap";
import { UserDispContext, GetDateFormatMMDDYYYY, createPhotoLink } from "../../Contexts/UserDisplayContext";
import { Directory, Photo } from "../../CrossServerTypes/DataTypes";


const DirPhotoViewListStyle = ({pathDirectoryData, pathPhotosData, DirectoryClicked, PhotoClicked}: {pathDirectoryData: Array<Directory>, pathPhotosData: Array<Photo>, DirectoryClicked: (e:React.SyntheticEvent, dir: Directory) => void, PhotoClicked: (e:React.SyntheticEvent, photo: Photo) => void}) => {

    const {dispInfo, setDispInfo} = useContext(UserDispContext);

    const [numLoadedImagesIndex, setNumLoadedImagesIndex] = useState<number>(20);
    const numLoadedImagesIncrease = 4;

    const listViewRef = useRef<HTMLDivElement>(null);

    const checkScrollToAddContent = () => {
        if ((window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 20) && pathPhotosData.length > numLoadedImagesIndex) {
            if(!listViewRef.current){
                return;
            }
            let imagesList = listViewRef.current!.querySelectorAll("#listViewImageActive");
            for(let i = 0; i < imagesList.length; i++){
                if(imagesList[i] instanceof HTMLImageElement){
                    let imgt: HTMLImageElement = imagesList[i] as HTMLImageElement;
                    console.log(imgt);
                    if(!imgt.complete || imgt.naturalHeight === 0){
                        return;
                    }
                }
            }
            setNumLoadedImagesIndex(numLoadedImagesIndex + numLoadedImagesIncrease);

        }
    };

    useEffect(() => {
        setNumLoadedImagesIndex(20);
    }, [pathPhotosData]);

    useEffect(() => {
        window.addEventListener("scroll", checkScrollToAddContent);
        return () => {
            window.removeEventListener("scroll", checkScrollToAddContent);
        };
    }, [numLoadedImagesIndex, pathPhotosData]);

    return (
        <Fragment>
            {pathDirectoryData.map(dirDat => (
                        <Fragment key={dirDat.id}>
                            <Row role="button" onClick={(e) => {DirectoryClicked(e, dirDat)}} className="my-3 mx-1">
                                <div className="text-dark py-3 bg-accent">
                                    <Stack direction="horizontal" gap={2}>
                                        {dirDat.name}
                                        <span className="ms-auto">{"Created On: "}{GetDateFormatMMDDYYYY(new Date(dirDat.created_at))}</span>
                                        <FontAwesomeIcon icon={faFolder} className="text-dark" />
                                    </Stack>
                                </div>
                            </Row>
                        </Fragment>
                    ))}

                    <hr />

                    <div ref={listViewRef}>
                        {pathPhotosData.map((photoDat, photoDatIndex) => (
                            <Fragment key={photoDat.id}>
                                <Row role="button" onClick={(e) => {PhotoClicked(e, photoDat)}} className={`${photoDatIndex < numLoadedImagesIndex ? "" : "d-none "}my-3 mx-1`}>
                                    <div className="text-dark py-3 bg-accent">
                                        <Stack direction="horizontal" gap={2}>
                                            <img id={photoDatIndex < numLoadedImagesIndex ? "listViewImageActive" : "listViewImageInactive"} className="img-fluid bg-accent p-0" style={{height:"10%"}} src={photoDatIndex < numLoadedImagesIndex ? createPhotoLink(photoDat, "internet") : ""} onLoad={() => {checkScrollToAddContent();}} />
                                            <span className="ms-auto">{"Created On: "}{GetDateFormatMMDDYYYY(new Date(photoDat.created_at))}</span>
                                            <FontAwesomeIcon icon={faFile} className="text-dark" />
                                        </Stack>
                                    </div>
                                </Row>
                            </Fragment>
                        )
                        )}
                    </div>
        </Fragment>
    );
}

export default DirPhotoViewListStyle;