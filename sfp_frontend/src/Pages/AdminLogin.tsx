import { useApolloClient } from "@apollo/client";
import React, { Fragment, useContext, useEffect, useState } from "react";
import { ModalContext } from "../Contexts/ModalContext";
import { NavbarContext, getNavbarHeight } from "../Contexts/NavbarContext";
import { UserDispContext } from "../Contexts/UserDisplayContext";
import Cookies from "universal-cookie";
import { useNavigate } from "react-router-dom";
import { mutAdminLogin } from "../CrossServerTypes/GraphMutations";
import { Button, Col, Container, Form, Row } from "react-bootstrap";
import { AttemptAdminLogin } from "../CrossServerTypes/GraphQueries";

const AdminLogin = () => {

    const {dispInfo, setDispInfo} = useContext(UserDispContext);
    const {navbarInfo, setNavbarInfo} = useContext(NavbarContext);
    const {modalInfo, setModalInfo} = useContext(ModalContext);

    const graphClient = useApolloClient();
    const cookies = new Cookies();
    const [CBP_SESSID, setCBP_SESSID] = useState(cookies.get("CBP_SESSID") !== undefined ? cookies.get("CBP_SESSID") : "");
    const navigate = useNavigate();

    const [loginUsername, setLoginUsername] = useState("");
    const [loginPassword, setLoginPassword] = useState("");
    const [showLoginPassword, setShowLoginPassword] = useState(false);
    
    useEffect(() => {
        setNavbarInfo!({...navbarInfo!, yOffset: 0});
    }, []);

    useEffect(() => {

        if(CBP_SESSID.length == 31){
            //possibly logged in
            graphClient.query({
                query:AttemptAdminLogin,
                variables:{
                    sess_id: CBP_SESSID
                }
            }).then(res => {
                if(!res.data.AttemptAdminLogin){
                    cookies.set("CBP_SESSID", "", {path: "/"});
                    setCBP_SESSID("");
                    return;
                }
                if(!res.data.AttemptAdminLogin.login_success){
                    cookies.set("CBP_SESSID", "", {path: "/"});
                    setCBP_SESSID("");
                    return;
                }
                navigate("/admin/dashboard");
            });
        }
        else{
            //not logged in

        }

    }, [CBP_SESSID]);

    const adminLoginSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault();

        graphClient.mutate({
            mutation: mutAdminLogin,
            variables: {
                adminUsername:loginUsername,
                adminPassword:loginPassword
            }
        }).then((res) => {
            if(res.data.AdminLogin){
                cookies.set("CBP_SESSID", res.data.AdminLogin.sess_id, {path: "/", expires: new Date((new Date()).getTime() + (1000 * 60 * 60 * 24))});
                setCBP_SESSID(res.data.AdminLogin.sess_id);
            }
            else{
                setModalInfo!({
                    ...modalInfo!,
                    modalSize:"sm",
                    modalShown:true,
                    modalHeader:"Error",
                    canClose:true,
                    modalContent:
                    <Fragment>
                        <h5 className="m-0 text-responsive">Incorrect Credentials</h5>
                    </Fragment>
                });
            }
        });
    };

    return (
        <Fragment>
            <div style={{height: `${navbarInfo!.yOffset + getNavbarHeight(navbarInfo!)}px`}}></div>

            <Container className="my-3">
                <Row className="justify-content-md-center">
                    <Col sm="8" lg="6">
                        <h1 className="my-2 text-center">Admin Login</h1>
                    </Col>
                </Row>

                <Row className="justify-content-md-center">
                    <Col sm="8" lg="6">
                        <Form onSubmit={e => adminLoginSubmit(e)}>
                            <Form.Group className="mb-3" controlId="formUsername">
                                <Form.Label>Username</Form.Label>
                                <Form.Control value={loginUsername} onChange={(e) => setLoginUsername(e.target.value)} type="username" placeholder="Enter username" />
                            </Form.Group>

                            <Form.Group className="mb-3" controlId="formPassword">
                                <Form.Label>Password</Form.Label>
                                <Form.Control value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} type={showLoginPassword ? "" : "password"} placeholder="Password" />
                            </Form.Group>
                            <Form.Group className="mb-3" controlId="formShowPassword">
                                <Form.Check checked={showLoginPassword} onChange={(e) => setShowLoginPassword(e.target.checked)} type="checkbox" label="Show Password" />
                            </Form.Group>

                            <Button variant="primary" type="submit">
                                Submit
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        </Fragment>
    );
};

export default AdminLogin;