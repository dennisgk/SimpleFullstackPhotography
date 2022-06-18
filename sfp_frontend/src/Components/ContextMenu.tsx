import React, { Fragment, useContext, useEffect } from "react";
import { Dropdown } from "react-bootstrap";
import { ContextMenuContext } from "../Contexts/ContextMenuContext";


const ContextMenu = () => {

    const {contextMenuInfo, setContextMenuInfo} = useContext(ContextMenuContext);

    useEffect(() => {
        if(contextMenuInfo!.isShown && contextMenuInfo!.options.length == 0){
            setContextMenuInfo!({...contextMenuInfo!, isShown: false});
        }
    }, [contextMenuInfo]);

    return (
        <Fragment>
            {contextMenuInfo!.isShown && !(contextMenuInfo!.options.length == 0) ? (
                <Dropdown.Menu show className="position-fixed" style={{top:`${contextMenuInfo!.yPos}px`,left:`${contextMenuInfo!.xPos}px`,zIndex:"1040"}}>
                    {contextMenuInfo!.options.map((option, optionIndex) => (
                        <Dropdown.Item key={`${option.text}_${optionIndex}`} onClick={(e) => {option.callback(contextMenuInfo!.lastShowEvent, e);}}>{option.text}</Dropdown.Item>
                    ))}
                </Dropdown.Menu>
            ) : (<></>)}
        </Fragment>
    );
};

export default ContextMenu;