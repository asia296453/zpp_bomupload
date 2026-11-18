sap.ui.define(["zppbomupload/lib/jszip",
	"zppbomupload/lib/xlsx",
	"zppbomupload/lib/exceljs.min"],(jszip, xlsx, ExcelJS) => {
    "use strict";

    return {

        downloadTemplate: function (aHeaders, sSheetName, sFileName) {

            var oWorkbook = XLSX.utils.book_new();

            var oWorksheet = XLSX.utils.aoa_to_sheet([
                aHeaders
            ]);
            XLSX.utils.book_append_sheet(
                oWorkbook,
                oWorksheet,
                sSheetName
            );

            XLSX.writeFile(
                oWorkbook,
                sFileName
            );
        },

        downloadBomTemplate: function () {

            this.downloadTemplate(
                [
                    "Material",
                    "Plant",
                    "Alternative",
                    "Base qty",
                    "Base unit",
                    "Alt Text",
                    "BOM Text",
                    "Item",
                    "Component",
                    "Comp qty",
                    "Comp unit"
                ],
                "BOM Template",
                "BOM_File_Template.xlsx"
            );

        },

        downloadRoutingTemplate: function () {

            this.downloadTemplate(
                [
                    "Material",
                    "Plant",
                    "Task Description",
                    "Usage",
                    "Status",
                    "Lot From",
                    "Lot To",
                    "Operation No",
                    "Work Center",
                    "Control Key",
                    "Description",
                    "Base qty",
                    "Variable Labour",
                    "Variable Labour Unit",
                    "Variable Machinery",
                    "Variable Machinery Unit",
                    "Fixed Labour",
                    "Fixed Labour Unit",
                    "Fixed Machinery",
                    "Fixed Machinery Unit"
                ],
                "Routing Template",
                "Routing_File_Template.xlsx"
            );

        },
        downloadBomExcel: function (aData) {

    var worksheet = XLSX.utils.json_to_sheet(aData);

    var workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "BOM Results"
    );

    XLSX.writeFile(
        workbook,
        "BOM_Result.xlsx"
    );

},
downloadRoutingExcel: function (aData) {

    var worksheet = XLSX.utils.json_to_sheet(aData);

    var workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        "Routing Results"
    );

    XLSX.writeFile(
        workbook,
        "Routing_Result.xlsx"
    );

},

    };

});