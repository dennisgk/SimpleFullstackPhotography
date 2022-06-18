export type Album = {
    id:number,
    name:string,
    code:string,
    created_at:string,
    __typename:string
};

export type Directory = {
    id:number,
    name:string,
    relative_album_path:string,
    parent_directory_id_fk:number | null,
    album_id_fk:number,
    created_at:string,
    __typename:string
};

export type Photo = {
    id:number,
    parent_directory_id_fk:number | null,
    album_id_fk:number,
    path:string,
    created_at:string,
    __typename:string
};