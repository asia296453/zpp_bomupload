sap.ui.define([], function () {
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