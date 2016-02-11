Ext.regApplication({
	name : 'app',
	launch : function() {
		printLog("===regApplication Launch===");	
		/*
		settingDB();
		myDBHandler.dropTable('penal');
		myDBHandler.dropTable('user');
		*/
		
		settingDB();
		
		this.views.viewport = new this.views.Viewport();
		app.myMask = new Ext.LoadMask(Ext.getBody(), {msg: 'Loading'});	
		var settingStore = Ext.getStore('mySettingStore');			
		settingStore.load();
		if (!settingStore.first()) {			
			firstTimeDatabaseSetting();
			settingStore.getProxy().clear();
			settingStore.add(app.mySettingVO.data);
			settingStore.sync();
			
			/*
			var proxy = app.stores.userStore.getProxy();
			
			proxy.insertUser({
				data : {
					entryname : '나미남',
					entrysex : '2'
				},			
				successCallback : function(operation) {		
					printLog("store.create successCallback");	
					increaseUserCount('2');
					window.location.reload();
			    },
				failureCallback : function(operation) {		
					printLog("store.create failureCallback");		
			    }
			});
			*/
			
			
		} else {					
			setUserDataToLocal(settingStore.first().data);				
		}		
		
		if (!app.views.tabbarView) {
			Ext.apply(app.views, {
				tabbarView : new app.views.TabbarView()
			});
			app.views.viewport.add(app.views.tabbarView);
		}
		app.views.viewport.setActiveItem(app.views.tabbarView);
		
	}
});

app.views.Viewport = Ext.extend(Ext.Panel, 
{
	id : 'viewport',	
	layout : 'card',
	fullscreen : true,
	listeners: {        
        afterlayout : function(){
            //writeLog("viewport afterlayout");
        },        
        beforeadd : function(){
        	//writeLog("viewport beforeadd");
        }       
    },
	initComponent : function() 
	{		
		app.views.Viewport.superclass.initComponent.apply(this, arguments);	    
	}

});
