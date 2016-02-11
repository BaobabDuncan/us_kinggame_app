var supportedLanguages = {
	en : 'en', /*English*/
	kr : 'kr' /*Korean*/
};

Ext.ns('app.lang','app.UI.en','app.UI.kr');

app.lang.en = {
	TabTitle : {
		KingGame : 'KING GAME',
		User : 'USER',
		ServerPenalty : 'TOP PENALTY',
		UserPenalty : 'USER PENALTY',
		Setting : 'SETTING'
	},
	MainTitle : {
		Entry : 'ENTRY',
		Penalty : 'PENALTY',
		ServerPenalty : 'TOP PENALTY',
		Setting : 'SETTING',
		KinggmaeMain : 'KING GAME'
	},
	DownlaodCount : 'Download',
	ReStartGame : 'Restart',
	StartGame : 'Start Game',
	canNotKimgGame : "Want you play game?<br>you must have to input user and penalty",
	PenaltyCount : 'Count of penalty',
	ManCount : 'Count of men',
	WomanCount : 'Count of women',
	SexDivision : 'With men and women',
	KimgGameSetting : 'Game Settings',
	Save : 'Save',
	Alert : 'Alert',
	PersonalInfo : 'User info',
	EntryName : 'User name',
	Sex : 'Sex',
	Add : 'Add',
	AddUser : 'Add User',
	AddPenalty : 'Add to user penalties',
	AddUserPenalty : 'Add to penalties',
	AddUserSuccess : 'Users have been added.',
	AddUserFailure : 'Add a user to have failed.',
	AddPenalSuccess : 'Penalties have been added.',
	AddPenalFailure : 'Add a penalties to have failed.',
	Back : 'Back',
	AddPenaltyLenth : 'Make penalties input.<br>(At least 4 characters)',
	AddPenaltyLenthMax : 'Input over the limit.<br>(140 characters or less)',
	AddUserName : 'Make username input.<br>('+MIN_USER_LENGTH+'자 이상)',
	AddUserNameMax : 'Input over the limit.<br>(10 characters or less)',
	AddPenaltyLimit : "Can't added more penalties.",
	AddUserLimit : "Can't added more user."
};

app.lang.kr = {
	TabTitle : {
		KingGame : '왕게임',
		User : '사용자',
		ServerPenalty : '인기 벌칙',
		UserPenalty : '유저 벌칙',
		Setting : '설정'
	},
	MainTitle : {
		Entry : '참가자',
		Penalty : '사용자 벌칙',
		ServerPenalty : '인기 벌칙',
		Setting : '설정',
		KinggmaeMain : '왕게임'
	},
	DownlaodCount : '다운로드',
	ReStartGame : '한번더',
	StartGame : '게임 시작',
	canNotKimgGame : '게임을 하기 위해서는 벌칙과 참가자를 입력해야 합니다.',
	PenaltyCount : '벌칙 수',
	ManCount : '남성 참가자 수',
	WomanCount : '여성 참가자 수',
	SexDivision : '남여 구분',
	KimgGameSetting : '왕게임 설정',
	Save : '저장',
	Alert : '알림',
	PersonalInfo : '참가자 정보',
	EntryName : '참가자 이름',
	Sex : '성별',
	Add : '추가',
	AddUser : '참가자 추가',
	AddPenalty : '유저벌칙으로 추가',
	AddUserPenalty : '벌칙 추가',
	AddUserSuccess : '참가자가 추가 되었습니다.',
	AddUserFailure : '참가자 추가에 실패 하였습니다.',
	AddPenalSuccess : '벌칙이 추가 되었습니다.',
	AddPenalFailure : '벌칙 추가에 실패 하였습니다.',
	Back : '뒤로',
	AddPenaltyLenth : '벌칙을 입력해주세요<br>(4자 이상)',
	AddPenaltyLenthMax : '벌칙의 입력범위를 초과했습니다.<br>(140자 이하)',
	AddUserName : '참가자 이름을 입력해주세요<br>('+MIN_USER_LENGTH+'자 이상)',
	AddUserNameMax : '참가자 입력범위를 초과했습니다.<br>(10자 이하)',
	AddPenaltyLimit : '더이상 벌칙을 추가 할 수 없습니다.',
	AddUserLimit : '더이상 참가자를 추가 할 수 없습니다.'
};

var newLang = supportedLanguages.kr;
var lang = app.lang[supportedLanguages.kr];



