import { GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";
import { QueryDatabase } from "../DatabaseConnector";
import { GetDirectoryFromDescendence, ValidateSessionID } from "../Utilities/DatabaseMacros";
import { AlbumType, AllAlbumsType, AttemptAdminLoginType, DirectoryAndPhotoListReturn, DirectoryType, PhotoType } from "./GraphMediaObjects";
import { DateScalar } from "./GraphScalars";

const QueryDirectoriesFromAlbumCode = {
    type:new GraphQLList(DirectoryType),
    args:{
        code:{type:new GraphQLNonNull(GraphQLString)},
        descendence:{type: new GraphQLNonNull(GraphQLString)}
    },
    resolve: async (parent, args, context, resolveInfo) => {
        let queryRes = (await QueryDatabase("SELECT id FROM albums WHERE code=?", [args.code]));
        if(queryRes.length < 1){
            return [];
        }
        let albumObj = queryRes[0];
        if(Object.keys(albumObj).indexOf("id") === -1){
            return [];
        }
        let parentDir = await GetDirectoryFromDescendence(args.descendence, albumObj.id);
        if(!parentDir){
            return [];
        }
        let albumId:number = albumObj.id;
        let directoriesList: any[] = undefined;
        if(parentDir.id){
            directoriesList = (await QueryDatabase("SELECT * FROM directories WHERE album_id_fk=? AND parent_directory_id_fk=?", [albumId, parentDir.id])) as any[];
        }
        else{
            directoriesList = (await QueryDatabase("SELECT * FROM directories WHERE album_id_fk=? AND parent_directory_id_fk IS NULL", [albumId])) as any[];
        }

        return directoriesList;
    }
};

const QueryPhotosFromAlbumCode = {
    type:new GraphQLList(PhotoType),
    args:{
        code:{type:new GraphQLNonNull(GraphQLString)},
        descendence:{type: new GraphQLNonNull(GraphQLString)}
    },
    resolve: async (parent, args, context, resolveInfo) => {
        let queryRes = (await QueryDatabase("SELECT id FROM albums WHERE code=?", [args.code]));
        if(queryRes.length < 1){
            return [];
        }
        let albumObj = queryRes[0];
        if(Object.keys(albumObj).indexOf("id") === -1){
            return [];
        }
        let parentDir = await GetDirectoryFromDescendence(args.descendence, albumObj.id);
        if(!parentDir){
            return [];
        }
        let albumId:number = albumObj.id;
        let photosList: any[] = undefined;
        if(parentDir.id){
            photosList = (await QueryDatabase("SELECT * FROM photos WHERE album_id_fk=? AND parent_directory_id_fk=?", [albumId, parentDir.id])) as any[];
        }
        else{
            photosList = (await QueryDatabase("SELECT * FROM photos WHERE album_id_fk=? AND parent_directory_id_fk IS NULL", [albumId])) as any[];
        }

        return photosList;
    }
};

const QueryDirectoriesPhotosFromAlbumCode = {
    type:DirectoryAndPhotoListReturn,
    args:{
        code:{type:new GraphQLNonNull(GraphQLString)},
        descendence:{type: new GraphQLNonNull(GraphQLString)}
    },
    resolve: async (parent, args, context, resolveInfo) => {
        let queryRes = (await QueryDatabase("SELECT id FROM albums WHERE code=?", [args.code]));
        if(queryRes.length < 1){
            return {directories: [], photos: []};
        }
        let albumObj = queryRes[0];
        if(Object.keys(albumObj).indexOf("id") === -1){
            return {directories: [], photos: []};
        }
        let parentDir = await GetDirectoryFromDescendence(args.descendence, albumObj.id);
        if(!parentDir){
            return {directories: [], photos: []};
        }
        let albumId:number = albumObj.id;
        let photosList: any[];
        let directoriesList: any[];
        if(parentDir.id){
            photosList = (await QueryDatabase("SELECT * FROM photos WHERE album_id_fk=? AND parent_directory_id_fk=?", [albumId, parentDir.id])) as any[];
            directoriesList = (await QueryDatabase("SELECT * FROM directories WHERE album_id_fk=? AND parent_directory_id_fk=?", [albumId, parentDir.id])) as any[];
        }
        else{
            photosList = (await QueryDatabase("SELECT * FROM photos WHERE album_id_fk=? AND parent_directory_id_fk IS NULL", [albumId])) as any[];
            directoriesList = (await QueryDatabase("SELECT * FROM directories WHERE album_id_fk=? AND parent_directory_id_fk IS NULL", [albumId])) as any[];
        }

        return {directories: directoriesList, photos: photosList};
    }
};

const QueryAlbumInfoFromAlbumCode = {
    type:AlbumType,
    args:{
        code:{type:new GraphQLNonNull(GraphQLString)}
    },
    resolve: async (parent, args, context, resolveInfo) => {
        let queryRes = (await QueryDatabase("SELECT * FROM albums WHERE code=?", [args.code]));
        if(queryRes.length < 1){
            return null;
        }
        let albumObj = queryRes[0];

        return albumObj;
    }
};

const QueryAttemptAdminLogin = {
    type:AttemptAdminLoginType,
    args:{
        sess_id:{type:new GraphQLNonNull(GraphQLString)}
    },
    resolve: async (parent, args, context, resolveInfo) => {
        let queryRes = await ValidateSessionID(args.sess_id);
        return queryRes;
    }
};

const QueryAllAlbums = {
    type:AllAlbumsType,
    args:{
        sess_id:{type:new GraphQLNonNull(GraphQLString)}
    },
    resolve: async (parent, args, context, resolveInfo) => {
        let queryRes = await ValidateSessionID(args.sess_id);
        if(!queryRes.login_success){
            return {
                login_info: queryRes,
                albums: []
            };
        }

        let albumRes = await QueryDatabase("SELECT * FROM albums", []);
        return {
            login_info: queryRes,
            albums: albumRes
        };

    }
};


export {QueryAlbumInfoFromAlbumCode, QueryDirectoriesFromAlbumCode, QueryPhotosFromAlbumCode, QueryDirectoriesPhotosFromAlbumCode, QueryAttemptAdminLogin, QueryAllAlbums}