import {gql} from '@apollo/client';

/*const DirectoriesFromAlbumCode = gql`

`;

const PhotosFromAlbumCode = gql`

`;*/

const DirectoriesPhotosFromAlbumCode = gql`
    query getDirectoriesPhotosFromAlbumCode($code: String!, $descendence: String!){
        DirectoriesPhotosFromAlbumCode(code: $code, descendence: $descendence){
            directories{
              id
              name
              relative_album_path
              parent_directory_id_fk
              album_id_fk
              created_at
            },
            photos{
              id
              parent_directory_id_fk
              album_id_fk
              created_at
              path
            }
        }
    }
`;

const AlbumInfoFromAlbumCode = gql`
    query getAlbumInfoFromAlbumCode($code: String!){
        AlbumInfoFromAlbumCode(code: $code){
            id,
            name,
            code,
            created_at
        }
    }
`

const AttemptAdminLogin = gql`
    query getAttemptAdminLogin($sess_id: String!){
        AttemptAdminLogin(sess_id: $sess_id){
            login_success
            active_session{
                admin_account_id_fk
                sess_id
                created_at
            }
        }
    }
`

const AllAlbums = gql`
    query getAllAlbums($sess_id: String!){
        AllAlbums(sess_id: $sess_id){
            login_info{
                login_success
            }
            albums{
                id
                name
                code
                created_at
            }
        }
    }
`

export {DirectoriesPhotosFromAlbumCode, AlbumInfoFromAlbumCode, AttemptAdminLogin, AllAlbums};