import React, { Fragment, useContext, useEffect, useRef, useState } from "react";
import { useLocation, Routes, Route, Navigate } from "react-router-dom";
import ContextMenu from "./Components/ContextMenu";
import FloatingNavbar from "./Components/FloatingNavbar";
import ReactiveModal from "./Components/ReactiveModal";
import { ContextMenuContext, ContextMenuOptionType } from "./Contexts/ContextMenuContext";
import { NavbarContext } from "./Contexts/NavbarContext";
import { UserDispContext } from "./Contexts/UserDisplayContext";
import AboutPage from "./Pages/AboutPage";
import AdminAlbumBrowser from "./Pages/AdminAlbumBrowser";
import AdminDashboard from "./Pages/AdminDashboard";
import AdminLogin from "./Pages/AdminLogin";
import AlbumViewer from "./Pages/AlbumViewer";
import MainPage from "./Pages/MainPage";

const DefaultView = () => {

	const location = useLocation();

    const {contextMenuInfo, setContextMenuInfo} = useContext(ContextMenuContext);

	const screenRevealerRef = useRef<HTMLDivElement>(null);
    const [isFirstReveal, setIsFirstReveal] = useState(true);
    const [isOnRevealCooldown, setIsOnRevealCooldown] = useState(false);

    const [lastLocation, setLastLocation] = useState<{hash: string, pathname:string, search:string}>({hash: "", pathname:"/", search:""});

	useEffect(() => {
		if(screenRevealerRef.current && !screenRevealerRef.current!.classList.contains("screen-revealer-anim") && isFirstReveal){
			const revealScreen = () => {
				screenRevealerRef.current!.className = "screen-revealer screen-revealer-anim"
				screenRevealerRef.current!.addEventListener("animationend", () => {
					screenRevealerRef.current!.className = "screen-revealer-transparent screen-revealer-hidden";
				}, {once: true});
                setIsFirstReveal(false);
			};
	
			const revealScreenTimeout = setTimeout(revealScreen, 300);
			return () => {
				clearTimeout(revealScreenTimeout);
			};
		}
	});

    useEffect(() => {
        if(!isFirstReveal && !isOnRevealCooldown){
            screenRevealerRef.current!.className = "screen-revealer-transparent screen-revealer-anim-both";
            screenRevealerRef.current!.addEventListener("animationend", () => {
                screenRevealerRef.current!.className = "screen-revealer-transparent screen-revealer-hidden";
                setIsOnRevealCooldown(false);
            }, {once: true});
            setIsOnRevealCooldown(true);
        }
        setLastLocation({pathname:location.pathname, hash:location.hash, search:location.search});
    }, [location]);

    const onContextMenu = (event: MouseEvent) => {
        event.preventDefault();
        let allOptions: ContextMenuOptionType[] = [];
        for(let i = 0; i < contextMenuInfo!.onContextMenuCallbacks.length; i++){
            contextMenuInfo!.onContextMenuCallbacks[i](event, allOptions);
        }
        setContextMenuInfo!({...contextMenuInfo!, xPos: event.clientX, yPos: event.clientY, isShown: true, lastShowEvent: event, options: allOptions});
    };

    const onRandomClick = (event: MouseEvent) => {
        if(contextMenuInfo!.isShown){
            setContextMenuInfo!({...contextMenuInfo!, isShown:false});
        }
    };

    useEffect(() => {
        document.addEventListener("contextmenu", onContextMenu);
        document.addEventListener("click", onRandomClick);
        return () => {
            document.removeEventListener("contextmenu", onContextMenu);
            document.removeEventListener("click", onRandomClick);
        }
    }, [contextMenuInfo]);

    return (
        <Fragment>
            <div ref={screenRevealerRef} className={"screen-revealer"}></div>
            
            <ReactiveModal />
            <FloatingNavbar />
            <ContextMenu />

            <Routes>
                <Route path='/' element={<MainPage />} />
                <Route path='/about' element={<AboutPage />} />
                <Route path='/viewAlbum/:albumCode' element={<AlbumViewer />} />
                <Route path='/admin' element={<AdminLogin />} />
                <Route path='/admin/dashboard' element={<AdminDashboard />} />
                <Route path='/admin/browser' element={<AdminAlbumBrowser />} />
                <Route path='*' element={<Navigate to="/" />} />
            </Routes>
        </Fragment>
    );

};

export default DefaultView;