sap.ui.define(
  [
      "sap/ui/core/mvc/Controller",
      "sap/ui/core/UIComponent",
      "cobranza/utils/utilService",
  ],
  function(BaseController,UIComponent,Service) {
    "use strict";
    const UriDomain="/sap/opu/odata/sap/ZOSFI_GW_TOMA_PEDIDO_SRV/"
    const hostname = location.hostname;
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
        // UriDomain = hostname.includes("port") ? UriDomain :this.getBaseURL()+UriDomain;
                                  // /sap/opu/odata/sap/ZOSFI_GW_TOMA_PEDIDO_SRV/MedioPagoSet?$filter=get eq 'X'
        const UriMedioDePago  = {uri:UriDomain+"MedioDePagoSet?$filter=land1 eq 'PE'"} 
        const UriStatus       = {uri:UriDomain+"StatusSet?$filter=get eq 'X'"};   
        const UriBancoCuenta  = {uri:UriDomain+"BancoCuentaSet?$filter=bukrs eq '1000' and waers eq 'PEN'"};
        // jQuery.sap.getModulePath("cobranza") +
        const UriPlanilla     = {uri:UriDomain+"ResultadosSet?$filter=cod_vendedor eq '1000000014'"};
        // const UriCorrelativo  = {uri:UriDomain+"PlanillasSet?$filter=get eq 'X'"};
        const UriUserLogin    = {uri:"/service/scim/Users?filter=emails eq 'consultorscp1@omniasolution.com'",header:{"Accept": "application/scim+json"}};
        const SendUri         = [UriMedioDePago,UriStatus,UriBancoCuenta,UriUserLogin,UriPlanilla]
        let Result            = await Service.doGetMultiple(SendUri);

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
        // that.ConsultaLoginUser();

      },
      ConsultaReporteCuentas :async  function(filters){
        const that            = this ;	
        const oView		        = this.getView(); 
        const Reporte         = oView.getModel("Reporte");
        const UserLogin       = oView.getModel("UserLogin"); 
        const InfoUserLogin   = UserLogin.getProperty("/data"); 

        const CodVendedor     = InfoUserLogin["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes[0].value ;
        let QueryFilter     = '';
        if(filters!== undefined){

          QueryFilter+= (filters.ruc_dni !== "" ?" & ruc_dni eq '"+filters.ruc_dni +"'" : "") ;
          QueryFilter+= (filters.documento !== "" ?" & documento eq '"+filters.documento +"'" : "") ;
          QueryFilter+= (filters.Cliente !== "" ?" & Cliente eq '"+filters.Cliente+"'"  : "") ;

        }

        const UriReporteCuentas = [{uri:UriDomain+"ReporteCuentasSet?$filter=kunn2 eq '"+CodVendedor+"'"+QueryFilter}];
        let ResultReporteCuentas= await Service.doGetMultiple(UriReporteCuentas);
        
        // jQuery.ajax({
        //   type  : "POST",
        //   url   : UriDomain+"CreaPlanillaSet",
        //   data  : JSON.stringify(data),
        //   headers :{"Accept": "application/json"},
        //   contentType: "application/json",
        //   success: function (data, textStatus, jqXHR) {
            
        //     debugger;
            
  
        //   },
        //   error: function () {
        //     // MessageBox.error("Ocurrio un error al obtener los datos de infoaprobador");
        //   }
        // });

        ResultReporteCuentas[0].d.results.map(function(obj){
          const DiasVencidos = parseFloat(obj.dias_ven);
          obj.dias_ven_State = DiasVencidos === 0 ? "Success":"Error"
          obj.dias_ven_Icon  = DiasVencidos === 0 ? "sap-icon://date-time":"sap-icon://date-time"
        });

        
        Reporte.setProperty("/data",ResultReporteCuentas[0].d.results);
        // that.ConsultaLoginUser();

      },
      // ConsultaLoginUser:async function(){
      //   const that    = this ;	
      //   const oView		= this.getView(); 
      //   const UserLogin = oView.getModel("UserLogin");

      //   // const UriReporteCuentas = ["/service/scim/Users?filter=emails eq 'liderdeproyecto1@omniasolution.com'"];

      //   jQuery.ajax({
      //     type: "GET",
      //     url: "/service/scim/Users?filter=emails eq 'liderdeproyecto1@omniasolution.com'",
      //     async: true,
      //     success: function (data, textStatus, jqXHR) {
            
            
      //       var data = {

      //       "apellido" : data.Resources[0].name.givenName,
      //       "nombre"   : data.Resources[0].name.familyName,
      //       "codVendedor":""
      //       }

      //       UserLogin.setProperty("/Data", data);
  
      //     },
      //     error: function () {
      //       // MessageBox.error("Ocurrio un error al obtener los datos de infoaprobador");
      //     }
      //   });


      //   // let aea = await Service.doGetMultiple(UriReporteCuentas);
      //   // console.log(aea);
      // },

      ConsultaPlanilla: async function(){
        const that            = this ;	
        const oView		        = this.getView(); 
        const UserLogin       = oView.getModel("UserLogin"); 
        const Planilla        = oView.getModel("Planilla");
        const InfoUserLogin   = UserLogin.getProperty("/data"); 
        const CodVendedor     = InfoUserLogin["urn:sap:cloud:scim:schemas:extension:custom:2.0:User"].attributes[0].value ;
        const UriPlanilla     = [{uri:UriDomain+"DetallePlanillaSet?$filter=cod_vendedor eq '"+CodVendedor+"'"}];
        // {uri:UriDomain+"ResultadosSet?$filter=cod_vendedor eq '"+CodVendedor+"'"};

        let ResultPlanilla    = await Service.doGetMultiple(UriPlanilla);
        let Planillas         = ResultPlanilla[0].d.results;

        // let groupbyPlanilla= Planillas.reduce(function(result, current) {
        //   result[current.planilla] = result[current.planilla] || [];
        //   result[current.planilla].push(current);
        //   return result;
        // }, {})

        let groupedPlanilla = Planillas.reduce((acc, cur) => { 
          let foundIndex = acc.findIndex(a => a.planilla == cur.planilla); 
          if (foundIndex != -1)
             acc[foundIndex].qty += 1  
           else 
            cur.qty = 1; acc.push(cur)  
          return acc;
        }, []);

        groupedPlanilla.map(function(obj){
          //Begin-- Sumatoria de todos los detalles Planillas
          let DetallePlanillas = Planillas.filter(obj1=> obj.planilla === obj1.planilla && obj1.documento !== "" );
          if(DetallePlanillas.length !== 0)  
               obj.importe_cobrado = DetallePlanillas.map(obj => obj.importe_cobrado).reduce((acc, amount) => parseFloat(acc) + parseFloat(amount) );
          else
          obj.importe_cobrado = "0.00";
          //End-- Sumatoria de todos los detalles Planillas

          obj.status = obj.status === "" ? "Vigente":"" ;
          obj.DetallePlanilla = JSON.parse(JSON.stringify(DetallePlanillas));

        });
        
        Planilla.setProperty("/data",groupedPlanilla);


        console.log(ResultPlanilla);
      },
      ConsultaDetallePlanilla : function (){
        const that            = this ;	
        const oView		        = this.getView(); 
        const DetallePlanilla = oView.getModel("DetallePlanilla");
        let DataDetallePlanilla   = DetallePlanilla.getProperty("/data");
        DetallePlanilla.setProperty("/dataPrincipal",DataDetallePlanilla);
       

      }

    //   getBaseURL: function () {
    //     // var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
    //     // var appPath = appId.replaceAll(".", "/");
    //     // var appModulePath = jQuery.sap.getModulePath(appPath);
    //     // that.getOwnerComponent().getManifestObject().resolveUri(sPath);
    //     // return appModulePath;
    // }, 

    });
  }
);
