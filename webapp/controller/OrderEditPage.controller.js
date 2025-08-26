sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageToast",
     "sap/m/MessageBox",
     "casestudygroup2/model/formatter"
], function (Controller, MessageToast, MessageBox, Formatter) {
    "use strict";

    return Controller.extend("casestudygroup2.controller.OrderEditPage", {
        formatter: Formatter,
        onInit: function () {
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteEditPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            //bind the selected order
            let sOrderID = oEvent.getParameter("arguments").OrderID;
            this._sOrderID = sOrderID; 
            this.getView().bindElement("/Orders('" + sOrderID + "')");
            this._oModel = this.getView().getModel();
        },

        onSavePress: function () {
            let oView = this.getView();
            let sOrderNumber = oView.byId("inpOrderNumberE").getValue();
            let sNewStatus = oView.byId("statusMCBEdit").getSelectedKey();
            let oModel = this._oModel;
            let sOrderID = this._sOrderID;
            
            //save confirmation
            MessageBox.confirm(
                "Are you sure you want to Save these changes?", {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            
                            let oData = {
                                Status: sNewStatus
                            };

                            // update
                            if (oModel.update) {
                                let sPath = "/Orders('" + sOrderID + "')";
                                oModel.update(sPath, oData, {
                                    success: function () {
                                        // show success message
                                        MessageBox.success(
                                            "The Order " + sOrderNumber + " has been successfully updated.", {
                                                onClose: function () {
                                                    // navigate back to detail page
                                                    let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                                                    oRouter.navTo("RouteDetailPage", {
                                                        OrderID: sOrderID
                                                    });
                                                }.bind(this)
                                            }
                                        );
                                    }.bind(this),
                                    error: function () {
                                        MessageToast.show("Failed to update order.");
                                    }
                                });
                            }
                            //  update 
                            else {
                                let oContext = oView.getBindingContext();
                                oContext.getObject().Status = sNewStatus;
                                oModel.refresh(true);

                                MessageBox.success(
                                    "The Order " + sOrderNumber + " has been successfully updated.", {
                                        onClose: function () {
                                            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                                            oRouter.navTo("RouteDetailPage", {
                                                OrderID: sOrderID
                                            });
                                        }.bind(this)
                                    }
                                );
                            }
                        }
                        
                    }.bind(this)
                }
            );
        },

        onCancelPress: function () {
            let oBundle = this.getView().getModel("i18n").getResourceBundle();
            let sMessage = oBundle.getText("cancelConfirmationMessage");
            //for cancel message
            MessageBox.confirm(sMessage, {
                actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                onClose: function (oAction) {
                    if (oAction === MessageBox.Action.YES) {
                        let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                        oRouter.navTo("RouteDetailPage", {
                            OrderID: this._sOrderID
                        });
                    }
                }.bind(this)
            });
        },

        onDeleteProduct: function () {
            let oBundle = this.getView().getModel("i18n").getResourceBundle();
            let oTable = this.getView().byId("tblProductEdit");
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
                                    let aData = oModel.getProperty("/OrderItems");
                                    let iIndex = aData.findIndex(function (prod) {
                                        return prod.ProductName === oProduct.ProductName;
                                    });
                                    if (iIndex !== -1) {
                                        aData.splice(iIndex, 1);
                                        oModel.setProperty("/OrderItems", aData);
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

        onAddProduct: function () {
            let oView = this.getView();
            let oModel = this._oModel;

            if (!this._oProductDialog) {
                this._oProductDialog = sap.ui.xmlfragment(
                    "casestudygroup2.fragment.SelectProductDialog", this
                );
                oView.addDependent(this._oProductDialog);
            }

            // open the dialog for product
            this._oProductDialog.open();

            // get delivering plant from current order
            let sDelPlantID = oView.getBindingContext().getProperty("DelPlantID");

            // filter products
            let aProducts = oModel.getProperty("/OrderItems") || [];
            // show all
            let aFiltered = aProducts.filter(function (p) {
                return !sDelPlantID || p.DelPlantID === sDelPlantID;
            });
            
            // show lists
            let oList = this._oProductDialog.byId("productList");
            let oBundle = this.getView().getModel("i18n").getResourceBundle();
            oList.setModel(new sap.ui.model.json.JSONModel({ Products: aFiltered }));
            oList.bindItems({
                path: "/OrderItems",
                template: new sap.m.StandardListItem({
                    title: "{ProductName}",
                    description: "Available: {Quantity}",
                    type: "Active"
                })
            });

            // clear previous search
            oList.getBinding("items").filter([]);
        },

        onProductDialogClose: function () {
            // for click close
            if (this._oProductDialog) {
                this._oProductDialog.close();
            }
        }
        
    });
});