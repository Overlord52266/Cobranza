sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/m/MessageBox",
    "cobranza/controller/BaseController",
    "cobranza/utils/utilService",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,MessageBox,BaseController,Service) {
        "use strict";
        let UriDomain="/sap/opu/odata/sap/ZOSFI_GW_TOMA_PEDIDO_SRV/"
        let hostname = location.hostname;
        return BaseController.extend("cobranza.controller.PlanillaView1", {
            onInit: function () {
                
            },
            onAfterRendering :  function (){
                const that  = this ;	
                const oView	= this.getView();
                // var Proyect = oView.getModel("Proyect");


                if(! hostname.includes("port")) {
                    if(!UriDomain.includes("~")){
                    UriDomain =  jQuery.sap.getModulePath("cobranza")+UriDomain;
                    }
                }
                    
                var oRouter =sap.ui.core.UIComponent.getRouterFor(this);
				oRouter.getRoute("RoutePlanillaView1").attachPatternMatched( that.ConsultaPlanilla, that);	


               

                // let dataInitial = 
                // {
                // "Codigo"            :"LI19-87704"       ,
                // "Estado"            :"Cerrado"          ,
                // "FechaEmision"      :"16/09/2022"       ,
                // "ImporteTotal"      :"S/. 176.96"       ,
                // "icon_Conciliado"   :"sap-icon://accept",
                // "icon_Liquidado"    :"sap-icon://accept",
                // "Moneda"            :"Pen"
                // };
                // dataInitial.state_Liquidado =dataInitial.icon_Conciliado === "sap-icon://accept"? "Success":"Error";
                // dataInitial.state_Conciliado=dataInitial.icon_Liquidado === "sap-icon://accept"? "Success":"Error";

                // Proyect.setProperty("/Planilla",[dataInitial]);
                // that.consultaMedioDePago();
                // that.consultaStatus();
                // that.consultaBancoCuenta();
            },
            OnBackMainMenu : function (){

                this.getRouter().navTo("RouteMenu");    

            },

            OnPressHeader : function (oEvent){
                const that              = this ;	
                const oView             = this.getView(); 
                const DetallePlanilla   = oView.getModel("DetallePlanilla");                
                let Planilla	        = oEvent.getSource().getBindingContext("Planilla").getObject();	

                let DataDetallePlanilla = DetallePlanilla.setProperty("/data",Planilla.DetallePlanilla);
                DetallePlanilla.setProperty("/dataPrincipal",Planilla);

                this.getRouter().navTo("RoutePlanillaView2");    
            },

            onPress : async function (){
                const that            = this ;	
                const oView		      = this.getView(); 
                const Planilla        = oView.getModel("Planilla");
                const DetallePlanilla = oView.getModel("DetallePlanilla");
                const UserLogin       = oView.getModel("UserLogin"); 
                const InfoUserLogin   = UserLogin.getProperty("/data"); 
                const CodVendedor     = InfoUserLogin["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes[0].value ;
                const DataPlanillas   = Planilla.getProperty("/data")

                const PlanillasVigentes= DataPlanillas.filter(obj=> obj.status === "Vigente");


                if(PlanillasVigentes.length !== 0){
                    MessageBox.error("Nose puede crear una Planilla,ya que existe una Planilla Vigente");
                    return ; 
                }

                const data =
                {
                    "crea":"X",
                    "cod_vendedor":CodVendedor,
                    "status":"V",
                    "DetallePlanillaSet":[
                    {
                    "status"        :"",
                    "planilla"      :"",
                    "cod_vendedor"  :"",
                    "vendedor"      :"",
                    "canal"         :"",
                    "documento"     :"",
                    "tipo_doc"      :"",
                    "cliente"       :"",
                    "cod_cliente"   :"",
                    "moneda"        :"",
                    "total_doc"     :"",
                    "importe_cobrado":"",
                    "saldo"         :"",
                    "fecha_emi"     :"",
                    "fecha_ven"     :"",
                    "cond_pago"     :"",
                    "medio_pago"    :"",
                    "banco"         :"",
                    "cta_bancaria"  :"",
                    "fecha_vouc"    :"",
                    "nro_oper"      :"",
                    "nro_cheque"    :"",
                    "doc_adjunto"   :"",
                    "type"          :"",
                    "msg"           :""
                    }
                    ], 
                    "ResultadosSet":[
                    {
                    "type":"",
                    "msg":"",
                    "planilla":"",
                    "cod_vendedor":"",
                    "status":"",
                    "fecha_emi":"",
                    "importe_ttl":"",
                    "conciliado":"",
                    "observ":""
                    }
                    ]
                    };

 


                let token='';

                await $.ajax({
                        url: UriDomain,
                          type: "GET",
                          headers: {
                              "x-CSRF-Token": "Fetch"
                          }
                      }).always(function (result, statusx, responsex) {
                          
                        token= responsex.getResponseHeader("x-csrf-token");
                });	


            await jQuery.ajax({
				type: "POST",
				url: UriDomain+"CreaPlanillaSet",
                headers: {
					"Accept": "application/json",
               	    "x-CSRF-Token":  token,
                    "Content-Type":"application/json"
				},
				async: true,
                data:JSON.stringify(data),
				success: async function (data, textStatus, jqXHR) {
					
                    const NumeroPlani = data.d.ResultadosSet.results[1].planilla ;
                    await that.ConsultaPlanilla(NumeroPlani);

                    // let DataPlanillas = Planilla.getProperty("/data");
                    // let PlanillaFilter = DataPlanillas.filter(obj=> obj.planilla === NumeroPlani);

                    // if(PlanillaFilter.length !== 0){
                    //     DetallePlanilla.setProperty("/dataPrincipal", PlanillaFilter[0]);
                    // }
                    
                    // DetallePlanilla.setProperty("/data",[]);


                    MessageBox.success("Se creó la Planilla "+NumeroPlani, {
                    actions: [MessageBox.Action.OK],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: function (sAction) {
                        that.getRouter().navTo("RoutePlanillaView2");
                    }
                });	



				},
				error: function () {
					MessageBox.error("Ocurrio un error al obtener los datos de infoaprobador");
				}
			    });
        
                // MessageBox.success("Se creó la Planilla LI19-87704");
                
            },
            SearchPlanilla : function (oEvent) {
            const that            = this ;	
            const oView		      = this.getView(); 
            let Search = oEvent.getSource().getValue();

            var aFilter1=new sap.ui.model.Filter( "documento", sap.ui.model.FilterOperator.Contains, Search) ;
            var aFilter2=new sap.ui.model.Filter( "ruc_dni", sap.ui.model.FilterOperator.Contains, Search) ;
            var aFilter3=new sap.ui.model.Filter( "cliente", sap.ui.model.FilterOperator.Contains, Search) ;

            oView.byId("TablePlanilla").getBinding("items").filter([aFilter1,aFilter2,aFilter3]);
            


            }


        });
    });
