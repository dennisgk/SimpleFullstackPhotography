import React, { useContext, useEffect, useState } from "react";
import { Navbar, Stack, Container, Nav } from "react-bootstrap";
import { Link } from "react-router-dom";
import { NavbarContext } from "../Contexts/NavbarContext";

const FloatingNavbar = () => {

    const {navbarInfo, setNavbarInfo} = useContext(NavbarContext);
    const [navbarPseudoOffset, setNavbarPseudoOffset] = useState(0);

    const checkScroll = () => {
        if(window.scrollY >= navbarInfo!.yOffset){
            if(navbarPseudoOffset != 0){
                setNavbarPseudoOffset(0);
            }
		}
		else{
            if(navbarPseudoOffset != navbarInfo!.yOffset){
                setNavbarPseudoOffset(navbarInfo!.yOffset);
            }
		}
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener("scroll", checkScroll);

        return () => {
            window.removeEventListener("scroll", checkScroll);
        };
    }, [navbarInfo, navbarPseudoOffset]);

    
    return(
        <Navbar ref={navbarInfo!.navbarElem} className={`bg-light ${window.scrollY >= navbarInfo!.yOffset ? "position-fixed" : "position-absolute"} m-0 p-0 end-0 start-0`} style={{zIndex:"1030",top:`${navbarPseudoOffset}px`}}>
            <Stack direction="vertical" className="m-0" gap={0}>
                <Container className="d-inline-flex my-1">

                    <Navbar.Brand><Link to='/' style={{textDecoration:'none'}}><span className="text-accent">SF Photography</span></Link></Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="w-100 me-auto justify-content-start">
                            <Navbar.Text><Link className='mx-1' style={{textDecoration:"none"}} to='/'><span className="text-accent">Home</span></Link></Navbar.Text>
                            <Navbar.Text><Link className='mx-1' style={{textDecoration:"none"}} to='/about'><span className="text-accent">About</span></Link></Navbar.Text>
                            <Navbar.Text className="ms-auto"><Link className='mx-1' style={{textDecoration:"none"}} to='/admin'><span className="text-accent">Admin</span></Link></Navbar.Text>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
                <hr className="m-0" />
            </Stack>
        </Navbar>
    );
};

export default FloatingNavbar;