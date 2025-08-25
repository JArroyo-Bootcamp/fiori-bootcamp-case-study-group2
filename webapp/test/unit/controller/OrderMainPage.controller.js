/*global QUnit*/

sap.ui.define([
	"casestudygroup2/controller/OrderMainPage.controller"
], function (Controller) {
	"use strict";

	QUnit.module("OrderMainPage Controller");

	QUnit.test("I should test the OrderMainPage controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
