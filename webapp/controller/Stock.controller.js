sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageToast",
	"sap/ui/model/json/JSONModel"
], function(Controller, MessageToast, JSONModel) {
	"use strict";

	return Controller.extend("sap.ui.stockStockCheck.controller.Stock", {
		onAfterRendering: function() {
		//Viz Frame Charts
			var oVizFrame = this.getView().byId("idcolumn");
			var oDataset = new sap.viz.ui5.data.FlattenedDataset({
				dimensions: [{
					name: 'Company',
					value: '{view>/query/results/quote/Name}'
				}],
				measures: [{
					name: 'Days Low',
					value: '{view>/query/results/quote/DaysLow}'
				}, {
					name: 'Days High',
					value: '{view>/query/results/quote/DaysHigh}'
				}, {
					name: 'Year Low',
					value: '{view>/query/results/quote/YearLow}'
				}, {
					name: 'Year High',
					value: '{view>/query/results/quote/YearHigh}'
				}, {
					name: 'Current Price',
					value: '{view>/query/results/quote/LastTradePriceOnly}'
				}],

				data: {
					path: "view>/"
				}
			});
			oVizFrame.setDataset(oDataset);
			oVizFrame.setModel(this.model);
			oVizFrame.setVizType('column');
			oVizFrame.setVizProperties({
				plotArea: {
					colorPalette: d3.scale.category20().range()
				},
				valueAxis: {
					title: {
						visible: true,
						text: "Market Trend"
					}
				},
				categoryAxis: {
					title: {
						visible: true,
						text: "Company"
					}
				}
			});

			var feedValueAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "valueAxis",
					'type': "Measure",
					'values': ["Days Low", "Days High", "Year Low", "Year High", "Current Price"]
				}),
				feedCategoryAxis = new sap.viz.ui5.controls.common.feeds.FeedItem({
					'uid': "categoryAxis",
					'type': "Dimension",
					'values': ["Company"]
				});
			oVizFrame.addFeed(feedValueAxis);
			oVizFrame.addFeed(feedCategoryAxis);
				
		},
		onStockCheck: function() {
			//i18n Model loaded
			var oBundle = this.getView().getModel("i18n").getResourceBundle();
			var sRecipient = this.getView().getModel().getProperty("/stock/name");
			var sMsg;
		//Model for Yahoo API result
			var model = new JSONModel();
			var url = "https://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20yahoo.finance.quote%20where%20symbol%20in%20(%22" +
				sRecipient + "%22)&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";
			model.loadData(url, "", false);
			this.getView().setModel(model, "view");
			
		//Initialize the controller variable for List and Viz Frame Chart
			var oList = this.getView().byId("list");
			var oViz = this.getView().byId("idcolumn");
			
		//Checking the Model for Successful result
			var sRt = this.getView().getModel("view").getProperty("/query/results/quote/Name");
			if(sRt === null){
				oViz.setVisible(false);
				oList.setVisible(false);
				sMsg = oBundle.getText("helloMsg", [sRecipient]);
				MessageToast.show(sMsg);
			}
			else
			{
				oViz.setVisible(true);
				oList.setVisible(true);
				sMsg = oBundle.getText("helloMsg2", [sRt]);
				MessageToast.show(sMsg);
			}
			
		//Object List Initialization
			oList.bindItems({
				path: "view>/",
				template: new sap.m.ObjectListItem({
					title: "{view>/query/results/quote/Name}",
					attributes: [
						new sap.m.ObjectAttribute({
							text: "Current Price: {view>/query/results/quote/LastTradePriceOnly}"
						}),
						new sap.m.ObjectAttribute({
							text: "Today's Change: {view>/query/results/quote/Change}"
						})
					],
					firstStatus: new sap.m.ObjectStatus({
						text: "Day's Low: {view>/query/results/quote/DaysLow}"
					}),
					secondStatus: new sap.m.ObjectStatus({
						text: "Day's High: {view>/query/results/quote/DaysHigh}"
					})
				})
			});
			
		}

	});
});