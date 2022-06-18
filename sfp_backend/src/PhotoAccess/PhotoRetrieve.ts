import path from 'path';
import * as fs from 'fs';
import { QueryDatabase } from '../DatabaseConnector';
import { GetRandomString } from '../Utilities/RandomCreate';
import { ValidateSessionID } from '../Utilities/DatabaseMacros';
import { exec } from 'child_process';

export const imageStoragePath = "/sfp_images";
const errorImagePath = path.join(imageStoragePath, "ErrorImage.png");
const imageResizerScriptPath = path.join(imageStoragePath, "lowerPhotoRes.py");
const diskImageScriptPath = path.join(imageStoragePath, "getDiskInfo.py");

const qualityTypes = ["internet", "full"];

const GetPhotoPath = (album_id: number, photo_id: number, quality: string, photo_path: string): string => {
    let rPath = path.join(imageStoragePath, `${album_id}_${photo_id}_${quality}_${photo_path}`);
    if(!fs.existsSync(rPath)){
        return errorImagePath;
    }
    return rPath;
};

const ensureQueries = (queryObj: object, queries: string[]): boolean => {
	let queryKeys = Object.keys(queryObj);
	for(let i = 0; i < queries.length; i++){
		if(queryKeys.indexOf(queries[i]) == -1){
			return false;
		}
	}
	return true;
};

const HandleGetPhoto = async (req, res) => {
    if(ensureQueries(req.query, ["id", "path", "album_id_fk", "quality"])){
        if(qualityTypes.indexOf(req.query.quality) == -1){
            res.sendFile(errorImagePath);
            return;
        }
        QueryDatabase("SELECT * FROM photos WHERE id=? AND BINARY path=? AND album_id_fk=?", [req.query.id, req.query.path, req.query.album_id_fk]).then((rows:Array<any>) => {
            if(rows.length < 1){
                res.sendFile(errorImagePath);
                return;
            }
            res.sendFile(GetPhotoPath(rows[0].album_id_fk, rows[0].id, req.query.quality, rows[0].path));
        });
    }
    else{
        res.sendFile(errorImagePath);
        return;
    }
};

const HandleUploadPhoto = async(req, res) => {
    if(ensureQueries(req.query, ["upload_id", "sess_id"])){
        let queryRes = await ValidateSessionID(req.query.sess_id);
        if(!queryRes.login_success){
            res.send({success:false});
            return;
        }
        if(!req.files){
            res.send({success:false});
            return;
        }
        let pUploadId = parseInt(req.query.upload_id);
        let uploadInfArr = await QueryDatabase("SELECT * FROM pending_uploads WHERE id=?", [pUploadId]);
        if(uploadInfArr.length < 1){
            res.send({success:false});
            return;
        }
        await QueryDatabase("DELETE FROM pending_uploads WHERE id=?", [pUploadId]);
        let uploadInf = uploadInfArr[0];

        let originalFileName = Object.keys(req.files)[0];
        let file = req.files[originalFileName];

        let imageExtension = uploadInf.image_type.substring(6);
        let imageName = `${GetRandomString(8)}.${imageExtension}`;

        let insertObj = await QueryDatabase("INSERT INTO photos(parent_directory_id_fk, album_id_fk, path) VALUES(?, ?, ?)", [uploadInf.parent_directory_id_fk, uploadInf.album_id_fk, imageName]);
        let actualSavedPath = `${uploadInf.album_id_fk}_${insertObj.insertId}_full_${imageName}`;
        let internetSizedSavedPath = `${uploadInf.album_id_fk}_${insertObj.insertId}_internet_${imageName}`;

        file.mv(path.join(imageStoragePath, actualSavedPath), (err) => {
            if(err){
                res.json({success:false});
                return;
            }

            let command = `python3 "${imageResizerScriptPath}" -i "${path.join(imageStoragePath, actualSavedPath)}" -o "${path.join(imageStoragePath, internetSizedSavedPath)}"`;
            exec(command, (err, stdout, stderr) => {
                if(err){
                    res.json({success:false});
                }
                else{
                    res.json({success:true});
                }
            });
        });


    }
    else{
        res.json({success: false});
        return;
    }
};

const HandleGetServerInfo = async(req, res) => {
    if(ensureQueries(req.query, ["sess_id"])){
        exec(`python3 "${diskImageScriptPath}"`, (err, stdout, stderr) => {
            if(err){
                res.json({total: 0, used: 0, free: 0});
                return;
            }
            
            let splResult = stdout.split(";");
            let rTotal = 0;
            let rUsed = 0;
            let rFree = 0;

            for(let i = 0; i < splResult.length; i++){
                if(splResult[i].startsWith("total=")){
                    rTotal = parseInt(splResult[i].split("total=")[1]);
                }
                if(splResult[i].startsWith("used=")){
                    rUsed = parseInt(splResult[i].split("used=")[1]);
                }
                if(splResult[i].startsWith("free=")){
                    rFree = parseInt(splResult[i].split("free=")[1]);
                }
            }

            res.json({total: rTotal, used: rUsed, free: rFree});
            return;
        });
    }
    else{
        res.json({total: 0, used: 0, free: 0});
        return;
    }
};

export {HandleGetPhoto, HandleUploadPhoto, GetPhotoPath, HandleGetServerInfo};
