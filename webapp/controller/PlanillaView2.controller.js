sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "cobranza/controller/BaseController",
    "sap/m/MessageBox",
	"sap/ui/model/ValidateException",
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, BaseController, MessageBox) {
        "use strict";
        // let UriDomain               = "/sap/opu/odata/sap/ZOSFI_GW_TOMA_PEDIDO_SRV/"
        let hostname = location.hostname;
        let SelectDetallePlanilla = {};
        let Vizualizar = false;


        return BaseController.extend("cobranza.controller.PlanillaView2", {
            onInit: function () {
            },
            onAfterRendering: function () {
                const that = this;
                const oView = this.getView();
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);

                var Global = oView.getModel("Global");
                let contador = Global.getProperty("/ContView1");
                let cont = Global.getProperty("/ContView2");

                if(cont === 0){
                    oRouter.getRoute("RoutePlanillaView2").attachPatternMatched(that.RefreshAutomatico, that);
                    Global.setProperty("/ContView2",1);
                }

                
                var Proyect = oView.getModel("Proyect");
                Proyect.setProperty("/ElementCobro", false);
                Proyect.setProperty("/ElementBanco", false);
                Proyect.setProperty("/ElementCheque", false);
                Proyect.setProperty("/ElementOperacion", false);
            },
            beforeOpenDialog2: function () {
                const that = this;
                const oView = this.getView();
                const DetallePlanilla = oView.getModel("DetallePlanilla");
                const date = sap.ui.getCore().byId("DateVoucher");
                date.setMaxDate( new Date() );
                date.addDelegate(
                    {
                        onAfterRendering: function () {
                            date.$().find('INPUT').attr('disabled', true).css('color', '#ccc');
                        }
                    }, date );
                if (Object.keys(SelectDetallePlanilla).length === 0) {
                    const Documentos = DetallePlanilla.getProperty("/SelectTableDialogDocumentos");
                    let ImpPagar = Documentos.map(obj => obj.impCobrado).reduce((acc, amount) => parseFloat(acc === '' || acc === undefined ? 0 : acc) + parseFloat(amount === '' || amount === undefined ? 0 : amount));
                    sap.ui.getCore().byId("ImportePagar").setValue( parseFloat(ImpPagar).toFixed(2) );
                }

                const Proyect = oView.getModel("Proyect");
                let idRefreshAuto = Proyect.getProperty("/idRefreshAuto");
                if (idRefreshAuto !== undefined) {
                    clearInterval(idRefreshAuto)
                }
            },
            afterOpenDialog2: async function () {
                const that = this;
                const oView = this.getView();
                const DetallePlanilla = oView.getModel("DetallePlanilla");
                const date = sap.ui.getCore().byId("DateVoucher");
                const MedioPago = oView.getModel("MedioPago");
                const Archivos = oView.getModel("Archivos");
                const dataMedioPago = MedioPago.getProperty("/data");
                sap.ui.getCore().byId("MedioPago").setEnabled(true)
                sap.ui.getCore().byId("ImportePagar").setEnabled(false)
                sap.ui.getCore().byId("Banco").setEnabled(true)
                sap.ui.getCore().byId("CuentaBancaria").setEnabled(true)
                sap.ui.getCore().byId("DateVoucher").setEnabled(true)
                sap.ui.getCore().byId("Cheque").setEnabled(true)
                sap.ui.getCore().byId("Operacion").setEnabled(true)
                sap.ui.getCore().byId("RegistrarPago").setVisible(true)
                sap.ui.getCore().byId("ActualizarPago").setVisible(false)

                if (Object.keys(SelectDetallePlanilla).length !== 0) {
                    let MP = dataMedioPago.filter(obj => obj.text1 === SelectDetallePlanilla.medio_pago);
                    sap.ui.getCore().byId("MedioPago").setSelectedKey(MP[0].via);
                    that.selectMedPago();
                    sap.ui.getCore().byId("ImportePagar").setValue((parseFloat(SelectDetallePlanilla.importe_cobrado)).toFixed(2));
                    sap.ui.getCore().byId("Banco").setSelectedKey(SelectDetallePlanilla.banco);
                    that.selectBanco();
                    sap.ui.getCore().byId("CuentaBancaria").setSelectedKey(SelectDetallePlanilla.cta_bancaria);
                    let fechaVaucher = SelectDetallePlanilla.fecha_vouc;
                    sap.ui.getCore().byId("DateVoucher").setValue(fechaVaucher === "" ? "" : fechaVaucher.substring(6, 8) + "/" + fechaVaucher.substring(4, 6) + "/" + fechaVaucher.substring(0, 4));
                    sap.ui.getCore().byId("Cheque").setValue(SelectDetallePlanilla.nro_cheque);
                    sap.ui.getCore().byId("Operacion").setValue(SelectDetallePlanilla.nro_oper);
                    sap.ui.getCore().byId("ImportePagar").setEnabled(false);
                    sap.ui.getCore().byId("RegistrarPago").setVisible(false);
                    sap.ui.getCore().byId("ActualizarPago").setVisible(true);
                    await that.consultaArchivos(SelectDetallePlanilla);
                }

                if (Vizualizar) {
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

            onNavBack: function () {
                this.getRouter().navTo("RoutePlanillaView1");
            },

            RegistrarDeposito: function () {
                const that = this;
                const oView = this.getView();
                if (!that.RegistrarDeposito12) {
                    that.RegistrarDeposito12 = sap.ui.xmlfragment("cobranza.view.Dialog1", that);
                    oView.addDependent(that.RegistrarDeposito12);
                }
                that.RegistrarDeposito12.open();

            },
            onClosed: function () {
                const that = this;
                const oView = this.getView();
                that.RegistrarDeposito12.close();
            },
            onClosedPago: function () {
                const that = this;
                const oView = this.getView();
                const DetallePlanilla = oView.getModel("DetallePlanilla");
                const NroPlanilla = DetallePlanilla.getProperty("/dataPrincipal/planilla")
                SelectDetallePlanilla = {};
                that.CleanDialog2Items();
                that.RefreshAutomatico(undefined);
                that.RegistrarPago333.close();
            },

            Nuevopago: function () {
                const that = this;
                const oView = this.getView();
                Vizualizar = false
                if (!this.RegistrarPago) {
                    that.RegistrarPago = sap.ui.xmlfragment("cobranza.view.TabletDialog1", that);
                    oView.addDependent(this.RegistrarPago);
                }
                const Proyect = oView.getModel("Proyect");
                let idRefreshAuto = Proyect.getProperty("/idRefreshAuto");
                if (idRefreshAuto !== undefined) {
                    clearInterval(idRefreshAuto)
                }
                this.RegistrarPago.open();

            },
            handleConfirm: function (oEvent) {
                const that = this;
                const oView = this.getView();
                const DetallePlanilla = oView.getModel("DetallePlanilla");
                const Reporte = oView.getModel("Reporte");
                const Table = sap.ui.getCore().byId("TableDialogDoc");
                let oItems = Table.getSelectedContextPaths(); 
                // getSelectedItems();

                if (oItems === undefined || oItems.length === 0) {
                    MessageBox.error("Debe seleccionar almenos un Documento");
                    return;
                }

                let ValidErrors = false;
                let Documentos = oItems.map(function (obj) {
                    // let Data = obj.getBindingContext("Reporte").getObject();
                    let Data = Reporte.getProperty(obj);
                    if (Data.impCobradoState === "Error") {
                        ValidErrors = true
                    }

                    return Data;
                });

                if (ValidErrors) {
                    // this.RegistrarPago.open();
                    MessageBox.error("El Importe a Pagar no debe excederse del Saldo");
                    return;
                }
                DetallePlanilla.setProperty("/SelectTableDialogDocumentos", Documentos);
                sap.ui.getCore().byId("SearchFieldReporteDoc").setValue("");
                sap.ui.getCore().byId("TableDialogDoc").getBinding("items").filter([]);
                Table.removeSelections(true)
                this.RegistrarPago.close();

                if (!that.RegistrarPago333) {
                    that.RegistrarPago333 = sap.ui.xmlfragment("cobranza.view.Dialog2", that);
                    oView.addDependent(that.RegistrarPago333);
                }
                that.RegistrarPago333.open();

            },
            RegistrarPago1: async function () {
                const that = this;
                const oView = this.getView();
                const Proyect = oView.getModel("Proyect");
                const DetallePlanilla = oView.getModel("DetallePlanilla");
                const Planilla = oView.getModel("Planilla");
                const MedioPago = oView.getModel("MedioPago");
                const Cuenta = oView.getModel("Cuenta");
                const Archivos = oView.getModel("Archivos");
                const Banco = oView.getModel("Banco");
                let data = DetallePlanilla.getProperty("/SelectTableDialogDocumentos");
                const ListaArchivos = sap.ui.getCore().byId("ListArchivos").getVisible();

                //formulario Dialog2
                const ImportePagar = sap.ui.getCore().byId("ImportePagar").getValue();
                let dataMedioPago = sap.ui.getCore().byId("MedioPago").getSelectedKey();
                let dataBanco = sap.ui.getCore().byId("Banco").getSelectedKey();
                let dataCuenta = sap.ui.getCore().byId("CuentaBancaria").getSelectedKey();
                const Operacion = sap.ui.getCore().byId("Operacion").getValue();
                const Cheque = sap.ui.getCore().byId("Cheque").getValue();
                const DateVoucher = sap.ui.getCore().byId("DateVoucher").getValue();
                const DateVoucherFormat = DateVoucher.replaceAll("/", "");
                const DateVoucherSAP = DateVoucherFormat.substring(4, 8) + DateVoucherFormat.substring(2, 4) + DateVoucherFormat.substring(0, 2);
                //formulario Dialog2
                if(that.validarCampoVacios()){
                    MessageBox.error("Complete los campos correctamente");
                    return;
                }

                const UserLogin = oView.getModel("UserLogin");
                const InfoUserLogin = UserLogin.getProperty("/data");
                const CodVendedor = InfoUserLogin["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes[0].value;
                const ElementCobro = Proyect.getProperty("/ElementCobro");
                const ElementOperacion = Proyect.getProperty("/ElementOperacion");
                const ElementBanco = Proyect.getProperty("/ElementBanco");
                const ElementCheque = Proyect.getProperty("/ElementCheque");
                const NroPlanilla = DetallePlanilla.getProperty("/dataPrincipal/planilla")
                let FechaEmi = DetallePlanilla.getProperty("/dataPrincipal/fecha_emi")
                let FechaEmiFormat = FechaEmi.replaceAll("/", "")
                let FechaEmiSAP = FechaEmiFormat.substring(4, 8) + FechaEmiFormat.substring(2, 4) + FechaEmiFormat.substring(0, 2)
                const InfoMediosPago = MedioPago.getProperty("/data");
                const DescMedioPago = InfoMediosPago.find(obj2 => obj2.via === dataMedioPago);
                const dataArchivos = Archivos.getProperty("/data");

                if (ListaArchivos && dataArchivos.length === 0) {
                    MessageBox.error("Debe adjuntar almenos un Voucher");
                    return;
                }
                // let oFileUploader		= oView.byId("UploadSetDocumentos");
                // let Documento			= await that.ImportarDoc(oFileUploader);
                let Documentos = data.map(function (obj) {
                    let FechaVenFormat = obj.fecha_ven.replaceAll("/", "");
                    let FechaVenSAP = FechaVenFormat.substring(4, 8) + FechaVenFormat.substring(2, 4) + FechaVenFormat.substring(0, 2);
                    let infoDetallePlanilla = Planilla.getProperty("/data");
                    // let ContadorDocRepetidos = 
                    let contadorDoc = 0 ;
                    infoDetallePlanilla.map(function(obj2){
                    let A =     obj2.DetallePlanilla.filter(obj1 => obj1.documento === obj.documento);
                    contadorDoc = contadorDoc+ A.length ;
                    });
                    // let Imp_ret = (contadorDoc+1)  === 1 ?   parseFloat(obj.imp_ret)  : 0.00   ;
                    let Saldo = parseFloat(obj.saldo_pagar) - parseFloat(obj.impCobrado) 
                    let sendDocumento = {
                        "status": "V",
                        "planilla": NroPlanilla,
                        "cod_vendedor": CodVendedor,
                        "vendedor": "",
                        "canal": "",
                        "documento": obj.documento,
                        "pago_parcial": (contadorDoc + 1).toString(),
                        "tipo_doc": obj.tipo_doc,
                        "cliente": obj.cliente,
                        "cod_cliente": obj.cod_cliente,
                        "moneda": obj.moneda,
                        "total_doc": obj.total_fac,
                        "importe_cobrado": (parseFloat(obj.impCobrado)).toFixed(2),
                        "saldo": Saldo.toFixed(2),
                        "fecha_emi": FechaEmiSAP,
                        "fecha_ven": FechaVenSAP,
                        "cond_pago": obj.cond_pago,
                        "medio_pago": DescMedioPago.text1,
                        "banco": ElementBanco ? dataBanco : "",
                        "cta_bancaria": ElementBanco ? dataCuenta : "",
                        "fecha_vouc": ElementCobro ? DateVoucherSAP : FechaEmiSAP,
                        "nro_oper": ElementOperacion ? Operacion : "",
                        "nro_cheque": ElementCheque ? Cheque : "",
                        "doc_adjunto": "",
                        "type": "",
                        "msg": ""
                    }
                    return sendDocumento;
                });
                // let contador = 1 ;
                sap.ui.core.BusyIndicator.show(0);
                // const Proyect       = oView.getModel("Proyect"); 
                // let idRefreshAuto = Proyect.getProperty("/idRefreshAuto");
                // clearInterval(idRefreshAuto)
                // for (let items of dataArchivos) {


                    // for (let item2 of Documentos) {

                        // item2.nombre_arch += contador.toString()+"\\" ;
                        // NroPlanilla+item2.documento+item2.pago_parcial+contador
                if(dataMedioPago !== "H"){
                        let sendArchivo = {
                            "CO_FACTURA":  (Documentos.map(obj=> obj.documento)).join("$")  ,
                            "CO_PLANILLA": (Documentos.map(obj=> that.getClient()+ obj.planilla)).join("$"),
                            "STATUS": "1",
                            "UNIQUE": (Documentos.map(obj=> obj.pago_parcial)).join("$"),
                            "NAME": (Documentos.map(obj=>  dataArchivos[0].Name.split(".")[0] )).join("$") ,
                            "EXTENSION": (Documentos.map(obj=>  dataArchivos[0].Name.split(".")[1] )).join("$"),
                            "CONTADOR": Documentos.length+"",
                            "FILE_LOB": dataArchivos[0].Base64
                        }
                       
                    // }
                    // contador++;
                // }
                
                // Documentos.map(function(obj){
                //     obj.nombre_arch+= "\\"+ contador ;
                // });
                await jQuery.ajax({
                            type: "POST",
                            url: hostname.includes("port") ? "/uploadfile" : that.GetUriBase("/Documents/uploadfile"),
                            headers: {
                                "x-access-token": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImR",
                                "Content-Type": "application/json"
                            }, async: true,
                            timeout: 3000000,
                            data: JSON.stringify(sendArchivo),
                            success: async function (data, textStatus, jqXHR) {
                                console.log(data);
                                // item2.doc_adjunto = data.data;
                                Documentos.map(function(obj,index){
                                obj.doc_adjunto = data.data[index].url ;   
                                // if(item2.nombre_arch === undefined){
                                //     item2.nombre_arch = sendArchivo.NAME + "." +sendArchivo.EXTENSION;
                                //     item2.doc_adjunto   = data.url.replace("=","");
                                // }else{
                                //     item2.nombre_arch += "\n"+sendArchivo.NAME + "."+sendArchivo.EXTENSION;
                                //     item2.doc_adjunto   += "\n"+data.url.replace("=","");
                                // }
                                });
                            }, error: function () {
                                MessageBox.error("Ocurrio un error al subir los adjuntos , vuelva a intentarlo");
                                sap.ui.core.BusyIndicator.hide();
                            }
                        });
                    }

                const data1 =
                {
                    "update": "X",
                    "cod_vendedor": CodVendedor,
                    "planilla": NroPlanilla,
                    "status": "V",
                    "DetallePlanillaSet": Documentos,
                    "ResultadosSet": [
                        {
                            "type": "",
                            "msg": "",
                            "planilla": "",
                            "cod_vendedor": "",
                            "status": "",
                            "fecha_emi": "",
                            "importe_ttl": "",
                            "conciliado": "",
                            "observ": ""
                        }
                    ]
                };
                let token = '';
                await $.ajax({
                    url: that.GetUriBaseSAP(),
                    type: "GET",
                    headers: {
                        "x-CSRF-Token": "Fetch"
                    }
                }).always(function (result, statusx, responsex) {
                    token = responsex.getResponseHeader("x-csrf-token");
                });
                await jQuery.ajax({
                    type: "POST",
                    url: that.GetUriBaseSAP() + "CreaPlanillaSet",
                    headers: {
                        "Accept": "application/json",
                        "x-CSRF-Token": token,
                        "Content-Type": "application/json"
                    },
                    async: true,
                    data: JSON.stringify(data1),
                    success: async function (data, textStatus, jqXHR) {
                        await that.ConsultaPlanilla(NroPlanilla, false);
                        
                        that.CleanDialog2Items();
                        that.RegistrarPago333.close();

                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.success("Se guardó existosamente", {
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {

                                // that.oRouter.navTo("RoutePlanillaView2");
                            }
                        });

                        that.RefreshAutomatico(undefined)

                    },
                    error: function () {
                        MessageBox.error("Ocurrio un error al obtener los datos");
                    }
                });

            },
            validarCampoVacios : function (){
            let Validacion      = false;
            const that = this;
            const oView = this.getView();
            const Proyect = oView.getModel("Proyect");

            const ElementCobro = Proyect.getProperty("/ElementCobro");
            const ElementOperacion = Proyect.getProperty("/ElementOperacion");
            const ElementBanco = Proyect.getProperty("/ElementBanco");
            const ElementCheque = Proyect.getProperty("/ElementCheque");

            let compMedioPago   = sap.ui.getCore().byId("MedioPago");
            let compBanco       = sap.ui.getCore().byId("Banco");
            let compCuenta      = sap.ui.getCore().byId("CuentaBancaria");
            let compOperacion   = sap.ui.getCore().byId("Operacion");
            let compCheque      = sap.ui.getCore().byId("Cheque");
            let compVoucher     = sap.ui.getCore().byId("DateVoucher");
            // let dataMedioPago   = compMedioPago.getSelectedKey();
            // let dataBanco       = compBanco.getSelectedKey();
            // let dataCuenta      = compCuenta.getSelectedKey();
            // const Operacion     = compOperacion.getValue();
            // const Cheque        = compCheque.getValue();
            // const DateVoucher   = compVoucher.getValue();
            compMedioPago.setValueState("None");
            compBanco.setValueState("None");
            compCuenta.setValueState("None");
            compOperacion.setValueState("None");
            compCheque.setValueState("None");
            compVoucher.setValueState("None");


                if(compMedioPago.getSelectedKey() === ""){
                    Validacion = true ;
                    compMedioPago.setValueState("Error");
                    compMedioPago.setValueStateText("Seleccione un medio de pago");
                }

                if(compBanco.getSelectedKey() === "" && ElementBanco){
                    Validacion = true ;
                    compBanco.setValueState("Error");
                    compBanco.setValueStateText("Seleccione un Banco");
                }

                if(compCuenta.getSelectedKey() === "" && ElementBanco){
                    Validacion = true ;
                    compCuenta.setValueState("Error");
                    compCuenta.setValueStateText("Escriba una Cuenta");
                }

                if(compOperacion.getValue() === "" && ElementOperacion){
                    Validacion = true ;
                    compOperacion.setValueState("Error");
                    compOperacion.setValueStateText("Escriba una Operacion");
                }

                if(compCheque.getValue() === "" && ElementCheque){
                    Validacion = true ;
                    compCheque.setValueState("Error");
                    compCheque.setValueStateText("Escriba un cheque");
                }

                if(compVoucher.getValue() === "" && ElementCobro){
                    Validacion = true ;
                    compVoucher.setValueState("Error");
                    compVoucher.setValueStateText("Eliga una fecha Voucher");
                }
                // if(Validacion){
                return Validacion ;
                // }

            },

            CleanDialog2Items: function () {

                const that = this;
                const oView = this.getView();
                const Reporte = oView.getModel("Reporte");
                var Proyect = oView.getModel("Proyect");
                let data = Reporte.getProperty("/data");
                const Archivos = oView.getModel("Archivos");

                data.map(function (obj) {
                    obj.impCobrado = '';
                });

                Reporte.setProperty("/data ", data)
                Archivos.setProperty("/data", []);
                sap.ui.getCore().byId("Operacion").setValue("");
                sap.ui.getCore().byId("Cheque").setValue("");
                sap.ui.getCore().byId("DateVoucher").setValue("");

                sap.ui.getCore().byId("Banco").setValue("");
                sap.ui.getCore().byId("CuentaBancaria").setValue("");
                sap.ui.getCore().byId("MedioPago").setValue("");

                sap.ui.getCore().byId("Banco").setSelectedKey("");
                sap.ui.getCore().byId("CuentaBancaria").setSelectedKey("");
                sap.ui.getCore().byId("MedioPago").setSelectedKey("");

                sap.ui.getCore().byId("Banco").setEnabled(true);
                sap.ui.getCore().byId("CuentaBancaria").setEnabled(true);

                Proyect.setProperty("/ElementCobro", false);
                Proyect.setProperty("/ElementOperacion", false);
                Proyect.setProperty("/ElementBanco", false);
                Proyect.setProperty("/ElementCheque", false);
            },

            SelectEfectivo: function () {
                const that = this;
                const oView = this.getView();
                var Proyect = oView.getModel("Proyect");
                Proyect.setProperty("/ElementCobro", false);

            },

            SelectBancario: function () {
                const that = this;
                const oView = this.getView();
                var Proyect = oView.getModel("Proyect");
                Proyect.setProperty("/ElementCobro", true);

            },
            selectMedPago: function () {
                const that = this;
                const oView = this.getView();
                // const Source = oEvent.getSource()
                var Proyect = oView.getModel("Proyect");
                // const key = Source.getSelectedKey()
                sap.ui.getCore().byId("Banco").setEnabled(true)
                sap.ui.getCore().byId("CuentaBancaria").setEnabled(true)
                
                let key = sap.ui.getCore().byId("MedioPago").getSelectedKey();
                if (key === "R" || key === "P") {

                    Proyect.setProperty("/ElementCobro", true);
                    Proyect.setProperty("/ElementOperacion", true);
                    Proyect.setProperty("/ElementBanco", true);
                    Proyect.setProperty("/ElementCheque", false);

                    sap.ui.getCore().byId("Banco").setSelectedKey("")
                    sap.ui.getCore().byId("Banco").setValue("")
                    sap.ui.getCore().byId("CuentaBancaria").setSelectedKey("")
                    sap.ui.getCore().byId("CuentaBancaria").setValue("")
                    if (key === "P") {
                        sap.ui.getCore().byId("Banco").setSelectedKey("BCP PEN")
                        sap.ui.getCore().byId("Banco").setEnabled(false)
                        that.selectBanco();
                        sap.ui.getCore().byId("CuentaBancaria").setSelectedKey("1941573143032")
                        sap.ui.getCore().byId("CuentaBancaria").setEnabled(false)
                    }

                }
                else if (key === "H") {
                    Proyect.setProperty("/ElementCobro", false);
                    Proyect.setProperty("/ElementOperacion", false);
                    Proyect.setProperty("/ElementBanco", false);
                    Proyect.setProperty("/ElementCheque", false);
                }
                else if(key === "Q") {
                    Proyect.setProperty("/ElementCobro", true);
                    Proyect.setProperty("/ElementOperacion", false);
                    Proyect.setProperty("/ElementBanco", false);
                    Proyect.setProperty("/ElementCheque", true);
                }

            },
            selectBanco: function () {
                const that = this;
                const oView = this.getView();
                const Banco = oView.getModel("Banco");
                const Cuenta = oView.getModel("Cuenta");
                const BancoCuenta = oView.getModel("BancoCuenta");

                let dataBanco = Banco.getProperty("/data");
                let KeyBanco = sap.ui.getCore().byId("Banco").getSelectedKey();
                let dataBancoCuenta = BancoCuenta.getProperty("/data");
                // Cuenta.setProperty("/data", [])
                let Cuentas = dataBancoCuenta.filter(obj => KeyBanco.split(" ")[0] === obj.text1.split(" ")[0]);
                Cuenta.setProperty("/data", Cuentas);
                sap.ui.getCore().byId("CuentaBancaria").setValue("");
                sap.ui.getCore().byId("CuentaBancaria").setSelectedKey("");

            },
            UploadFinish: function (oEvent) {

                oEvent.mParameters.item.setVisibleEdit(false);
            },
            handleClose: function () {
                const that = this;
                const oView = this.getView();
                const Reporte = oView.getModel("Reporte");
                const data = Reporte.getProperty("/data");
                const Table = sap.ui.getCore().byId("TableDialogDoc");
                const DetallePlanilla = oView.getModel("DetallePlanilla");
                const NroPlanilla = DetallePlanilla.getProperty("/dataPrincipal/planilla")

                data.map(function (obj) {
                    obj.impCobrado = '';
                    obj.impCobradoState = "None";
                });

                // SearchFieldReporteDoc
                sap.ui.getCore().byId("SearchFieldReporteDoc").setValue("");
                sap.ui.getCore().byId("TableDialogDoc").getBinding("items").filter([]);
                Table.removeSelections(true);
                that.RefreshAutomatico(undefined);
                this.RegistrarPago.close();

                Reporte.setProperty("/data ", data)
            },
            OnPressCerarPlanilla: async function () {

                const that = this;
                const oView = this.getView();
                const Proyect = oView.getModel("Proyect");
                const DetallePlanilla = oView.getModel("DetallePlanilla");
                const NroPlanilla = DetallePlanilla.getProperty("/dataPrincipal/planilla")
                const UserLogin = oView.getModel("UserLogin");
                const InfoUserLogin = UserLogin.getProperty("/data");
                const CodVendedor = InfoUserLogin["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes[0].value;
                let token = '';
                const dataDetallePlanilla = DetallePlanilla.getProperty("/data")

                if (dataDetallePlanilla.length === 0) {
                    MessageBox.error("Debe registrar almenos un Pago");
                    return;
                }

                MessageBox.warning("¿Esta seguro que desea cerrar la Planilla?", {
                    actions: ["Si", "No"],
                    emphasizedAction: MessageBox.Action.OK,
                    onClose: async function (sAction) {

                        if (sAction === "Si") {

                        let idRefreshAuto = Proyect.getProperty("/idRefreshAuto");
                        if (idRefreshAuto !== undefined) {
                            clearInterval(idRefreshAuto)
                        }
                        
                            const data =
                            {
                                "update": "X",
                                "cod_vendedor": CodVendedor,
                                "planilla": NroPlanilla,
                                "status": "C",
                                "DetallePlanillaSet": [
                                    {
                                        "status": "",
                                        "planilla": "",
                                        "cod_vendedor": "",
                                        "vendedor": "",
                                        "canal": "",
                                        "documento": "",
                                        "tipo_doc": "",
                                        "cliente": "",
                                        "cod_cliente": "",
                                        "moneda": "",
                                        "total_doc": "",
                                        "importe_cobrado": "",
                                        "saldo": "",
                                        "fecha_emi": "",
                                        "fecha_ven": "",
                                        "cond_pago": "",
                                        "medio_pago": "",
                                        "banco": "",
                                        "cta_bancaria": "",
                                        "fecha_vouc": "",
                                        "nro_oper": "",
                                        "nro_cheque": "",
                                        "doc_adjunto": "",
                                        "type": "",
                                        "msg": ""
                                    }
                                ],
                                "ResultadosSet": [
                                    {
                                        "type": "",
                                        "msg": "",
                                        "planilla": "",
                                        "cod_vendedor": "",
                                        "status": "",
                                        "fecha_emi": "",
                                        "importe_ttl": "",
                                        "conciliado": "",
                                        "observ": ""
                                    }
                                ]
                            };
                            sap.ui.core.BusyIndicator.show(0);
                            await $.ajax({
                                url: that.GetUriBaseSAP(),
                                type: "GET",
                                headers: {
                                    "x-CSRF-Token": "Fetch"
                                }
                            }).always(function (result, statusx, responsex) {

                                token = responsex.getResponseHeader("x-csrf-token");
                            });

                            await jQuery.ajax({
                                type: "POST",
                                url: that.GetUriBaseSAP() + "CreaPlanillaSet",
                                headers: {
                                    "Accept": "application/json",
                                    "x-CSRF-Token": token,
                                    "Content-Type": "application/json"
                                },
                                async: true,
                                data: JSON.stringify(data),
                                success: async function (data, textStatus, jqXHR) {
                                    that.getRouter().navTo("RoutePlanillaView1");
                                    that.RefreshAutomatico(undefined);
                                    DetallePlanilla.setProperty("/dataPrincipal/status", "Cerrado");
                                    sap.ui.core.BusyIndicator.hide();
                                    MessageBox.success("Se Actualizó existosamente", {
                                        actions: [MessageBox.Action.OK],
                                        emphasizedAction: MessageBox.Action.OK,
                                        onClose: function (sAction) {
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
            onPressModificar: function (oEvent) {
                const that = this;
                const oView = this.getView();
                // const DetallePlanilla   = oView.getModel("DetallePlanilla");                
                let DetallePlanilla = oEvent.getSource().getBindingContext("DetallePlanilla").getObject();
                Vizualizar = false
                SelectDetallePlanilla = JSON.parse(JSON.stringify(DetallePlanilla));
                if (!that.RegistrarPago333) {
                    that.RegistrarPago333 = sap.ui.xmlfragment("cobranza.view.Dialog2", that);
                    oView.addDependent(that.RegistrarPago333);
                }
                that.RegistrarPago333.open();
            },
            onPressActualizarPago: async function () {
                const that              = this;
                const oView             = this.getView();
                const Proyect           = oView.getModel("Proyect");
                const DetallePlanilla   = oView.getModel("DetallePlanilla");
                const MedioPago         = oView.getModel("MedioPago");
                const UserLogin         = oView.getModel("UserLogin");
                const Reporte           = oView.getModel("Reporte");

                const ImportePagar      = sap.ui.getCore().byId("ImportePagar").getValue();
                let dataMedioPago       =  sap.ui.getCore().byId("MedioPago").getSelectedKey();
                let dataBanco           = sap.ui.getCore().byId("Banco").getSelectedKey();
                let dataCuenta          = sap.ui.getCore().byId("CuentaBancaria").getSelectedKey();
                const Operacion         = sap.ui.getCore().byId("Operacion").getValue();
                const Cheque            = sap.ui.getCore().byId("Cheque").getValue();
                const DateVoucher       = sap.ui.getCore().byId("DateVoucher").getValue();
                const DateVoucherFormat = DateVoucher.replaceAll("/", "");
                const DateVoucherSAP    = DateVoucherFormat.substring(4, 8) + DateVoucherFormat.substring(2, 4) + DateVoucherFormat.substring(0, 2);
                const InfoUserLogin     = UserLogin.getProperty("/data");
                const CodVendedor       = InfoUserLogin["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes[0].value;
                const NroPlanilla       = DetallePlanilla.getProperty("/dataPrincipal/planilla")

                const ElementCobro      = Proyect.getProperty("/ElementCobro");
                const ElementOperacion  = Proyect.getProperty("/ElementOperacion");
                const ElementBanco      = Proyect.getProperty("/ElementBanco");
                const ElementCheque     = Proyect.getProperty("/ElementCheque");
                
                let FechaEmi            = DetallePlanilla.getProperty("/dataPrincipal/fecha_emi")
                let FechaEmiFormat      = FechaEmi.replaceAll("/", "")
                let FechaEmiSAP         = FechaEmiFormat.substring(4, 8) + FechaEmiFormat.substring(2, 4) + FechaEmiFormat.substring(0, 2)
                let FechaVenFormat      = SelectDetallePlanilla.fecha_ven.replaceAll("/", "");
                let FechaVenSAP         = FechaVenFormat.substring(4, 8) + FechaVenFormat.substring(2, 4) + FechaVenFormat.substring(0, 2);
                const InfoMediosPago    = MedioPago.getProperty("/data");
                const DescMedioPago     = InfoMediosPago.find(obj2 => obj2.via === dataMedioPago);

                const Archivos = oView.getModel("Archivos");
                const dataArchivos = Archivos.getProperty("/data");
                const ListaArchivos = sap.ui.getCore().byId("ListArchivos").getVisible();

                if(that.validarCampoVacios()){
                    MessageBox.error("Complete los campos correctamente");
                    return;
                }

                if (ListaArchivos && dataArchivos.length === 0) {
                    MessageBox.error("Debe adjuntar almenos un Voucher");
                    return;
                }

                let ReporteCuentas = Reporte.getProperty("/data")
                // const Proyect       = oView.getModel("Proyect"); 
                // let idRefreshAuto = Proyect.getProperty("/idRefreshAuto");
                // clearInterval(idRefreshAuto)
                sap.ui.core.BusyIndicator.show(0);
                // let contador = 1

                let sendArchivo = {
                        "CO_FACTURA": SelectDetallePlanilla.documento,
                        "CO_PLANILLA": that.getClient() + SelectDetallePlanilla.planilla,
                        "STATUS": "2",
                        "CONTADOR" :"1",
                        "UNIQUE": (parseFloat(SelectDetallePlanilla.pago_parcial)).toString(),
                        "NAME": "delete",
                        "EXTENSION": "delete",
                        "FILE_LOB": "delete" 
                    };

                    await jQuery.ajax({
                        type: "POST",
                        url: hostname.includes("port") ? "/uploadfile" : that.GetUriBase("/Documents/uploadfile"),
                        headers: {
                            "x-access-token": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImR",
                            "Content-Type": "application/json"
                        }, async: true,
                        data: JSON.stringify(sendArchivo),
                        timeout: 3000000,
                        success: async function (data, textStatus, jqXHR) {

                        }, error: function () {
                            MessageBox.error("Ocurrio un error en el adjunto ,por favor vuelva a intentarlo");
                            sap.ui.core.BusyIndicator.hide();
                        }
                    });

                if (DescMedioPago.via !== "H") {

                    // let UltimoIndice = 0;
                    for (let items of dataArchivos) {

                        if (items.Base64 === undefined) {
                            continue;
                            // return ;
                        }
                        // SelectDetallePlanilla.planilla +SelectDetallePlanilla.documento + (parseFloat(SelectDetallePlanilla.pago_parcial)).toString() + SelectDetallePlanilla.contadorArchivo,
                        let sendArchivo = {
                            "CO_FACTURA": SelectDetallePlanilla.documento,
                            "CO_PLANILLA": that.getClient() +SelectDetallePlanilla.planilla,
                            "STATUS": "1",
                            "CONTADOR":"1",
                            "UNIQUE": (parseFloat(SelectDetallePlanilla.pago_parcial)).toString(),
                            "NAME": items.Name.split(".")[0],
                            "EXTENSION": items.Name.split(".")[1],
                            "FILE_LOB": items.Base64 
                        }

                        await jQuery.ajax({
                            type: "POST",
                            url: hostname.includes("port") ? "/uploadfile" : that.GetUriBase("/Documents/uploadfile"),
                            headers: {
                                "x-access-token": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImR",
                                "Content-Type": "application/json"
                            }, async: true,
                            data: JSON.stringify(sendArchivo),
                            timeout: 3000000,
                            success: async function (data, textStatus, jqXHR) {
                                console.log(data);

                                SelectDetallePlanilla.doc_adjunto = data.data[0].url;

                            }, error: function () {
                                sap.ui.core.BusyIndicator.hide();
                                MessageBox.error("Ocurrio un error en el adjunto ,por favor vuelva a intentarlo");
                            }
                        });

                    }
                }

                let Cuenta = ReporteCuentas.find(obj=> obj.documento === SelectDetallePlanilla.documento);

                const data1 =
                {
                    "update": "X",
                    "cod_vendedor": CodVendedor,
                    "planilla": NroPlanilla,
                    "status": "V",
                    "DetallePlanillaSet":
                        [{
                            "status": "V",
                            "planilla": NroPlanilla,
                            "cod_vendedor": CodVendedor,
                            "vendedor": "",
                            "canal": "",
                            "documento": SelectDetallePlanilla.documento,
                            "pago_parcial": (parseFloat(SelectDetallePlanilla.pago_parcial)).toString(),
                            "tipo_doc": SelectDetallePlanilla.tipo_doc,
                            "cliente": SelectDetallePlanilla.cliente,
                            "cod_cliente": SelectDetallePlanilla.cod_cliente,
                            "moneda": SelectDetallePlanilla.moneda,
                            "total_doc": (parseFloat(SelectDetallePlanilla.total_doc)).toFixed(2),
                            "importe_cobrado": (parseFloat(ImportePagar)).toFixed(2),
                            "saldo":    ( (Cuenta === undefined ? 0.00 : parseFloat(Cuenta.saldo_pagar) ) + parseFloat(SelectDetallePlanilla.importe_cobrado) - parseFloat(ImportePagar)  ).toFixed(2),
                            "fecha_emi": FechaEmiSAP,
                            "fecha_ven": FechaVenSAP,
                            "cond_pago": SelectDetallePlanilla.cond_pago,
                            "medio_pago": DescMedioPago.text1,
                            "banco": ElementBanco ? dataBanco : "",
                            "cta_bancaria": ElementBanco ? dataCuenta : "",
                            "fecha_vouc": ElementCobro ? DateVoucherSAP : "",
                            "nro_oper": ElementOperacion ? Operacion : "",
                            "nro_cheque": ElementCheque ? Cheque : "",
                            "doc_adjunto": SelectDetallePlanilla.doc_adjunto,
                            // "nombre_arch"   :SelectDetallePlanilla.nombre_arch,
                            "type": "",
                            "msg": ""
                        }],
                    "ResultadosSet": [
                        {
                            "type": "",
                            "msg": "",
                            "planilla": "",
                            "cod_vendedor": "",
                            "status": "",
                            "fecha_emi": "",
                            "importe_ttl": "",
                            "conciliado": "",
                            "observ": ""
                        }
                    ]
                };
                let token = '';
                await $.ajax({
                    url: that.GetUriBaseSAP(),
                    type: "GET",
                    headers: {
                        "x-CSRF-Token": "Fetch"
                    }
                }).always(function (result, statusx, responsex) {

                    token = responsex.getResponseHeader("x-csrf-token");
                });
                await jQuery.ajax({
                    type: "POST",
                    url: that.GetUriBaseSAP() + "CreaPlanillaSet",
                    headers: {
                        "Accept": "application/json",
                        "x-CSRF-Token": token,
                        "Content-Type": "application/json"
                    },
                    async: true,
                    data: JSON.stringify(data1),
                    success: async function (data, textStatus, jqXHR) {
                        await that.ConsultaPlanilla(NroPlanilla, false);
                        
                        // that.CleanDialog2Items();
                        // that.RegistrarPago333.close();
                        that.onClosedPago()
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.success("Se actualizó existosamente", {
                            actions: [MessageBox.Action.OK],
                            emphasizedAction: MessageBox.Action.OK,
                            onClose: function (sAction) {
                                // that.oRouter.navTo("RoutePlanillaView2");
                            }
                        });

                        that.RefreshAutomatico(undefined)
                    },
                    error: function () {
                        MessageBox.error("Ocurrio un error al obtener los datos");
                    }
                });
            },

            onPressEliminar: async function (oEvent) {
                const that = this;
                const oView = this.getView();
                // const DetallePlanilla   = oView.getModel("DetallePlanilla");                
                const ModelDetallePlanilla = oView.getModel("DetallePlanilla");
                const NroPlanilla = ModelDetallePlanilla.getProperty("/dataPrincipal/planilla")
                let DetallePlanilla = oEvent.getSource().getBindingContext("DetallePlanilla").getObject();
                const UserLogin = oView.getModel("UserLogin");
                const InfoUserLogin = UserLogin.getProperty("/data");
                const CodVendedor = InfoUserLogin["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes[0].value;
                const Proyect = oView.getModel("Proyect");
                let idRefreshAuto = Proyect.getProperty("/idRefreshAuto");
                if (idRefreshAuto !== undefined) {
                    clearInterval(idRefreshAuto)
                }
                const data =
                {
                    "delete": "X",
                    "cod_vendedor": CodVendedor,
                    "planilla": NroPlanilla,
                    "DetallePlanillaSet": [
                        {
                            "status": "",
                            "planilla": "",
                            "cod_vendedor": "",
                            "vendedor": "",
                            "canal": "",
                            "documento": DetallePlanilla.documento,
                            "tipo_doc": "",
                            "cliente": "",
                            "cod_cliente": "",
                            "moneda": "",
                            "total_doc": "",
                            "importe_cobrado": "",
                            "pago_parcial": DetallePlanilla.pago_parcial,
                            "saldo": "",
                            "fecha_emi": "",
                            "fecha_ven": "",
                            "cond_pago": "",
                            "medio_pago": "",
                            "banco": "",
                            "cta_bancaria": "",
                            "fecha_vouc": "",
                            "nro_oper": "",
                            "nro_cheque": "",
                            "doc_adjunto": "",
                            "type": "",
                            "msg": ""
                        }
                    ],
                    "ResultadosSet": [
                        {
                            "type": "",
                            "msg": "",
                            "planilla": "",
                            "cod_vendedor": "",
                            "status": "",
                            "fecha_emi": "",
                            "importe_ttl": "",
                            "conciliado": "",
                            "observ": ""
                        }
                    ]
                };
                sap.ui.core.BusyIndicator.show(0);
                if (DetallePlanilla.medio_pago !== "DESCUENTO POR PLANILLA") {
                    let sendArchivo = {
                        "CO_FACTURA": DetallePlanilla.documento,
                        "CO_PLANILLA": that.getClient() + DetallePlanilla.planilla,
                        "STATUS": "2",
                        "CONTADOR":"1",
                        "UNIQUE": (parseFloat(DetallePlanilla.pago_parcial)).toString(),
                        "NAME": "delete",
                        "EXTENSION": "delete",
                        "FILE_LOB": "delete"
                    };
                    await jQuery.ajax({
                        type: "POST",
                        url: hostname.includes("port") ? "/uploadfile" : that.GetUriBase("/Documents/uploadfile"),
                        headers: {
                            "x-access-token": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImR",
                            "Content-Type": "application/json"
                        }, async: true,
                        data: JSON.stringify(sendArchivo),
                        timeout: 3000000,
                        success:  function (data, textStatus, jqXHR) {

                        }, error: function () {
                            MessageBox.error("Ocurrio un error en el adjunto ,por favor vuelva a intentarlo");
                            sap.ui.core.BusyIndicator.hide();
                        }
                    });
                }
                let token = '';
                await $.ajax({
                    url: that.GetUriBaseSAP(),
                    type: "GET",
                    headers: {
                        "x-CSRF-Token": "Fetch"
                    }
                }).always(function (result, statusx, responsex) {

                    token = responsex.getResponseHeader("x-csrf-token");
                });


                await jQuery.ajax({
                    type: "POST",
                    url: that.GetUriBaseSAP() + "CreaPlanillaSet",
                    headers: {
                        "Accept": "application/json",
                        "x-CSRF-Token": token,
                        "Content-Type": "application/json"
                    },
                    async: true,
                    data: JSON.stringify(data),
                    success: async function (data, textStatus, jqXHR) {
                        await that.ConsultaPlanilla(NroPlanilla, false);
                        sap.ui.core.BusyIndicator.hide();
                        MessageBox.success("Se eliminó la Planilla con éxito");
                        that.RefreshAutomatico(undefined)
                    },
                    error: function () {
                        MessageBox.error("Ocurrio un error al obtener los datos");
                    }
                })
            },

            OnPressHeader: function (oEvent) {
                const that = this;
                const oView = this.getView();
                // const DetallePlanilla   = oView.getModel("DetallePlanilla");                
                let DetallePlanilla = oEvent.getSource().getBindingContext("DetallePlanilla").getObject();
                Vizualizar = true;
                SelectDetallePlanilla = DetallePlanilla;
                if (!that.RegistrarPago333) {
                    that.RegistrarPago333 = sap.ui.xmlfragment("cobranza.view.Dialog2", that);
                    oView.addDependent(that.RegistrarPago333);
                }
                that.RegistrarPago333.open();
            },

            isNumberKey: function (oEvent) {
                var Number = oEvent.getSource().getValue();
                //para Letras caracteres etc
                let a = Number.replace(/[^\d.]+/g, '');
                let b = a.split(".")
                let b1 = a
                if (b.length > 1) {
                    b1 = b[0] + "." + b[1];
                }
                ///decimales a 2
                // let c = b1.replace(/^(\d+,?\d{0,2})\d*$/, "$1");
                // let c = b.replace(/(\.)+/g, '.');
                let c = b1.replace(/(?<=\.[0-9]{2}).+/g, "");
                oEvent.getSource().setValue(c);
                let Documentos = oEvent.getSource().getBindingContext("Reporte").getObject();
                if (parseFloat(Documentos.saldo_pagar) < parseFloat(Documentos.impCobrado)) {
                    Documentos.impCobradoStateText = "No debe excederse al Saldo";
                    Documentos.impCobradoState = "Error";
                } else {
                    Documentos.impCobradoState = "None";
                }
            },

            handleUploadAdjuntos: async function (oEvent) {
                var oView = this.getView();
                var Archivos = oView.getModel("Archivos");
                let DataArchivos = Archivos.getProperty("/data");
                var oFileUploader = sap.ui.getCore().byId("UploadSetDocumentos");
                var Documento = await this.ImportarDoc(oFileUploader);
                if(DataArchivos.length > 0){
                    sap.m.MessageBox.error("Solo se puede adjuntar un Voucher")
                    return ;
                }
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
                    reader.readAsDataURL(file);
                    reader.onload = async function (evt) {
                        try {

                            if (  !file.type.includes("pdf")  ){
                            let Base64='';   
                            const img = new Image();
                            img.src = reader.result;
                            img.onload = await function() {
                                const canvas = document.createElement("canvas");
                                canvas.width = img.width;
                                canvas.height = img.height;
                                const ctx = canvas.getContext("2d");
                                ctx.drawImage(img, 0, 0);
                                const dataURL = canvas.toDataURL("image/png");
                                console.log(dataURL)
                                // const downloadLink = document.createElement("a");
                                    // const fileName = NombreArchivo;
                                    // document.body.appendChild(image);

                                    // downloadLink.href = dataURL;
                                    // downloadLink.download = "hola.png";
                                    // downloadLink.click();
                                    
                                Base64=dataURL;
                                // var base64Index = base64_marker.length;
                                // Base64 = Base64.substring(base64Index);
                                console.log(dataURL);
                                
                                // .substring(base64Index);
                                let name= file.name.split(".")
                                Document = {
                                    "Type": "image/png",//file.type
                                    "Name": file.name.replace(/jpg|jpeg/i,"png"),
                                    "File": file,
                                    "Base64": Base64,
                                    "Result": reader.result
                                };
                                resolve(Document);
                                };
                            }
                            else  
                            {
                                // var base64Index = base64_marker.length;
                                let base64 = evt.target.result;
                                Document = {
                                    "Type": file.type,
                                    "Name": file.name,
                                    "File": file,
                                    "Base64": base64,
                                    "Result": reader.result
                                };
                                resolve(Document);

                            }   



                        } catch (err) {
                            reject(err);
                        }

                    }
                    // reader.readAsDataURL(file);
                });
            },

            onPressDescargar: function (oEvent) {
                var that = this;
                var oView = this.getView();
                var oBindingContext = oEvent.getSource().getBindingContext("Archivos");
                var sPath = oBindingContext.getPath();
                var model = oBindingContext.getModel();
                //get the selected  data from the model 
                var data = model.getProperty(sPath);
                let Base64 = data.Base64;
                let NombreArchivo = data.Name;
                // if (data.Type !== undefined) {
                    // let Base64          = data.Base64;
                    // Base64 = "data:" + data.Type.toLowerCase() + ";base64," + Base64
                    // window.open(data.Result)
                // }
                const downloadLink = document.createElement("a");
                const fileName = NombreArchivo;
                // document.body.appendChild(image);
                downloadLink.href = Base64;
                downloadLink.download = fileName;
                downloadLink.click();
            },

            deleteListArchivos: function (oEvent) {
                var that = this;
                var oView = this.getView();
                var ModelProyect = oView.getModel("Archivos");
                var deleteRecord = oEvent.getParameters().listItem.getBindingContext("Archivos").getPath();
                var data = ModelProyect.getProperty(deleteRecord);
                const Archivos = oView.getModel("Archivos");
                const dataArchivos = Archivos.getProperty("/data");
                let Index = dataArchivos.findIndex(obj => obj.Name === data.Name)
                dataArchivos.splice(Index, 1);
                Archivos.refresh(true);
            },
            NumberAleatorio: function () {
                return (Math.floor(Math.random() * 999999999999999999999)).toString() + (Math.floor(Math.random() * 999999999999999999999)).toString() + (Math.floor(Math.random() * 999999999999999999999)).toString();
            },
            onSearchDocumentos: function (oEvent) {
                const that = this;
                const oView = this.getView();
                let Search = oEvent.getSource().getValue();

                // var Number = oEvent.getSource().getValue();
                oEvent.getSource().setValue(Search );

                let aFilter1 = new sap.ui.model.Filter("documento", sap.ui.model.FilterOperator.Contains, Search);
                let aFilter2 = new sap.ui.model.Filter("ruc_dni", sap.ui.model.FilterOperator.Contains, Search);
                let aFilter3 = new sap.ui.model.Filter("cliente", sap.ui.model.FilterOperator.Contains, Search);
                var allFilter = new sap.ui.model.Filter([aFilter1, aFilter2, aFilter3], false);
                // sap.ui.getCore().byId("TableDialogDoc");
                sap.ui.getCore().byId("TableDialogDoc").getBinding("items").filter(allFilter);
            }
        });
    });
