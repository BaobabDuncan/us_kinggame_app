Ext.data.ProxyMgr.registerType("pxyUser", Ext.extend(Ext.data.Proxy, {	
	
	
	create : function(operation, callback, scope) 
	{
		printLog("create");
	},

	read : function(operation, callback, scope) 
	{
		printLog("read");
		var preCallback = callback;
		var me = this;	
		var records = new Array();	
		var store = Ext.getStore('userStore');	
		var data = this.extraParams.data;		
		var proxyUtils = new app.models.Utils();
				
		var records = proxyUtils.parseUser(data.rows);	
		
		operation.setSuccessful();		
		store.data.clear();					
		store.sync();	
		operation.records = records;		
		preCallback.call(scope || me, operation);
	},
	
	update : function(operation, callback, scope) 
	{
		
	},
	destroy : function(operation, callback, scope) {
		
	},
	insertUser : function(options){
		printLog("insertUser");
		app.myMask.show();			
		var me = this;			
		var succCallback = options.successCallback;
		var failCallback = options.failureCallback;
		var data = options.data;
		
		myDBHandler.database.transaction(function (tx) {			
			tx.executeSql('INSERT INTO user (name,sex) VALUES (?,?)',
			[data.entryname,data.entrysex],
			function(trans, results){	
				succCallback.call(options.scope || me, results);						
			}, function(trans, results){
				failCallback.call(options.scope || me, results);
			});
		});		
	},
	selectUser : function(options){
		printLog("selectUser");		
		var me = this;			
		var callback = options.callback;
		
		myDBHandler.database.transaction(function (tx) {
			var sql = 'select * from user ORDER BY -user_id LIMIT '+MAX_USER_COUNT+'';
			tx.executeSql(sql,[], function(transaction, results)  {                         
				callback(results);
			}, self.handleError);
		});
	},
	deleteUser : function(options){
		printLog("selectUser");
		app.myMask.show();	
		
		var me = this;			
		var callback = options.callback;
		var userData = options.userData;		
		
		myDBHandler.database.transaction(function (tx) {			
			var sql = 'DELETE FROM user WHERE user_id = '+userData.data.id+'';
			tx.executeSql(sql,[], function(transaction, results)  {                         
				callback(userData);
			}, self.handleError);
		}); 
		
	}
}));

app.models.UserVO = Ext.regModel('app.models.UserVO',{
    idProperty : 'id',
    fields : [{
            name : 'id',
            type : 'integer'
    },{
            name : 'name'
    },{
    		name : 'sex',
    		type : 'integer'
    }]
});


app.stores.userStore = new Ext.data.Store({
	id:'userStore',
	model : 'app.models.UserVO',
	pageSize : 20,
	autoload : false,	
	proxy : {
		type : 'pxyUser',
		id:'pxyUserStorage'
	}	
});


app.stores.gameUserStore = new Ext.data.Store({
	id:'gameUserStore',
	model : 'app.models.UserVO',
	pageSize : 20,
	autoload : false,	
	proxy : {
		type : 'pxyUser',
		id:'pxyUserStorage'
	}	
});


Ext.data.ProxyMgr.registerType("pxyPenalty", Ext.extend(Ext.data.Proxy, {	
	
	
	create : function(operation, callback, scope) 
	{
		printLog("create");
	},

	read : function(operation, callback, scope) 
	{
		printLog("read");		
		var preCallback = callback;
		var me = this;	
		var records = new Array();	
		var store = Ext.getStore('penaltyStore');	
		var data = this.extraParams.data;		
		
		var proxyUtils = new app.models.Utils();
		
		var records = proxyUtils.parsePenalty(data.rows);	
		
		operation.setSuccessful();		
		store.data.clear();					
		store.sync();	
		operation.records = records;		
		preCallback.call(scope || me, operation);
	},
	
	update : function(operation, callback, scope) 
	{
		printLog("update");	
	},
	destroy : function(operation, callback, scope) {
		printLog("destroy");	
	},
	insertPenal : function(options){
		printLog("insertPenal");
		
		app.myMask.show();			
		var me = this;			
		var succCallback = options.successCallback;
		var failCallback = options.failureCallback;
		var data = options.data;
		
		myDBHandler.database.transaction(function (tx) {			
			tx.executeSql('INSERT INTO penal (uuid,detail) VALUES (?,?)',
			[data.uuid,data.penalty],
			function(trans, results){	
				succCallback.call(options.scope || me, results);						
			}, function(trans, results){
				failCallback.call(options.scope || me, results);
			});
		});	
		
	},
	selectPenal : function(options){
		printLog("selectPenal");
		//app.myMask.show();			
		var me = this;			
		var callback = options.callback;
		
		myDBHandler.database.transaction(function (tx) {
			var sql = 'select * from penal ORDER BY -penal_id LIMIT '+MAX_PENALTY_COUNT+'';
			tx.executeSql(sql,[], function(transaction, results)  {                         
				callback(results);
			}, self.handleError);
		});
	},
	deletePenalty : function(options){
		printLog("deletePenalty");
		app.myMask.show();	
		
		var me = this;			
		var callback = options.callback;
		var penaltyData = options.penaltyData;		
		
		myDBHandler.database.transaction(function (tx) {			
			var sql = 'DELETE FROM penal WHERE penal_id = '+penaltyData.data.id+'';
			tx.executeSql(sql,[], function(transaction, results)  {                         
				callback(penaltyData);
			}, self.handleError);
		}); 
		
	},
	sendPenaltyToServer : function(options){
		printLog("sendPenaltyToServer");
		
		var me = this;			
		var callback = options.callback;
		var penalty_detail = options.data.penalty_detail;
				
		var sendData = {
			detail : penalty_detail,
			lang_type : newLang,
			type : 'user'
		};			
		
		Ext.Ajax.request({ 
			cache : true,
			method: 'POST',			
			url: SERVER_URL+'kinggame/api/sendPenalty/',
			params : sendData,
			//timeout: 50,
			success: function(response){	
				printLog("success");							
			},			
			failure : function(response){	                        
				printLog("failure");			
			}		
		});
		
	},
	sendChoicePenaltyToServer : function(options){
		printLog("sendChoicePenaltyToServer");
		
		var me = this;			
		var callback = options.callback;
		var penalty_uuid = options.data.penalty_uuid;
		//dbc163f92b9742c09c537e7e9a6737
		var sendData = {
			penalty_id : penalty_uuid
		};			
		printLog(sendData)
		Ext.Ajax.request({ 
			cache : true,
			method: 'POST',			
			url: SERVER_URL+'kinggame/api/choicePenalty/',
			params : sendData,
			//timeout: 50,
			success: function(response){	
				printLog("success");	
				printLog(response)
			},			
			failure : function(response){	                        
				printLog("failure");			
			}		
		});
		
	}
}));


app.models.PenaltyVO = Ext.regModel('app.models.PenaltyVO',{
    idProperty : 'id',
    fields : [{
            name : 'id',
            type : 'integer'
    },{
    		name : 'uuid'
    },{
            name : 'detail'
    }]
});


app.stores.penaltyStore = new Ext.data.Store({
	id:'penaltyStore',
	model : 'app.models.PenaltyVO',
	pageSize : 20,
	autoload : false,	
	proxy : {
		type : 'pxyPenalty',
		id:'pxyPenaltyStorage'
	}	
});

app.stores.gamePenaltyStore = new Ext.data.Store({
	id:'gamePenaltyStore',
	model : 'app.models.PenaltyVO',
	pageSize : 20,
	autoload : false,	
	proxy : {
		type : 'pxyPenalty',
		id:'pxyPenaltyStorage'
	}	
});


Ext.data.ProxyMgr.registerType("pxyTopPenalty", Ext.extend(Ext.data.Proxy, {	
	
	
	create : function(operation, callback, scope) 
	{
		printLog("create");
	},

	read : function(operation, callback, scope) 
	{
		printLog("read");		
		var preCallback = callback;
		var me=this;
		var store = Ext.getStore('topPenaltyStore');
		var records = new Array();	
		var iStoreCount = store.getCount();		
		var sendData = {
				type : newLang
		};	
		
		var next = null;		
		if (iStoreCount>0) {			
			next = store.last().get('uuid');			
			sendData.next = next;
		}		
		
		Ext.Ajax.request({ 
			cache : true,
			method: 'GET',			
			url: SERVER_URL+'kinggame/api/getPenalty/',
			params : sendData,
			//timeout: 50,
			success: function(response){	
				
				var data = StringToJSON(response.responseText);				
					
				if (data.api_header.status != 'True') {											
					
				}
				else{						
					operation.setSuccessful();		
					
					if (iStoreCount>0) {								
						var newRecords = new Array();
						store.each(function(obj) {							
							newRecords.push(obj);
						});
						
						if(data.messages.length > 0) {
							
							for(var index = 0; index < data.messages.length;index++) {
								
								var aItem = data.messages[index];	
								
								var voItem = Ext.ModelMgr.create({									
									uuid : aItem.uuid,
									update_at : aItem.update_at,
									detail : aItem.detail,
									download_count : aItem.download_count											
								}, 'app.models.TopPenaltyVO');	
								
								newRecords.push(voItem);
							}
						}
						
						records = newRecords;
						delete newRecords;
					}	
					else{
						for ( var index = 0; index < data.messages.length; index++) 
						{						
							var aItem = data.messages[index];									
							var voItem = Ext.ModelMgr.create({
								uuid : aItem.uuid,
								update_at : aItem.update_at,
								detail : aItem.detail,
								download_count : aItem.download_count									
							}, 'app.models.TopPenaltyVO');					
							records.push(voItem);
						}
					}
							
				}
				
				store.data.clear();					
				store.sync();	
				operation.records = records;					
				preCallback.call(scope || me, operation);
			},			
			failure : function(response){	                        
				console.log("failure");
				operation.setSuccessful();				
				store.data.clear();					
				store.sync();	
				operation.records = records;					
				preCallback.call(scope || me, operation);
			}		
		});
	},
	
	update : function(operation, callback, scope) 
	{
		printLog("update");	
	},
	destroy : function(operation, callback, scope) {
		printLog("destroy");	
	}
}));

app.models.TopPenaltyVO = Ext.regModel('app.models.TopPenaltyVO',{
    idProperty : 'id',
    fields : [{
            name : 'uuid'           
    },{
    		name : 'detail'
    },{
            name : 'update_at'
    },{
    		name : 'download_count'
    }]
});

app.stores.topPenaltyStore = new Ext.data.Store({
	id:'topPenaltyStore',
	model : 'app.models.TopPenaltyVO',
	pageSize : 20,
	autoload : false,	
	proxy : {
		type : 'pxyTopPenalty',
		id:'pxyTopPenaltyStorage'
	}	
});




app.models.SettingVO = Ext.regModel('app.models.SettingVO',{
    idProperty : 'id',
    fields : [{
            name : 'id',
            type : 'integer'
    },{
	        name : 'phone_gap',
	        type : 'boolean'
    },{
            name : 'same_status',
            type : 'boolean'
    },{
    		name : 'sex_status',
    		type : 'boolean'
    },{
			name : 'man_user_count',
			type : 'integer'
    },{
			name : 'woman_user_count',
			type : 'integer'
    },{
			name : 'penalty_count',
			type : 'integer'
    }]
});
Ext.regStore('mySettingStore', {
    model : 'app.models.SettingVO', 
    sorters : [ {
            property : 'id',
            direction : 'DESC'
    } ],
    proxy : {
            type : 'localstorage',
            id : 'myKGSetting-localstore'
    },
    autoLoad:true
});


