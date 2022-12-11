sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent"	,
	"cobranza/controller/BaseController",
	"cobranza/utils/utilService",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,UIComponent,BaseController,Service) {
        "use strict";

        return BaseController.extend("cobranza.controller.Menu", {
            onInit: function () {

            },
            onAfterRendering : function (){

			//  this.ConsultaPrincipal();
             var oRouter =sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.getRoute("RouteMenu").attachPatternMatched( this.ConsultaPrincipal, this);	
		
            },

            NavigateCreacionPlanilla: function (){

                this.getRouter().navTo("RoutePlanillaView1");
            },

            NavigateReporteCuentas: function (){
                this.getRouter().navTo("RouteReporteView");
            }

        });
    });
