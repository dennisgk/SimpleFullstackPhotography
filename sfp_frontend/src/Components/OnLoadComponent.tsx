import { Fragment, useEffect } from "react";

interface OnLoadProps{
    onLoadCallback: () => void
};

const OnLoadComponent = (props: React.PropsWithChildren<OnLoadProps>) => {

    useEffect(() => {
        props.onLoadCallback();
    }, []);

    return (
        <Fragment>
            {props.children}
        </Fragment>
    );
};


export default OnLoadComponent;