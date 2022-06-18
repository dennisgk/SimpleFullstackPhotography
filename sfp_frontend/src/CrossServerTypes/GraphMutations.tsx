import {gql} from '@apollo/client';

const mutAdminLogin = gql`

    mutation mutAdminLogin($adminUsername: String!, $adminPassword: String!){
        AdminLogin(adminUsername: $adminUsername, adminPassword: $adminPassword){
            admin_account_id_fk
            sess_id
            created_at
        }
    }
`;

const mutAddAlbum = gql`

    mutation mutAddAlbum($sess_id: String!, $album_name: String!, $album_code: String!){
        AddAlbum(sess_id: $sess_id, album_name: $album_name, album_code: $album_code){
            success
        }
    }

`

const mutMakeDirectory = gql`

    mutation mutMakeDirectory($sess_id: String!, $directory_name: String!, $descendence: String!, $album_code: String!){
        MakeDirectory(sess_id: $sess_id, directory_name: $directory_name, descendence: $descendence, album_code: $album_code){
            success
        }
    }

`

const mutDeleteDirectoryBunch = gql`

    mutation mutDeleteDirectoryBunch($sess_id: String!, $directory_ids: [Int]!){
        DeleteDirectoryBunch(sess_id: $sess_id, directory_ids: $directory_ids){
            success
        }
    }

`

const mutDeletePhotoBunch = gql`

    mutation mutDeletePhotoBunch($sess_id: String!, $photo_ids: [Int]!){
        DeletePhotoBunch(sess_id: $sess_id, photo_ids: $photo_ids){
            success
        }
    }

`

const mutDeleteAlbumBunch = gql`

    mutation mutDeleteAlbumBunch($sess_id: String!, $album_ids: [Int]!){
        DeleteAlbumBunch(sess_id: $sess_id, album_ids: $album_ids){
            success
        }
    }

`

const mutPrepareForPhotoUpload = gql`

    mutation mutPrepareForPhotoUpload($sess_id: String!, $descendence: String!, $album_code: String!, $image_type: String!){
        PrepareForPhotoUpload(sess_id: $sess_id, descendence: $descendence, album_code: $album_code, image_type: $image_type){
            upload_id
        }
    }

`

export {mutAdminLogin, mutAddAlbum, mutMakeDirectory, mutDeleteDirectoryBunch, mutDeletePhotoBunch, mutDeleteAlbumBunch, mutPrepareForPhotoUpload};