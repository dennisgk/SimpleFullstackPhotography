import { useApolloClient } from "@apollo/client";
import { useState, useEffect, Fragment, useContext } from "react";
import { Card, Button, Container, Row, Col, Stack, ProgressBar } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Cookies from "universal-cookie";
import { ModalContext } from "../Contexts/ModalContext";
import { getNavbarHeight, NavbarContext } from "../Contexts/NavbarContext";
import { GetBackendServlet } from "../Contexts/UserDisplayContext";
import { AttemptAdminLogin } from "../CrossServerTypes/GraphQueries";

const AdminDashboard = () => {

    const {navbarInfo, setNavbarInfo} = useContext(NavbarContext);
    const {modalInfo, setModalInfo} = useContext(ModalContext);

    const cookies = new Cookies();
    const graphClient = useApolloClient();

    const [diskSpaceDesc, setDiscSpaceDesc] = useState(["Total: 0 GB", "Used: 0 GB", "Free: 0 GB"]);
    const [diskSpacePercent, setDiskSpacePercent] = useState(0);

    const [CBP_SESSID, setCBP_SESSID] = useState(cookies.get("CBP_SESSID") !== undefined ? cookies.get("CBP_SESSID") : "");
    const [canQueryForData, setCanQueryForData] = useState<boolean>(false);
    const navigate = useNavigate();

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
                    navigate("/admin");
                    return;
                }
                if(!res.data.AttemptAdminLogin.login_success){
                    navigate("/admin");
                    return;
                }

                setCanQueryForData(true);
            });
        }
        else{
            //not logged in
            navigate("/admin");
        }
    }, [CBP_SESSID]);

    useEffect(() => {
        if(canQueryForData){
            fetch(GetBackendServlet(`/serverInfo?sess_id=${CBP_SESSID}`)).then(response => response.json()).then(data => {
                let tmpDiscSpaceDesc = [...diskSpaceDesc];
                tmpDiscSpaceDesc[0] = `Total: ${data.total / 1000000000} GB`;
                tmpDiscSpaceDesc[1] = `Used: ${data.used / 1000000000} GB`;
                tmpDiscSpaceDesc[2] = `Free: ${data.free / 1000000000} GB`;
                setDiscSpaceDesc(tmpDiscSpaceDesc);

                setDiskSpacePercent((data.used / data.total) * 100);
            });
        }
    }, [canQueryForData]);

    return(
        <Fragment>
            <div style={{height: `${navbarInfo!.yOffset + getNavbarHeight(navbarInfo!)}px`}}></div>
            
            <Container>
                <Stack className="my-2" direction="vertical">
                    <h1>Admin Dashboard</h1>
                    <hr />
                    <h5>Disc Space Info:</h5>
                    <p>{diskSpaceDesc[0]}</p>
                    <p>{diskSpaceDesc[1]}</p>
                    <p>{diskSpaceDesc[2]}</p>
                    <h5>Used Space On Server:</h5>
                    <ProgressBar striped variant="danger" animated now={diskSpacePercent} label={`${Math.round(diskSpacePercent * 100) / 100}%`} />
                    <hr />
                </Stack>
                
                <Card className="my-2" style={{ width: '18rem' }}>
                    <Card.Body>
                        <Card.Title>Album Browser</Card.Title>
                        <Card.Text>
                            Browse and edit albums here.
                        </Card.Text>
                        <Button onClick={(e) => {navigate("/admin/browser");}} variant="primary">Access Browser</Button>
                    </Card.Body>
                </Card>
            </Container>
        </Fragment>
    );
};

export default AdminDashboard;