sap.ui.define([
 
], function () {
    "use strict";
    return {

        /**
         * Determines the value state based on the provided 
         * @param {string} sValue - status value to evaluate
         * @returns 
         */        
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
        },

        onUpdateOrders: function(oEvent) {
            var iTotalItems = oEvent.getParameter("total");
            var oTitle = this.byId("txtOrder");
    
            // Update the title text with count
            if (iTotalItems) {
                oTitle.setText("Orders (" + iTotalItems + ")");
            } else {
                oTitle.setText("Orders");
            }
        },

        productCounter: function(aOrderItems) {
            if (!aOrderItems) {
                return "Product (0)";
            }
            return "Product (" + aOrderItems.length + ")";
        },

        totalPriceFormatter: function (iQuantity, fPricePerQty) {
            var qty = parseFloat(iQuantity) || 0;
            var price = parseFloat(fPricePerQty) || 0;
            return (qty * price).toFixed(2);
        }

    };
});