function DBHandler(aOption)
{
	var self = this;
	
	this.databaseOption = aOption;
	this.database = null;
	this.name = 'DBHandler';
	
	DBHandler.prototype.connectDB = function(){	
		try{
			self.database = openDatabase(
				self.databaseOption.fileName,
				self.databaseOption.version,
				self.databaseOption.displayName,
				self.databaseOption.maxSize
			);
		}
		catch(e){
			
		}
	};
	DBHandler.prototype.nullDataHandler = function(transaction, resultSet) {
		console.info('nullDataHandler');
	};
	DBHandler.prototype.nullDataHandler = function(transaction, resultSet) {
		console.info('nullDataHandler');
	};
	DBHandler.prototype.handleError = function(transaction, resultSet){
		console.info('handleError');
	};	
	DBHandler.prototype.openSQL = function(aSql,dataHandler,errorHandler){		
		self.database.transaction(
			function (transaction){
				transaction.executeSql(aSql,[],dataHandler,errorHandler);
			}
		);
	};
	DBHandler.prototype.accSQL = function(aSql,dataHandler,errorHandler){			
		self.database.transaction(
			function (transaction){
				transaction.executeSql(aSql,[],dataHandler,dataHandler);
			}
		);
	};
	
	DBHandler.prototype.execSQLCommand = function(aSql, onSuccess, onFailure){		
		self.database.transaction(
			function(transaction){
				transaction.executeSql(aSql, [], onSuccess, onFailure);
			}
		);
	};
	
	DBHandler.prototype.execSQL = function(aSql) {
		self.execSQLCommand(aSql, self.nullDataHandler, self.nullErrorHandler);
	};

	
	DBHandler.prototype.dropTable = function(table_name) {		
		var sql1 = 'DROP TABLE '+table_name;		
		self.execSQL(sql1,self.nullDataHandler,self.nullErrorHandler);
	};
	
	DBHandler.prototype.createUserTable = function() {
		try{
			var sSql = 'CREATE TABLE IF NOT EXISTS user'+
				'(user_id INTEGER PRIMARY KEY, '+
				' name TEXT DEFAULT "", '+
				' sex INTEGER DEFAULT "");';								
			self.execSQL(sSql);
		}
		catch(err){
			console.info('DBHandler.prototype.createUserTable = '+err.message);
		}
	};	
	
	DBHandler.prototype.createPenalTable = function() {
		try{
			var sSql = 'CREATE TABLE IF NOT EXISTS penal'+
				'(penal_id INTEGER PRIMARY KEY, '+		
				' uuid TEXT DEFAULT "", '+
				' detail TEXT DEFAULT "" );';								
			self.execSQL(sSql);
		}
		catch(err){
			console.info('DBHandler.prototype.createPenalTable = '+err.message);
		}
	};	
	
}