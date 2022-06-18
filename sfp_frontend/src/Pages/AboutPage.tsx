import React, { Fragment, useContext, useEffect } from "react";
import { Container } from "react-bootstrap/lib/Tab";
import { getNavbarHeight, NavbarContext } from "../Contexts/NavbarContext";
import { UserDispContext } from "../Contexts/UserDisplayContext";

const AboutPage = () => {

    const {dispInfo, setDispInfo} = useContext(UserDispContext);
    const {navbarInfo, setNavbarInfo} = useContext(NavbarContext);
    useEffect(() => {
        setNavbarInfo!({...navbarInfo!, yOffset: 0});
    }, []);

    return(
        <Fragment>

            <div style={{height: `${navbarInfo!.yOffset + getNavbarHeight(navbarInfo!)}px`}}></div>

            <Container>
                <h1>
                    Empty
                </h1>
            </Container>

        </Fragment>
    );
};

export default AboutPage;