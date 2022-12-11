sap.ui.define(
  [
      "sap/ui/core/mvc/Controller",
      "sap/ui/core/UIComponent",
      "cobranza/utils/utilService",
  ],
  function(BaseController,UIComponent,Service) {
    "use strict";
    let UriDomain   = "/sap/opu/odata/sap/ZOSFI_GW_TOMA_PEDIDO_SRV/";
    const hostname  = location.hostname;
    let Email       = 'consultorscp1@omniasolution.com';
    return BaseController.extend("cobranza.controller.BaseController", {

      getRouter: function () {
        try {
            return UIComponent.getRouterFor(this);
        } catch (e) {

        }

      },
      ConsultaPrincipal: async function (){
        const that        = this ;	
        const oView       = this.getView();
        const MedioPago   = oView.getModel("MedioPago");
        const Status      = oView.getModel("Status");
        const Banco       = oView.getModel("Banco"); 
        const Cuenta      = oView.getModel("Cuenta"); 
        const BancoCuenta = oView.getModel("BancoCuenta"); 
        const UserLogin   = oView.getModel("UserLogin"); 

        
        if(! hostname.includes("port")) {

          if(!UriDomain.includes("~")){
            UriDomain =  jQuery.sap.getModulePath("cobranza")+UriDomain;
            }
        // UriDomain =  jQuery.sap.getModulePath("cobranza")+UriDomain;
        Email     = sap.ushell.Container.getService("UserInfo").getUser().getEmail()

        }
        const UriMedioDePago  = {uri:UriDomain+"MedioDePagoSet?$filter=land1 eq 'PE'"} 
        const UriStatus       = {uri:UriDomain+"StatusSet?$filter=get eq 'X'"};   
        const UriBancoCuenta  = {uri:UriDomain+"BancoCuentaSet?$filter=bukrs eq '1000' and waers eq 'PEN'"};
        const UriDomainUser   = "/service/scim/Users?filter=emails eq '" +Email+"'";
        const UriUserLogin    = {uri:  hostname.includes("port") ?  UriDomainUser :(jQuery.sap.getModulePath("cobranza")+UriDomainUser)   ,header:{"Accept": "application/scim+json"}};
        
        const SendUri         = [UriMedioDePago,UriStatus,UriBancoCuenta,UriUserLogin]
        sap.ui.core.BusyIndicator.show(0);
        let Result            = await Service.doGetMultiple(SendUri);
        sap.ui.core.BusyIndicator.hide();
        console.log(Result);
        debugger;

        MedioPago.setProperty("/data"   ,Result[0].d.results);
        Status.setProperty("/data"      ,Result[1].d.results);

        let Bancos = Result[2].d.results.map(function(obj){
           let Banco= obj.text1.split(" ")[0]+" "+obj.text1.split(" ")[1]
            return {"nombre": Banco};
        });

        let RemoveDuplicateBancos = Bancos.filter((arr, index, self) =>
    																 index === self.findIndex((t) => (t.nombre === arr.nombre )));
        Banco.setProperty("/data"       ,RemoveDuplicateBancos);
        BancoCuenta.setProperty("/data" ,Result[2].d.results);
        Cuenta.setProperty("/data"      ,[]);
        UserLogin.setProperty("/data"   ,Result[3].Resources[0]);
      },
      ConsultaReporteCuentas :async  function(filters){
        const that            = this ;	
        const oView		        = this.getView(); 
        const Reporte         = oView.getModel("Reporte");
        const UserLogin       = oView.getModel("UserLogin"); 
        const Cliente         = oView.getModel("Cliente"); 
        const InfoUserLogin   = UserLogin.getProperty("/data"); 
        const CodVendedor     = InfoUserLogin["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes[0].value ;
        const UriClientes     = {uri:  UriDomain+"ClientesSet?$filter=cod_vendedor eq '"+CodVendedor+"'"}
        let QueryFilter       = '';
        if(filters!== undefined){

          QueryFilter+= (filters.ruc_dni !== "" && filters.ruc_dni !== undefined ?" and ruc_dni eq '"+filters.ruc_dni +"'" : "") ;
          QueryFilter+= (filters.documento !== "" && filters.documento !== undefined ?" and documento eq '"+filters.documento +"'" : "") ;
          QueryFilter+= (filters.Cliente !== "" && filters.Cliente !== undefined?" and Cliente eq '"+filters.Cliente+"'"  : "") ;

        }
        // if(Busy !== undefined && Busy ){
        sap.ui.core.BusyIndicator.show(0);
        // }

        const UriReporteCuentas = {uri:UriDomain+"ReporteCuentasSet?$filter=kunn2 eq '"+CodVendedor+"'"+QueryFilter};
        let ResultReporteCuentas= await Service.doGetMultiple([UriReporteCuentas,UriClientes]);
        sap.ui.core.BusyIndicator.hide();
      

        ResultReporteCuentas[0].d.results.map(function(obj){
          const DiasVencidos = parseFloat(obj.dias_ven);
          obj.saldo_pagar     = (parseFloat(obj.total_fac) - parseFloat(obj.imp_ret) - parseFloat(obj.pago_cuenta) ).toFixed(2);
          obj.fecha_emi       = obj.fecha_emi.substring(6,8)+ "/" +obj.fecha_emi.substring(4,6)  + "/"+obj.fecha_emi.substring(0,4);   
          obj.fecha_ven       = obj.fecha_ven.substring(6,8)+ "/" +obj.fecha_ven.substring(4,6)  + "/"+obj.fecha_ven.substring(0,4);    
          obj.dias_ven_State  = DiasVencidos === 0 ? "Success":"Error"
          obj.dias_ven_Icon   = "sap-icon://date-time"
          obj.AgentRetencion =  parseFloat(obj.imp_ret) !== 0 ? "sap-icon://circle-task-2" :"sap-icon://circle-task" ;

        });
        let IndexDocVacio = ResultReporteCuentas[0].d.results.findIndex(obj=> obj.documento === "");

        ResultReporteCuentas[0].d.results.splice(IndexDocVacio,1);

        Reporte.setProperty("/data",ResultReporteCuentas[0].d.results);
        // that.ConsultaLoginUser();
        Cliente.setProperty("/data",ResultReporteCuentas[1].d.results);
        if(oView.byId("cliente") !== undefined && filters !== undefined && filters.ruc_dni === undefined ){
        oView.byId("cliente").setSelectedKey("");
        oView.byId("cliente").setValue("");
        }
        

      },
      ConsultaPlanilla: async function(NroPlanilla){
        const that            = this ;	
        const oView		        = this.getView(); 
        const UserLogin       = oView.getModel("UserLogin"); 
        const Planilla        = oView.getModel("Planilla");
        const DetallePlanilla = oView.getModel("DetallePlanilla");
        const Reporte         = oView.getModel("Reporte");
        const MedioPago       = oView.getModel("MedioPago");
        const InfoUserLogin   = UserLogin.getProperty("/data"); 
        const CodVendedor     = InfoUserLogin["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes[0].value ;
        const UriPlanilla     = [{uri:UriDomain+"DetallePlanillaSet?$filter=cod_vendedor eq '"+CodVendedor+"'"}];
        // {uri:UriDomain+"ResultadosSet?$filter=cod_vendedor eq '"+CodVendedor+"'"};


        // DetallePlanilla.setProperty("/data",{})
        // DetallePlanilla.setProperty("/dataPrincipal",{})
        // if(Busy !== undefined || Busy  ){
        sap.ui.core.BusyIndicator.show(0);
        // }
        let ResultPlanilla    = await Service.doGetMultiple(UriPlanilla);
        let Planillas         = ResultPlanilla[0].d.results;
        await that.ConsultaReporteCuentas(undefined);

        let DataReporte       = Reporte.getProperty("/data");
        let DataReporteCopy   = JSON.parse(JSON.stringify(DataReporte));

        DataReporte.map(function(obj){
          obj.saldo_pagar =( parseFloat(obj.total_fac) - parseFloat(obj.imp_ret) ).toFixed(2) ;
        });

        DataReporteCopy.map(function(obj){
          let DetallePlanillas = Planillas.filter(obj1=> obj1.documento === obj.documento);
          


            if(DetallePlanillas.length !== 0){
              let ImpTotalCobrado     = DetallePlanillas.map(obj1 => parseFloat(obj1.importe_cobrado)).reduce((acc, amount) => acc + amount );  
              let ImptCobradoSobrante = parseFloat(obj.total_fac) - parseFloat(ImpTotalCobrado) - parseFloat(obj.imp_ret);
              let index               = DataReporte.findIndex(obj1 =>  obj1.documento === obj.documento );
            if(ImptCobradoSobrante <= 0){
              DataReporte.splice(index, 1);
            }else 
              DataReporte[index].saldo_pagar = ImptCobradoSobrante.toFixed(2);
            }

        });
        Reporte.refresh(true);
        

        //Begin--Agrupacion Planillas
        let groupedPlanilla = Planillas.reduce((acc, cur) => { 
          let foundIndex = acc.findIndex(a => a.planilla == cur.planilla); 
          if (foundIndex != -1){
             acc[foundIndex].qty += 1  
          }
           else {
            cur.qty = 1; acc.push(cur)  
           }
          return acc;
        }, []);
        //End--Agrupacion Planillas

        const InfoMediosPago = MedioPago.getProperty("/data");
        groupedPlanilla.map(function(obj){
          
          let DetallePlanillas = Planillas.filter(obj1=> obj.planilla === obj1.planilla && obj1.documento !== "" );
            if(DetallePlanillas.length !== 0) {
              //De nomenclatura a texto el medio de pago
                DetallePlanillas.map(function(obj1){
                // const DescMedioPago = InfoMediosPago.find(obj2=> obj2.via ===  obj1.medio_pago) ;
                // obj1.medio_pago     = DescMedioPago ? DescMedioPago.text1 : "";
                obj1.fecha_ven      = obj1.fecha_ven.substring(6,8) + "/" + obj1.fecha_ven.substring(4,6)  + "/"+obj1.fecha_ven.substring(0,4)
                });
              //    
          //Begin-- Sumatoria de todos los detalles Planillas(Documentos)
          let ImporteTotal = DetallePlanillas.map(obj1 => parseFloat(obj1.importe_cobrado)).reduce((acc, amount) => acc + amount )
          obj.importe_cobrado = (ImporteTotal).toFixed(2);
          //End-- Sumatoria de todos los detalles Planillas(Documentos)
            }
            else{
          obj.importe_cobrado = "0.00";}
          obj.fecha_emi       = obj.fecha_emi.substring(6,8)+ "/" +obj.fecha_emi.substring(4,6)  + "/"+obj.fecha_emi.substring(0,4) 
          obj.observ = obj.status === "R" ? obj.observ: "";
          

          if(obj.status === "V"){
            obj.status= "Vigente";
            obj.state = "Success";
            obj.icon  = "sap-icon://sys-enter";
          }else if(obj.status === "C"){
            obj.status= "Cerrado";
            obj.state = "Error";
            obj.icon  = "sap-icon://sys-cancel-2";
          }else if(obj.status === "R"){
            obj.status= "Rechazado";
            obj.state = "Warning";
            obj.icon  = "sap-icon://alert";
          }
          // obj.status          = obj.status === "" || obj.status === "V" ? "Vigente":obj.status === "C" ? "Cerrado":"";

          if(NroPlanilla !== undefined && NroPlanilla === obj.planilla){
            DetallePlanilla.setProperty("/data",DetallePlanillas)
            DetallePlanilla.setProperty("/dataPrincipal",obj)
          }
          obj.DetallePlanilla = JSON.parse(JSON.stringify(DetallePlanillas));
        });

        Planilla.setProperty("/data",groupedPlanilla);
        var Archivos		    = oView.getModel("Archivos");
        Archivos.setProperty("/data",[]);
        console.log(ResultPlanilla);

      },
      ConsultaDetallePlanilla : function (){
        const that            = this ;	
        const oView		        = this.getView(); 
        const DetallePlanilla = oView.getModel("DetallePlanilla");
        let DataDetallePlanilla   = DetallePlanilla.getProperty("/data");
        DetallePlanilla.setProperty("/dataPrincipal",DataDetallePlanilla);
       
      },
      
      ValidacionDetallePlanilla : function(context){

        const that            = this ;	
        const oView		        = this.getView(); 
        setInterval(async function () {
          
          // const UserLogin       = oView.getModel("UserLogin"); 
          // const Planilla        = oView.getModel("Planilla");
          const DetallePlanilla     = oView.getModel("DetallePlanilla");
          let DataDetallePlanilla   = DetallePlanilla.getProperty("/dataPrincipal");
          that.ConsultaPlanilla(DataDetallePlanilla.planilla,false);

        }, 1000);

      }

    });
  }
);
