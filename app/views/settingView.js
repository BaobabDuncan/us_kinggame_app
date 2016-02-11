/**
 * 
 */
 
 
app.views.setting = Ext.extend(Ext.Panel, {
	id : 'setting',
	fullscreen : true,
	layout : 'card',	
	
	initComponent : function() {
		printLog("===setting initComponent===");		
		
		this.settingFormPanel = new Ext.form.FormPanel({	
			
			items : [{
                xtype: 'fieldset',
                title: lang.KimgGameSetting,
                defaults: {
                    required: true,
                    labelAlign: 'left',
                    labelWidth: '50%'
                },                         
                items: [{
					xtype : 'togglefield',
					id : 'sex_status-togglefield',					
					label: lang.SexDivision,
					value : app.mySettingVO.data.sex_status, 
					required : true,
					listeners: {	                    
	                    change: function (slider, thumb, newValue, oldValue) {
	                    	printLog("togglefield change");
	                    	if ((oldValue == 0 && newValue == 1) || (oldValue == 1 && newValue == 0)) {  	                    		               		
	                    		if(newValue==1){	                    			
	                    			app.mySettingVO.data.sex_status = true;
	                    		}
	                    		else{	                    			
	                    			app.mySettingVO.data.sex_status = false;
	                    		}
	                    		saveUserDataToNative();
	                    		return;
	                        }	  	                    	
	                    }
	                }
                }]
            },{
            	style: {	                    
                    marginTop: '-30px'               
                },
            	html : '<div id="uksmart_info"><p>You can  see the more uksmart application</p>'+
            	'<a href="http://uk-smart.appspot.com/redirect" target="_black">UKSMART</a></div>'
            }]
		});
		
		this.mainPanel = new Ext.Panel({
			layout : 'fit',
			dockedItems : [ {
				xtype : 'toolbar',
				title : lang.MainTitle.Setting,
				items : [{
					xtype : 'spacer'
				}/*,{					
					ui : 'action',
					text : lang.Save,
					handler : function() {
						console.log("Save handler");						
						app.mySettingVO.data.sex_status = Ext.getCmp('sex_status-togglefield').getValue();
						saveUserDataToNative();
					}
				}*/]
			}],
			items : [this.settingFormPanel]
		});
		this.items = [this.mainPanel];
		
		this.mainPanel.on('afterrender', this.loadMainPanel, this);
		app.views.setting.superclass.initComponent.apply(this, arguments);		
	},
	loadMainPanel : function() {
		printLog("===setting loadMainPanel===");	
		var me = this;
		//me.refleshTab();
	},
	refleshTab : function(){		
		printLog("===setting refleshTab===");
		//Ext.getCmp('sex_status-togglefield').setValue(app.mySettingVO.data.sex_status);
	}
	
});
Ext.reg('setting_view', app.views.setting);
