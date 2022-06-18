import { QueryDatabase } from "../DatabaseConnector";
import { GetPhotoPath, imageStoragePath } from "../PhotoAccess/PhotoRetrieve";
import * as fs from 'fs';
import path from 'path';

const ValidateSessionID = async (sess_id: string) => {
    let queryRes = (await QueryDatabase("SELECT * FROM active_sessions WHERE BINARY sess_id=?", [sess_id]));
    if(queryRes.length < 1){
        return {login_success: false, active_session: null};
    }
    let activeSessionObj = queryRes[0];
    let adminObj = (await QueryDatabase("SELECT * FROM admin_accounts WHERE id=?", [activeSessionObj.admin_account_id_fk]));
    if(adminObj.length < 1){
        return {login_success: false, active_session: null};
    }
    return {login_success: true, active_session: activeSessionObj};
}

const GetAlbumFromCode = async (album_code: string) => {
    let queryRes = (await QueryDatabase("SELECT * FROM albums WHERE BINARY code=?", [album_code]));
    if(queryRes.length < 1){
        return undefined;
    }
    return queryRes[0];
}

const GetDirectoryFromDescendence = async (desc: string, albumId: number) => {
    if(desc === "/"){
        return {id: null};
    }
    let queryRes = (await QueryDatabase("SELECT * FROM directories WHERE album_id_fk=? AND BINARY relative_album_path=?", [albumId, desc]));
    if(queryRes.length < 1){
        return null;
    }
    return queryRes[0];
};

const DeleteDirectoryRecursive = async (dirId: number) => {
    let allPhotos = await QueryDatabase("SELECT * FROM photos WHERE parent_directory_id_fk=?", [dirId]);
    for(let i = 0; i < allPhotos.length; i++){
        await DeletePhotoAllWithObject(allPhotos[i]);
    }
    let childrenDirs = await QueryDatabase("SELECT * FROM directories WHERE parent_directory_id_fk=?", [dirId]);
    for(let i = 0; i < childrenDirs.length; i++){
        await DeleteDirectoryRecursive(childrenDirs[i].id);
    }
    await QueryDatabase("DELETE FROM directories WHERE id=?", [dirId]);
};

const DeletePhotoAll = async(photoId: number) => {
    let photoArr = await QueryDatabase("SELECT * FROM photos WHERE id=?", [photoId]);
    if(photoArr.length < 1){
        return;
    }
    let photo = photoArr[0];
    await QueryDatabase("DELETE FROM photos WHERE id=?", [photo.id]);
    let photoPath1 = GetPhotoPath(photo.album_id_fk, photo.id, "full", photo.path);
    let photoPath2 = GetPhotoPath(photo.album_id_fk, photo.id, "internet", photo.path);
    fs.rm(photoPath1, (err) => {});
    fs.rm(photoPath2, (err) => {});
};

const DeletePhotoAllWithObject = async(photo: any) => {
    await QueryDatabase("DELETE FROM photos WHERE id=?", [photo.id]);
    let photoPath1 = GetPhotoPath(photo.album_id_fk, photo.id, "full", photo.path);
    let photoPath2 = GetPhotoPath(photo.album_id_fk, photo.id, "internet", photo.path);
    fs.rm(photoPath1, (err) => {});
    fs.rm(photoPath2, (err) => {});
}

export {ValidateSessionID, GetAlbumFromCode, GetDirectoryFromDescendence, DeleteDirectoryRecursive, DeletePhotoAll, DeletePhotoAllWithObject};