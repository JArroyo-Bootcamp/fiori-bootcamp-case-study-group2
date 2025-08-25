sap.ui.define([
 
], function () {
    "use strict";
    return {

         statusValueState: function(sValue) {
            if(sValue === "Released") {
                return "Warning";
            } else if (sValue === "Partially Completed") {
                return "Information";
            } else if (sValue === "Delivered") {
                return "Success";
            } else {

            }

         }



    };
});