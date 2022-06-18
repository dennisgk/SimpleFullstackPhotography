import React, { createContext, useRef, useEffect } from "react";
import {isMobile} from 'react-device-detect';
import { Photo } from "../CrossServerTypes/DataTypes";

const GetBackendServlet = (servletName:string) => {
  let backend = `${process.env.REACT_APP_BACKEND_PROTOCOL}://${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}/`;
  return BuildPath(backend, servletName);
}

const createPhotoLink = (photo: Photo, quality: "internet" | "full"):string => {
  return GetBackendServlet(`/photo?id=${photo.id}&path=${photo.path}&album_id_fk=${photo.album_id_fk}&quality=${quality}`);
};

const BuildPath = (...args: any[]) => {
  return args.map((part, i) => {
    if (i === 0) {
      return part.trim().replace(/[\/]*$/g, '')
    } else {
      return part.trim().replace(/(^[\/]*|[\/]*$)/g, '')
    }
  }).filter(x=>x.length).join('/')
};

const GetDateFormatMMDDYYYY = (date: Date) => {
  let mm = date.getMonth() + 1;
  let dd = date.getDate();

  return [(mm > 9 ? "" : "0") + mm, (dd > 9 ? "" : "0") + dd, date.getFullYear()].join("/");
};

const isAlphanumeric = (str: string) => {
  const alphaNumericChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  for(let i = 0; i < str.length; i++){
    if(alphaNumericChars.indexOf(str.charAt(i)) === -1){
      return false;
    }
  }
  return true;
};

const isSafeDirectoryName = (str: string) => {
  const safeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 !@#$%<>?.,;:[]{}=-_+)(~";
  for(let i = 0; i < str.length; i++){
    if(safeChars.indexOf(str.charAt(i)) === -1){
      return false;
    }
  }
  return true;
};

export {GetBackendServlet, BuildPath, GetDateFormatMMDDYYYY, createPhotoLink, isAlphanumeric, isSafeDirectoryName};

export type UserDisplayContextType = {
    docWidth: string,
    windowHeight: number,
    windowWidth: number,
    isMobile: boolean,
    backendAddress: string
};

export type UserDisplayContextHandler = {
    dispInfo: UserDisplayContextType | undefined,
    setDispInfo: React.Dispatch<React.SetStateAction<UserDisplayContextType>> | undefined
};

export const userDisplayContextInitState:UserDisplayContextType = {
    docWidth: isMobile ? "w-50" : "w-25",
    windowHeight: window.innerHeight,
    windowWidth: window.innerWidth,
    isMobile: isMobile,
    backendAddress: `${process.env.REACT_APP_BACKEND_PROTOCOL}://${process.env.REACT_APP_BACKEND_HOST}:${process.env.REACT_APP_BACKEND_PORT}/`
}

export const UserDispContext = createContext<UserDisplayContextHandler>({dispInfo: undefined, setDispInfo: undefined});