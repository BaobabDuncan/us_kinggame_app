/**
 * 
 */

app.models.Utils = Ext.extend(Ext.util.Observable, {
	parseUser : function(Items){
		printLog("parseUser");
		var records = new Array();
		if(!Items) return records;
		for ( var index = 0; index < Items.length; index++) 
		{		
			var user = Items.item(index);			
			var voUser = Ext.ModelMgr.create({
				id:user.user_id,
				name : user.name,
				sex : user.sex													
			}, 'app.models.UserVO');		
			records.push(voUser);			
		}		
		return records;
	},
	
	parsePenalty : function(Items)
	{
		printLog("parsePenalty");
		var records = new Array();
		if(!Items) return records;
		
		for (var index=0; index < Items.length; index++){			
			var penalty = Items.item(index);		
			
			var voPenalty = Ext.ModelMgr.create({
				id : penalty.penal_id,
				uuid : penalty.uuid,
				detail : penalty.detail													
			}, 'app.models.PenaltyVO');		
			records.push(voPenalty);			
		}	
		
		return records;
	}
	
});
