import React, { createContext, useRef, useEffect } from "react";

export type ModalInfoType = {
	modalContentElem: React.MutableRefObject<HTMLDivElement | null>,
	modalSize: "lg" | "sm" | "xl",
	modalShown: boolean,
	modalHeader: string,
	canClose: boolean
	modalContent: JSX.Element
};
export type ModalContextType = {
	modalInfo: ModalInfoType | undefined,
	setModalInfo: React.Dispatch<React.SetStateAction<ModalInfoType>> | undefined
};
export const ModalContext = createContext<ModalContextType>({
	modalInfo: undefined,
	setModalInfo: undefined
});
