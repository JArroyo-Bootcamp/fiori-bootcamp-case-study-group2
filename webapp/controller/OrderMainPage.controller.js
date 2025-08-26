sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "../model/formatter" ,
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
     "sap/m/MessageBox",  
    "sap/m/MessageToast"           

], (Controller, Formatter, Filter, FilterOperator, MessageBox, MessageToast) => {
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
        },

         /**
         * This is a method that filters data using the Filterbar based on user input
         * @param {sap.ui.base.Event} 
         */
        onSearchFilter: function(oEvent) {
            let oView = this.getView();
            let sOrderNum = oView.byId("oderNumberInput").getValue();   
            let sCreateDate = oView.byId("creationDateInput");                     
            let sStatus = oView.byId("statusMCB").getSelectedKeys();

            // Initialize filter array
           const aFilter = [];
           if (sOrderNum) {
                aFilter.push(new Filter("OrderID", FilterOperator.EQ, parseInt(sOrderNum) ));
            }

           if (sCreateDate) {
                // Get the start date
                let dStartDate = sCreateDate.getDateValue();    
                // Get the end date  
                let dEndDate = sCreateDate.getSecondDateValue();   

                let oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
                pattern: "yyyy-MM-dd"
                 });            

                if (dStartDate && dEndDate) {
                 let sStartDate = oDateFormat.format(dStartDate);
                 let sEndDate = oDateFormat.format(dEndDate);

                 aFilter.push(new Filter("CreationDate", FilterOperator.BT, sStartDate, sEndDate));
                }            
            }         

           if (sStatus) {
               sStatus.forEach(status => {
               aFilter.push(new Filter("Status", FilterOperator.EQ, status));
               });
           }                
            // Filter Binding
            let oTable = oView.byId("tblOrders");
            let oBinding = oTable.getBinding("items");
            
            // Apply filter
            oBinding.filter(aFilter);      
        
        },

        onPressDelete: function () {
            let oBundle = this.getView().getModel("i18n").getResourceBundle();
            let oTable = this.getView().byId("tblOrders");
            let aSelectedItems = oTable.getSelectedItems();
            //for delete message
            if (aSelectedItems.length === 0) {               
                sap.m.MessageToast.show(oBundle.getText("productDeleteSelectMessage"));
                return;
            }
            let sConfirmMessage = oBundle.getText("productDeleteConfirmMessage", [aSelectedItems.length]);
            
            sap.m.MessageBox.confirm(
                sConfirmMessage, {
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {
                           this._oModel = this.getView().getModel();
                            let oModel = this._oModel;

                            aSelectedItems.forEach(function (oItem) {
                                let oContext = oItem.getBindingContext();
                                let oProduct = oContext.getObject();

                                if (oModel.remove) {
                                    let sPath = oContext.getPath();
                                    oModel.remove(sPath, {
                                        success: function () {                                           
                                            sap.m.MessageToast.show(oBundle.getText("productDeleteSuccessMessage"));
                                            oModel.refresh();
                                        },
                                        error: function () {
                                            
                                            sap.m.MessageToast.show(oBundle.getText("productDeleteErrorMessage"));
                                        }
                                    });
                                } else {
                                    let aData = oModel.getProperty("/Orders");
                                    let iIndex = aData.findIndex(function (prod) {
                                        return prod.ProductName === oProduct.ProductName;
                                    });
                                    if (iIndex !== -1) {
                                        aData.splice(iIndex, 1);
                                        oModel.setProperty("/Orders", aData);
                                    }
                                    oModel.refresh(true);
                                    sap.m.MessageToast.show(oBundle.getText("productDeleteSuccessMessage"));
                                }
                            });

                            oTable.removeSelections();
                        }
                    }.bind(this)
                }
            );
        },        
        
        onPressOrder: function (oEvent) {
            var oItem = oEvent.getSource();  
            var oContext = oItem.getBindingContext();
            var sOrderId = oContext.getProperty("OrderID");

            // Navigate to the detail page
            this.getOwnerComponent().getRouter().navTo("RouteDetailPage", {
                OrderID: sOrderId
            });
        },

        onPressCreate: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteCreateOrderPage");
        }
    });
});