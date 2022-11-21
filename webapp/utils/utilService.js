sap.ui.define([], function(
	
    ) {
        "use strict";
    
        return {
            doPostMultipleOnbase : async function (Sends){
                try {
                    const results = await Promise.all(Sends.map(send=> 
                    // "/sap/fiori/irequestbvregistrodocliq"+
                        fetch("/sap/fiori/irequestbvregistrodocliq" + Utilities.getOnbaseDomain()+ send.URL,
                        {
                        method	:"POST",
                        body	:JSON.stringify(send.data),
                        headers :{"Accept": "application/json"}
                        }
                        )
                    )) 
                    const finalData	   = await Promise.all(results.map(result => 
                            result.json()));
                        return 	finalData ;
                        console.log(finalData);
                    }
                    catch(err) {
                        console.log(err);
                    }
                    
                    
            },
            doGetMultiple : async function (Sends){
                try {
                    const results = await Promise.all(Sends.map(send=> 
                    // "/sap/fiori/irequestbvregistrodocliq"+
                        fetch(send.uri,
                        {
                        method	:"GET",
                        headers : send.header === undefined ? {"Accept": "application/json"}: send.header
                        }
                        )
                    )) 
                    const finalData	   = await Promise.all(results.map(result => 
                            result.json()));
                        return 	finalData ;
                        console.log(finalData);
                    }
                    catch(err) {
                        console.log(err);
                    }
                  
            }
    
    
        }
        
    
    });