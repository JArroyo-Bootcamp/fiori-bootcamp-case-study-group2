sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "casestudygroup2/model/formatter"
], (Controller, Formatter) => {
    "use strict";

    return Controller.extend("casestudygroup2.controller.DetailPage", {
        formatter: Formatter,

        onInit() {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteDetailPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sOrderId = oEvent.getParameter("arguments").OrderID;

            this.getView().bindElement({
                path: "/Orders(" + sOrderId + ")",
                parameters: {
                    expand: "OrderItems, RecPlants, DelPlants"
                }
            });
        },

        onPressDetailCancel: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteOrderMainPage");
        },
        //navigates Order Edit Page
        onEditPress: function () {
            const oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            const sOrderID = this.getView().getBindingContext().getProperty("OrderID");
            oRouter.navTo("RouteEditPage", { OrderID: sOrderID });
        },
    });
});
