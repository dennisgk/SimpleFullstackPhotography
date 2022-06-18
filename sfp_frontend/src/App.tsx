import React, { createContext, Fragment, useContext, useEffect, useRef, useState } from 'react';
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Link,
	Navigate,
	useLocation
} from "react-router-dom";

import {Navbar, Container, Nav, NavDropdown, Stack} from 'react-bootstrap';
import { UserDisplayContextHandler, UserDispContext, GetBackendServlet, userDisplayContextInitState } from './Contexts/UserDisplayContext';

import {ApolloClient, InMemoryCache, ApolloProvider, HttpLink, from} from '@apollo/client';
import {onError} from '@apollo/client/link/error';

import MainPage from './Pages/MainPage';
import AboutPage from './Pages/AboutPage';
import AlbumViewer from './Pages/AlbumViewer';
import FloatingNavbar from './Components/FloatingNavbar';
import { NavbarContext, NavbarContextType, NavbarInfoType } from './Contexts/NavbarContext';
import DefaultView from './DefaultView';
import { ModalContextType, ModalInfoType, ModalContext } from './Contexts/ModalContext';
import { ContextMenuContext, ContextMenuInfoType, ContextMenuType } from './Contexts/ContextMenuContext';

const errorLink = onError(({graphQLErrors, networkError}) => {
	if(graphQLErrors){
		graphQLErrors.map((graphError) => {
			console.error(`Graph error ${graphError.message}`);
		});
	}
});
const graphLink = from([
	errorLink,
	new HttpLink({ uri:GetBackendServlet("graph") }),
]);

const graphClient = new ApolloClient({
	cache: new InMemoryCache(),
	link: graphLink
});

const App = () => {

	const [userDisplayInfo, setUserDisplayInfo] = React.useState(userDisplayContextInitState);
	const userDispHandlerObj: UserDisplayContextHandler = {dispInfo: userDisplayInfo, setDispInfo: setUserDisplayInfo};

	const [navbarInfo, setNavbarInfo] = useState<NavbarInfoType>({navbarElem: useRef(null), yOffset: 0});
	const navbarHandleObj: NavbarContextType = {navbarInfo: navbarInfo, setNavbarInfo: setNavbarInfo};

	const [modalInfo, setModalInfo] = useState<ModalInfoType>({modalContentElem: useRef(null), modalSize: "sm", modalShown: false, modalHeader: "", modalContent: <></>, canClose: true});
	const modalHandleObj: ModalContextType = {modalInfo: modalInfo, setModalInfo: setModalInfo};

	const [contextMenuInfo, setContextMenuInfo] = useState<ContextMenuInfoType>({isShown:false, xPos:0, yPos:0, options: [], lastShowEvent: undefined, onContextMenuCallbacks: []});
	const contextMenuHandleObj: ContextMenuType = {contextMenuInfo: contextMenuInfo, setContextMenuInfo: setContextMenuInfo};

	return (
		<div>
			<Router>
				<ApolloProvider client={graphClient}>
					<UserDispContext.Provider value={userDispHandlerObj}>
						<NavbarContext.Provider value={navbarHandleObj}>
							<ModalContext.Provider value={modalHandleObj}>
								<ContextMenuContext.Provider value={contextMenuHandleObj}>
									<DefaultView />
								</ContextMenuContext.Provider>
							</ModalContext.Provider>
						</NavbarContext.Provider>
					</UserDispContext.Provider>
				</ApolloProvider>
			</Router>
		</div>
	);
}

export default App;
