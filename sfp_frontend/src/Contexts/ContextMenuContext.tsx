import React, { createContext, useRef, useEffect } from "react";

export type ContextMenuOptionType = {text: string, callback: (cmEvent: MouseEvent | undefined, event: React.SyntheticEvent) => void};
export type ContextMenuInfoType = {
    isShown: boolean,
    xPos: number,
    yPos: number,
    options: Array<ContextMenuOptionType>,
    lastShowEvent: MouseEvent | undefined,
    onContextMenuCallbacks: Array<(event: MouseEvent, optionArr: ContextMenuOptionType[]) => void>
};
export type ContextMenuType = {
	contextMenuInfo: ContextMenuInfoType | undefined,
	setContextMenuInfo: React.Dispatch<React.SetStateAction<ContextMenuInfoType>> | undefined
};
export const ContextMenuContext = createContext<ContextMenuType>({
	contextMenuInfo: undefined,
	setContextMenuInfo: undefined
});
