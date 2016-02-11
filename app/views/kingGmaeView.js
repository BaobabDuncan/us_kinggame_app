/**
 * 
 */


app.views.kinggmaemain = Ext.extend(Ext.Panel, {
	id : 'kinggmaemain',
	fullscreen : true,
	layout : 'card',	
	kingGameData : null,
	
	initComponent : function() {
		printLog("===kinggmaemain initComponent===");		
		var me = this;
		this.kinggmaeDataFormPanel = new Ext.form.FormPanel({	
			
			items : [{
                xtype: 'fieldset',
                title: lang.KimgGameSetting,
                defaults: {                    
                    labelAlign: 'left',
                    labelWidth: '50%'
                },                         
                items: [{
    				xtype : 'textfield',	    				
    				label: lang.PenaltyCount,
    				id : 'PenaltyCount-textfield',
    				//value : (app.mySettingVO.data.penalty_count == 0) ? '0' : app.mySettingVO.data.penalty_count,
    				listeners: {
                        afterrender: function(ele){
                           ele.fieldEl.dom.readOnly = true;
                        }
                   }     
    			},{
    				xtype : 'textfield',	    				
    				label: lang.ManCount,
    				id : 'ManCount-textfield',
    				//value : (app.mySettingVO.data.man_user_count == 0) ? '0' : app.mySettingVO.data.man_user_count,
    				listeners: {
                        afterrender: function(ele){
                           ele.fieldEl.dom.readOnly = true;
                        }
                   }     
    			},{
    				xtype : 'textfield',	    				
    				label: lang.WomanCount,
    				id : 'WomanCount-textfield',
    				//value : (app.mySettingVO.data.woman_user_count == 0) ? '0' : app.mySettingVO.data.woman_user_count,
    				listeners: {
                        afterrender: function(ele){
                           ele.fieldEl.dom.readOnly = true;
                        }
                   }     
    			}]
            },{
            	id : 'kinggmaeCanNotPanel',
            	html : '<div>'+lang.canNotKimgGame+'</div>'
            },{
            	id : 'kinggmaeCanPanel',
            	html : 'Can'
            },{
				xtype : 'button',
				id : 'kinggmaeCanPanel',
                ui  : 'round',
                text: lang.StartGame,
                
                handler : function() {
					printLog("start game handler");		
					app.myMask.show();
					loadScript('./phonegap-1.4.1.js',function(){
						setTimeout(function() {		
							app.myMask.hide();
							var childCard = new app.views.startGame({					
								prevCard : me
							});		
							app.views.viewport.add(childCard);
							app.views.viewport.setActiveItem(childCard,{type: 'slide', direction: 'left'});
						}, 500);
					});					
				}
            }]
		}); 		
		this.mainPanel = new Ext.Panel({
			layout : 'fit',
			dockedItems : [ {
				xtype : 'toolbar',
				title : lang.MainTitle.KinggmaeMain,
				items : [{
					xtype : 'spacer'
				}]
			}],
			items : [this.kinggmaeDataFormPanel]
		});
		this.items = [this.mainPanel];
		
		this.mainPanel.on('afterrender', this.loadMainPanel, this);
		app.views.kinggmaemain.superclass.initComponent.apply(this, arguments);		
	},
	loadMainPanel : function() {
		printLog("===kinggmaemain loadMainPanel===");	
		var me = this;
		me.refleshTab();
	},
	refleshTab : function(){		
		printLog("===kinggmaemain refleshTab===");
		var me = this;
		me.initTextfield();
		
		if(me.checkGameStart()){
			me.selectPenalHandler();
			me.selectUserHandler();
		}
		
	},
	initTextfield : function(){
		printLog("initTextfield");
		Ext.getCmp('PenaltyCount-textfield').setValue((app.mySettingVO.data.penalty_count == 0) ? '0' : app.mySettingVO.data.penalty_count);
		Ext.getCmp('ManCount-textfield').setValue((app.mySettingVO.data.man_user_count == 0) ? '0' : app.mySettingVO.data.man_user_count);
		Ext.getCmp('WomanCount-textfield').setValue((app.mySettingVO.data.woman_user_count == 0) ? '0' : app.mySettingVO.data.woman_user_count);
	},
	checkGameStart : function(){
		
		if ((app.mySettingVO.data.man_user_count==0)||(app.mySettingVO.data.woman_user_count==0)||(app.mySettingVO.data.penalty_count==0)){
			Ext.getCmp('kinggmaeCanNotPanel').show();
			Ext.getCmp('kinggmaeCanPanel').hide();
			return false;
		}
		Ext.getCmp('kinggmaeCanPanel').show();
		Ext.getCmp('kinggmaeCanNotPanel').hide();
		return true;		
	},
	selectPenalHandler : function(){
		printLog("userPenaltyList selectPenalHandler");		
		var proxy = app.stores.penaltyStore.getProxy();
		var store = Ext.getStore('gamePenaltyStore');
		store.removeAll();		
		proxy.selectPenal({
			callback : function(operation) {		
				printLog("store.selectPenal callback");						
				store.proxy.extraParams={data:operation};
				store.load({
					data : operation,
					callback: function(operation) {							
						printLog("app.stores.penaltyStore.load callback");
				    }
				});
				app.myMask.hide();	
				
				printLog(store);
		    }			
		});
	},
	selectUserHandler : function(){
		printLog("userList selectUserHandler");
		var proxy = app.stores.userStore.getProxy();
		var store = Ext.getStore('gameUserStore');
		store.removeAll();		
		proxy.selectUser({
			callback : function(operation) {		
				store.proxy.extraParams={data:operation};
				store.load({
					data : operation,
					callback: function(operation) {							
						printLog("app.stores.userStore.load callback");
				    }
				});
				app.myMask.hide();				
		    
				printLog(store);
		    }			
		});
	}
	
});
Ext.reg('kinggmae_view', app.views.kinggmaemain);

app.views.startGame = Ext.extend(Ext.Panel,{
	id : 'startGame',
	layout : 'card',
	prevCard : null,
	initComponent : function() {
		printLog("===startGame initComponent===");	
		var me = this;
		
		this.kingGmaePanel = new Ext.Panel({
			html : '<div id="kinggmaebody"></div>'
		});
		
		this.mainPanel = new Ext.Panel({
			layout : 'fit',
			dockedItems : [ {
				xtype : 'toolbar',
				title : lang.MainTitle.KinggmaeMain,
				items : [ {
					ui : 'back',
					text : lang.Back,
					scope : this,
					handler : function() {
						printLog("addUser Back handler");									
						app.views.viewport.setActiveItem(app.views.tabbarView,{type: 'slide', direction: 'right'});						
						app.views.viewport.remove(me);
						me.destroy();							
					}
				}, {
					xtype : 'spacer'
				}]
			}],
			items : [this.kingGmaePanel]
		});
		this.items = [this.mainPanel];
		
		this.mainPanel.on('afterrender', this.loadMainPanel, this);
		app.views.startGame.superclass.initComponent.apply(this, arguments);
	},
	loadMainPanel : function() {
		printLog("===startGame loadMainPanel===");				
		var me = this;				
		me.startGame();		
	},
	playSound : function(){
		printLog("playSound");
		if(!DEBUG){
			try{
				var gameSound = new Media('./resources/data/cheer.mp3');
				gameSound.play();
			}
			catch(err){
				return false;
			}
		}
			
			
	},
	startGame : function(){
		printLog("startGame");
		var me = this;
		
		
		$("#kinggmaebody").empty();
		me.initKingGameData();
		
		var html = me.createHtml();
		
		setTimeout(function() {		
			me.playSound()
			$("#kinggmaebody").append($(html));
			$("#box-div div").hide();
			$("#button_div").hide();
			setTimeout(function() {
				$("#box1").show(900,function(){
					$("#box2").slideToggle(1000,function(){
						$("#box3").show(1200,function(){
							$("#button_div").slideDown(500);
						});	
					});
				});						
			}, 300);
			$("#retryBtn").click(function(){
				me.startGame();
			});
		}, 1);
		
		
		
	},
	createHtml : function(){
		printLog("createHtml");
		var me = this;
		printLog(me.kingGameData);
		var html = '';	
		html += '<div id="box-div">';
		if(DEBUG){
			html += '<embed height="1px" width="1px" src="./resources/data/cheer.mp3" />';
		}
		html += '<div id="box1" class="box"><p>'+me.kingGameData[0]+'</p></div>';
		html += '<div id="box2" class="box"><p>'+me.kingGameData[1]+'</p></div>';
		html += '<div id="box3" class="box"><p>'+me.kingGameData[2]+'</p></div>';
		html += '</div>';		
		html += '<div id="button_div"><div id="retryBtn" class="x-button x-button-round">';
		html += '<span class="x-button-label">'+lang.ReStartGame+'</span>';
		html += '</div></div>';
		return html;
		
		//<div id="kinggmaeCanPanel" class="x-button x-button-round"><span class="x-button-label" id="ext-gen1029">게임 시작</span></div>
		
	},
	initKingGameData : function(){
		printLog("initKingGameData");
		var me = this;
		var tempResult = new Array();
		
		
		var penaltyStore = Ext.getStore('gamePenaltyStore');
		var dataToCount = penaltyStore.getCount()- 1;		
		var selectNumber = getRandomFromTo(0,dataToCount);		
		var ranPenalty = penaltyStore.getAt(selectNumber).get('detail');	
		
		
		if(app.mySettingVO.data.sex_status){
			var firstSex = getRandomFromTo(1,2);
			var secondSex = (firstSex==1) ? 2 : 1;
			
			var userStore = Ext.getStore('gameUserStore');
			
			
			userStore.filter({property:'sex',value:firstSex});
			
			var dataToCount = userStore.getCount()- 1;
			var selectNumber = getRandomFromTo(0,dataToCount);
			var ranUser1 = userStore.getAt(selectNumber).get('name');		
			userStore.clearFilter(true);
			
			userStore.filter({property:'sex',value:secondSex});
		
			var dataToCount = userStore.getCount()- 1;
			var selectNumber = getRandomFromTo(0,dataToCount);
			
			var ranUser2 = userStore.getAt(selectNumber).get('name');	
			userStore.clearFilter(true);
			
		}
		else{
			
			var userStore = Ext.getStore('userStore');
			var dataToCount = userStore.getCount()- 1;
			var selectNumber = getRandomFromTo(0,dataToCount);			
			var ranUser1 = userStore.getAt(selectNumber).get('name');			
			var selectNumber = getRandomFromTo(0,dataToCount);
			var ranUser2 = userStore.getAt(selectNumber).get('name');
		}
		
		tempResult.push(ranUser1);
		tempResult.push(ranPenalty);
		tempResult.push(ranUser2);
		
		
		me.kingGameData = tempResult;
		
	}
});
