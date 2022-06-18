import Masonry from "masonry-layout";
import React, { Fragment, useContext, useEffect, useRef, useState } from "react";
import { Stack } from "react-bootstrap";
import { createPhotoLink, GetBackendServlet, UserDispContext } from "../../Contexts/UserDisplayContext";
import { Album, Directory, Photo } from "../../CrossServerTypes/DataTypes";


const DirPhotoViewBoxStyleAdmin = ({pathDirectoryData, pathPhotosData, DirectoryClicked, PhotoClicked, selectedMedia, setSelectedMedia}: {pathDirectoryData: Array<Directory | Album>, pathPhotosData: Array<Photo>, DirectoryClicked: (e:React.SyntheticEvent, dir: Directory | Album) => void, PhotoClicked: (e:React.SyntheticEvent, photo: Photo) => void, selectedMedia: Array<Directory | Photo | Album>, setSelectedMedia: React.Dispatch<React.SetStateAction<Array<Directory | Photo | Album>>>}) => {
    
    const {dispInfo, setDispInfo} = useContext(UserDispContext);

    const [numLoadedImagesIndex, setNumLoadedImagesIndex] = useState<number>(20);
    const numLoadedImagesIncrease = 4;

    const masonryRef = useRef<HTMLDivElement>(null);
    const [masonryWall, setMasonryWall] = useState<Masonry | undefined>(undefined);

    const setupMasonry = () => {
        if(masonryRef.current){
            if(masonryWall){
                masonryWall!.destroy!();
            }
            let msrny = new Masonry(masonryRef.current, {
                itemSelector: ".grid-item",
                columnWidth: 0,
                transitionDuration: 0
            });
            setMasonryWall(msrny);
        }
    };

    const fixMasonryWall = () => {
        if(masonryWall != undefined){
            masonryWall!.reloadItems!();
            masonryWall!.layout!();
        }
    };

    const checkScrollToAddContent = () => {
        if ((window.innerHeight + window.scrollY) >= (document.body.scrollHeight - 20) && pathPhotosData.length > numLoadedImagesIndex) {
            
            if(!masonryRef.current){
                return;
            }
            let imagesList = masonryRef.current?.querySelectorAll(".grid-item");
            for(let i = 0; i < imagesList.length; i++){
                if(imagesList[i].children.length > 0){
                    if(imagesList[i].children[0] instanceof HTMLImageElement){
                        let imgt: HTMLImageElement = imagesList[i].children[0] as HTMLImageElement;
                        if(!imgt.complete || imgt.naturalHeight === 0){
                            return;
                        }
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
        setupMasonry();
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
                    <div className={`${dispInfo!.docWidth} d-inline-block`}>
                        <div className={`user-select-none m-1 ${(selectedMedia.includes(dirDat)) ? "bg-selected" : "bg-accent"}`}>
                            <Stack direction="horizontal">
                                <input checked={(selectedMedia.includes(dirDat) ? true : false)} onChange={(e) => {mediaSelected(e, dirDat)}} type="checkbox" className="ms-3 me-2" />
                                <div role="button" onClick={(e) => {DirectoryClicked(e, dirDat)}} className="text-dark my-1 ps-1 pt-3 pb-3 w-100">
                                    {dirDat.name}
                                    {dirDat.__typename === "Directory" ? <></> : <>{" - "}{(dirDat as Album).code}</>}
                                </div>
                            </Stack>
                        </div>
                    </div>
                </Fragment>
            ))}

            <hr className="my-2" />

            <div ref={masonryRef}>
                {pathPhotosData.map((photoDat, photoDatIndex) => (
                    <Fragment key={photoDat.id}>
                        <div role="button" onClick={(e) => {PhotoClicked(e, photoDat)}} className={`${dispInfo!.docWidth} ${photoDatIndex < numLoadedImagesIndex ? "grid-item" : "d-none"} p-1`}>
                            <img className={`img-fluid ${(selectedMedia.includes(photoDat)) ? "bg-selected" : "bg-accent"} p-2`} style={{width:"100%"}} src={photoDatIndex < numLoadedImagesIndex ? createPhotoLink(photoDat, "internet") : ""} onLoad={() => {checkScrollToAddContent();fixMasonryWall();}} />
                        </div>
                    </Fragment>
                )
                )}
            </div>
        </Fragment>
    );
};

export default DirPhotoViewBoxStyleAdmin;