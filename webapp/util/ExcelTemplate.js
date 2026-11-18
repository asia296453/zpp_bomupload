sap.ui.define(["zppbomupload/lib/jszip",
	"zppbomupload/lib/xlsx",
	"zppbomupload/lib/exceljs.min"],(jszip, xlsx, ExcelJS) => {
    "use strict";

    return {

        downloadTemplate: function (aHeaders, sFileName) {

            var wb = XLSX.utils.book_new();

            var ws = XLSX.utils.aoa_to_sheet([
                aHeaders
            ]);

            XLSX.utils.book_append_sheet(wb, ws, "Template");

            XLSX.writeFile(wb, sFileName);

        }

    };

});