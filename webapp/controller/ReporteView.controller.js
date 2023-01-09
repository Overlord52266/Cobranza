sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "cobranza/controller/BaseController",
    "sap/ui/dom/jquery/getSelectedText",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,
        UIComponent,
        BaseController,
        getSelectedText) {
        "use strict";

        return BaseController.extend("cobranza.controller.ReporteView", {
            onInit: function () {

            },
            onAfterRendering: function () {
                const that = this;
                const oView = this.getView();

                var Reporte = oView.getModel("Reporte");
                // Proyect.setProperty("/ElementCobro",false);
                // $.ajax("/sap/opu/odata/sap/ZOSFI_GW_TOMA_PEDIDO_SRV/ReporteCuentasSet?$filter=kunn2 eq '1000000014'")

                var oRouter = that.getRouter();
                oRouter.getRoute("RouteReporteView").attachMatched(that.ConsultaReporteCuentas, that);
                // oRouter.getRoute("RouteReporteView").attachMatched( that.ConsultaReporteCuentas, that);

                // this.ConsultaReporteCuentas();


            },

            onPressBackMenu: function () {
                this.getRouter().navTo("RouteMenu");
            },

            onSearch: function () {
                const that = this;
                const oView = this.getView();
                const InputDocumento = oView.byId("InputDocumento").getValue();
                const InputRucDni = oView.byId("InputRucDni").getValue();
                const cliente = oView.byId("cliente").getSelectedKey();
                const send =
                {
                    "ruc_dni": cliente !== "" ? cliente : InputRucDni,
                    "documento": InputDocumento
                }

                that.ConsultaReporteCuentas(send);
            },

        });
    });
