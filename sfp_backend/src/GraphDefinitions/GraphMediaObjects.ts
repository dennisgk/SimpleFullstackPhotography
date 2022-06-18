import { GraphQLBoolean, GraphQLID, GraphQLInt, GraphQLList, GraphQLObjectType, GraphQLString } from "graphql";
import { DateScalar } from "./GraphScalars";


const AlbumType = new GraphQLObjectType({
    name:"Album",
    fields:() => ({
        id:{type:GraphQLInt},
        name:{type:GraphQLString},
        code:{type:GraphQLString},
        created_at:{type:DateScalar}
    })
});

const DirectoryType = new GraphQLObjectType({
    name:"Directory",
    fields:() => ({
        id:{type:GraphQLInt},
        name:{type:GraphQLString},
        relative_album_path:{type:GraphQLString},
        parent_directory_id_fk:{type:GraphQLInt},
        album_id_fk:{type:GraphQLInt},
        created_at:{type:DateScalar}
    })
});

const PhotoType = new GraphQLObjectType({
    name:"Photo",
    fields:() => ({
        id:{type:GraphQLInt},
        parent_directory_id_fk:{type:GraphQLInt},
        album_id_fk:{type:GraphQLInt},
        path:{type:GraphQLString},
        created_at:{type:DateScalar}
    })
});

const DirectoryAndPhotoListReturn = new GraphQLObjectType({
    name:"DirectoriesPhotos",
    fields:() => ({
        directories:{type:new GraphQLList(DirectoryType)},
        photos:{type: new GraphQLList(PhotoType)}
    })
});

const ActiveAdminSessionType = new GraphQLObjectType({
    name:"ActiveAdminSession",
    fields:() => ({
        admin_account_id_fk:{type:GraphQLInt},
        sess_id:{type:GraphQLString},
        created_at:{type:DateScalar}
    })
});

const AttemptAdminLoginType = new GraphQLObjectType({
    name:"AttemptAdminLogin",
    fields:() => ({
        login_success:{type:GraphQLBoolean},
        active_session:{type:ActiveAdminSessionType}
    })
});

const AllAlbumsType = new GraphQLObjectType({
    name:"AllAlbums",
    fields:() => ({
        login_info:{type: AttemptAdminLoginType},
        albums:{type:new GraphQLList(AlbumType)}
    })
});

const AddAlbumSuccessType = new GraphQLObjectType({
    name:"AddAlbumSuccess",
    fields:() => ({
        success:{type:GraphQLBoolean},
        album:{type:AlbumType}
    })
});

const MakeDirectorySuccessType = new GraphQLObjectType({
    name:"MakeDirectorySuccess",
    fields:() => ({
        success:{type:GraphQLBoolean},
        directory:{type:DirectoryType}
    })
});

const SuccessType = new GraphQLObjectType({
    name:"Success",
    fields:() => ({
        success:{type:GraphQLBoolean}
    })
});

const PhotoUploadPrepType = new GraphQLObjectType({
    name:"PhotoUploadPrep",
    fields:() => ({
        parent_directory_id_fk:{type:GraphQLInt},
        album_id_fk:{type:GraphQLInt},
        upload_id:{type:GraphQLInt}
    })
});

export {AlbumType, DirectoryType, PhotoType, DirectoryAndPhotoListReturn, ActiveAdminSessionType, AttemptAdminLoginType, AllAlbumsType, AddAlbumSuccessType, MakeDirectorySuccessType, SuccessType, PhotoUploadPrepType};