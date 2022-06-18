import React, { useContext } from "react";
import { Modal } from "react-bootstrap";
import { ModalContext } from "../Contexts/ModalContext";


const ReactiveModal = () => {

    const {modalInfo, setModalInfo} = useContext(ModalContext);

    return(
        <Modal size={modalInfo!.modalSize} show={modalInfo!.modalShown} backdrop={modalInfo!.canClose ? undefined : "static"} keyboard={modalInfo!.canClose ? true : false} onHide={() => {setModalInfo!({...modalInfo!, modalShown: false});}}>
            <Modal.Header closeButton={modalInfo!.canClose ? true : false}>
                <Modal.Title>{modalInfo!.modalHeader}</Modal.Title>
            </Modal.Header>
            <Modal.Body ref={modalInfo!.modalContentElem}>
                {modalInfo!.modalContent}
            </Modal.Body>
        </Modal>
    );
};

export default ReactiveModal;