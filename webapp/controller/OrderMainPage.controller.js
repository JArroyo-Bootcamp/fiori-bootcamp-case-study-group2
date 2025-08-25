sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter"      
], (Controller, Formatter) => {
    "use strict";

    return Controller.extend("casestudygroup2.controller.OrderMainPage", {
    formatter: Formatter,         
        onInit() {
        },

        onClear() {
            var oView = this.getView();
            oView.byId("oderNumberInput").setValue("");
            oView.byId("creationDateInput").setValue("");
            oView.byId("statusMCB").removeAllSelectedItems();
        }
    });
});