import React, { createContext, useRef, useEffect } from "react";

export type NavbarInfoType = {
	navbarElem: React.MutableRefObject<HTMLElement | null>,
	yOffset: number
};
export type NavbarContextType = {
	navbarInfo: NavbarInfoType | undefined,
	setNavbarInfo: React.Dispatch<React.SetStateAction<NavbarInfoType>> | undefined
};
export const NavbarContext = createContext<NavbarContextType>({
	navbarInfo: undefined,
	setNavbarInfo: undefined
});


const getNavbarHeight = (navbarInfo: NavbarInfoType) => {
	if(navbarInfo!.navbarElem){
		if(navbarInfo!.navbarElem.current){
			return navbarInfo!.navbarElem.current.offsetHeight;
		}
	}
	return 0;
};

export {getNavbarHeight};

