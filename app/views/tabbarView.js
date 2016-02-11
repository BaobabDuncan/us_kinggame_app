app.views.TabbarView = Ext.extend(Ext.TabPanel, {
	id : 'tabbarView',	
	fullscreen : true,
	
	tabBar : {
		ui : 'dark',
		dock : 'bottom',
		layout : {
			pack : 'center'
		}
	},

	cardSwitchAnimation : false,
	
	items : [{
		title : lang.TabTitle.KingGame,		
		cls : 'card0',
		iconCls: 'team',
		xtype : 'kinggmae_view',
		viewType : 0
	},{
		title : lang.TabTitle.ServerPenalty,
		cls : 'card5',
		iconCls: 'favorites',
		xtype : 'server_penalty_view',
		viewType : 5
	},{
		title : lang.TabTitle.UserPenalty,
		cls : 'card3',
		iconCls: 'bookmarks',
		xtype : 'user_penalty_view',
		viewType : 3
	},{
		title : lang.TabTitle.User,		
		cls : 'card1',
		iconCls: 'user',	
		xtype : 'user_list_view',
		viewType : 1
	},{
		title : lang.TabTitle.Setting,
		cls : 'card4',
		iconCls: 'settings',
		xtype : 'setting_view',
		viewType : 4
	}],
	
	initComponent : function() {		
		this.on('cardswitch', this.handleCardSwitch, this);
		app.views.TabbarView.superclass.initComponent.apply(this, arguments);
	},
	
	handleCardSwitch : function(container, newCard, oldCard, index, animated) {		
		printLog('tab changed ' + index);
		//printLog(newCard);		
		newCard.refleshTab();
	}
	
 });