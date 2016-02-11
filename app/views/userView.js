app.views.userList = Ext.extend(Ext.Panel, {
	id : 'userList',
	fullscreen : true,
	layout : 'card',		
	initComponent : function() {
		printLog("===userList initComponent===");	
		var me = this;
		this.entryListPanel = new Ext.List({
			id : 'entryList',
			allowDeselect: false,
			activeCls: 'user-item-active',
			store : app.stores.userStore,			
			itemTpl : new Ext.XTemplate('<div class="user-item">',
			'<img id="sexImg" src="{sex:this.sexImgUrl}">{name}',
			'<div class="action delete x-button">Delete</div></div>',
			{
				sexImgUrl : function(value){
					if(value==1){
						return './resources/images/man.png'
					}
					else{
						return './resources/images/woman.png'
					}
				}
		    		
			}),
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
				title : lang.MainTitle.Entry,
				items : [{
					xtype : 'spacer'
				},{					
					ui : 'action',
					text : lang.Add,					
					handler : function() {
						printLog("Show User View");						
						var childCard = new app.views.addUser({					
							prevCard : me
						});		
						app.views.viewport.add(childCard);
						app.views.viewport.setActiveItem(childCard,{type: 'slide', direction: 'down'});
					}
				}]
			}],
			items : [this.entryListPanel]
		});
		this.items = [this.mainPanel];
		
		this.mainPanel.on('afterrender', this.loadMainPanel, this);
		app.views.userList.superclass.initComponent.apply(this, arguments);		
	},
	loadMainPanel : function(){
		printLog("userList loadMainPanel");
		var me = this;		
		//me.refleshTab();
	},
	refleshTab : function() {
		var me = this;
		me.selectUserHandler();
	},
	selectUserHandler : function(){
		printLog("userList selectUserHandler");
		app.myMask.show();			
		var proxy = app.stores.userStore.getProxy();
		var store = Ext.getStore('userStore');
		store.removeAll();		
		proxy.selectUser({
			callback : function(operation) {		
				printLog("store.selectUser callback");			
				
				store.proxy.extraParams={data:operation};
				store.load({
					data : operation,
					callback: function(operation) {							
						printLog("app.stores.userStore.load callback");
						setTimeout(function() {							
							Ext.getCmp('entryList').scroller.scrollTo({ y : 0 }, true);			
						}, 1);
				    }
				});
				app.myMask.hide();				
		    }			
		});
	},
	onItemtapAction: function(list, index, item, e) {
		var me = this;
		if (e.getTarget('.user-item-active div.delete')) {
			printLog('click delete');
			var store    = list.store,
            selModel = list.getSelectionModel(),
            instance = store.getAt(index),
            selected = selModel.isSelected(instance),
            nearest  = store.getAt(index + 1) || store.getAt(index - 1);
			
			
			
			var proxy = store.getProxy();
			
			
			var userSex = store.getAt(index).data.sex;
			
			proxy.deleteUser({
				userData : instance,
				callback : function(operation) {		
					printLog("store.deleteUser callback");					
					if (selected && nearest) {
		                selModel.select(nearest);
		            }
		            store.removeAt(index);
		            store.sync();		           
		            decreaseUserCount(userSex);
		            app.myMask.hide();	
			    }			
			});       
            
        } else {
            me.deactivateAll();            
            
        }
	},
	onItemSwipe: function(list, index, item, e) {
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
    	Ext.select('div.user-item', this.el.dom).removeCls(Ext.getCmp('entryList').activeCls);
    }
});
Ext.reg('user_list_view', app.views.userList);

Ext.regModel('SexModel', {
    fields: [
        {name: 'value',     type: 'integer'},
        {name: 'title',    type: 'string'}
    ]
 });

var sexStore = new Ext.data.JsonStore({
    data : [
         { value : 1,  title : 'Man'},
         { value : 2, title : 'Woman'}
    ],
    model : 'SexModel'
    //autoLoad : true,
    //autoDestroy : true
 });

app.views.addUser = Ext.extend(Ext.Panel,{
	id : 'addUser',
	layout : 'card',
	prevCard : null,
	initComponent : function() {
		printLog("===addUser initComponent===");	
		var me = this;
		
		this.userInputPanle = new Ext.form.FormPanel({	
			items : [{
                xtype: 'fieldset',
                title: lang.PersonalInfo,   
                defaults: {
                    required: true,
                    labelAlign: 'left',
                    labelWidth: '50%'
                },   
                items: [{
					xtype : 'textfield',					
					name : 'name',
					id : 'entryname-textfield',
					label: lang.EntryName,
					maxLength : 10,					
					useClearIcon : true,					
					required : true
                },{                
                    xtype: 'selectfield',
                    name : 'sex',
                    id : 'entrysex-textfield',
                    label: lang.Sex,
                    valueField : 'value',
                    displayField : 'title',
                    store : sexStore

                }]
            }]
		});
		
		this.mainPanel = new Ext.Panel({
			layout : 'fit',
			dockedItems : [ {
				xtype : 'toolbar',
				title : lang.AddUser,
				items : [ {
					ui : 'back',
					text : lang.Back,
					scope : this,
					handler : function() {
						printLog("addUser Back handler");						
						app.views.viewport.setActiveItem(app.views.tabbarView,{type: 'slide', direction: 'up'});						
						me.prevCard.selectUserHandler();
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
						me.addUserHandler();
					}
				}]
			}],
			items : [this.userInputPanle]
		});
		this.items = [this.mainPanel];
		
		this.mainPanel.on('afterrender', this.loadMainPanel, this);
		app.views.addUser.superclass.initComponent.apply(this, arguments);
	},
	loadMainPanel : function() {
		printLog("===addUser loadMainPanel===");		
		var me = this;		
	},
	addUserHandler : function(){
		var me = this;
		var entryname = Ext.getCmp('entryname-textfield').getValue();
		var entrysex = Ext.getCmp('entrysex-textfield').getValue();
		var proxy = app.stores.userStore.getProxy();
		
		if (entryname.length > 10){
			Ext.Msg.alert(lang.Alert,lang.AddUserNameMax,function(){				
			}).doComponentLayout();	
			return false;
		}
		
		if (entryname.length < MIN_USER_LENGTH){
			Ext.Msg.alert(lang.Alert,lang.AddUserName,function(){				
			}).doComponentLayout();	
			return false;
		};	
		
		if (!checkUserCount()){
			Ext.Msg.alert(lang.Alert,lang.AddUserLimit,function(){				
			}).doComponentLayout();	
			return false;
		}
		
		proxy.insertUser({
			data : {
				entryname : entryname,
				entrysex : entrysex
			},			
			successCallback : function(operation) {		
				printLog("store.create successCallback");	
				app.myMask.hide();
				Ext.Msg.alert(lang.Alert,lang.AddUserSuccess,function(){				
					me.initializationTextField();
				}).doComponentLayout();	
				increaseUserCount(entrysex);
		    },
			failureCallback : function(operation) {		
				printLog("store.create failureCallback");		
				app.myMask.hide();
				Ext.Msg.alert(lang.Alert,lang.AddUserFailure,function(){				
				}).doComponentLayout();	
		    }
		});
		
	},
	initializationTextField : function(){
		printLog('initializationTextField');
		Ext.getCmp('entryname-textfield').setValue('');
	}
	
});