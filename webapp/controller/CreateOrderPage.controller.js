sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "casestudygroup2/model/formatter",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
], (Controller, Formatter, Filter, FilterOperator) => {
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

    onSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("Name", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);
		},

    _configValueHelpDialog: function () {
        var sInputValue = this.byId("RecPlantInput").getValue(),
          oModel = this.getView().getModel(),
          aProducts = oModel.getProperty("/RecPlants");

        aProducts.forEach(function (oProduct) {
          oProduct.selected = (oProduct.Name === sInputValue);
        });
        oModel.setProperty("/RecPlants", aProducts);
      },

    });
});
