sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "cobranza/controller/BaseController",
    "sap/m/MessageBox",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller,BaseController,MessageBox) {
        "use strict";
        let UriDomain="/sap/opu/odata/sap/ZOSFI_GW_TOMA_PEDIDO_SRV/"
        let hostname = location.hostname;

        return BaseController.extend("cobranza.controller.PlanillaView2", {
            onInit: function () {
                this.oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            },
            beforeOpenDialog2:function(){
                var that = this;
                const date = sap.ui.getCore().byId("DateVoucher");
                date.addDelegate({
                    onAfterRendering: function() {
                        date.$().find('INPUT').attr('disabled', true).css('color', '#ccc');
                    }
                  }, date);
                           
            },

            onAfterRendering: function (){
                const that = this ;	
                const oView				= this.getView(); 

                // var oRouter = that.getRouter();
				// oRouter.getRoute("RoutePlanillaView2").attachMatched(that.ConsultaDetallePlanilla, that);	

                var Proyect = oView.getModel("Proyect");
                Proyect.setProperty("/ElementCobro",false);
                Proyect.setProperty("/ElementBanco",false);
                Proyect.setProperty("/ElementCheque",false);

            },

            onNavBack : function (){

                this.oRouter.navTo("RoutePlanillaView1");
            },

            RegistrarDeposito : function (){
                const that = this ;	
                const oView				= this.getView(); 
                if (!that.RegistrarDeposito12) {
                    that.RegistrarDeposito12 = sap.ui.xmlfragment("cobranza.view.Dialog1", that);
                    oView.addDependent(that.RegistrarDeposito12);
                    }
                    
                
                that.RegistrarDeposito12.open();

            },
            onClosed: function (){
                const that = this ;	
                const oView				= this.getView(); 

                that.RegistrarDeposito12.close();

            },
            onClosedPago: function (){
                const that = this ;	
                const oView				= this.getView(); 

                that.RegistrarPago333.close();

            },

            Nuevopago : function (){
                const that = this ;	
                const oView				= this.getView(); 
                // if (!that.RegistrarPago) {
                //     that.RegistrarPago = sap.ui.xmlfragment("cobranza.view.TabletDialog1", that);
                //     oView.addDependent(that.RegistrarPago);
                //     }
                    
                    // var vista	= this.getView();
			
                    if (!this.RegistrarPago) {
                        that.RegistrarPago = sap.ui.xmlfragment("cobranza.view.TabletDialog1", that);
                            oView.addDependent(this.RegistrarPago);		
                        }
                        
                  	
                    this.RegistrarPago.open();



                // that.RegistrarPago.open();

            },
            handleConfirm : function (oEvent){
                const that = this ;	
                const oView				= this.getView(); 
                const DetallePlanilla = oView.getModel("DetallePlanilla");
                const Table = sap.ui.getCore().byId("TableDialogDoc");
                let  oItems = oEvent.getParameter("selectedItems");    

                let Documentos = oItems.map(function(obj){
                    let Data = obj.getBindingContext("Reporte").getObject();
                    return Data;
                });

                DetallePlanilla.setProperty("/SelectTableDialogDocumentos",Documentos);


                if (!that.RegistrarPago333) {
                    that.RegistrarPago333 = sap.ui.xmlfragment("cobranza.view.Dialog2", that);
                    oView.addDependent(that.RegistrarPago333);
                    }
                    that.RegistrarPago333.open();
                    
            },
            RegistrarPago1 : async function (){
                const that              = this ;	
                const oView				= this.getView(); 
                const Proyect           = oView.getModel("Proyect");    
                const DetallePlanilla   = oView.getModel("DetallePlanilla");
                const Planilla          = oView.getModel("Planilla");
                const MedioPago         = oView.getModel("MedioPago");
                const Cuenta            = oView.getModel("Cuenta");

                const Banco         = oView.getModel("Banco");
                let data            = DetallePlanilla.getProperty("/SelectTableDialogDocumentos");
                

                const ImportePagar  = sap.ui.getCore().byId("ImportePagar").getValue();

            
                let dataMedioPago   =  sap.ui.getCore().byId("MedioPago").getSelectedKey();
                let dataBanco       = sap.ui.getCore().byId("Banco").getSelectedKey();
                let dataCuenta      = sap.ui.getCore().byId("CuentaBancaria").getSelectedKey();
                const Operacion     = sap.ui.getCore().byId("Operacion").getValue();
                const Cheque        = sap.ui.getCore().byId("Cheque").getValue();

                const UserLogin       = oView.getModel("UserLogin"); 
                const InfoUserLogin   = UserLogin.getProperty("/data"); 
                const CodVendedor     = InfoUserLogin["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes[0].value ;

                const ElementCobro  = Proyect.getProperty("/ElementCobro");
                const ElementBanco  = Proyect.getProperty("/ElementBanco");
                const ElementCheque = Proyect.getProperty("/ElementCheque");

                const CorrelativoPlanilla = DetallePlanilla.getProperty("/dataPrincipal/planilla")
                
                let Documentos = data.map(function(obj){
                    let sendDocumento = {
                        "status"        :"",
                        "planilla"      :CorrelativoPlanilla,
                        "cod_vendedor"  :CodVendedor,
                        "vendedor"      :"",
                        "canal"         :"",
                        "documento"     :obj.documento,
                        "tipo_doc"      :obj.tipo_doc,
                        "cliente"       :obj.cliente,
                        "moneda"        :obj.moneda,
                        "total_doc"     :obj.total_fac,
                        "importe_cobrado":obj.impCobrado,
                        "saldo"         :obj.saldo_pagar,
                        "fecha_emi"     :"20221119",
                        "fecha_ven"     :obj.fecha_ven,
                        "cond_pago"     :obj.cond_pago,
                        "medio_pago"    :dataMedioPago,
                        "banco"         :ElementBanco ? dataBanco :"",
                        "cta_bancaria"  :ElementBanco ? dataCuenta:"",
                        "fecha_vouc"    :ElementCobro ?"20221119":"",
                        "nro_oper"      :ElementCobro ? Operacion:"",
                        "nro_cheque"    :ElementCheque ? Cheque:"",
                        "doc_adjunto"   :"",
                        "type"          :"",
                        "msg"           :""
                        }
                        return sendDocumento;
                });


                const data1 =
                {
                    "update":"X",
                    "cod_vendedor":CodVendedor,
                    "planilla":CorrelativoPlanilla,
                    "DetallePlanillaSet":Documentos, 
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
                    sap.ui.core.BusyIndicator.show(0);
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
                    data:JSON.stringify(data1),
                    success: async function (data, textStatus, jqXHR) {
                        
                        
                        sap.ui.getCore().byId("Operacion").setValue("");
                        sap.ui.getCore().byId("Cheque").setValue("");
                        sap.ui.getCore().byId("DateVoucher").setValue("");

                        sap.ui.getCore().byId("Banco").setValue("");
                        sap.ui.getCore().byId("CuentaBancaria").setValue("");
                        sap.ui.getCore().byId("MedioPago").setValue("");

                        sap.ui.getCore().byId("Banco").setSelectedKey("");
                        sap.ui.getCore().byId("CuentaBancaria").setSelectedKey("");
                        sap.ui.getCore().byId("MedioPago").setSelectedKey("");

                        let DataDetallePlanillas = DetallePlanilla.getProperty("/data")
                        DataDetallePlanillas = DataDetallePlanillas.concat(Documentos);
                        DetallePlanilla.setProperty("/data",DataDetallePlanillas)


                        let ImporteTotal=0;
                        DataDetallePlanillas.map(function(obj){
                          ImporteTotal +=parseFloat(obj.importe_cobrado)
                        });
          
                        DetallePlanilla.setProperty("/dataPrincipal/importe_cobrado",ImporteTotal)
                        


                        Proyect.setProperty("/ElementCobro",false);
                        Proyect.setProperty("/ElementBanco",false);
                        Proyect.setProperty("/ElementCheque",false);

                        that.RegistrarPago333.close();

                        
                        
                        
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.success("Se guardó existosamente", {
                        actions: [MessageBox.Action.OK],
                        emphasizedAction: MessageBox.Action.OK,
                        onClose: function (sAction) {

                            // that.oRouter.navTo("RoutePlanillaView2");
                        }
                    });	
    
    
    
                    },
                    error: function () {
                        MessageBox.error("Ocurrio un error al obtener los datos");
                    }
                    });
            

  


 
                // ImportePagar

                // "MedioPago>/Key"



            },
          
            SelectEfectivo : function (){
                const that = this ;	
                const oView				= this.getView(); 
                var Proyect = oView.getModel("Proyect");
                Proyect.setProperty("/ElementCobro",false);
                
            },

            SelectBancario : function (){
                const that = this ;	
                const oView				= this.getView(); 
                var Proyect = oView.getModel("Proyect");
                Proyect.setProperty("/ElementCobro",true);
 
            },
            selectMedPago : function (oEvent){
                const that = this ;	
                const oView				= this.getView(); 
                const Source = oEvent.getSource()
                var Proyect = oView.getModel("Proyect");    
                const key = Source.getSelectedKey()
                if (key === "R" || key === "P"){
                
                Proyect.setProperty("/ElementCobro",true);
                Proyect.setProperty("/ElementBanco",true);
                Proyect.setProperty("/ElementCheque",false);
                }
                else if (key === "H"){
                Proyect.setProperty("/ElementCobro",false);
                Proyect.setProperty("/ElementBanco",false);
                Proyect.setProperty("/ElementCheque",false);
                }
                else{
                Proyect.setProperty("/ElementCobro",true);
                Proyect.setProperty("/ElementBanco",false);
                Proyect.setProperty("/ElementCheque",true);
                }





            },
            selectBanco : function (){
            const that          = this ;	
            const oView		    = this.getView(); 
            const Banco         = oView.getModel("Banco"); 
            const Cuenta        = oView.getModel("Cuenta"); 
            const BancoCuenta   = oView.getModel("BancoCuenta"); 

            let dataBanco       = Banco.getProperty("/data");
            let KeyBanco        = sap.ui.getCore().byId("Banco").getSelectedKey();
            let dataBancoCuenta = BancoCuenta.getProperty("/data");
            // Cuenta.setProperty("/data", [])
            let Cuentas = dataBancoCuenta.filter(obj=> KeyBanco.split(" ")[0] === obj.text1.split(" ")[0]);
            Cuenta.setProperty("/data",Cuentas) ;
            sap.ui.getCore().byId("CuentaBancaria").setValue("");

            },
            UploadFinish : function (oEvent){

                oEvent.mParameters.item.setVisibleEdit(false);
            }
        });
    });
