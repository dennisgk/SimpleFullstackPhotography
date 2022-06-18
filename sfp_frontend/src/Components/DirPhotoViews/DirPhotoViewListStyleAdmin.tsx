import { faFolder, faFile } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState, useRef, useEffect, Fragment } from "react";
import { Row, Stack } from "react-bootstrap";
import { UserDispContext, GetDateFormatMMDDYYYY, createPhotoLink } from "../../Contexts/UserDisplayContext";
import { Directory, Album, Photo } from "../../CrossServerTypes/DataTypes";


const DirPhotoViewListStyleAdmin = ({pathDirectoryData, pathPhotosData, DirectoryClicked, PhotoClicked, selectedMedia, setSelectedMedia}: {pathDirectoryData: Array<Directory | Album>, pathPhotosData: Array<Photo>, DirectoryClicked: (e:React.SyntheticEvent, dir: Directory | Album) => void, PhotoClicked: (e:React.SyntheticEvent, photo: Photo) => void, selectedMedia: Array<Directory | Photo | Album>, setSelectedMedia: React.Dispatch<React.SetStateAction<Array<Directory | Photo | Album>>>}) => {
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
                    <Fragment key={dirDat.__typename === "Directory" ? `d_${dirDat.id}` : `a_${dirDat.id}`}>
                        <Row className="my-3 mx-1">
                            <div className={`text-dark py-3 ${(selectedMedia.includes(dirDat)) ? "bg-selected" : "bg-accent"}`}>
                                <Stack direction="horizontal" gap={2}>
                                    <input checked={(selectedMedia.includes(dirDat) ? true : false)} onChange={(e) => {mediaSelected(e, dirDat)}} type="checkbox" className="ms-3 me-2" />
                                    <Stack role="button" onClick={(e) => {DirectoryClicked(e, dirDat)}} direction="horizontal" gap={2} className="w-100">
                                        {dirDat.name}
                                        {dirDat.__typename === "Directory" ? <></> : <>{" - "}{(dirDat as Album).code}</>}
                                        <span className="ms-auto">{"Created On: "}{GetDateFormatMMDDYYYY(new Date(dirDat.created_at))}</span>
                                        <FontAwesomeIcon icon={faFolder} className="text-dark" />
                                    </Stack>
                                </Stack>
                            </div>
                        </Row>
                    </Fragment>
                        
                    ))}

                    <hr />

                    <div ref={listViewRef}>
                        {pathPhotosData.map((photoDat, photoDatIndex) => (
                            <Fragment key={photoDat.id}>
                                <Row id="photoContentRow" role="button" onClick={(e) => {PhotoClicked(e, photoDat)}} className={`${photoDatIndex < numLoadedImagesIndex ? "" : "d-none "}my-3 mx-1`}>
                                    <div className={`text-dark py-3 ${(selectedMedia.includes(photoDat)) ? "bg-selected" : "bg-accent"}`}>
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
};

export default DirPhotoViewListStyleAdmin;