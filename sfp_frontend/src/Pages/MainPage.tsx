import React, { Fragment, useContext, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserDispContext } from "../Contexts/UserDisplayContext";

import {Form, Button, Container, Row, Stack, Carousel, Col} from 'react-bootstrap';

import Masonry from "masonry-layout";
import { NavbarContext } from "../Contexts/NavbarContext";

const MainPage = () => {

    const {dispInfo, setDispInfo} = useContext(UserDispContext);
    const {navbarInfo, setNavbarInfo} = useContext(NavbarContext);
    useEffect(() => {
        setNavbarInfo!({...navbarInfo!, yOffset: Math.floor(dispInfo!.windowHeight / 5.7)});

        setupMasonry();
    }, []);

    const navigate = useNavigate();

    const [albumSearchCode, setAlbumSearchCode] = useState("000000");
    const handleAlbumSearchCodeSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();
        navigate(`/viewAlbum/${albumSearchCode}`);
    };

    const [imageCarouselIndex, setImageCarouselIndex] = useState(0);
    const handleChangeCarousel = (eventKey: number, event: Record<string, unknown> | null) => {
        setImageCarouselIndex(eventKey);
    };

    const getCarouselPictureUrl = (ending: string) => {
        return `/assets/carousel/${ending}`;
    };

    const masonryRef = useRef<HTMLDivElement>(null);
    const [masonryWall, setMasonryWall] = useState<Masonry | undefined>(undefined);

    const setupMasonry = () => {
        if(masonryRef.current){
            if(masonryWall){
                masonryWall!.destroy!();
            }
            let msrny = new Masonry(masonryRef.current, {
                itemSelector: ".grid-item",
                columnWidth: 0,
                transitionDuration: 0
            });
            setMasonryWall(msrny);
        }
    };

    const fixMasonryWall = () => {
        if(masonryWall != undefined){
            masonryWall!.layout!();
        }
    }

    const getNavbarHeight = () => {
        if(navbarInfo!.navbarElem){
            if(navbarInfo!.navbarElem.current){
                return navbarInfo!.navbarElem.current.offsetHeight;
            }
        }
        return 0;
    };

    return (
        <Fragment>
            <div className="pt-2 d-flex justify-content-center" style={{height: `${navbarInfo!.yOffset}px`}}>
                <img className="h-100 image-fluid" src="/assets/logo.png" />
            </div>
            <div style={{height: `${getNavbarHeight()}px`}}></div>
            

            <Container className="px-0" fluid>
                <Carousel activeIndex={imageCarouselIndex} onSelect={handleChangeCarousel}>
                    {Array(8).fill(0).map((_, i) => {
                        return (
                            <Carousel.Item key={i+1} style={{height:`${dispInfo!.windowHeight - (navbarInfo!.yOffset + getNavbarHeight())}px`}} interval={5000}>
                                <img
                                    className="d-block"
                                    src={getCarouselPictureUrl(`${i + 1}.jpg`)}
                                />
                            </Carousel.Item>
                        );

                    })}
                </Carousel>
            </Container>


            <Container className="my-3">
                {dispInfo!.isMobile ? (
                    <Fragment>
                        <div className="p-2 justify-content-center text-center w-100 d-inline-block">
                            <h2>Search For Album</h2>

                            <Row className="justify-content-md-center">
                                <Form onSubmit={handleAlbumSearchCodeSubmit}>
                                    <Form.Group>
                                        <Form.Label>Album Code</Form.Label>
                                        <Stack className="mx-auto" direction="horizontal" gap={2}>
                                            <Form.Control name="AlbumCode" value={albumSearchCode} onChange={(e) => {setAlbumSearchCode(e.target.value)}} placeholder="Enter Album Code" />
                                            <Button className="mx-auto bg-accent text-dark" onClick={handleAlbumSearchCodeSubmit}>Search</Button>
                                        </Stack>
                                    </Form.Group>
                                </Form>
                            </Row>
                        </div>

                        <div className="p-2 justify-content-center text-center w-100 d-inline-block">
                            <h2>Welcome and thank you for visiting</h2>

                            <div ref={masonryRef}>
                                {Array(12).fill(0).map((_, i) => {
                                    return (
                                        <div key={i+9} className="w-50 grid-item p-1">
                                            <img className="img-fluid bg-accent p-1 w-100" src={getCarouselPictureUrl(`${i + 9}.jpg`)} onLoad={() => {fixMasonryWall()}} />
                                        </div>
                                    );

                                })}
                            </div>
                        </div>
                    </Fragment>

                ) : (

                    <Fragment>
                        <div className="p-2 justify-content-center text-center w-75 d-inline-block">
                            <h2>Welcome and thank you for visiting</h2>

                            <div ref={masonryRef}>
                                {Array(12).fill(0).map((_, i) => {
                                    return (
                                        <div key={i+9} className="w-50 grid-item p-1">
                                            <img className="img-fluid bg-accent p-2 w-100" src={getCarouselPictureUrl(`${i + 9}.jpg`)} onLoad={() => {fixMasonryWall()}} />
                                        </div>
                                    );

                                })}
                            </div>
                        </div>

                        <div className="p-2 justify-content-center text-center w-25 d-inline-block">
                            <h2>Search For Album</h2>

                            <Row className="justify-content-md-center">
                                <Form onSubmit={handleAlbumSearchCodeSubmit}>
                                    <Form.Group>
                                        <Form.Label>Album Code</Form.Label>
                                        <Stack className="mx-auto" direction="horizontal" gap={2}>
                                            <Form.Control name="AlbumCode" value={albumSearchCode} onChange={(e) => {setAlbumSearchCode(e.target.value)}} placeholder="Enter Album Code" />
                                            <Button className="mx-auto bg-accent text-dark" onClick={handleAlbumSearchCodeSubmit}>Search</Button>
                                        </Stack>
                                    </Form.Group>
                                </Form>
                            </Row>
                        </div>
                    </Fragment>
                )
                }
                


            </Container>

        </Fragment>
    );
};

export default MainPage;