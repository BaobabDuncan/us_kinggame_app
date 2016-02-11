/**
 * 
 */
 
app.views.userPenaltyList = Ext.extend(Ext.Panel, {
	id : 'userPenaltyList',
	fullscreen : true,
	layout : 'card',		
	initComponent : function() {
		printLog("===userPenaltyList initComponent===");	
		var me = this;
		
		this.penaltyListPanel = new Ext.List({
			id : 'penaltyList',
			allowDeselect: false,
			activeCls: 'penalty-item-active',
			store : app.stores.penaltyStore,			
			itemTpl : new Ext.XTemplate('<div class="penalty-item">',
			'{detail}',
			'<div class="action delete x-button">Delete</div></div>'
			),
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
				title : lang.MainTitle.Penalty,
				items : [{
					xtype : 'spacer'
				},{					
					ui : 'action',
					text : lang.Add,					
					handler : function() {
						printLog("Show Penalty View");						
						var childCard = new app.views.addPenalty({					
							prevCard : me
						});		
						app.views.viewport.add(childCard);
						app.views.viewport.setActiveItem(childCard,{type: 'slide', direction: 'down'});
					}
				}]
			}],
			items : [this.penaltyListPanel]
		});
		this.items = [this.mainPanel];
		
		this.mainPanel.on('afterrender', this.loadMainPanel, this);
		app.views.userPenaltyList.superclass.initComponent.apply(this, arguments);		
	},
	loadMainPanel : function(){
		printLog("userPenaltyList loadMainPanel");		
		var me = this;	
		//me.refleshTab();
	},
	refleshTab : function() {
		var me = this;
		me.selectPenalHandler();
	},
	selectPenalHandler : function(){
		printLog("userPenaltyList selectPenalHandler");		
		app.myMask.show();			
		var proxy = app.stores.penaltyStore.getProxy();
		var store = Ext.getStore('penaltyStore');
		store.removeAll();		
		proxy.selectPenal({
			callback : function(operation) {		
				printLog("store.selectPenal callback");					
				store.proxy.extraParams={data:operation};
				store.load({
					data : operation,
					callback: function(operation) {							
						printLog("app.stores.penaltyStore.load callback");
						setTimeout(function() {							
							Ext.getCmp('penaltyList').scroller.scrollTo({ y : 0 }, true);			
						}, 1);
				    }
				});
				app.myMask.hide();				
		    }			
		});
	},
	onItemtapAction: function(list, index, item, e) {
		printLog("userPenaltyList onItemtapAction");
		var me = this;
		if (e.getTarget('.penalty-item-active div.delete')) {
			printLog('click delete');
			
			var store    = list.store,
            selModel = list.getSelectionModel(),
            instance = store.getAt(index),
            selected = selModel.isSelected(instance),
            nearest  = store.getAt(index + 1) || store.getAt(index - 1);
			
			var proxy = store.getProxy();
			
			proxy.deletePenalty({
				penaltyData : instance,
				callback : function(operation) {		
					printLog("store.deletePenalty callback");					
					if (selected && nearest) {
		                selModel.select(nearest);
		            }
		            store.removeAt(index);
		            store.sync();
		            decreasePenaltyCount();
		            app.myMask.hide();			            
			    }			
			});       
            
        } else {
            me.deactivateAll();            
            
        }
	},
	onItemSwipe: function(list, index, item, e) {
		printLog("userPenaltyList onItemSwipe");
		var me = this;
		var el = Ext.get(item), activeCls = list.activeCls, hasClass = el.hasCls(activeCls);
		console.log(hasClass);
		me.deactivateAll();
		if (hasClass) {
            el.removeCls(activeCls);
        } else {
            el.addCls(activeCls);
        }
	},
	deactivateAll: function() {        
		printLog("userPenaltyList deactivateAll");
		Ext.select('div.penalty-item', this.el.dom).removeCls(Ext.getCmp('penaltyList').activeCls);
    }
});
Ext.reg('user_penalty_view', app.views.userPenaltyList);

app.views.addPenalty = Ext.extend(Ext.Panel,{
	id : 'addPenalty',
	layout : 'card',
	prevCard : null,
	initComponent : function() {
		printLog("===addPenalty initComponent===");	
		var me = this;
		
		this.postPenalty = new Ext.Panel({			
			items : [{
				xtype : 'textareafield',
				name : 'penalty',
				id : 'penalty-textfield',
				maxLength : 140,				
				placeHolder : 'penalty'
			}]
		});
		
		this.mainPanel = new Ext.Panel({
			layout : 'fit',
			dockedItems : [ {
				xtype : 'toolbar',
				title : lang.AddUserPenalty,
				items : [ {
					ui : 'back',
					text : lang.Back,
					scope : this,
					handler : function() {
						printLog("addUser Back handler");									
						app.views.viewport.setActiveItem(app.views.tabbarView,{type: 'slide', direction: 'up'});						
						me.prevCard.selectPenalHandler();
						app.views.viewport.remove(me);
						me.destroy();							
					}
				}, {
					xtype : 'spacer'
				},{					
					ui : 'action',
					text : lang.Add,					
					handler : function() {
						printLog("Add User handler");						
						me.addUserPenaltyHandler();
					}
				}]
			}],
			items : [this.postPenalty]
		});
		this.items = [this.mainPanel];
		
		this.mainPanel.on('afterrender', this.loadMainPanel, this);
		app.views.addPenalty.superclass.initComponent.apply(this, arguments);
	},
	loadMainPanel : function() {
		printLog("===addPenalty loadMainPanel===");		
		var me = this;		
	},
	addUserPenaltyHandler : function() {
		printLog("===addPenalty addUserPenaltyHandler===");	
		var me = this;
		var penalty = Ext.getCmp('penalty-textfield').getValue();		
		
		if (penalty.length > 140){
			Ext.Msg.alert(lang.Alert,lang.AddPenaltyLenthMax,function(){				
			}).doComponentLayout();	
			return false;
		}
		
		if (penalty.length < 4){
			Ext.Msg.alert(lang.Alert,lang.AddPenaltyLenth,function(){				
			}).doComponentLayout();	
			return false;
		};	
		/*
		if (!checkPenaltyCount()){
			Ext.Msg.alert(lang.Alert,lang.AddPenaltyLimit,function(){				
			}).doComponentLayout();	
			return false;
		}*/
		
		
		var proxy = app.stores.penaltyStore.getProxy();
		
		proxy.insertPenal({
			data : {
				penalty : penalty,
				uuid : 'user_uuid'
			},			
			successCallback : function(operation) {		
				printLog("store.create successCallback");	
				app.myMask.hide();
				Ext.Msg.alert(lang.Alert,lang.AddPenalSuccess,function(){	
					me.initializationTextField();
				}).doComponentLayout();	
				increasePenaltyCount();
				me.sendPenaltyToServer(penalty);
		    },
			failureCallback : function(operation) {		
				printLog("store.create failureCallback");		
				app.myMask.hide();
				Ext.Msg.alert(lang.Alert,lang.AddPenalFailure,function(){				
				}).doComponentLayout();	
		    }
		});
		
	},
    sendPenaltyToServer : function(penalty) {
    	printLog("sendPenaltyToServer");
    	var proxy = app.stores.penaltyStore.getProxy();
    	
    	proxy.sendPenaltyToServer({
			data : {
				penalty_detail : penalty				
			},			
			callback : function(operation) {		
				printLog("store.sendPenaltyToServer callback");					
		    }
		});
    	
    },
    initializationTextField : function(){
    	printLog("initializationTextField");
    	Ext.getCmp('penalty-textfield').setValue('');
    }

	
});


