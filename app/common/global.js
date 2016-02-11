var DEBUG = false;
//var SERVER_URL = 'http://localhost:8080/';
var SERVER_URL = 'http://api-server-1.appspot.com/';
var ADD_PHONEGAP = false;

var MAX_USER_COUNT = 20;
var MAX_PENALTY_COUNT = 40;
var MIN_USER_LENGTH = 3;

var MAN_VALUE = 'man';
var WOMAN_VALUE = 'woman';


function StringToJSON(aString)
{
    return eval('(' + aString + ')');
};

function checkKorean(str){
	check = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/;
	if(check.test(str)) return true;
	return false;
}

function koreanCheck(str) {
    var i;
    var ch;
    
    for (i=0;i<str.length;i++) {
        ch = escape(str.charAt(i));        //ISO-Latin-1 문자셋으로 변경

        if (strCharByte(ch) != 2) { //한글이 아닐 경우
            return;
        }
    }
}
function strCharByte(chStr) {
    if (chStr.substring(0, 2) == '%u') {
        if (chStr.substring(2,4) == '00')
            return 1;
        else
            return 2;        //한글
    } else if (chStr.substring(0,1) == '%') {
        if (parseInt(chStr.substring(1,3), 16) > 127)
            return 2;        //한글
        else
            return 1;
    } else {
            return 1;
    }
}

function loadScript(url, callback)
{
	if (DEBUG) {
		callback();
		return false;
	}
	
	if (ADD_PHONEGAP) {
		callback();
		return false;
	}
	
	// adding the script tag to the head as suggested before
		
		
	var head = document.getElementsByTagName('head')[0];
	var script = document.createElement('script');
	script.type = 'text/javascript';
	script.src = url;
	
	// then bind the event to the callback function 
	// there are several events for cross browser compatibility
	script.onreadystatechange = callback;
	script.onload = callback;
	
	ADD_PHONEGAP = true;
	
	// fire the loading
	head.appendChild(script);
	
}

var databaseOptions = {
	fileName: "us_kinggame2.db",
	version: "1.0",
	displayName:"kinggame db",
	maxSize: 1024
};

var DEFAULT_SETTING_DATA = {
	"id" : 1,
	"phone_gap": false,
	"same_status": true, 
	"sex_status" : true,
	"man_user_count" : 0,
	"woman_user_count" : 0,
	"penalty_count" : 0
};


function settingDB() {
	myDBHandler = new DBHandler(databaseOptions);
	myDBHandler.connectDB();		
	myDBHandler.createUserTable();	
	myDBHandler.createPenalTable();
}

var DEBUG_COUNT = 0;
function printLog(sMsg){
	if(!DEBUG){
		return false;
	}
	if(!sMsg) {
		sMsg = DEBUG_COUNT;
		DEBUG_COUNT++;
	}
	console.log(sMsg);
}

function firstTimeDatabaseSetting(){
	/*
	 * create database
	 * create setting
	 * */	
	var settingVO = Ext.ModelMgr.create({	
		'id' : DEFAULT_SETTING_DATA.id,
		'phone_gap' : DEFAULT_SETTING_DATA.phone_gap,
		'same_status' :DEFAULT_SETTING_DATA.same_status,
		'sex_status' : DEFAULT_SETTING_DATA.sex_status,
		'man_user_count' : DEFAULT_SETTING_DATA.man_user_count,
		'woman_user_count' : DEFAULT_SETTING_DATA.woman_user_count,
		'penalty_count' : DEFAULT_SETTING_DATA.penalty_count
	}, 'app.models.SettingVO');		
	
	Ext.apply(app, {
		mySettingVO : settingVO
	});			
	
}

function setUserDataToLocal(aSettingData)
{	
	
	var settingVO = Ext.ModelMgr.create({	
		'id' : aSettingData.id,
		'phone_gap' : aSettingData.phone_gap,
		'same_status' :aSettingData.same_status,
		'sex_status' : aSettingData.sex_status,
		'man_user_count' : aSettingData.man_user_count,
		'woman_user_count' : aSettingData.woman_user_count,
		'penalty_count' : aSettingData.penalty_count
	}, 'app.models.SettingVO');		
	
	Ext.apply(app, {
		mySettingVO : settingVO
	});			
	
}

function checkPenaltyCount(){
	printLog("checkPenaltyCount");
	var totalCount = app.mySettingVO.data.penalty_count;
	if (totalCount < MAX_PENALTY_COUNT){
		return true;
	}
	else{
		return false;
	}
}

function increasePenaltyCount(){
	printLog("increasePenaltyCount");
	app.mySettingVO.data.penalty_count = (app.mySettingVO.data.penalty_count + 1);
	printLog(app.mySettingVO.data.penalty_count);
	saveUserDataToNative();
}

function decreasePenaltyCount(){
	printLog("decreasePenaltyCount");
	app.mySettingVO.data.penalty_count = (app.mySettingVO.data.penalty_count - 1);	
	saveUserDataToNative();
}

function checkUserCount(){
	printLog("checkUserCount");
	var totalCount = app.mySettingVO.data.man_user_count + app.mySettingVO.data.woman_user_count;
	if (totalCount < MAX_USER_COUNT){
		return true;
	}
	else{
		return false;
	}
}

function increaseUserCount(aEntrysex){
	printLog("increaseUserCount");	
	if(aEntrysex==1){		
		app.mySettingVO.data.man_user_count = (app.mySettingVO.data.man_user_count + 1);
	}
	else if (aEntrysex==2){		
		app.mySettingVO.data.woman_user_count = (app.mySettingVO.data.woman_user_count + 1);		
	}
	saveUserDataToNative();
}

function decreaseUserCount(aEntrysex){
	printLog("decreaseUserCount");	
	if(aEntrysex==1){		
		app.mySettingVO.data.man_user_count = (app.mySettingVO.data.man_user_count - 1);
	}
	else if (aEntrysex==2){				
		app.mySettingVO.data.woman_user_count = (app.mySettingVO.data.woman_user_count - 1);		
	}
	saveUserDataToNative();
}

function saveUserDataToNative()
{		
	printLog("saveUserDataToNative");
				
	var configStore = Ext.getStore('mySettingStore');
	configStore.getProxy().clear();
	configStore.add(app.mySettingVO.data);		
	configStore.save();
	configStore.sync();	
	
	return;
}

function getRandomFromTo(from,to) {			
	return Math.floor(Math.random() * (to - from + 1) + from);
}

