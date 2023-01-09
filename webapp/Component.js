/**
 * eslint-disable @sap/ui5-jsdocs/no-jsdoc
 */

sap.ui.define([
        "sap/ui/core/UIComponent",
        "sap/ui/Device",
        "cobranza/model/models",
        "sap/ui/core/routing/HashChanger"
    ],
    function (UIComponent, Device, models,HashChanger) {
        "use strict";

        return UIComponent.extend("cobranza.Component", {
            metadata: {
                manifest: "json",
                config: {
                    fullWidth: true
                }
            },

            /**
             * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
             * @public
             * @override
             */
            init: function () {

                    var URLactual	= window.location.hash;
                    
                    if(!URLactual.includes("RouteMenu")) {
                        HashChanger.getInstance().replaceHash("");	
                    }
                    // call the base component's init function
                    UIComponent.prototype.init.apply(this, arguments);

                    // enable routing
                    this.getRouter().initialize();

                    // set the device model
                    this.setModel(models.createDeviceModel(), "device");
                   

                }
        });
    }
);