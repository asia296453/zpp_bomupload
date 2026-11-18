sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/TableSelectDialog",
    "sap/m/Column",
    "sap/m/Label",
    "sap/m/Text",
    "sap/m/ColumnListItem",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "zppbomupload/util/ExcelTemplate",
    "zppbomupload/util/ExcelHelper",
    "sap/m/MessageBox"
], (Controller, JSONModel, TableSelectDialog, Column, Label, Text, ColumnListItem, Filter, FilterOperator, MessageToast, ExcelTemplate, ExcelHelper, MessageBox) => {
    "use strict";

    return Controller.extend("zppbomupload.controller.Main", {
        onInit: function () {

            var oLocalModel = new JSONModel({
                Plant: "",
                PlantDesc: "",
                ReqType: "",
                ReqTypeDesc: "",
                showBom: false,
                showRouting: false,
                savebutton:true,
                bomCount: 0,
                routingCount: 0,

                bomUploadEnabled: false,
                routingUploadEnabled: false
            });

            this.getView().setModel(oLocalModel, "localModel");

            var oExcelModel = new JSONModel({
                bomData: [],
                routingData: []
            });

            this.getView().setModel(oExcelModel, "excel");
            var sBomreq = "";
            // var sBomreq = "3";
            // //begin
            // this.onReadOData("/BOMREQSet('" + sBomreq + "')", null).then((oresponse) => {
            //     if (oresponse.Werks !== "") {
            //         this.getView().getModel("localModel").setProperty("/savebutton", false);
            //     }
            //     this.getView().getModel("localModel").setProperty("/Plant", oresponse.Werks);
            //     this.getView().getModel("localModel").setProperty("/ReqType", oresponse.Reqtyp);

            //     this.onReadOData("/PLANTSSet('" + oresponse.Werks + "')", null).then((oresponse1) => {
            //         this.getView().getModel("localModel").setProperty("/PlantDesc", oresponse1.Name1);
            //     });
            //     this.onReadOData("/REQTYPSet('" + oresponse.Reqtyp + "')", null).then((oresponse2) => {
            //         this.getView().getModel("localModel").setProperty("/ReqTypeDesc", oresponse2.Text);
            //         this.onReqTypeChange();
            //     });

            //     var aInitialFilters = [];
            //     aInitialFilters.push(new sap.ui.model.Filter("Bomreq", sap.ui.model.FilterOperator.EQ, sBomreq));
            //     this.onReadOData("/BOMITEMSet", aInitialFilters).then((oresponse3) => {
            //         this.getView().getModel("excel").setProperty("/bomData", oresponse3.results);
            //     });

            //     this.onReadOData("/ROUTREQSet", aInitialFilters).then((oresponse4) => {
            //         this.getView().getModel("excel").setProperty("/routingData", oresponse4.results);
            //     });

            //     this.onReadOData("/BOMREQWFLOGSet", aInitialFilters).then((oresponse5) => {
            //         this.getView().getModel("BOMApproval").setProperty("/results", oresponse5.results);
            //     });
            // });
            // //end


            if (this.getOwnerComponent().getComponentData() !== undefined &&
                this.getOwnerComponent().getComponentData().startupParameters.Bomreq !== undefined) {
                sBomreq = this.getOwnerComponent().getComponentData().startupParameters.Bomreq[0];

                if (sBomreq !== "") {
                   // var sBomreq = "1";
                    this.onReadOData("/BOMREQSet('" + sBomreq + "')", null).then((oresponse) => {
                        if(oresponse.Werks !== ""){
                            this.getView().getModel("localModel").setProperty("/savebutton", false);
                        }
                        this.getView().getModel("localModel").setProperty("/Plant", oresponse.Werks);
                        this.getView().getModel("localModel").setProperty("/ReqType", oresponse.Reqtyp);

                        this.onReadOData("/PLANTSSet('" + oresponse.Werks + "')", null).then((oresponse1) => {
                            this.getView().getModel("localModel").setProperty("/PlantDesc", oresponse1.Name1);
                        });
                        this.onReadOData("/REQTYPSet('" + oresponse.Reqtyp + "')", null).then((oresponse2) => {
                            this.getView().getModel("localModel").setProperty("/ReqTypeDesc", oresponse2.Text);
                            this.onReqTypeChange();
                        });

                        var aInitialFilters = [];
                        aInitialFilters.push(new sap.ui.model.Filter("Bomreq", sap.ui.model.FilterOperator.EQ, sBomreq));
                        this.onReadOData("/BOMITEMSet", aInitialFilters).then((oresponse3) => {
                            this.getView().getModel("excel").setProperty("/bomData", oresponse3.results);
                        });

                        this.onReadOData("/ROUTREQSet", aInitialFilters).then((oresponse4) => {
                            this.getView().getModel("excel").setProperty("/routingData", oresponse4.results);
                        });

                        this.onReadOData("/BOMREQWFLOGSet", aInitialFilters).then((oresponse5) => {
                            this.getView().getModel("BOMApproval").setProperty("/results", oresponse5.results);
                        });
                    });
                }

            }

        },

        onReadOData: function (spath, oFiltersp) {
            var spath = spath;
            var smodel = smodel;
            var oFiltersp = oFiltersp;
            return new Promise(function (resolve, reject) {
                var oModel = this.getOwnerComponent().getModel("odata1");
                this.getOwnerComponent().getModel().read(spath, {
                    filters: oFiltersp || [],
                    success: function (oData) {
                        resolve(oData);
                    }.bind(this),
                    error: function (oError) {
                        var oMsg = JSON.parse(oError.responseText);
                        resolve("E-" + oMsg.error.message.value);
                    }.bind(this)
                });
            }.bind(this));
        },

        _getValueHelpConfig: function () {

            return {
                Plant: { set: "/PLANTSSet", key: "Werks", returnproperty: "Name1" },
                ReqType: { set: "/REQTYPSet", key: "Reqtyp", returnproperty: "Text" }
            };
        },
        onValueHelpRequest: function (oEvent) {
            var oInput = oEvent.getSource();
            var sBindingPath = oInput.getBindingPath("value");
            var sFieldName = sBindingPath.substring(1);
            var oConfig = this._getValueHelpConfig()[sFieldName];
            if (!oConfig) {
                MessageToast.show("Value Help not configured for " + sFieldName);
                return;
            }
            var oModel = this.getOwnerComponent().getModel();
            var oMetaModel = oModel.getMetaModel();
            oMetaModel.loaded().then(function () {
                var sEntitySet = oConfig.set.substring(1);
                var oEntitySet = oMetaModel.getODataEntitySet(sEntitySet);
                var oEntityType = oMetaModel.getODataEntityType(oEntitySet.entityType);
                var aColumns = [];
                var aCells = [];
                oEntityType.property.forEach(function (oProperty) {
                    aColumns.push(
                        new Column({
                            header: new Label({
                                text: oProperty["sap:label"] || oProperty.name
                            })
                        })
                    );
                    aCells.push(
                        new Text({
                            text: "{" + oProperty.name + "}"
                        })
                    );

                });
                var oDialog = new TableSelectDialog({
                    title: "Select " + sFieldName,
                    multiSelect: false,
                    columns: aColumns,
                    search: function (oEvt) {
                        var sValue = oEvt.getParameter("value");

                        var oBinding = oEvt.getSource().getBinding("items");

                        if (!sValue) {
                            oBinding.filter([]);
                            return;
                        }

                        var aFilters = [];

                        oEntityType.property.forEach(function (oProperty) {

                            if (oProperty.type === "Edm.String") {

                                aFilters.push(new Filter({
                                    path: oProperty.name,
                                    operator: FilterOperator.Contains,
                                    value1: sValue
                                }));
                            }
                        });
                        oBinding.filter(new Filter({
                            filters: aFilters,
                            and: false
                        }));
                    },
                    confirm: function (oEvt) {

                        var oSelectedItem = oEvt.getParameter("selectedItem");

                        if (!oSelectedItem) {
                            return;
                        }
                        var oObject = oSelectedItem.getBindingContext().getObject();

                        this.getView().getModel("localModel").setProperty(
                            sBindingPath,
                            oObject[oConfig.key]
                        );

                        this.getView().getModel("localModel").setProperty(
                            sBindingPath + "Desc",
                            oObject[oConfig.returnproperty]
                        );
                        if (sFieldName === "ReqType") {
                            this.onReqTypeChange();
                        }
                    }.bind(this)

                });

                oDialog.setModel(oModel);

                var oTemplate = new ColumnListItem({
                    cells: aCells
                });

                oDialog.bindAggregation("items", {
                    path: oConfig.set,
                    template: oTemplate
                });

                this.getView().addDependent(oDialog);

                oDialog.open();

            }.bind(this)).catch(function () {

                MessageToast.show("Failed to load metadata.");

            });
        },
        onReqTypeChange: function () {
            var oLocalModel = this.getView().getModel("localModel");
            var sReqType = oLocalModel.getProperty("/ReqType");
            oLocalModel.setProperty("/showBom", false);
            oLocalModel.setProperty("/showRouting", false);
            switch (sReqType) {
                case "AA":
                case "AB":
                case "AE":
                    oLocalModel.setProperty("/showBom", true);
                    oLocalModel.setProperty("/showRouting", true);
                    break;
                case "AC":
                case "AD":
                    oLocalModel.setProperty("/showBom", true);
                    break;
                case "AF":
                case "AG":
                case "AH":
                case "AI":
                    oLocalModel.setProperty("/showRouting", true);
                    break;
            }
        },

        onDownloadBomTemplate: function () {

            ExcelHelper.downloadBomTemplate();

        },
        onDownloadRoutingTemplate: function () {
            ExcelHelper.downloadRoutingTemplate();
        },
        onBomFileAdded: function (oEvent) {

            var oFile = oEvent.getParameter("files")[0];

            var reader = new FileReader();

            reader.onload = function (e) {

                var workbook = XLSX.read(e.target.result, {
                    type: "array"
                });

                var sheet = workbook.Sheets[workbook.SheetNames[0]];

                var aData = XLSX.utils.sheet_to_json(sheet);
                var oExcelModel = this.getView().getModel("excel");
                var oarrBom = [];
                aData.forEach(function (oRow) {
                    oarrBom.push({
                        Matnr: oRow.Material.toString(),
                        Werks: oRow.Plant.toString(),
                        Item: oRow.Item.toString(),
                        Stlal: oRow.Alternative.toString(),
                        Basmn: oRow["Base qty"].toString(),
                        Basme: oRow["Base unit"].toString(),
                        Stktx: oRow["Alt Text"].toString(),
                        Cstext: oRow["BOM Text"].toString(),
                        Idnrk: oRow.Component.toString(),
                        Kmpmg: oRow["Comp qty"].toString(),
                        Kmpme: oRow["Comp unit"].toString()
                    });
                });
                oExcelModel.setProperty("/bomData", oarrBom);
                this.getView().getModel("localModel").setProperty("/bomCount", aData.length);
                this.getView().getModel("localModel").setProperty("/bomUploadEnabled", true);

                MessageToast.show("BOM Loaded Successfully");
            }.bind(this);
            reader.readAsArrayBuffer(oFile);
        },
        onRoutingFileAdded: function (oEvent) {

            var oFile = oEvent.getParameter("files")[0];
            var reader = new FileReader();

            reader.onload = function (e) {

                var workbook = XLSX.read(e.target.result, {
                    type: "array"
                });

                var sheet = workbook.Sheets[workbook.SheetNames[0]];

                var aData = XLSX.utils.sheet_to_json(sheet);
                var oREQTOROUTING = [];
                aData.forEach(function (oRow) {
                    oREQTOROUTING.push({
                        Matnr: oRow.Material.toString().trim(),
                        Werks: String(oRow.Plant).toString(),
                        Vornr: String(oRow["Operation No"]).toString(),
                        Plantext: oRow["Task Description"].toString(),
                        Plnverwe: String(oRow.Usage).toString(),
                        Plnst: String(oRow.Status).toString(),
                        Losvn: String(oRow["Lot From"]).trim().toString(),
                        Losbs: String(oRow["Lot To"]).trim().toString(),
                        Arbpl: oRow["Work Center"].toString(),
                        Steus: oRow["Control Key"].toString(),
                        Ltxa1: oRow.Description.toString(),
                        Bmsch: String(oRow["Base qty"]).trim().toString(),
                        Act1: String(oRow["Variable Labour"].toString()),
                        Actunt1: oRow["Variable Labour Unit"].toString(),
                        Act2: String(oRow["Variable Machinery"].toString()),
                        Actunt2: oRow["Variable Machinery Unit"].toString(),
                        Act3: String(oRow["Fixed Labour"].toString()),
                        Actunt3: oRow["Fixed Labour Unit"].toString(),
                        Act4: String(oRow["Fixed Machinery"].toString()),
                        Actunt4: oRow["Fixed Machinery Unit"].toString()

                    });
                });
                var oExcelModel = this.getView().getModel("excel");
                oExcelModel.setProperty("/routingData", oREQTOROUTING);

                this.getView().getModel("localModel").setProperty("/routingCount", aData.length);
                this.getView().getModel("localModel").setProperty("/routingUploadEnabled", true);
                MessageToast.show("Routing Loaded Successfully");

            }.bind(this);

            reader.readAsArrayBuffer(oFile);

        },
        onDownloadBomExcel: function () {

            var aData = this.getView()
                .getModel("excel")
                .getProperty("/bomData");

            ExcelHelper.downloadBomExcel(aData);

        },
        onDownloadRoutingExcel: function () {

            var aData = this.getView()
                .getModel("excel")
                .getProperty("/routingData");

            ExcelHelper.downloadRoutingExcel(aData);

        },
        onUploadBom: function () {
            this.byId("bomUploader").openFileDialog();
        },
        onCancel: function () {

            var oLocalModel = this.getView().getModel("localModel");
            var oExcelModel = this.getView().getModel("excel");

            oLocalModel.setProperty("/Plant", "");
            oLocalModel.setProperty("/PlantDesc", "");
            oLocalModel.setProperty("/ReqType", "");
            oLocalModel.setProperty("/ReqTypeDesc", "");

            oLocalModel.setProperty("/bomCount", 0);
            oLocalModel.setProperty("/routingCount", 0);

            oExcelModel.setProperty("/bomData", []);
            oExcelModel.setProperty("/routingData", []);

            sap.m.MessageToast.show("Screen Cleared");

        },
        onSave: function () {
            var oModel = this.getOwnerComponent().getModel();
            var oLocalModel = this.getView().getModel("localModel");
            var oExcelModel = this.getView().getModel("excel");
            if (!oLocalModel.getProperty("/Plant")) {
                MessageBox.error("Please Select Plant");
                return;
            }
            if (!oLocalModel.getProperty("/ReqType")) {
                MessageBox.error("Please Select Request Type");
                return;
            }
            var aBomData = oExcelModel.getProperty("/bomData") || [];
            var aRoutingData = oExcelModel.getProperty("/routingData") || [];
            var oPayload = {
                Werks: oLocalModel.getProperty("/Plant"),
                Reqtyp: oLocalModel.getProperty("/ReqType"),
                REQTOBOMITEMS: aBomData,
                REQTOROUTING: aRoutingData
            };
            // aBomData.forEach(function (oRow) {
            //     oPayload.REQTOBOMITEMS.push({
            //         Matnr: oRow.Material.toString(),
            //         Werks: oRow.Plant.toString(),
            //         Item: oRow.Item.toString(),
            //         Stlal: oRow.Alternative.toString(),
            //         Basmn: oRow["Base qty"].toString(),
            //         Basme: oRow["Base unit"].toString(),
            //         Stktx: oRow["Alt Text"].toString(),
            //         Cstext: oRow["BOM Text"].toString(),
            //         Idnrk: oRow.Component.toString(),
            //         Kmpmg: oRow["Comp qty"].toString(),
            //         Kmpme: oRow["Comp unit"].toString()
            //     });
            // });

            // aRoutingData.forEach(function (oRow) {
            //     oPayload.REQTOROUTING.push({
            //         Matnr: oRow.Material.toString().trim(),
            //         Werks: String(oRow.Plant).toString(),
            //         Vornr: String(oRow["Operation No"]).toString(),
            //         Plantext: oRow["Task Description"].toString(),
            //         Plnverwe: String(oRow.Usage).toString(),
            //         Plnst: String(oRow.Status).toString(),
            //         Losvn: String(oRow["Lot From"]).trim().toString(),
            //         Losbs: String(oRow["Lot To"]).trim().toString(),
            //         Arbpl: oRow["Work Center"].toString(),
            //         Steus: oRow["Control Key"].toString(),
            //         Ltxa1: oRow.Description.toString(),
            //         Bmsch: String(oRow["Base qty"]).trim().toString(),
            //         Act1: String(oRow["Variable Labour"].toString()),
            //         Actunt1: oRow["Variable Labour Unit"].toString(),
            //         Act2: String(oRow["Variable Machinery"].toString()),
            //         Actunt2: oRow["Variable Machinery Unit"].toString(),
            //         Act3: String(oRow["Fixed Labour"].toString()),
            //         Actunt3: oRow["Fixed Labour Unit"].toString(),
            //         Act4: String(oRow["Fixed Machinery"].toString()),
            //         Actunt4: oRow["Fixed Machinery Unit"].toString()

            //     });
            // });

            sap.ui.core.BusyIndicator.show(0);
            oPayload.Status = 'CR';
            debugger;
            oModel.create("/BOMREQSet", oPayload, {
                success: function (oData, res) {
                    sap.ui.core.BusyIndicator.hide();
                    debugger;
                    if (res.headers["sap-message"] !== undefined &&
                        JSON.parse(res.headers["sap-message"]).message !== "") {
                        MessageBox.error(JSON.parse(res.headers["sap-message"]).message);
                    } else {
                        MessageBox.success(oPayload.Bomreq + " Request Created Successfully");
                        oExcelModel.setProperty("/bomData", []);
                        oExcelModel.setProperty("/routingData", []);
                        oLocalModel.setProperty("/bomCount", 0);
                        oLocalModel.setProperty("/routingCount", 0);
                    }


                }.bind(this),
                error: function (oError) {
                    sap.ui.core.BusyIndicator.hide();
                    MessageBox.error("Error while Saving Request");
                }
            });
        },


        formatTime: function (oTime) {

            if (!oTime || oTime.ms === undefined) {
                return "";
            }

            var iSeconds = Math.floor(oTime.ms / 1000);
            var iHours = Math.floor(iSeconds / 3600);
            var iMinutes = Math.floor((iSeconds % 3600) / 60);
            var iSecs = iSeconds % 60;

            return [
                String(iHours).padStart(2, "0"),
                String(iMinutes).padStart(2, "0"),
                String(iSecs).padStart(2, "0")
            ].join(":");
        }

    });

});