import { QueryDatabase } from "../DatabaseConnector";

const SQLDateFormat = (date: Date):string => {
    return date.toISOString().slice(0, 19).replace('T', ' ');
};

const ClearOldActiveSessions = async () => {
    const expirationTime = 1000 * 60 * 60 * 24; //in milliseconds, expires 1 day after login
    let currentDate = new Date();
    let expirationDate = new Date(currentDate.getTime() - expirationTime);
    let queryRes = await QueryDatabase("DELETE FROM active_sessions WHERE created_at < ?", [SQLDateFormat(expirationDate)]);
};

const ClearOldPendingUploads = async () => {
    const expirationTime = 1000 * 60 * 60 * 24; //in milliseconds, expires 1 day after login
    let currentDate = new Date();
    let expirationDate = new Date(currentDate.getTime() - expirationTime);
    let queryRes = await QueryDatabase("DELETE FROM pending_uploads WHERE created_at < ?", [SQLDateFormat(expirationDate)]);
};

export {ClearOldActiveSessions, ClearOldPendingUploads};