sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "casestudygroup2/model/formatter",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
	  "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
     "sap/m/MessageBox",
], (Controller, Formatter, Filter, FilterOperator, MessageToast, MessageBox) => {
    "use strict";

    return Controller.extend("casestudygroup2.controller.CreateOrderPage", {
        formatter: Formatter,

        onInit() {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.getRoute("RouteCreateOrderPage").attachPatternMatched(this._onObjectMatched, this);
        },


        onPressCreate: function () {
            var oRouter = this.getOwnerComponent().getRouter();
            oRouter.navTo("RouteOrderMainPage");
        },

        onReceivingPlant: function () {
          if (!this.oReceivingDialog) {
            this.oReceivingDialog = this.loadFragment({
              name: "casestudygroup2.fragment.ReceivingPlantDialog",
              controller: this,
            });
          }
          this.oReceivingDialog.then(function (oDialog) {
            oDialog.open();
          });
        },

        onDeliveringPlant: function () {
          if (!this.oDeliveringDialog) {
            this.oDeliveringDialog = this.loadFragment({
              name: "casestudygroup2.fragment.DeliveringPlantDialog",
              controller: this,
            });
          }
          this.oDeliveringDialog.then(function (oDialog) {
            oDialog.open();
          });
        },

        onValueHelpDialogClose: function (oEvent) {
			    var oSelectedItem = oEvent.getParameter("selectedItem"),
				    oInput = this.byId("RecPlantInput");

			    if (!oSelectedItem) {
				    oInput.resetProperty("value");
			    return;
		    }

			oInput.setValue(oSelectedItem.getTitle());
		  },

      onValueHelpDialogClose2: function (oEvent) {
			  var oSelectedItem = oEvent.getParameter("selectedItem"),
				  oInput = this.byId("DelPlantInput");

			  if (!oSelectedItem) {
				  oInput.resetProperty("value");
				  return;
			  }

			  oInput.setValue(oSelectedItem.getTitle()); 
		},

       onConfirmProductSelection: function (oEvent) {
			  var oSelectedItem = oEvent.getParameter("selectedItem"),
				  oInput = this.byId("tblProductCO");

			  if (!oSelectedItem) {
				  oInput.resetProperty("value");
				  return;
			  }

			  oInput.setValue(oSelectedItem.getTitle()); 
		},



       onSearch: function (oEvent) {
        var sValue = oEvent.getParameter("value");
        var oFilter = new Filter("Name", FilterOperator.Contains, sValue);
        var oBinding = oEvent.getParameter("itemsBinding");
        oBinding.filter([oFilter]);
      },

      onAddProduct: function () {
              let oView = this.getView();
              let oModel = this._oModel;

              if (!this._oProductDialog) {
                  this._oProductDialog = sap.ui.xmlfragment(
                      "casestudygroup2.fragment.CreateOrderDialog", this
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
                                                    oRouter.navTo("RouteOrderMainPage", {
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
      
     onDeleteProduct: function () {
            let oBundle = this.getView().getModel("i18n").getResourceBundle();
            let oTable = this.getView().byId("tblProductCO");
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

    });
});
