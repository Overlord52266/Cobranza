sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "cobranza/utils/utilService",
  ],
  function (BaseController, UIComponent, Service) {
    "use strict";
    const UriSAP = "/sap/opu/odata/sap/ZOSFI_GW_TOMA_PEDIDO_SRV/";
    const hostname = location.hostname;
    const Email = 'consultorscp1@omniasolution.com' //Se establece el correo para pruebas Local;
    const Client = "300" // PRD (300) QAS (210) Se establece el mandante de la conexion del ERP para los Voucher(Documentos adjuntos) ;
    return BaseController.extend("cobranza.controller.BaseController", {

      getRouter: function () {
        try {
          return UIComponent.getRouterFor(this);
        } catch (e) {

        }

      },
      GetUriBase: function (Uri) {

        let UriBase = Uri
        if (!hostname.includes("port")) {

          // if(!UriDomain.includes("~")){
          UriBase = jQuery.sap.getModulePath("cobranza") + UriBase;
          // }
        }
        return UriBase;

      },
      GetUriBaseSAP: function () {

        return this.GetUriBase(UriSAP);

      },
      GetEmail: function () {

        let Correo = Email;
        if (!hostname.includes("port")) {
          Correo = sap.ushell.Container.getService("UserInfo").getUser().getEmail()
        }

        return Correo;

      },
      getClient : function (){

        return Client;
      },
      ConsultaPrincipal: async function () {
        const that = this;
        const oView = this.getView();
        const MedioPago = oView.getModel("MedioPago");
        const Status = oView.getModel("Status");
        const Banco = oView.getModel("Banco");
        const Cuenta = oView.getModel("Cuenta");
        const BancoCuenta = oView.getModel("BancoCuenta");
        const UserLogin = oView.getModel("UserLogin");

        // const a=location.href;

        const Proyect = oView.getModel("Proyect");
        let idRefreshAuto = Proyect.getProperty("/idRefreshAuto");
        if (idRefreshAuto !== undefined) {
          clearInterval(idRefreshAuto)
        }

        // UriDomain =  jQuery.sap.getModulePath("cobranza")+UriDomain;
        // Email     = sap.ushell.Container.getService("UserInfo").getUser().getEmail()

        // }
        const UriMedioDePago = { uri: that.GetUriBaseSAP() + "MedioDePagoSet?$filter=land1 eq 'PE'" }
        const UriStatus = { uri: that.GetUriBaseSAP() + "StatusSet?$filter=get eq 'X'" };
        const UriBancoCuenta = { uri: that.GetUriBaseSAP() + "BancoCuentaSet?$filter=bukrs eq '1000' and waers eq 'PEN'" };
        const UriDomainUser = "/service/scim/Users?filter=emails eq '" + that.GetEmail() + "'";
        const UriUserLogin = { uri: that.GetUriBase(UriDomainUser), header: { "Accept": "application/scim+json" } };

        const SendUri = [UriMedioDePago, UriStatus, UriBancoCuenta, UriUserLogin]
        sap.ui.core.BusyIndicator.show(0);
        let Result = await Service.doGetMultiple(SendUri);
        sap.ui.core.BusyIndicator.hide();
        console.log(Result);
        debugger;


        let IndexNotaCredito = Result[0].d.results.findIndex(obj=> obj.via === "N");
        Result[0].d.results.splice(IndexNotaCredito,1);

        MedioPago.setProperty("/data", Result[0].d.results);
        Status.setProperty("/data", Result[1].d.results);

        let Bancos = Result[2].d.results.map(function (obj) {
          let Banco = obj.text1.split(" ")[0] + " " + obj.text1.split(" ")[1]
          return { "nombre": Banco };
        });

        let RemoveDuplicateBancos = Bancos.filter((arr, index, self) =>
          index === self.findIndex((t) => (t.nombre === arr.nombre)));
        Banco.setProperty("/data", RemoveDuplicateBancos);
        BancoCuenta.setProperty("/data", Result[2].d.results);
        Cuenta.setProperty("/data", []);
        UserLogin.setProperty("/data", Result[3].Resources[0]);
      },

      ConsultaReporteCuentas: async function (filters) {
        const that = this;
        const oView = this.getView();
        const Reporte = oView.getModel("Reporte");
        const UserLogin = oView.getModel("UserLogin");
        const Cliente = oView.getModel("Cliente");
        const InfoUserLogin = UserLogin.getProperty("/data");
        const CodVendedor = InfoUserLogin["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes[0].value;
        const UriClientes = { uri: that.GetUriBaseSAP() + "ClientesSet?$filter=cod_vendedor eq '" + CodVendedor + "'" }
        let QueryFilter = '';
        if (filters !== undefined) {
          QueryFilter += (filters.ruc_dni !== "" && filters.ruc_dni !== undefined ? " and ruc_dni eq '" + filters.ruc_dni + "'" : "");
          QueryFilter += (filters.documento !== "" && filters.documento !== undefined ? " and documento eq '" + filters.documento + "'" : "");
          QueryFilter += (filters.Cliente !== "" && filters.Cliente !== undefined ? " and Cliente eq '" + filters.Cliente + "'" : "");
        }
        // if(Busy !== undefined && Busy ){
        sap.ui.core.BusyIndicator.show(0);
        // }

        const UriReporteCuentas = { uri: that.GetUriBaseSAP() + "ReporteCuentasSet?$filter=kunn2 eq '" + CodVendedor + "'" + QueryFilter };
        let ResultReporteCuentas = await Service.doGetMultiple([UriReporteCuentas, UriClientes]);
        sap.ui.core.BusyIndicator.hide();

        that.estructuracionReporteCuentas(ResultReporteCuentas[0].d.results);
        // that.ConsultaLoginUser();
        Cliente.setProperty("/data", ResultReporteCuentas[1].d.results);
        if (oView.byId("cliente") !== undefined && filters !== undefined && filters.ruc_dni === undefined) {
          oView.byId("cliente").setSelectedKey("");
          oView.byId("cliente").setValue("");
          oView.byId("InputDocumento").setValue("");
          oView.byId("InputRucDni").setValue("");
        }
      },

      estructuracionReporteCuentas: function (data) {
        const that = this;
        const oView = this.getView();
        const Reporte = oView.getModel("Reporte");

        data.map(function (obj) {
          const DiasVencidos = parseFloat(obj.dias_ven);
          obj.saldo_pagar = (parseFloat(obj.total_fac) - parseFloat(obj.imp_ret) - parseFloat(obj.pago_cuenta)).toFixed(2);
          obj.pago_cuenta = (parseFloat(obj.pago_cuenta)).toFixed(2);
          obj.total_fac = (parseFloat(obj.total_fac)).toFixed(2);
          obj.imp_ret = (parseFloat(obj.imp_ret)).toFixed(2);
          obj.fecha_emi = obj.fecha_emi.substring(6, 8) + "/" + obj.fecha_emi.substring(4, 6) + "/" + obj.fecha_emi.substring(0, 4);
          obj.fecha_ven = obj.fecha_ven.substring(6, 8) + "/" + obj.fecha_ven.substring(4, 6) + "/" + obj.fecha_ven.substring(0, 4);
          obj.dias_ven_State = DiasVencidos === 0 ? "Success" : "Error"
          obj.dias_ven_Icon = "sap-icon://date-time"
          obj.AgentRetencion = parseFloat(obj.imp_ret) !== 0 ? "sap-icon://circle-task-2" : "sap-icon://circle-task";

        });

        let IndexDocVacio = data.findIndex(obj => obj.documento === "");
        if (IndexDocVacio !== -1) {
          data.splice(IndexDocVacio, 1);
        }
        Reporte.setProperty("/data", data);
      },

      ConsultaPlanilla: async function (NroPlanilla, Busy , CancelReport) {
        const that      = this;
        const oView     = this.getView();
        const Proyect   = oView.getModel("Proyect");
        const UserLogin = oView.getModel("UserLogin");
        const Planilla  = oView.getModel("Planilla");
        const DetallePlanilla = oView.getModel("DetallePlanilla");
        const Reporte         = oView.getModel("Reporte");
        const MedioPago       = oView.getModel("MedioPago");
        const InfoUserLogin   = UserLogin.getProperty("/data");
        const CodVendedor     = InfoUserLogin["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes[0].value;
        const uriPlanilla     = { uri: that.GetUriBaseSAP() + "DetallePlanillaSet?$filter=cod_vendedor eq '" + CodVendedor + "'" };
        const UriReporteCuentas = { uri: that.GetUriBaseSAP() + "ReporteCuentasSet?$filter=kunn2 eq '" + CodVendedor + "'" };
        // {uri:UriDomain+"ResultadosSet?$filter=cod_vendedor eq '"+CodVendedor+"'"};
        // let idRefreshAuto     = Proyect.getProperty("/idRefreshAuto");
        // DetallePlanilla.setProperty("/data",{})
        // DetallePlanilla.setProperty("/dataPrincipal",{})
        if (Busy) {
          sap.ui.core.BusyIndicator.show(0);
        }
        let SendConsults = [uriPlanilla, UriReporteCuentas];
        if (CancelReport !== undefined  && !CancelReport ){
          SendConsults.splice(1,1);
        }

        let Result          = await Service.doGetMultiple(SendConsults);
        let Planillas       = Result[0].d.results;

        if (CancelReport === undefined ){
        let Cuentas         = Result[1].d.results;
        let ReporteCuentas  = Cuentas.filter(obj=> obj.tipo_doc !== "RG")
        that.estructuracionReporteCuentas(ReporteCuentas);
        }
        // await that.ConsultaReporteCuentas(undefined);
        let DataReporte = Reporte.getProperty("/data");
        let DataReporteCopy = JSON.parse(JSON.stringify(DataReporte));
        Reporte.setProperty("/dataCopy",DataReporteCopy);

        DataReporte.map(function (obj) {
          obj.saldo_pagar = (parseFloat(obj.total_fac) - parseFloat(obj.imp_ret)).toFixed(2);
        });

        DataReporteCopy.map(function (obj) {  
          let DetallePlanillas = Planillas.filter(obj1 => obj1.documento === obj.documento);
          if (DetallePlanillas.length !== 0) {
            let ImpTotalCobrado = DetallePlanillas.map(obj1 => parseFloat(obj1.importe_cobrado) ).reduce((acc, amount) => parseFloat((acc + amount).toFixed(2)) );
            let ImptCobradoSobrante = parseFloat(obj.total_fac) - parseFloat(ImpTotalCobrado) - parseFloat(obj.imp_ret);
            let index = DataReporte.findIndex(obj1 => obj1.documento === obj.documento);
            if (ImptCobradoSobrante <= 0) {
              DataReporte.splice(index, 1);
            } else
              DataReporte[index].saldo_pagar = ImptCobradoSobrante.toFixed(2);
          }

        });
        Reporte.refresh(true);

        //Begin--Agrupacion Planillas
        let groupedPlanilla = Planillas.filter(obj=> obj.documento === "" && obj.planilla !== "" );
        // .reduce((acc, cur) => {
        //   let foundIndex = acc.findIndex(a => a.planilla == cur.planilla);
        //   if (foundIndex != -1) {
        //     acc[foundIndex].qty += 1
        //   }
        //   else {
        //     cur.qty = 1; acc.push(cur)
        //   }
        //   return acc;
        // }, []);
        //End--Agrupacion Planillas

        groupedPlanilla.sort(function(a, b){
          return parseFloat(b.planilla.split("-")[1])  - parseFloat(a.planilla.split("-")[1])  ;
        });

        const InfoMediosPago = MedioPago.getProperty("/data");
        groupedPlanilla.map(function (obj) {

          let DetallePlanillas = Planillas.filter(obj1 => obj.planilla === obj1.planilla && obj1.documento !== "");
          if (DetallePlanillas.length !== 0) {
            //De nomenclatura a texto el medio de pago
            DetallePlanillas.map(function (obj1) {
              // const DescMedioPago = InfoMediosPago.find(obj2=> obj2.via ===  obj1.medio_pago) ;
              // obj1.medio_pago     = DescMedioPago ? DescMedioPago.text1 : "";
              obj1.fecha_ven = obj1.fecha_ven.substring(6, 8) + "/" + obj1.fecha_ven.substring(4, 6) + "/" + obj1.fecha_ven.substring(0, 4);

              let DocumentoReporte = DataReporteCopy.find(cuenta=> cuenta.documento === obj1.documento )
              obj1.imp_ret   = DocumentoReporte === undefined ? "0.00" : DocumentoReporte.imp_ret ;
            });
            //    
            //Begin-- Sumatoria de todos los detalles Planillas(Documentos)
            let ImporteTotal = DetallePlanillas.map(obj1 => parseFloat(obj1.importe_cobrado)).reduce((acc, amount) => acc + amount)
            obj.importe_cobrado = (ImporteTotal).toFixed(2);
            //End-- Sumatoria de todos los detalles Planillas(Documentos)
          }
          else {
            obj.importe_cobrado = "0.00";
          }
          obj.fecha_emi_MY = parseFloat(obj.fecha_emi.substring(0, 4) + obj.fecha_emi.substring(4, 6));
          obj.fecha_emi = obj.fecha_emi.substring(6, 8) + "/" + obj.fecha_emi.substring(4, 6) + "/" + obj.fecha_emi.substring(0, 4);
          obj.observ = obj.status === "R" ? obj.observ : "";


          if (obj.status === "V") {
            obj.status = "Vigente";
            obj.state = "Success";
            obj.icon = "sap-icon://sys-enter";
          } else if (obj.status === "C") {
            obj.status = "Cerrado";
            obj.state = "Error";
            obj.icon = "sap-icon://sys-cancel-2";
          } else if (obj.status === "R") {
            obj.status = "Rechazado";
            obj.state = "Warning";
            obj.icon = "sap-icon://alert";
          }
          // obj.status          = obj.status === "" || obj.status === "V" ? "Vigente":obj.status === "C" ? "Cerrado":"";

          if (NroPlanilla !== undefined && NroPlanilla === obj.planilla) {
            DetallePlanilla.setProperty("/data", DetallePlanillas)
            DetallePlanilla.setProperty("/dataPrincipal", obj)
          }
          obj.DetallePlanilla = JSON.parse(JSON.stringify(DetallePlanillas));
        });

        let impTotalPlanilla = groupedPlanilla.map(obj1 => parseFloat(obj1.importe_cobrado)).reduce((acc, amount) => acc + amount)
        Planilla.setProperty("/impTotal", (parseFloat(impTotalPlanilla)).toFixed(2));

        let dataPlanillas = Planilla.getProperty("/data")
        if (dataPlanillas !== undefined) {
          groupedPlanilla.map(function (obj, index) {
            dataPlanillas.splice(index, 1, obj)
          });
          // oView.byId("TablePlanilla").getBinding("items").refresh(); 
          Planilla.refresh(true)
        } else {
          Planilla.setProperty("/data", groupedPlanilla);
        }
        var Archivos = oView.getModel("Archivos");
        Archivos.setProperty("/data", []);
        if (Busy) {
        sap.ui.core.BusyIndicator.hide();
        }
        // console.log(ResultPlanilla);
      },

      consultaArchivos: async function (Documento) {
        const that = this;
        const oView = this.getView();
        const Archivos = oView.getModel("Archivos");
        let UriArchivo = hostname.includes("port") ? "/getfiles" : (jQuery.sap.getModulePath("cobranza") + "/Documents/getfiles");

        let sendArchivo =
        {
          "UNIQUE": (parseFloat(Documento.pago_parcial)).toString(),
          "CO_PLANILLA": that.getClient()+Documento.planilla,
          "CO_FACTURA": Documento.documento
        }

        sap.ui.core.BusyIndicator.show(0);
        // let Result        = await Service.doGetMultiple(SendUri);
        await jQuery.ajax({
          type: "POST",
          url: UriArchivo,
          timeout: 0,
          headers: {
            "x-access-token": "eyJhbGciOiJSUzI1NiIsImtpZCI6ImR",
            "Content-Type": "application/json"
          }, async: true,
          data: JSON.stringify(sendArchivo),
          success: async function (data, textStatus, jqXHR) {
            console.log(data);

            let Documentos = data.map(function (obj) {
              let Archivo =
              {
                "Name": obj.ARCHIVO + "." + obj.EXTENSION,
                "Base64": obj.ARCHIVO_B64
              }
              return Archivo;


              // obj.ARCHIVO
              // obj.ARCHIVO_B64
              // obj.EXTENSION
            });
            Archivos.setProperty("/data", Documentos);
            // Documentos.map(function(obj){
            // if(item2.nombre_arch === undefined){
            //     item2.nombre_arch = sendArchivo.NAME + "." +sendArchivo.EXTENSION;
            //     item2.doc_adjunto   = data.url.replace("=","");
            // }else{
            //     item2.nombre_arch += "\n"+sendArchivo.NAME + "."+sendArchivo.EXTENSION;
            //     item2.doc_adjunto   += "\n"+data.url.replace("=","");
            // }
            // });
          }, error: function () {
            MessageBox.error("Ocurrio un error al obtener los datos");
          }

        });

        sap.ui.core.BusyIndicator.hide();

      },

      // ConsultaDetallePlanilla : function (){
      //   const that            = this ;	
      //   const oView		        = this.getView(); 
      //   const DetallePlanilla = oView.getModel("DetallePlanilla");
      //   let DataDetallePlanilla   = DetallePlanilla.getProperty("/data");
      //   DetallePlanilla.setProperty("/dataPrincipal",DataDetallePlanilla);

      // },

      RefreshAutomatico: async function (oEvent) {
        const that = this;
        const oView = this.getView();
        const Proyect = oView.getModel("Proyect");
        let idRefreshAuto = Proyect.getProperty("/idRefreshAuto");
        const UserLogin = oView.getModel("UserLogin");
        const Planilla = oView.getModel("Planilla");
        const DetallePlanilla = oView.getModel("DetallePlanilla");
        let DataDetallePlanilla = DetallePlanilla.getProperty("/dataPrincipal");
        let id;

        if (oView.byId("TablePlanilla") !== undefined) {
          oView.byId("TablePlanilla").getBinding("items").filter([]);
          oView.byId("DateRangeEmision").setValue("");
          oView.byId("SeachPlanilla").setValue("");
        }

        if (oEvent !== undefined && !location.href.includes("RoutePlanillaView2")  ) {
          sap.ui.core.BusyIndicator.show(0);
          await that.ConsultaPlanilla(undefined, false,undefined);
          
        }

        if (!idRefreshAuto) {
          sap.ui.core.BusyIndicator.hide();
          id = setInterval(async function () {
            const Uri = location.href.includes("RoutePlanillaView1");
            await that.ConsultaPlanilla(Uri ? undefined : DataDetallePlanilla.planilla, false,false);
          }, 3000);

        } else {
          clearInterval(idRefreshAuto)
          sap.ui.core.BusyIndicator.hide();
          id = setInterval(async function () {
            const Uri = location.href.includes("RoutePlanillaView1");
            await that.ConsultaPlanilla(Uri ? undefined : DataDetallePlanilla.planilla, false,false);
          }, 3000);
        }

        Proyect.setProperty("/idRefreshAuto", id);
      }

    });
  }
);
