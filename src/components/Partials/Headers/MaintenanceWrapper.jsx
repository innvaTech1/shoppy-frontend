import React from "react";
import isMaintainance from "../../../../Middleware/isMaintainance";

function MaintenanceWrapper({ children }) {
    console.log(children);
    return <div>{children && children}</div>;
}

export default isMaintainance(MaintenanceWrapper);