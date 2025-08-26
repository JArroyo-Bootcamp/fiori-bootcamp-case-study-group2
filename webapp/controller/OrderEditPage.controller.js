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
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("RouteEditPage").attachPatternMatched(this._onObjectMatched, this);
        },

        _onObjectMatched: function (oEvent) {
            var sOrderID = oEvent.getParameter("arguments").OrderID;
            this._sOrderID = sOrderID; // store for later use

            // bind view to the selected order
            this.getView().bindElement("/Orders('" + sOrderID + "')");

            // reference to model
            this._oModel = this.getView().getModel();
        },

        onSavePress: function () {
            var oView = this.getView();
            var sOrderNumber = oView.byId("inpOrderNumberE").getValue();
            var sNewStatus = oView.byId("statusMCBEdit").getSelectedKey();
            var oModel = this._oModel;
            var sOrderID = this._sOrderID;

            // Show confirmation before saving
            MessageBox.confirm(
                "Are you sure you want to Save these changes?", {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            
                            var oData = {
                                Status: sNewStatus
                            };

                            // update
                            if (oModel.update) {
                                var sPath = "/Orders('" + sOrderID + "')";
                                oModel.update(sPath, oData, {
                                    success: function () {
                                        // Show success message
                                        MessageBox.success(
                                            "The Order " + sOrderNumber + " has been successfully updated.", {
                                                onClose: function () {
                                                    // Navigate back to detail page
                                                    var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
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
                                var oContext = oView.getBindingContext();
                                oContext.getObject().Status = sNewStatus;
                                oModel.refresh(true);

                                MessageBox.success(
                                    "The Order " + sOrderNumber + " has been successfully updated.", {
                                        onClose: function () {
                                            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
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
            MessageBox.confirm(
                "Are you sure you want to cancel the changes done in the page?", {
                    actions: [MessageBox.Action.YES, MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === MessageBox.Action.YES) {
                            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                            oRouter.navTo("RouteDetailPage", {
                                OrderID: this._sOrderID
                            });
                        }
                    }.bind(this)
                }
            );
        },

        onDeleteProduct: function () {
            var oTable = this.getView().byId("tblProductEdit");
            var aSelectedItems = oTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                sap.m.MessageToast.show("Please select at least one product to delete.");
                return;
            }

            sap.m.MessageBox.confirm(
                "Are you sure you want to delete " + aSelectedItems.length + " item(s)?", {
                    actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
                    onClose: function (oAction) {
                        if (oAction === sap.m.MessageBox.Action.YES) {
                            var oModel = this._oModel;

                            aSelectedItems.forEach(function (oItem) {
                                var oContext = oItem.getBindingContext();
                                var oProduct = oContext.getObject();

                                if (oModel.remove) {
                                    var sPath = oContext.getPath();
                                    oModel.remove(sPath, {
                                        success: function () {
                                            sap.m.MessageToast.show("Product deleted successfully.");
                                            oModel.refresh();
                                        },
                                        error: function () {
                                            sap.m.MessageToast.show("Failed to delete product.");
                                        }
                                    });
                                } else {
                                    var aData = oModel.getProperty("/OrderItems");
                                    var iIndex = aData.findIndex(function (prod) {
                                        return prod.ProductID === oProduct.ProductID;
                                    });
                                    if (iIndex !== -1) {
                                        aData.splice(iIndex, 1);
                                        oModel.setProperty("/OrderItems", aData);
                                    }
                                    oModel.refresh(true);
                                    sap.m.MessageToast.show("Product deleted successfully.");
                                }
                            });

                            oTable.removeSelections();
                        }
                    }.bind(this)
                }
            );
        },

        onAddProduct: function () {
            var oView = this.getView();
            var oModel = this._oModel;

            if (!this._oProductDialog) {
                this._oProductDialog = sap.ui.xmlfragment(
                    "casestudygroup2.fragment.SelectProductDialog", this
                );
                oView.addDependent(this._oProductDialog);
            }

            // open the dialog for product
            this._oProductDialog.open();

            // Get Delivering Plant from current order
            var sDelPlantID = oView.getBindingContext().getProperty("DelPlantID");

            // Filter products
            var aProducts = oModel.getProperty("/OrderItems") || [];
            // show all
            var aFiltered = aProducts.filter(function (p) {
                return !sDelPlantID || p.DelPlantID === sDelPlantID;
            });

            var oList = this._oProductDialog.byId("productList");
            oList.setModel(new sap.ui.model.json.JSONModel({ Products: aFiltered }));
            oList.bindItems({
                path: "/OrderItems",
                template: new sap.m.StandardListItem({
                    title: "{ProductName}",
                    description: "Available: {Quantity}",
                    type: "Active"
                })
            });

            // Clear previous search
            oList.getBinding("items").filter([]);
        },

        onProductSearch: function (oEvent) {
            var sQuery = oEvent.getParameter("query");
            var oList = this._oProductDialog.byId("productList");
            var oBinding = oList.getBinding("items");

            if (sQuery) {
                var aFilters = [
                    new sap.ui.model.Filter("ProductName", sap.ui.model.FilterOperator.Contains, sQuery),
                    new sap.ui.model.Filter("Quantity", sap.ui.model.FilterOperator.Contains, sQuery)
                ];
            
                var oCombinedFilter = new sap.ui.model.Filter({
                    filters: aFilters,
                    and: false
                });
                oBinding.filter([oCombinedFilter]);
            } else {
                oBinding.filter([]);
            }
        },

        onConfirmProductSelection: function () {
            var oList = this._oProductDialog.byId("productList");
            var oSelectedItem = oList.getSelectedItem();

            if (!oSelectedItem) {
                sap.m.MessageToast.show("Please select a product first.");
                return;
            }

            var oProduct = oSelectedItem.getBindingContext().getObject();

            
            var oNewItem = Object.assign({}, oProduct);

            oNewItem.ItemID = Date.now();  
            oNewItem.Quantity = 1;         
            oNewItem.TotalPrice = oNewItem.PricePerQty * oNewItem.Quantity;

            // Push into OrderItems model
            var aOrderItems = this._oModel.getProperty("/OrderItems") || [];
            aOrderItems.push(oNewItem);
            this._oModel.setProperty("/OrderItems", aOrderItems);
            this._oModel.refresh(true);

            sap.m.MessageToast.show(oProduct.ProductName + " added to order.");

            this._oProductDialog.close();
        },
        onProductDialogClose: function () {
            if (this._oProductDialog) {
                this._oProductDialog.close();
            }
        }
        
    });
});