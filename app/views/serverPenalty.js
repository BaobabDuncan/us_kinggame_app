/**
 * 
 */



app.views.serverPenaltyList = Ext.extend(Ext.Panel, {
	id : 'serverPenaltyList',
	fullscreen : true,
	layout : 'card',		
	initComponent : function() {
		printLog("===serverPenaltyList initComponent===");	
		var me = this;
		
		this.TopPenaltyListPanel = new Ext.List({
			id : 'TopPenaltyListPanel',
			allowDeselect: false,
			activeCls: 'penalty-item-active',
			store : app.stores.topPenaltyStore,			
			itemTpl : new Ext.XTemplate('<div class="penalty-item">',
			'{detail}<span class="download-count"> '+lang.DownlaodCount+' {download_count}</span>',
			'<div class="action add x-button">'+lang.AddPenalty+'</div></div>'
			),
			plugins : [ {
				ptype : 'listpaging',
				autoPaging : false
			}],
			listeners: {
                scope: this,
                itemtap: this.onItemtapAction,
                itemswipe: this.onItemSwipe
            }
		});
		
		this.mainPanel = new Ext.Panel({
			layout : 'fit',
			dockedItems : [ {
				xtype : 'toolbar',
				title : lang.MainTitle.ServerPenalty				
			}],
			items : [this.TopPenaltyListPanel]
		});
		this.items = [this.mainPanel];
		
		this.mainPanel.on('afterrender', this.loadMainPanel, this);
		app.views.serverPenaltyList.superclass.initComponent.apply(this, arguments);		
	},
	loadMainPanel : function(){
		printLog("serverPenaltyList loadMainPanel");		
		var me = this;
		//me.refleshTab();
		
	},
	refleshTab : function() {
		var me = this;
		me.loadServerPenalHandler();
	},
	loadServerPenalHandler : function(){
		printLog("serverPenaltyList loadServerPenalHandler");
		var me = this;
		var store = Ext.getStore('topPenaltyStore');
			
		store.removeAll();		
		store.currentPage = 1;		
		store.proxy.extraParams={};				
		store.load({
			callback: function(operation) {		
				setTimeout(function() {
					
					Ext.getCmp('TopPenaltyListPanel').scroller.scrollTo({ y : 0 }, true);			
				}, 1);	
									
		    }
		});
	},
	onItemtapAction: function(list, index, item, e) {
		printLog("serverPenaltyList onItemtapAction");	
		var me = this;
		if (e.getTarget('.penalty-item-active div.add')) {
			printLog('click add');
			
			if (!checkPenaltyCount()){
				Ext.Msg.alert(lang.Alert,lang.AddPenaltyLimit,function(){				
				}).doComponentLayout();	
				return false
			}
			
			
			var store    = list.store,
            selModel = list.getSelectionModel(),
            instance = store.getAt(index),
            selected = selModel.isSelected(instance),
            nearest  = store.getAt(index + 1) || store.getAt(index - 1);
			
			//store.removeAt(index);
            //store.sync();
			
            //app.stores.topPenaltyStore.sync();
			me.addUserPenalty(instance.data,index,store)
			/*var proxy = store.getProxy();
			
			proxy.deletePenalty({
				penaltyData : instance,
				callback : function(operation) {		
					printLog("store.deletePenalty callback");					
					if (selected && nearest) {
		                selModel.select(nearest);
		            }
		            store.removeAt(index);
		            store.sync();
		            app.myMask.hide();			            
			    }			
			});       */
            
        } else {
            me.deactivateAll();            
            
        }
	},
	onItemSwipe: function(list, index, item, e) {
		printLog("serverPenaltyList onItemSwipe");		
		var me = this;
		var el = Ext.get(item), activeCls = list.activeCls, hasClass = el.hasCls(activeCls);
		
		me.deactivateAll();
		if (hasClass) {
            el.removeCls(activeCls);
        } else {
            el.addCls(activeCls);
        }
	},
	deactivateAll: function() {        
		printLog("serverPenaltyList deactivateAll");
		Ext.select('div.penalty-item', this.el.dom).removeCls(Ext.getCmp('TopPenaltyListPanel').activeCls);
    },
    addUserPenalty : function(oPenalty,index,store){
    	printLog("addUserPenalty");
    	var me = this;
    	var proxy = app.stores.penaltyStore.getProxy();
    	
		proxy.insertPenal({
			data : {
				penalty : oPenalty.detail,
				uuid : oPenalty.uuid
			},			
			successCallback : function(operation) {		
				printLog("store.insertPenal successCallback");	
				app.myMask.hide();
				Ext.Msg.alert(lang.Alert,lang.AddPenalSuccess,function(){				
				}).doComponentLayout();	
				increasePenaltyCount();
				store.removeAt(index);
	            store.sync();
				me.sendChoicePenaltyToServer(oPenalty);
		    },
			failureCallback : function(operation) {		
				printLog("store.insertPenal failureCallback");		
				app.myMask.hide();
				Ext.Msg.alert(lang.Alert,lang.AddPenalFailure,function(){				
				}).doComponentLayout();	
		    }
		});
    },
    sendChoicePenaltyToServer : function(oPenalty){
    	printLog("sendChoicePenaltyToServer");
    	var proxy = app.stores.penaltyStore.getProxy();
    	
    	proxy.sendChoicePenaltyToServer({
			data : {
				penalty_uuid : oPenalty.uuid				
			},			
			callback : function(operation) {		
				printLog("store.sendChoicePenaltyToServer callback");					
		    }
		});
    }
});
Ext.reg('server_penalty_view', app.views.serverPenaltyList);