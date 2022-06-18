import { GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLString } from "graphql";
import { QueryDatabase } from "../DatabaseConnector";
import { DeleteDirectoryRecursive, DeletePhotoAll, DeletePhotoAllWithObject, GetAlbumFromCode, GetDirectoryFromDescendence, ValidateSessionID } from "../Utilities/DatabaseMacros";
import { GetRandomString } from "../Utilities/RandomCreate";
import { ActiveAdminSessionType, AddAlbumSuccessType, AlbumType, DirectoryType, MakeDirectorySuccessType, PhotoUploadPrepType, SuccessType } from "./GraphMediaObjects";

const MutateAdminLogin = {
    type:ActiveAdminSessionType,
    args:{
        adminUsername:{type:new GraphQLNonNull(GraphQLString)},
        adminPassword:{type:new GraphQLNonNull(GraphQLString)}
    },
    resolve: async (parent, args, context, resolveInfo) => {
        let queryRes = (await QueryDatabase("SELECT * FROM admin_accounts WHERE BINARY username=? AND BINARY password=?", [args.adminUsername, args.adminPassword]));
        if(queryRes.length < 1){
            return null;
        }
        let adminAccountId = queryRes[0].id;
        let newSessId = GetRandomString(31);

        await QueryDatabase("INSERT INTO active_sessions(admin_account_id_fk, sess_id) VALUES(?, ?)", [adminAccountId, newSessId]);

        return {
            admin_account_id_fk:adminAccountId,
            sess_id:newSessId,
            created_at:(new Date())
        };
    }
};

const MutateAddAlbum = {
    type:AddAlbumSuccessType,
    args:{
        sess_id:{type:new GraphQLNonNull(GraphQLString)},
        album_name:{type:new GraphQLNonNull(GraphQLString)},
        album_code:{type:new GraphQLNonNull(GraphQLString)}
    },
    resolve: async (parent, args, context, resolveInfo) => {
        let queryRes = await ValidateSessionID(args.sess_id);
        if(!queryRes.login_success){
            return {
                success:false,
                album:null
            };
        }

        let insertId = 0;
        try{
            let insertRes = await QueryDatabase("INSERT INTO albums(name, code) VALUES(?, ?)", [args.album_name, args.album_code]);
            insertId = insertRes.insertId;
        }
        catch(err){
            return{
                success:false,
                album:null
            };
        }

        let albumObj = await QueryDatabase("SELECT * FROM albums WHERE id=?", [insertId]);

        return{
            success:true,
            album:albumObj[0]
        };
    }
};

const MutateMakeDirectory = {
    type:MakeDirectorySuccessType,
    args:{
        sess_id:{type:new GraphQLNonNull(GraphQLString)},
        directory_name:{type:new GraphQLNonNull(GraphQLString)},
        descendence:{type:new GraphQLNonNull(GraphQLString)},
        album_code:{type:new GraphQLNonNull(GraphQLString)},
    },
    resolve: async (parent, args, context, resolveInfo) => {
        let queryRes = await ValidateSessionID(args.sess_id);
        if(!queryRes.login_success){
            return {
                success:false,
                directory:null
            };
        }
        let albumObj = await GetAlbumFromCode(args.album_code);
        if(!albumObj){
            return {
                success: false,
                directory: null
            };
        }

        let insertId = 0;
        try{
            let parentDir = await GetDirectoryFromDescendence(args.descendence, albumObj.id);
            if(args.directory_name.length < 1){
                throw new Error("Directory name invalid");
            }
            if(!parentDir){
                throw new Error("No parent found");
            }
            let relAlbumPath = args.descendence + args.directory_name + "/";
            let checkForSameName = await QueryDatabase("SELECT * FROM directories WHERE BINARY relative_album_path=?", [relAlbumPath]);
            if(checkForSameName.length > 0){
                throw new Error("Folder already exists");
            }
            let insertRes = await QueryDatabase("INSERT INTO directories(name, relative_album_path, parent_directory_id_fk, album_id_fk) VALUES(?, ?, ?, ?)", [args.directory_name, relAlbumPath, parentDir.id, albumObj.id]);
            insertId = insertRes.insertId;
        }
        catch(err){
            return{
                success:false,
                directory:null
            };
        }

        let directoryObj = await QueryDatabase("SELECT * FROM directories WHERE id=?", [insertId]);

        return{
            success:true,
            directory:directoryObj[0]
        };

    }
};


const MutateDeleteDirectoryBunch = {
    type:SuccessType,
    args:{
        sess_id:{type:new GraphQLNonNull(GraphQLString)},
        directory_ids:{type:new GraphQLNonNull(new GraphQLList(GraphQLInt))}
    },
    resolve: async (parent, args, context, resolveInfo) => {
        let queryRes = await ValidateSessionID(args.sess_id);
        if(!queryRes.login_success){
            return {
                success:false
            };
        }

        try{
            for(let i = 0; i < args.directory_ids.length; i++){
                await DeleteDirectoryRecursive(args.directory_ids[i]);
            }
        }
        catch(err){
            return{
                success:false
            };
        };

        return{
            success:true
        };
    }
};


const MutateDeleteAlbumBunch = {
    type:SuccessType,
    args:{
        sess_id:{type:new GraphQLNonNull(GraphQLString)},
        album_ids:{type:new GraphQLNonNull(new GraphQLList(GraphQLInt))}
    },
    resolve: async (parent, args, context, resolveInfo) => {
        let queryRes = await ValidateSessionID(args.sess_id);
        if(!queryRes.login_success){
            return {
                success:false
            };
        }

        try{
            for(let i = 0; i < args.album_ids.length; i++){
                let allPhotos = await QueryDatabase("SELECT * FROM photos WHERE album_id_fk=?", [args.album_ids[i]]);
                for(let i = 0; i < allPhotos.length; i++){
                    DeletePhotoAllWithObject(allPhotos[i]);
                }
                let subDirs = await QueryDatabase("SELECT * FROM directories WHERE album_id_fk=? AND parent_directory_id_fk IS NULL", [args.album_ids[i]]);
                for(let i = 0; i < subDirs.length; i++){
                    await DeleteDirectoryRecursive(subDirs[i].id);
                }
                await QueryDatabase("DELETE FROM albums WHERE id=?", [args.album_ids[i]]);
            }
        }
        catch(err){
            return{
                success:false
            };
        };

        return{
            success:true
        };
    }
};

const MutateDeletePhotoBunch = {
    type:SuccessType,
    args:{
        sess_id:{type:new GraphQLNonNull(GraphQLString)},
        photo_ids:{type:new GraphQLNonNull(new GraphQLList(GraphQLInt))}
    },
    resolve: async (parent, args, context, resolveInfo) => {
        let queryRes = await ValidateSessionID(args.sess_id);
        if(!queryRes.login_success){
            return {
                success:false
            };
        }

        try{
            for(let i = 0; i < args.photo_ids.length; i++){
                await DeletePhotoAll(args.photo_ids[i]);
            }
        }
        catch(err){
            return{
                success:false
            };
        };

        return{
            success:true
        };
    }
};

const MutatePrepareForPhotoUpload = {
    type:PhotoUploadPrepType,
    args:{
        sess_id:{type: new GraphQLNonNull(GraphQLString)},
        descendence:{type: new GraphQLNonNull(GraphQLString)},
        album_code:{type:new GraphQLNonNull(GraphQLString)},
        image_type:{type:new GraphQLNonNull(GraphQLString)}
    },
    resolve: async (parent, args, context, resolveInfo) => {
        let queryRes = await ValidateSessionID(args.sess_id);
        if(!queryRes.login_success){
            return null;
        }
        let albumObj = await GetAlbumFromCode(args.album_code);
        if(!albumObj){
            return null;
        }
        let parentDir = await GetDirectoryFromDescendence(args.descendence, albumObj.id);
        if(!parentDir){
            return null;
        }
        let insertObj: any = undefined;

        if(parentDir.id){
            insertObj = await QueryDatabase("INSERT INTO pending_uploads(parent_directory_id_fk, album_id_fk, image_type) VALUES(?, ?, ?)", [parentDir.id, albumObj.id, args.image_type]);
        }
        else{
            insertObj = await QueryDatabase("INSERT INTO pending_uploads(album_id_fk, image_type) VALUES(?, ?)", [albumObj.id, args.image_type]);
        }

        if(insertObj === undefined){
            return null;
        }
        
        return {
            parent_directory_id_fk:parentDir.id,
            album_id_fk:albumObj.id,
            upload_id:Number(insertObj.insertId)
        };

    }
};



export {MutateAdminLogin, MutateAddAlbum, MutateMakeDirectory, MutateDeleteDirectoryBunch, MutateDeleteAlbumBunch, MutateDeletePhotoBunch, MutatePrepareForPhotoUpload}