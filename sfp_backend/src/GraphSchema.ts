import { GraphQLSchema, GraphQLObjectType, GraphQLInt, GraphQLString, GraphQLList, GraphQLNonNull } from "graphql";
import { MutateAddAlbum, MutateAdminLogin, MutateDeleteAlbumBunch, MutateDeleteDirectoryBunch, MutateDeletePhotoBunch, MutateMakeDirectory, MutatePrepareForPhotoUpload } from "./GraphDefinitions/GraphMutations";
import { QueryAlbumInfoFromAlbumCode, QueryAllAlbums, QueryAttemptAdminLogin, QueryDirectoriesFromAlbumCode, QueryDirectoriesPhotosFromAlbumCode, QueryPhotosFromAlbumCode } from "./GraphDefinitions/GraphQueries";
import { DateScalar } from "./GraphDefinitions/GraphScalars";
import { addResolversToSchema } from "@graphql-tools/schema"

const RootQuery = new GraphQLObjectType({
    name:"RootQuery",
    fields:{
        DirectoriesFromAlbumCode: QueryDirectoriesFromAlbumCode,
        PhotosFromAlbumCode: QueryPhotosFromAlbumCode,
        DirectoriesPhotosFromAlbumCode: QueryDirectoriesPhotosFromAlbumCode,
        AlbumInfoFromAlbumCode: QueryAlbumInfoFromAlbumCode,
        AttemptAdminLogin: QueryAttemptAdminLogin,
        AllAlbums: QueryAllAlbums
    }
});

const RootMutation = new GraphQLObjectType({
    name:"RootMutation",
    fields:{
        AddAlbum:MutateAddAlbum,
        AdminLogin:MutateAdminLogin,
        MakeDirectory:MutateMakeDirectory,
        DeleteDirectoryBunch:MutateDeleteDirectoryBunch,
        DeleteAlbumBunch:MutateDeleteAlbumBunch,
        DeletePhotoBunch:MutateDeletePhotoBunch,
        PrepareForPhotoUpload:MutatePrepareForPhotoUpload
    }
});

const resolverFunctions = {
    Date: DateScalar
}

const sfp_schema_no_resolvers = new GraphQLSchema({query: RootQuery, mutation: RootMutation});
const sfp_schema = addResolversToSchema(sfp_schema_no_resolvers, resolverFunctions);

export {sfp_schema};
