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
    "zppbomupload/lib/jszip",
	"zppbomupload/lib/xlsx",
	"zppbomupload/lib/exceljs.min",
    "zppbomupload/util/ExcelTemplate",
    "zppbomupload/util/ExcelHelper",
    "sap/m/MessageBox",
    "sap/ui/export/Spreadsheet",
    "sap/ui/export/library"    
], (Controller, JSONModel, TableSelectDialog, Column, Label, Text, ColumnListItem, Filter, FilterOperator, MessageToast,jszip, xlsx, ExcelJS, ExcelTemplate, ExcelHelper, MessageBox ,Spreadsheet, exportLibrary) => {
    "use strict";
    var EdmType = exportLibrary.EdmType;
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
            var aData = [
                {
				"Material" :"",
                    "Plant" :"",
                    "Alternative" :"",
                    "Base qty" :"",
                    "Base unit" :"",
                    "Alt Text" :"",
                    "BOM Text" :"",
                    "Item" :"",
                    "Component" :"",
                    "Comp qty" :"",
                    "Comp unit" :""
				}
            ];

            var aColumns = [
                {
                    label: "Material",
                    property: "Material",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Plant",
                    property: "Plant",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Alternative",
                    property: "Alternative",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Base qty",
                    property: "Base qty",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Base unit",
                    property: "Base unit",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Alt Text",
                    property: "Alt Text",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "BOM Text",
                    property: "BOM Text",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Item",
                    property: "Item",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Component",
                    property: "Component",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Comp qty",
                    property: "Comp qty",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Comp unit",
                    property: "Comp unit",
                    type: exportLibrary.EdmType.String
                }
            ];

            var oSettings = {
                workbook: {
                    columns: aColumns
                },
                dataSource: aData,
                fileName: "BOM_File_Template.xlsx"
            };

            var oSpreadsheet = new Spreadsheet(oSettings);

            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });
        },

        onDownloadRoutingTemplate: function () {

            // Sample data
            var aData = [
                {
                    "Material": "",
                    "Plant": "",
                    "Task Description": "",
                    "Usage": "",
                    "Status": "",
                    "Lot From": "",
                    "Lot To": "",
                    "Operation No": "",
                    "Work Center": "",
                    "Control Key": "",
                    "Description": "",
                    "Base qty": "",
                    "Variable Labour": "",
                    "Variable Labour Unit": "",
                    "Variable Machinery": "",
                    "Variable Machinery Unit": "",
                    "Fixed Labour": "",
                    "Fixed Labour Unit": "",
                    "Fixed Machinery": "",
                    "Fixed Machinery Unit": ""
                }
            ];

            // Excel column definitions
            var aColumns = [
                {
                    label: "Material",
                    property: "Material",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Plant",
                    property: "Plant",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Task Description",
                    property: "Task Description",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Usage",
                    property: "Usage",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Status",
                    property: "Status",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Lot From",
                    property: "Lot From",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Lot To",
                    property: "Lot To",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Operation No",
                    property: "Operation No",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Work Center",
                    property: "Work Center",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Control Key",
                    property: "Control Key",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Description",
                    property: "Description",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Base qty",
                    property: "Base qty",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Variable Labour",
                    property: "Variable Labour",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Variable Labour Unit",
                    property: "Variable Labour Unit",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Variable Machinery",
                    property: "Variable Machinery",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Variable Machinery Unit",
                    property: "Variable Machinery Unit",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Fixed Labour",
                    property: "Fixed Labour",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Fixed Labour Unit",
                    property: "Fixed Labour Unit",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Fixed Machinery",
                    property: "Fixed Machinery",
                    type: exportLibrary.EdmType.String
                },
                {
                    label: "Fixed Machinery Unit",
                    property: "Fixed Machinery Unit",
                    type: exportLibrary.EdmType.String
                }
            ];

            // Spreadsheet configuration
            var oSettings = {
                workbook: {
                    columns: aColumns
                },
                dataSource: aData,
                fileName: "Routing_File_Template.xlsx"
            };

            // Create Excel spreadsheet
            var oSpreadsheet = new Spreadsheet(oSettings);

            oSpreadsheet.build().finally(function () {
                oSpreadsheet.destroy();
            });

        },
        onDownloadBomTemplate1: function () {

            ExcelHelper.downloadBomTemplate();

        },
        onDownloadRoutingTemplate1: function () {
            ExcelHelper.downloadRoutingTemplate();
        },
        onBomFileAdded1: function (oEvent) {

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
                        Matnr: oRow.Material,
                        Werks: oRow.Plant,
                        Item: oRow.Item,
                        Stlal: oRow.Alternative,
                        Basmn: oRow["Base qty"],
                        Basme: oRow["Base unit"],
                        Stktx: oRow["Alt Text"],
                        Cstext: oRow["BOM Text"],
                        Idnrk: oRow.Component,
                        Kmpmg: oRow["Comp qty"],
                        Kmpme: oRow["Comp unit"]
                    });
                });
                oExcelModel.setProperty("/bomData", oarrBom);
                this.getView().getModel("localModel").setProperty("/bomCount", aData.length);
                this.getView().getModel("localModel").setProperty("/bomUploadEnabled", true);

                MessageToast.show("BOM Loaded Successfully");
            }.bind(this);
            reader.readAsArrayBuffer(oFile);
        },
        onRoutingFileAdded1: function (oEvent) {

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
                        Matnr: oRow.Material.trim(),
                        Werks: oRow.Plant,
                        Vornr: oRow["Operation No"],
                        Plantext: oRow["Task Description"],
                        Plnverwe: oRow.Usage,
                        Plnst: oRow.Status,
                        Losvn: oRow["Lot From"].trim(),
                        Losbs: oRow["Lot To"].trim(),
                        Arbpl: oRow["Work Center"],
                        Steus: oRow["Control Key"],
                        Ltxa1: oRow.Description,
                        Bmsch: oRow["Base qty"].trim(),
                        Act1: oRow["Variable Labour"],
                        Actunt1: oRow["Variable Labour Unit"],
                        Act2: oRow["Variable Machinery"],
                        Actunt2: oRow["Variable Machinery Unit"],
                        Act3: oRow["Fixed Labour"],
                        Actunt3: oRow["Fixed Labour Unit"],
                        Act4: oRow["Fixed Machinery"],
                        Actunt4: oRow["Fixed Machinery Unit"]

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
            //         Matnr: oRow.Material,
            //         Werks: oRow.Plant,
            //         Item: oRow.Item,
            //         Stlal: oRow.Alternative,
            //         Basmn: oRow["Base qty"],
            //         Basme: oRow["Base unit"],
            //         Stktx: oRow["Alt Text"],
            //         Cstext: oRow["BOM Text"],
            //         Idnrk: oRow.Component,
            //         Kmpmg: oRow["Comp qty"],
            //         Kmpme: oRow["Comp unit"]
            //     });
            // });

            // aRoutingData.forEach(function (oRow) {
            //     oPayload.REQTOROUTING.push({
            //         Matnr: oRow.Material.trim(),
            //         Werks: String(oRow.Plant),
            //         Vornr: String(oRow["Operation No"]),
            //         Plantext: oRow["Task Description"],
            //         Plnverwe: String(oRow.Usage),
            //         Plnst: String(oRow.Status),
            //         Losvn: String(oRow["Lot From"]).trim(),
            //         Losbs: String(oRow["Lot To"]).trim(),
            //         Arbpl: oRow["Work Center"],
            //         Steus: oRow["Control Key"],
            //         Ltxa1: oRow.Description,
            //         Bmsch: String(oRow["Base qty"]).trim(),
            //         Act1: String(oRow["Variable Labour"]),
            //         Actunt1: oRow["Variable Labour Unit"],
            //         Act2: String(oRow["Variable Machinery"]),
            //         Actunt2: oRow["Variable Machinery Unit"],
            //         Act3: String(oRow["Fixed Labour"]),
            //         Actunt3: oRow["Fixed Labour Unit"],
            //         Act4: String(oRow["Fixed Machinery"]),
            //         Actunt4: oRow["Fixed Machinery Unit"]

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
                        JSON.parse(res.headers["sap-message"]).message !== ""
                        && JSON.parse(res.headers["sap-message"]).message.indexOf("Created") === -1) {
                        MessageBox.error(JSON.parse(res.headers["sap-message"]).message);
                    } else {
                        MessageBox.success(oData.Bomreq + " Request Created Successfully");
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
        },

        
_loadXLSX: function () {

    var that = this;

    return new Promise(function (resolve, reject) {

        // Already loaded?
        if (window.XLSX) {
            resolve(window.XLSX);
            return;
        }

        // Get BSP application root path
        // var sAppPath = sap.ui.require.toUrl(
        //     "zppbomupload"
        // );
        
        var sAppPath="/sap/bc/ui5_ui5/sap/zppbomupload"

        var sLibraryPath =
            sAppPath + "/lib/xlsx.full.min.js";

        console.log("Loading Excel library:", sLibraryPath);

        var oScript = document.createElement("script");

        oScript.type = "text/javascript";
        oScript.src = sLibraryPath;

        oScript.onload = function () {

            console.log("SheetJS script loaded");

            if (window.XLSX) {
                resolve(window.XLSX);
            } else {
                reject(
                    new Error("Script loaded, but XLSX is undefined.")
                );
            }

        };

        oScript.onerror = function () {

            reject(
                new Error("Unable to load: " + sLibraryPath)
            );

        };

        document.head.appendChild(oScript);

    });

},

onRoutingFileAdded: function (oEvent) {

    var oFile = oEvent.getParameter("files")[0];

    if (!oFile) {
        return;
    }

    this._loadXLSX()
        .then(function (XLSXLib) {

            var oReader = new FileReader();

            oReader.onload = function (e) {

                try {

                    var aBinary = new Uint8Array(
                        e.target.result
                    );

                    var oWorkbook = XLSXLib.read(
                        aBinary,
                        {
                            type: "array"
                        }
                    );

                    var sSheetName =
                        oWorkbook.SheetNames[0];

                    var oWorksheet =
                        oWorkbook.Sheets[sSheetName];

                    var aExcelData =
                        XLSXLib.utils.sheet_to_json(
                            oWorksheet,
                            {
                                defval: "",
                                raw: false
                            }
                        );

                    console.log("Excel Data:", aExcelData);
                    
                    var oarrBom = [];
                aExcelData.forEach(function (oRow) {
                    oarrBom.push({
                        Matnr: oRow.Material.trim(),
                        Werks: oRow.Plant,
                        Vornr: oRow["Operation No"],
                        Plantext: oRow["Task Description"],
                        Plnverwe: oRow.Usage,
                        Plnst: oRow.Status,
                        Losvn: oRow["Lot From"].trim(),
                        Losbs: oRow["Lot To"].trim(),
                        Arbpl: oRow["Work Center"],
                        Steus: oRow["Control Key"],
                        Ltxa1: oRow.Description,
                        Bmsch: oRow["Base qty"].trim(),
                        Act1: oRow["Variable Labour"],
                        Actunt1: oRow["Variable Labour Unit"],
                        Act2: oRow["Variable Machinery"],
                        Actunt2: oRow["Variable Machinery Unit"],
                        Act3: oRow["Fixed Labour"],
                        Actunt3: oRow["Fixed Labour Unit"],
                        Act4: oRow["Fixed Machinery"],
                        Actunt4: oRow["Fixed Machinery Unit"]
                    });
                });
                    this.getView()
                        .getModel("excel")
                        .setProperty(
                            "/routingData",
                            oarrBom
                        );

                    sap.m.MessageToast.show(
                        aExcelData.length +
                        " records uploaded successfully"
                    );

                } catch (error) {

                    sap.m.MessageBox.error(
                        "Excel Error: " + error.message
                    );

                    console.error(error);

                }

            }.bind(this);

            oReader.onerror = function () {

                sap.m.MessageBox.error(
                    "Unable to read Excel file."
                );

            };

            oReader.readAsArrayBuffer(oFile);

        }.bind(this))

        .catch(function (error) {

            console.error(error);

            sap.m.MessageBox.error(error.message);

        });

},

onBomFileAdded: function (oEvent) {

    var oFile = oEvent.getParameter("files")[0];

    if (!oFile) {
        return;
    }

    this._loadXLSX()
        .then(function (XLSXLib) {

            var oReader = new FileReader();

            oReader.onload = function (e) {

                try {

                    var aBinary = new Uint8Array(
                        e.target.result
                    );

                    var oWorkbook = XLSXLib.read(
                        aBinary,
                        {
                            type: "array"
                        }
                    );

                    var sSheetName =
                        oWorkbook.SheetNames[0];

                    var oWorksheet =
                        oWorkbook.Sheets[sSheetName];

                    var aExcelData =
                        XLSXLib.utils.sheet_to_json(
                            oWorksheet,
                            {
                                defval: "",
                                raw: false
                            }
                        );

                    console.log("Excel Data:", aExcelData);
                    
                    var oarrBom = [];
                aExcelData.forEach(function (oRow) {
                    oarrBom.push({
                        Matnr: oRow.Material,
                        Werks: oRow.Plant,
                        Item: oRow.Item,
                        Stlal: oRow.Alternative,
                        Basmn: oRow["Base qty"],
                        Basme: oRow["Base unit"],
                        Stktx: oRow["Alt Text"],
                        Cstext: oRow["BOM Text"],
                        Idnrk: oRow.Component,
                        Kmpmg: oRow["Comp qty"],
                        Kmpme: oRow["Comp unit"]
                    });
                });
                    this.getView()
                        .getModel("excel")
                        .setProperty(
                            "/bomData",
                            oarrBom
                        );

                    sap.m.MessageToast.show(
                        aExcelData.length +
                        " records uploaded successfully"
                    );

                } catch (error) {

                    sap.m.MessageBox.error(
                        "Excel Error: " + error.message
                    );

                    console.error(error);

                }

            }.bind(this);

            oReader.onerror = function () {

                sap.m.MessageBox.error(
                    "Unable to read Excel file."
                );

            };

            oReader.readAsArrayBuffer(oFile);

        }.bind(this))

        .catch(function (error) {

            console.error(error);

            sap.m.MessageBox.error(error.message);

        });

},



    });

});