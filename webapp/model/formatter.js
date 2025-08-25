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

         },

          dateFormatter: function (sValue) {
            if (!sValue) {
            return "";
            }
            let oDate;

            // Handle OData v2 format: /Date(1063016544000)/
            if (typeof sValue === "string" && sValue.indexOf("/Date(") === 0) {
                let iTime = parseInt(sValue.replace(/[^0-9]/g, ""), 10);
                oDate = new Date(iTime);
            } else {
                oDate = sValue instanceof Date ? sValue : new Date(sValue);
            }

            if (isNaN(oDate.getTime())) {
            return sValue; // fallback if invalid
            }

            // Format as "01 Jan 2025"
            let oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "dd MMM yyyy"
            });

            return oDateFormat.format(oDate);
        }

    };
});