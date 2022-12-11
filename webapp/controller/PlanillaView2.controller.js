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
        let UriDomain               = "/sap/opu/odata/sap/ZOSFI_GW_TOMA_PEDIDO_SRV/"
        let hostname                = location.hostname;
        let SelectDetallePlanilla   = {};
        let Vizualizar              = false ;
       

        return BaseController.extend("cobranza.controller.PlanillaView2", {
            onInit: function () {
               
            },
            onAfterRendering: function (){
                const that = this ;	
                const oView				= this.getView(); 
                var oRouter =sap.ui.core.UIComponent.getRouterFor(this);
				// oRouter.getRoute("RoutePlanillaView2").attachPatternMatched( that.ValidacionDetallePlanilla, that);	
                

                if(! hostname.includes("port")) {
                    if(!UriDomain.includes("~")){
                    UriDomain =  jQuery.sap.getModulePath("cobranza")+UriDomain;
                    }
            
                    }

                var Proyect = oView.getModel("Proyect");
                Proyect.setProperty("/ElementCobro",false);
                Proyect.setProperty("/ElementBanco",false);
                Proyect.setProperty("/ElementCheque",false);
                Proyect.setProperty("/ElementOperacion",false);

            },
            beforeOpenDialog2:function(){
                const that              = this;
                const oView				= this.getView(); 
                const DetallePlanilla   = oView.getModel("DetallePlanilla");
                const date              = sap.ui.getCore().byId("DateVoucher");
                    date.setMaxDate(new Date());
                    date.addDelegate(
                        {
                        onAfterRendering:   function() {
                                                date.$().find('INPUT').attr('disabled', true).css('color', '#ccc');
                                            }
                        }, date);
                        
                    if( Object.keys(SelectDetallePlanilla).length === 0 ){
                    const Documentos    = DetallePlanilla.getProperty("/SelectTableDialogDocumentos");
                    let ImpPagar        = Documentos.map(obj => obj.impCobrado).reduce((acc, amount) => parseFloat(acc === '' ? 0: acc) + parseFloat(amount === '' ? 0:amount ) );
                    sap.ui.getCore().byId("ImportePagar").setValue(ImpPagar  );

                    // sap.ui.getCore().byId("ImportePagar").setEnabled(false);
                    // sap.ui.getCore().byId("RegistrarPago").setVisible(true);
                    // sap.ui.getCore().byId("ActualizarPago").setVisible(false);
                    }
                    
                    // else{
                    // sap.ui.getCore().byId("ImportePagar").setEnabled(true);
                    // sap.ui.getCore().byId("RegistrarPago").setVisible(false);
                    // sap.ui.getCore().byId("ActualizarPago").setVisible(true);
                    // }
               
            },
            afterOpenDialog2 : function (){
                const that              = this;
                const oView				= this.getView(); 
                const DetallePlanilla   = oView.getModel("DetallePlanilla");
                const date              = sap.ui.getCore().byId("DateVoucher");
                const MedioPago         = oView.getModel("MedioPago");
                const Archivos          = oView.getModel("Archivos");
                

                const dataMedioPago         = MedioPago.getProperty("/data");


                    sap.ui.getCore().byId("MedioPago").setEnabled(true)
                    sap.ui.getCore().byId("ImportePagar").setEnabled(false)
                    sap.ui.getCore().byId("Banco").setEnabled(true)
                    sap.ui.getCore().byId("CuentaBancaria").setEnabled(true)
                    sap.ui.getCore().byId("DateVoucher").setEnabled(true)
                    sap.ui.getCore().byId("Cheque").setEnabled(true)
                    sap.ui.getCore().byId("Operacion").setEnabled(true)
                    sap.ui.getCore().byId("RegistrarPago").setVisible(true)
                    sap.ui.getCore().byId("ActualizarPago").setVisible(false)


                if( Object.keys(SelectDetallePlanilla).length !== 0 ){
                    // sap.ui.getCore().byId("Banco").setValue(SelectDetallePlanilla.banco);
                    // sap.ui.getCore().byId("CuentaBancaria").setValue(SelectDetallePlanilla.cta_bancaria);
                    // sap.ui.getCore().byId("MedioPago").setValue("");

                    let MP = dataMedioPago.filter(obj=> obj.text1 === SelectDetallePlanilla.medio_pago);      
                    sap.ui.getCore().byId("MedioPago").setSelectedKey(MP[0].via);
                    that.selectMedPago();
                    sap.ui.getCore().byId("ImportePagar").setValue((parseFloat(SelectDetallePlanilla.importe_cobrado)).toFixed(2) );
                    sap.ui.getCore().byId("Banco").setSelectedKey(SelectDetallePlanilla.banco);
                    
                    that.selectBanco();
                    sap.ui.getCore().byId("CuentaBancaria").setSelectedKey(SelectDetallePlanilla.cta_bancaria);

                    let fechaVaucher = SelectDetallePlanilla.fecha_vouc;
                    sap.ui.getCore().byId("DateVoucher").setValue(fechaVaucher === "" ?  "" : fechaVaucher.substring(6,8) + "/" + fechaVaucher.substring(4,6)  + "/"+fechaVaucher.substring(0,4) );
                    sap.ui.getCore().byId("Cheque").setValue(SelectDetallePlanilla.nro_cheque);
                    sap.ui.getCore().byId("Operacion").setValue(SelectDetallePlanilla.nro_oper);
                    
                    // SelectDetallePlanilla.nombre_arch.split("\n");
                    // SelectDetallePlanilla.doc_adjunto.split("\n");
                    
                    // let contadorArchivo = SelectDetallePlanilla.nombre_arch.split("\\")[1]
                    // SelectDetallePlanilla.contadorArchivo = contadorArchivo ;
                    // SelectDetallePlanilla.nombre_arch= SelectDetallePlanilla.nombre_arch.replace("\\"+contadorArchivo ,"");
                    let DocArchivos = SelectDetallePlanilla.nombre_arch.split("\n").map(function(obj,index) {
                        let doc ={
                            Name :obj,
                            Uri  :SelectDetallePlanilla.doc_adjunto.split("\n")[index]
                        };
                        return doc;
                    });

                    Archivos.setProperty("/data",DocArchivos)

                    sap.ui.getCore().byId("ImportePagar").setEnabled(true);
                    sap.ui.getCore().byId("RegistrarPago").setVisible(false);
                    sap.ui.getCore().byId("ActualizarPago").setVisible(true);
                }

                if(Vizualizar){
                    sap.ui.getCore().byId("MedioPago").setEnabled(false)
                    sap.ui.getCore().byId("ImportePagar").setEnabled(false)
                    sap.ui.getCore().byId("Banco").setEnabled(false)
                    sap.ui.getCore().byId("CuentaBancaria").setEnabled(false)
                    sap.ui.getCore().byId("DateVoucher").setEnabled(false)
                    sap.ui.getCore().byId("Cheque").setEnabled(false)
                    sap.ui.getCore().byId("Operacion").setEnabled(false)
                    sap.ui.getCore().byId("RegistrarPago").setVisible(false)
                    sap.ui.getCore().byId("ActualizarPago").setVisible(false)

                }


            },

            onNavBack : function (){

                this.getRouter().navTo("RoutePlanillaView1");
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
                const that          = this ;	
                const oView			= this.getView(); 
                SelectDetallePlanilla = {};
                that.CleanDialog2Items();
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
                    Vizualizar = false
                    if (!this.RegistrarPago) {
                        that.RegistrarPago = sap.ui.xmlfragment("cobranza.view.TabletDialog1", that);
                            oView.addDependent(this.RegistrarPago);		
                        }
                        
                        // this.RegistrarPago._dialog.attachAfterOpen(function(oEvent){
                        //     let oInput 			= sap.ui.getCore().byId("ImpCobrado");	
                            // var oInput = this.getView().byId("inputid");
                            // oInput.attachBrowserEvent("keypress", function(evt, element) {
                            //     var charCode = (evt.which) ? evt.which : event.keyCode
                            //     if (charCode > 31 && (charCode < 48 || charCode > 57) && !(charCode == 46 || charCode == 8))
                            //         return false;
                            //     else {
                            //         var len = $(element).val().length;
                            //         var index = $(element).val().indexOf('.');
                            //         if (index > 0 && charCode == 46) {
                            //         return false;
                            //         }
                            //         if (index > 0) {
                            //         var CharAfterdot = (len + 1) - index;
                            //         if (CharAfterdot > 3) {
                            //             return false;
                            //         }
                            //         }

                            //     }
                            //     return true;
                            // });

                        // });

                        // this.RegistrarPago._oOkButton.attachBrowserEvent("click", function(evt, element) {
                        //         return ;
                        // });

                    this.RegistrarPago.open();



                // that.RegistrarPago.open();

            },
            handleConfirm : function (oEvent){
                const that = this ;	
                const oView				= this.getView(); 
                const DetallePlanilla = oView.getModel("DetallePlanilla");
                const Table = sap.ui.getCore().byId("TableDialogDoc");
                let  oItems = Table.getSelectedItems();    

                if(oItems === undefined || oItems.length === 0){
                    MessageBox.error("Debe seleccionar almenos un Documento");
                    return ;
                }

                let ValidErrors = false ;
                let Documentos = oItems.map(function(obj){
                    let Data = obj.getBindingContext("Reporte").getObject();
                    if(Data.impCobradoState === "Error" ){
                        ValidErrors = true
                    }

                    return Data;
                });

                if(ValidErrors){
                    // this.RegistrarPago.open();
                    MessageBox.error("El Importe a Pagar no debe excederse del Saldo");
                    return ;
                }

                DetallePlanilla.setProperty("/SelectTableDialogDocumentos",Documentos);
                Table.removeSelections()
                this.RegistrarPago.close();

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
                const Archivos          = oView.getModel("Archivos");
               

                const Banco         = oView.getModel("Banco");
                let data            = DetallePlanilla.getProperty("/SelectTableDialogDocumentos");
                
                const ListaArchivos = sap.ui.getCore().byId("ListArchivos").getVisible();
                const ImportePagar  = sap.ui.getCore().byId("ImportePagar").getValue();
                let dataMedioPago   = sap.ui.getCore().byId("MedioPago").getSelectedKey();
                let dataBanco       = sap.ui.getCore().byId("Banco").getSelectedKey();
                let dataCuenta      = sap.ui.getCore().byId("CuentaBancaria").getSelectedKey();
                const Operacion     = sap.ui.getCore().byId("Operacion").getValue();
                const Cheque        = sap.ui.getCore().byId("Cheque").getValue();
                
                const DateVoucher      = sap.ui.getCore().byId("DateVoucher").getValue();
                const DateVoucherFormat= DateVoucher.replaceAll("/","");
                const DateVoucherSAP   = DateVoucherFormat.substring(4,8)+DateVoucherFormat.substring(2,4)+DateVoucherFormat.substring(0,2);
                

                const UserLogin       = oView.getModel("UserLogin"); 
                const InfoUserLogin   = UserLogin.getProperty("/data"); 
                const CodVendedor     = InfoUserLogin["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes[0].value ;

                const ElementCobro  = Proyect.getProperty("/ElementCobro");
                const ElementOperacion  = Proyect.getProperty("/ElementOperacion");
                const ElementBanco  = Proyect.getProperty("/ElementBanco");
                const ElementCheque = Proyect.getProperty("/ElementCheque");

                const NroPlanilla   = DetallePlanilla.getProperty("/dataPrincipal/planilla")
                let FechaEmi        = DetallePlanilla.getProperty("/dataPrincipal/fecha_emi")
                let FechaEmiFormat  = FechaEmi.replaceAll("/","")
                let FechaEmiSAP     = FechaEmiFormat.substring(4,8)+FechaEmiFormat.substring(2,4)+FechaEmiFormat.substring(0,2)
                
              
                const InfoMediosPago = MedioPago.getProperty("/data");
                const DescMedioPago = InfoMediosPago.find(obj2=> obj2.via ===  dataMedioPago) ;
                
                 const dataArchivos      = Archivos.getProperty("/data");
                if(ListaArchivos && dataArchivos.length === 0){
                    MessageBox.error("Debe adjuntar almenos un Voucher");
                    return ;
                }
                // let oFileUploader		= oView.byId("UploadSetDocumentos");
                // let Documento			= await that.ImportarDoc(oFileUploader);
                let Documentos = data.map(function(obj){
                    let FechaVenFormat      = obj.fecha_ven.replaceAll("/","");
                    let FechaVenSAP         = FechaVenFormat.substring(4,8)+FechaVenFormat.substring(2,4)+FechaVenFormat.substring(0,2);
                    let infoDetallePlanilla = DetallePlanilla.getProperty("/data");
                    let ContadorDocRepetidos= infoDetallePlanilla.filter(obj1=> obj1.documento === obj.documento);


                    let Saldo = parseFloat(obj.total_fac) - parseFloat(obj.impCobrado) - parseFloat(obj.imp_ret)
                    let sendDocumento = {
                        "status"        :"V",
                        "planilla"      :NroPlanilla,
                        "cod_vendedor"  :CodVendedor,
                        "vendedor"      :"",
                        "canal"         :"",
                        "documento"     :obj.documento,
                        "pago_parcial"  :(ContadorDocRepetidos.length +1).toString() ,
                        "tipo_doc"      :obj.tipo_doc,
                        "cliente"       :obj.cliente,
                        "cod_cliente"   :obj.cod_cliente,
                        "moneda"        :obj.moneda,
                        "total_doc"     :obj.total_fac,
                        "importe_cobrado":(parseFloat(obj.impCobrado)).toFixed(2),
                        "saldo"         :Saldo.toFixed(2),
                        "fecha_emi"     :FechaEmiSAP,
                        "fecha_ven"     :FechaVenSAP,
                        "cond_pago"     :obj.cond_pago,
                        "medio_pago"    :DescMedioPago.text1,
                        "banco"         :ElementBanco ? dataBanco :"",
                        "cta_bancaria"  :ElementBanco ? dataCuenta:"",
                        "fecha_vouc"    :ElementCobro ? DateVoucherSAP:"",
                        "nro_oper"      :ElementOperacion ? Operacion:"",
                        "nro_cheque"    :ElementCheque ? Cheque:"",
                        "doc_adjunto"   :"",
                        "type"          :"",
                        "msg"           :""
                        }
                        return sendDocumento;
                });
                // let contador = 1 ;
                sap.ui.core.BusyIndicator.show(0);
                for (let items of dataArchivos) {
                    
                    for (let item2 of Documentos){

                        // item2.nombre_arch += contador.toString()+"\\" ;

                    // NroPlanilla+item2.documento+item2.pago_parcial+contador
                   let sendArchivo = {
                        "UNIQUE"    :  that.NumberAleatorio() ,
                        "NAME"      : items.Name.split(".")[0],
                        "EXTENSION" : items.Name.split(".")[1],
                        "FILE_LOB"  : "data:"+ items.Type + ";base64," +items.Base64 
                    }
                
                    await jQuery.ajax({
                        type: "POST",
                        url: "/uploadfile",
                        timeout: 0,
                        headers: {
                            "x-access-token": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImR",
                            "Content-Type": "application/json"
                        },async: true,
                        data:JSON.stringify(sendArchivo),
                        success: async function (data, textStatus, jqXHR) {
                            console.log(data);
                            // Documentos.map(function(obj){
                                if(item2.nombre_arch === undefined){

                                    item2.nombre_arch = sendArchivo.NAME + "." +sendArchivo.EXTENSION;
                                    item2.doc_adjunto   = data.url.replace("=","");
                                }else{
                                    item2.nombre_arch += "\n"+sendArchivo.NAME + "."+sendArchivo.EXTENSION;
                                    item2.doc_adjunto   += "\n"+data.url.replace("=","");
                                }
                            // });

                        },error: function () {
                            MessageBox.error("Ocurrio un error al obtener los datos");
                        }
                    });

                    }
                    // contador++;

                }
                
                // Documentos.map(function(obj){
                //     obj.nombre_arch+= "\\"+ contador ;
                // });

                const data1 =
                {
                    "update":"X",
                    "cod_vendedor":CodVendedor,
                    "planilla":NroPlanilla,
                    "status":"V",
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
                    
                    await $.ajax({
                            url: UriDomain,
                              type: "GET",
                              headers: {
                                  "x-CSRF-Token": "Fetch"
                              }
                          }).always(function (result, statusx, responsex) {
                              
                            token= responsex.getResponseHeader("x-csrf-token");
                    });	

                    // const 

                    // await jQuery.ajax({
                    //     type: "POST",
                    //     url: "https://ecomm.corporacionlife.com.pe/uploadfile",
                    //     headers: {
                    //         "Accept": "application/json",
                    //         "x-CSRF-Token":  "eyJhbGciOiJSUzI1NiIsImtpZCI6ImR",
                    //         "Content-Type":"application/json"
                    //     },
                    //     async: true,
                    //     data:JSON.stringify(data1),
                    //     success: async function (data, textStatus, jqXHR) {



                    //     }
                    //     });
                    
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
                        await that.ConsultaPlanilla(NroPlanilla);
                        // let DataDetallePlanillas = DetallePlanilla.getProperty("/data")
                        // const InfoMediosPago = MedioPago.getProperty("/data");

                        // Documentos.map(function(obj1){
                        //     const DescMedioPago = InfoMediosPago.find(obj2=> obj2.via ===  obj1.medio_pago) ;
                        //     obj1.medio_pago = DescMedioPago ? DescMedioPago.text1 : "";
                        //     obj1.fecha_ven  = obj1.fecha_ven.substring(6,8)+ "/" +obj1.fecha_ven.substring(4,6)  + "/"+obj1.fecha_ven.substring(0,4) 
                        //     });

                        // DataDetallePlanillas = DataDetallePlanillas.concat(Documentos);
                        // DetallePlanilla.setProperty("/data",DataDetallePlanillas)

                        // let ImporteTotalCobrado  = DataDetallePlanillas.map(obj => obj.importe_cobrado).reduce((acc, amount) => parseFloat(acc) + parseFloat(amount) );  
                        // DetallePlanilla.setProperty("/dataPrincipal/importe_cobrado",ImporteTotalCobrado)
                        that.CleanDialog2Items();
                        that.RegistrarPago333.close();

                        // sap.ui.core.BusyIndicator.hide();
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

            },

            CleanDialog2Items : function (){

                const that              = this ;	
                const oView				= this.getView(); 
                const Reporte           = oView.getModel("Reporte");
                var Proyect             = oView.getModel("Proyect");
                let data                = Reporte.getProperty("/data");
                

                data.map(function(obj){
                    obj.impCobrado='';
                });

                Reporte.setProperty("/data ",data)

                sap.ui.getCore().byId("Operacion").setValue("");
                sap.ui.getCore().byId("Cheque").setValue("");
                sap.ui.getCore().byId("DateVoucher").setValue("");
        
                sap.ui.getCore().byId("Banco").setValue("");
                sap.ui.getCore().byId("CuentaBancaria").setValue("");
                sap.ui.getCore().byId("MedioPago").setValue("");
        
                sap.ui.getCore().byId("Banco").setSelectedKey("");
                sap.ui.getCore().byId("CuentaBancaria").setSelectedKey("");
                sap.ui.getCore().byId("MedioPago").setSelectedKey("");

                Proyect.setProperty("/ElementCobro",false);

                Proyect.setProperty("/ElementOperacion",false);
                Proyect.setProperty("/ElementBanco",false);
                Proyect.setProperty("/ElementCheque",false);
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
            selectMedPago : function (){
                const that = this ;	
                const oView				= this.getView(); 
                // const Source = oEvent.getSource()
                var Proyect = oView.getModel("Proyect");    
                // const key = Source.getSelectedKey()

                let key        = sap.ui.getCore().byId("MedioPago").getSelectedKey();
                if (key === "R" || key === "P"){
                
                Proyect.setProperty("/ElementCobro",true);
                Proyect.setProperty("/ElementOperacion",true);
                Proyect.setProperty("/ElementBanco",true);
                Proyect.setProperty("/ElementCheque",false);
                
                sap.ui.getCore().byId("Banco").setSelectedKey("")
                sap.ui.getCore().byId("Banco").setValue("")
                sap.ui.getCore().byId("CuentaBancaria").setSelectedKey("")
                sap.ui.getCore().byId("CuentaBancaria").setValue("")
                if(key === "P"){
                    sap.ui.getCore().byId("Banco").setSelectedKey("BCP PEN")
                    that.selectBanco();
                    sap.ui.getCore().byId("CuentaBancaria").setSelectedKey("1941573143032")
                }

                }
                else if (key === "H"){
                Proyect.setProperty("/ElementCobro",false);
                Proyect.setProperty("/ElementOperacion",false);
                Proyect.setProperty("/ElementBanco",false);
                Proyect.setProperty("/ElementCheque",false);
                }
                else{
                Proyect.setProperty("/ElementCobro",true);
                Proyect.setProperty("/ElementOperacion",false);
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
            sap.ui.getCore().byId("CuentaBancaria").setSelectedKey("");

            },
            UploadFinish : function (oEvent){

                oEvent.mParameters.item.setVisibleEdit(false);
            },
            handleClose : function(){
                const that              = this ;	
                const oView				= this.getView(); 
                const Reporte           = oView.getModel("Reporte");
                const data              = Reporte.getProperty("/data");
                const Table             = sap.ui.getCore().byId("TableDialogDoc");

                data.map(function(obj){
                    obj.impCobrado='';
                    obj.impCobradoState="None";
                });
                Table.removeSelections()
                this.RegistrarPago.close();

                Reporte.setProperty("/data ",data)      
            },
            OnPressCerarPlanilla :async  function (){

                const that              = this ;	
                const oView				= this.getView(); 
                const Proyect           = oView.getModel("Proyect");    
                const DetallePlanilla   = oView.getModel("DetallePlanilla");
                const NroPlanilla       = DetallePlanilla.getProperty("/dataPrincipal/planilla")
                const UserLogin         = oView.getModel("UserLogin"); 
                const InfoUserLogin     = UserLogin.getProperty("/data"); 
                const CodVendedor       = InfoUserLogin["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes[0].value ;
                let token               = '';
                const dataDetallePlanilla      = DetallePlanilla.getProperty("/data")

                if(dataDetallePlanilla.length === 0){
                    MessageBox.error("Debe registrar almenos un Pago");
                    return ;
                }

                MessageBox.warning("¿Esta seguro que desea cerrar la Planilla?", {
                    actions: ["Si","No"],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: async function (sAction) {

                        if(sAction=== "Si"){
                        const data =
                                        {
                                            "update":"X",
                                            "cod_vendedor":CodVendedor,
                                            "planilla":NroPlanilla,
                                            "status":"C",
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
                                            data:JSON.stringify(data),
                                            success: async function (data, textStatus, jqXHR) {
                                                
                                                // let DataDetallePlanillas = DetallePlanilla.getProperty("/data")
                                                // DataDetallePlanillas = DataDetallePlanillas.concat(Documentos);
                                                // DetallePlanilla.setProperty("/data",DataDetallePlanillas)
                        
                        
                                                // let ImporteTotal=0;
                                                // DataDetallePlanillas.map(function(obj){
                                                //   ImporteTotal +=parseFloat(obj.importe_cobrado)
                                                // });
                                                // oView.byId("NuevoPago").setEnabled(false);
                                                DetallePlanilla.setProperty("/dataPrincipal/status","Cerrado");
                                                
                                                sap.ui.core.BusyIndicator.hide();
                                                    MessageBox.success("Se Actualizó existosamente", {
                                                    actions: [MessageBox.Action.OK],
                                                    emphasizedAction: MessageBox.Action.OK,
                                                    onClose: function (sAction) {

                                                        // that.oRouter.navTo("RoutePlanillaView2");
                                                    }
                                                });	
                                  
                                                
                            
                                            },
                                            error: function () {
                                                MessageBox.error("Ocurrio un error al obtener los datos de infoaprobador");
                                            }
                                            });

                        }
                        
                    }
                });	

            },
            onPressModificar : function (oEvent){
                const that              = this ;	
                const oView             = this.getView(); 
                // const DetallePlanilla   = oView.getModel("DetallePlanilla");                
                let DetallePlanilla	    = oEvent.getSource().getBindingContext("DetallePlanilla").getObject();	
                Vizualizar = false
                SelectDetallePlanilla = JSON.parse(JSON.stringify(DetallePlanilla));
                if (!that.RegistrarPago333) {
                    that.RegistrarPago333 = sap.ui.xmlfragment("cobranza.view.Dialog2", that);
                    oView.addDependent(that.RegistrarPago333);
                    }
                    that.RegistrarPago333.open();
            },
            onPressActualizarPago : async function (){
            const that          = this ;	
            const oView		    = this.getView(); 
            const Proyect           = oView.getModel("Proyect");    
            const DetallePlanilla   = oView.getModel("DetallePlanilla");
            const MedioPago         = oView.getModel("MedioPago");

            const ImportePagar  = sap.ui.getCore().byId("ImportePagar").getValue();
            let dataMedioPago   = sap.ui.getCore().byId("MedioPago").getSelectedKey();
            let dataBanco       = sap.ui.getCore().byId("Banco").getSelectedKey();
            let dataCuenta      = sap.ui.getCore().byId("CuentaBancaria").getSelectedKey();
            const Operacion     = sap.ui.getCore().byId("Operacion").getValue();
            const Cheque        = sap.ui.getCore().byId("Cheque").getValue();
                
            const DateVoucher      = sap.ui.getCore().byId("DateVoucher").getValue();
            const DateVoucherFormat= DateVoucher.replaceAll("/","");
            const DateVoucherSAP   = DateVoucherFormat.substring(4,8)+DateVoucherFormat.substring(2,4)+DateVoucherFormat.substring(0,2);
                

            const UserLogin       = oView.getModel("UserLogin"); 
            const InfoUserLogin   = UserLogin.getProperty("/data"); 
            const CodVendedor     = InfoUserLogin["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes[0].value ;

            const ElementCobro  = Proyect.getProperty("/ElementCobro");
            const ElementOperacion  = Proyect.getProperty("/ElementOperacion");
            const ElementBanco  = Proyect.getProperty("/ElementBanco");
            const ElementCheque = Proyect.getProperty("/ElementCheque");

            

            const NroPlanilla   = DetallePlanilla.getProperty("/dataPrincipal/planilla")
            let FechaEmi        = DetallePlanilla.getProperty("/dataPrincipal/fecha_emi")
            let FechaEmiFormat  = FechaEmi.replaceAll("/","")
            let FechaEmiSAP     = FechaEmiFormat.substring(4,8)+FechaEmiFormat.substring(2,4)+FechaEmiFormat.substring(0,2)
            
            let FechaVenFormat      = SelectDetallePlanilla.fecha_ven.replaceAll("/","");
            let FechaVenSAP         = FechaVenFormat.substring(4,8)+FechaVenFormat.substring(2,4)+FechaVenFormat.substring(0,2);

            const InfoMediosPago = MedioPago.getProperty("/data");
            const DescMedioPago = InfoMediosPago.find(obj2=> obj2.via ===  dataMedioPago) ;

          

                const Archivos          = oView.getModel("Archivos");
                const dataArchivos      = Archivos.getProperty("/data");
                const ListaArchivos = sap.ui.getCore().byId("ListArchivos").getVisible();
                if(ListaArchivos && dataArchivos.length === 0){
                    MessageBox.error("Debe adjuntar almenos un Voucher");
                    return ;
                }
                // let contador = 1
                for (let items of dataArchivos) {
                    
                    if(items.Base64 === undefined ){
                        continue;
                        // return ;
                    }
                    // SelectDetallePlanilla.planilla +SelectDetallePlanilla.documento + (parseFloat(SelectDetallePlanilla.pago_parcial)).toString() + SelectDetallePlanilla.contadorArchivo,
                   let sendArchivo = {
                        "UNIQUE"    : that.NumberAleatorio() ,
                        "NAME"      : items.Name.split(".")[0],
                        "EXTENSION" : items.Name.split(".")[1],
                        "FILE_LOB"  : "data:"+ items.Type + ";base64," +items.Base64 
                    }
                
                    await jQuery.ajax({
                        type: "POST",
                        url: "/uploadfile",
                        timeout: 0,
                        headers: {
                            "x-access-token": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImR",
                            "Content-Type": "application/json"
                        },async: true,
                        data:JSON.stringify(sendArchivo),
                        success: async function (data, textStatus, jqXHR) {
                            console.log(data);
                            // Documentos.map(function(obj){
                                if(SelectDetallePlanilla.nombre_arch === undefined){

                                    SelectDetallePlanilla.nombre_arch = sendArchivo.NAME + "." +sendArchivo.EXTENSION;
                                    SelectDetallePlanilla.doc_adjunto = data.url.replace("=","");

                                }else{

                                    SelectDetallePlanilla.nombre_arch += "\n"+sendArchivo.NAME + "."+sendArchivo.EXTENSION;
                                    SelectDetallePlanilla.doc_adjunto += "\n"+data.url.replace("=","");
                                }
                            // });

                        },error: function () {
                            MessageBox.error("Ocurrio un error al obtener los datos");
                        }
                    });
                    // SelectDetallePlanilla.contadorArchivo = SelectDetallePlanilla.contadorArchivo++ ;
                    // contador++;


                }

                  const data1 =
                {
                    "update":"X",
                    "cod_vendedor":CodVendedor,
                    "planilla":NroPlanilla,
                    "status":"V",
                    "DetallePlanillaSet":
                    [{
                        "status"        :"V",
                        "planilla"      :NroPlanilla,
                        "cod_vendedor"  :CodVendedor,
                        "vendedor"      :"",
                        "canal"         :"",
                        "documento"     :SelectDetallePlanilla.documento,
                        "pago_parcial"  :(parseFloat(SelectDetallePlanilla.pago_parcial)).toString() ,
                        "tipo_doc"      :SelectDetallePlanilla.tipo_doc,
                        "cliente"       :SelectDetallePlanilla.cliente,
                        "cod_cliente"   :SelectDetallePlanilla.cod_cliente,
                        "moneda"        :SelectDetallePlanilla.moneda,
                        "total_doc"     :(parseFloat(SelectDetallePlanilla.total_doc)).toFixed(2),
                        "importe_cobrado":(parseFloat(ImportePagar)).toFixed(2),
                        "saldo"         :(parseFloat(ImportePagar)).toFixed(2),
                        "fecha_emi"     :FechaEmiSAP,
                        "fecha_ven"     :FechaVenSAP,
                        "cond_pago"     :SelectDetallePlanilla.cond_pago,
                        "medio_pago"    :DescMedioPago.text1,
                        "banco"         :ElementBanco ? dataBanco :"",
                        "cta_bancaria"  :ElementBanco ? dataCuenta:"",
                        "fecha_vouc"    :ElementCobro ? DateVoucherSAP:"",
                        "nro_oper"      :ElementOperacion ? Operacion:"",
                        "nro_cheque"    :ElementCheque ? Cheque:"",
                        "doc_adjunto"   :SelectDetallePlanilla.doc_adjunto,
                        "nombre_arch"   :SelectDetallePlanilla.nombre_arch,
                        "type"          :"",
                        "msg"           :""
                    }], 
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
                        await that.ConsultaPlanilla(NroPlanilla);
                        that.CleanDialog2Items();
                        
                        that.RegistrarPago333.close();

                        // sap.ui.core.BusyIndicator.hide();
                        MessageBox.success("Se actualizó existosamente", {
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


            },
            onPressEliminar: async function (oEvent){
                const that              = this ;	
                const oView             = this.getView(); 
                // const DetallePlanilla   = oView.getModel("DetallePlanilla");                
                const ModelDetallePlanilla   = oView.getModel("DetallePlanilla");
                const NroPlanilla   = ModelDetallePlanilla.getProperty("/dataPrincipal/planilla")
                let DetallePlanilla	    = oEvent.getSource().getBindingContext("DetallePlanilla").getObject();	
                const UserLogin       = oView.getModel("UserLogin"); 
                const InfoUserLogin   = UserLogin.getProperty("/data"); 
                const CodVendedor     = InfoUserLogin["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes[0].value ;

                
                const data =
                {
                    "delete":"X",
                    "cod_vendedor":CodVendedor,
                    "planilla":NroPlanilla,
                    "DetallePlanillaSet":[
                    {
                    "status"        :"",
                    "planilla"      :"",
                    "cod_vendedor"  :"",
                    "vendedor"      :"",
                    "canal"         :"",
                    "documento"     :DetallePlanilla.documento,
                    "tipo_doc"      :"",
                    "cliente"       :"",
                    "cod_cliente"   :"",
                    "moneda"        :"",
                    "total_doc"     :"",
                    "importe_cobrado":"",
                    "pago_parcial"  :DetallePlanilla.pago_parcial,
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
                data:JSON.stringify(data),
				success: async function (data, textStatus, jqXHR) {
                    await that.ConsultaPlanilla(NroPlanilla);
                    MessageBox.success("Se eliminó la Planilla con éxito");
                },
                error: function () {
                    MessageBox.error("Ocurrio un error al obtener los datos");
                }
                })

            },
            OnPressHeader: function(oEvent){
                const that              = this ;	
                const oView             = this.getView(); 
                // const DetallePlanilla   = oView.getModel("DetallePlanilla");                
                let DetallePlanilla	    = oEvent.getSource().getBindingContext("DetallePlanilla").getObject();	
                Vizualizar = true;
                SelectDetallePlanilla = DetallePlanilla;
                if (!that.RegistrarPago333) {
                    that.RegistrarPago333 = sap.ui.xmlfragment("cobranza.view.Dialog2", that);
                    oView.addDependent(that.RegistrarPago333);
                    }
                    that.RegistrarPago333.open();


            },
            isNumberKey: function(oEvent){
            var Number = oEvent.getSource().getValue();
            //para Letras caracteres etc
            let a = Number.replace(/[^\d.]+/g, '');
            let b = a.split(".")
            let b1 = a
            if(b.length > 1 ){
                b1 = b[0] +"."+b[1];
            }    
            ///decimales a 2
            // let c = b1.replace(/^(\d+,?\d{0,2})\d*$/, "$1");
            // let c = b.replace(/(\.)+/g, '.');
            let c = b1.replace(/(?<=\.[0-9]{2}).+/g, "");
            oEvent.getSource().setValue(c);
            let Documentos = oEvent.getSource().getBindingContext("Reporte").getObject();	

            if( parseFloat(Documentos.saldo_pagar) <  parseFloat(Documentos.impCobrado) ){
                Documentos.impCobradoStateText = "No debe excederse al Saldo";
                Documentos.impCobradoState     = "Error" ;
            }else {
                Documentos.impCobradoState = "None";
            }
            

            },
            selectionChangedDocumentos : function(){


            },

            handleUploadAdjuntos: async function (oEvent) {
                var oView				= this.getView();
                var Archivos		    = oView.getModel("Archivos");
                let DataArchivos        = Archivos.getProperty("/data");
                var oFileUploader		= sap.ui.getCore().byId("UploadSetDocumentos");
                var Documento			= await this.ImportarDoc(oFileUploader);

                DataArchivos.push(Documento);
                Archivos.refresh(true);

            },
            
            ImportarDoc: async function (oFileUploader) {
                var file = jQuery.sap.domById(oFileUploader.getId() + "-fu").files[0];
                var base64_marker = "data:" + file.type + ";base64,";
                debugger;
                return new Promise((resolve, reject) => {
                    var Document;
                    var reader = new FileReader();
                    reader.onload = async function (evt) {
    
                        try {
                            var base64Index = base64_marker.length;
                            var base64 = evt.target.result.substring(base64Index);
                            // .substring(base64Index);
    
                            Document = {
                                "Type": file.type,
                                "Name": file.name,
                                "File": file,
                                "Base64": base64,
                                "Result": reader.result
                            };
    
                            resolve(Document);
    
                        } catch (err) {
    
                            reject(err);
    
                        }
                    }
    
                    reader.readAsDataURL(file);
    
                });
    
            },

            onPressDescargar : function (oEvent){
            var that = this;
			var oView = this.getView();
			var oBindingContext = oEvent.getSource().getBindingContext("Archivos");
			var sPath = oBindingContext.getPath();
			var model = oBindingContext.getModel();
			//get the selected  data from the model 
			var data = model.getProperty(sPath);
            if (data.Base64 !== undefined && data.Base64 !== "") {
                let NombreArchivo = data.Name;
				let Base64 = data.Base64;
				const typeFile = "data:" + data.Type.toLowerCase() + ";base64,"
				const downloadLink = document.createElement("a");
				const fileName = NombreArchivo;

                // document.body.appendChild(image);
				downloadLink.href = typeFile + Base64;
				downloadLink.download = fileName;
				downloadLink.click();
                // window.open(data.Result)

            }else {
                window.open(data.Uri.replace("=","") , "_blank");
            }

            },

            deleteListArchivos : function (oEvent){
            var that = this;
			var oView = this.getView();

            var oView = this.getView();
			var ModelProyect = oView.getModel("Archivos");
			var deleteRecord = oEvent.getParameters().listItem.getBindingContext("Archivos").getPath();
			var data = ModelProyect.getProperty(deleteRecord);

			// var oBindingContext = oEvent.getSource().getBindingContext("Archivos");
			// var sPath = oBindingContext.getPath();
			// var model = oBindingContext.getModel();
            // var data = model.getProperty(sPath);
            const Archivos          = oView.getModel("Archivos");
            const dataArchivos      = Archivos.getProperty("/data");

                if(data.Base64 === undefined){

                    if( SelectDetallePlanilla.nombre_arch.includes( "\n"+data.Name ) ){
                        SelectDetallePlanilla.nombre_arch = SelectDetallePlanilla.nombre_arch.replace( "\n"+data.Name ,"" )

                    }else {
                        SelectDetallePlanilla.nombre_arch=SelectDetallePlanilla.nombre_arch.replace( data.Name+"\n" ,"" )
                    }

                    if( SelectDetallePlanilla.doc_adjunto.includes( "\n"+data.Uri ) ){
                        SelectDetallePlanilla.doc_adjunto=SelectDetallePlanilla.doc_adjunto.replace( "\n"+data.Uri ,"" )
                     }else {
                        SelectDetallePlanilla.doc_adjunto=SelectDetallePlanilla.doc_adjunto.replace( data.Uri+"\n" ,"" )
                    } 
                    // SelectDetallePlanilla.doc_adjunto
                    // SelectDetallePlanilla.doc_adjunto
                    // data.Uri

                }

                    let Index  = dataArchivos.findIndex(obj=> obj.Uri === data.Uri)
                    dataArchivos.splice(Index, 1);
                    Archivos.refresh(true);
            }, 
            NumberAleatorio : function (){
                
                return (Math.floor(Math.random()*999999999999999999999)).toString() + (Math.floor(Math.random()*999999999999999999999)).toString() +(Math.floor(Math.random()*999999999999999999999)).toString() ;
            },
            onSearchDocumentos : function(oEvent){
            const that            = this ;	
            const oView		      = this.getView(); 
            let Search            = oEvent.getSource().getValue();

            var aFilter           =   new sap.ui.model.Filter( "planilla", sap.ui.model.FilterOperator.Contains, Search) ;
            var aFilter           =   new sap.ui.model.Filter( "planilla", sap.ui.model.FilterOperator.Contains, Search) ;
            var aFilter           =   new sap.ui.model.Filter( "planilla", sap.ui.model.FilterOperator.Contains, Search) ;


            oView.byId("TableDialogDoc").getBinding("items").filter([aFilter]);
            

            }

            // let DocArchivos = SelectDetallePlanilla.nombre_arch.split("\n").map(function(obj,index) {
            //     let doc ={
            //         Name :obj,
            //         Uri  :SelectDetallePlanilla.doc_adjunto.split("\n")[index]
            //     };
            //     return doc;
            // });

            // Archivos.setProperty("/data",DocArchivos)
            // SelectDetallePlanilla.


            

        });
    });
