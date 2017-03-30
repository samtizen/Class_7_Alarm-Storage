(function(){
	
	var alarmMain = {};
	
	alarmMain.init = function(){
		
		//События
		$().ready(initAlarm);
		$("#main-footer").on("click", "#btn-del-alarms", removeAlarmItems);
		$("#btn-add-alarm-page").on("click", showAddAlarmPage);
		$("#btn-mod-alarm-add-cancel").click(backToMainAlarmPage);
		$("#btn-set-alarm").click(setAlarmItem);
		
		$("#btn-alarm-back").click(backToMain);
		
		$("#alarm-list").on("click", ".ui-alarm-data", showModAlarmPage);
		
		$("#alarmActive").on("pagebeforeshow", showAlarmPage);
		
		//$(".alarm-item-data").click(showModAlarmPage);
	}
	
	//Элементы UI для Alarm--------------------------
	//Переменные
	var $timePicker;
	var $datePicker;
	
	//Если undefined, то добавляем новое напоминание; иначе изменяем текущее на новое
	var alarmId = undefined;
	
	//Срабатывает при появлении страницы с Alarm
	function initAlarm() {
		
		console.log("init Alarm");
		
		alarmId = undefined;
		setAlarmForm("", new Date());
		
		$("#ui-floatingaction").show();
		showAlarmList();
		
	}
	
	//Устанавливаем значения для поля с текстом и пикером
	function setAlarmForm(note, date) {
		
		$timePicker = $("#timepicker");
		$datePicker = $("#datepicker");
		
		//Устанавливаем начальное время для picker'а
		var curTime = date.toTimeString().split(":");
		
		$timePicker.val(curTime[0] + ":" + curTime[1]);
		
		$datePicker[0].valueAsDate = date;
		
		$("#textarea").val(note);
	}
	
	//Открываем окно для изменения напоминания
	function showModAlarmPage() {
		
		$("#main-page").hide();
		$("#modify-alarm-page").show();
		$("#ui-floatingaction").hide();
		
		tau.changePage("modify-alarm-page", {transition: "pop", reverse: false});
		
		var fullAlarmId = this.id;
		
		alarmId = fullAlarmId.split("_")[1];
		
		$("#mod-alarm-header-text").text("Change Alarm");
		
		var alarmObject = selectByKey(fullAlarmId);
		
		setAlarmForm(alarmObject.note, new Date(alarmObject.date));
		
	}
	//Открываем окно для добавления нового напоминания
	function showAddAlarmPage() {
		
		$("#main-page").hide();
		$("#modify-alarm-page").show();
		$("#ui-floatingaction").hide();
		
		initAlarm();
		tau.changePage("modify-alarm-page", {transition: "pop", reverse: false});
		$("#mod-alarm-header-text").text("Add New Alarm");
	    
	}
	
	//Возвращаемся к главной старанице со списком напоминаний
	function backToMainAlarmPage() {
		
		$("#main-page").show();
		$("#modify-alarm-page").hide();
		$("#ui-floatingaction").show();
		
		tau.changePage("main-page", {transition: "pop", reverse: false});
		$("#mod-alarm-header-text").text("");
	}
	
	//Устанавливаем или измениям напоминание
	function setAlarmItem() {
		
		var vTimeAlarm = new Date();
		
		var vTime = $timePicker.val();
		var arrHourMin = vTime.split(":");
		var arrYMD = $datePicker.val().split("-");
		
		var noteAlarm = $("#textarea").val();
		
		if (arrHourMin.length === 2 && arrYMD.length === 3) {
			
			vTimeAlarm.setFullYear(arrYMD[0], arrYMD[1]-1, arrYMD[2]);
			vTimeAlarm.setHours(arrHourMin[0], arrHourMin[1], 0);
			
			//console.log(vTimeAlarm);
			console.log("Alarm ID: " + alarmId);
			var curTime = new Date();
			
			if (vTimeAlarm > curTime) {
				
				console.log("Alarm ID: " + alarmId);
				
				if (alarmId === undefined) {
					
					//Добавляем новое напоминание
					
					var curAlarmId = addAlarm(vTimeAlarm);
					
					//add to db
					addAlarmObject(curAlarmId, noteAlarm, vTimeAlarm);
					
					addAlarmObjectView(curAlarmId, noteAlarm, vTimeAlarm);
					
				}
				else {
					
					//Изменяем на новое
					
					removeAlarm(alarmId);
					
					var curAlarmId = addAlarm(vTimeAlarm);
					
					updateAlarmObject("alarm_"+alarmId, curAlarmId, noteAlarm, vTimeAlarm);
					updateAlarmObjectView(alarmId, curAlarmId, noteAlarm, vTimeAlarm);
				}
				
				backToMainAlarmPage();
			}
			else {
			
				//Popup
			}
		}
		
	}
	//Удаляем выделенные напоминания
	function removeAlarmItems() {
		
		console.log("Remove Action");
		
		$(".alarm-checkbox:checkbox:checked").each(function(){
			
			var curAlarmId = this.value;
			
			removeAlarm(curAlarmId);
			removeAlarmObject("alarm_" + curAlarmId);
			removeAlarmObjectView(curAlarmId);
			
			//console.log(curAlarmId);
			
		});
		
	}
	function showAlarmPage() {
		
		$("#main-page").hide();
		$("#modify-alarm-page").hide();
		$("#ui-floatingaction").hide();
		$("#alarmActive").show();
		
		//Элемент <audio>
		var audioAlarm = $("#alarm-audio")[0];
		
		//Путь к файлу
		audioAlarm.src="/opt/usr/media/Music/Over the Horizon.mp3";
		
		//Запуск музыки
		audioAlarm.play();
	}
	//Возвращение на главную страницу после срабатывания напоминания
	function backToMain() {
		
		var audioAlarm = $("#alarm-audio")[0];

		audioAlarm.pause();
		audioAlarm.currentTime = 0;
		
		$("#main-page").show();
		$("#modify-alarm-page").hide();
		$("#ui-floatingaction").show();
		$("#alarmActive").hide();
		
		tau.changePage("main-page", {transition: "pop", reverse: false});
		
		showAlarmList();
	}
	
	function showAlarmList() {
		
		removeAll();
		
		var i = 0,
			lenList = localStorage.length;
		
		for (i; i < lenList; i++) {
			
			var obj = JSON.parse(localStorage.getItem(localStorage.key(i)));
			
			addAlarmObjectView(obj.id.split("_")[1], obj.note, obj.date);
		}
		
	}
	
	//ALARMS-----------------------------------------------
	function addAlarm(date) {
		
		var myAlarm = new tizen.AlarmAbsolute(date);
		var appControl = new tizen.ApplicationControl("http://tizen.org/appcontrol/operation/startMyAlarm", null, null, null, null);
		
		tizen.alarm.add(myAlarm, tizen.application.getAppInfo().id, appControl);
		
		return myAlarm.id;
	}
	function removeAlarm(id) {
		
		if (tizen.alarm.getAll().indexOf(id) != -1) {
			tizen.alarm.remove(id);
			console.log("Alarm " + id + " was removed");
			console.log(tizen.alarm.getAll());
		} 
		else {
			
			console.log("Not found");
			
		}
	}
	function removeAlarms(ids) {
		
		var i = 0, l = ids.length;
		
		for(i; i < l; i++) {
			removeAlarm(ids[i]);
		}
	}
	function removeAllAlarms() {
		
		var alarms = tizen.alarm.getAll(), 
		i = 0, 
		l = tizen.alarm.getAll().length;
		
		for(i; i < l; i++) {
			removeAlarm(alarms[i].id);
		}
	}
	//---------------------------------------------------
	
	//ALARM STORAGE--------------------------------------
	function addAlarmObject(id, note, date) {
		
		var alarm = new Object();
		
		alarm.id = "alarm_" + id;
		alarm.note = note;
		alarm.date = date;
		
		//console.log(alarm);
		
		//localStorage.setItem(alarm.id, JSON.stringify(alarm)); 
		localStorage[alarm.id] = JSON.stringify(alarm);
	}
	function updateAlarmObject(oldId, curId, note, date) {
		
		var alarm = new Object();
		
		alarm.id = "alarm_" + curId;
		alarm.note = note;
		alarm.date = date;
		
		//console.log(alarm);
		
		localStorage.removeItem(oldId);
		
		//localStorage.setItem(alarm.id, JSON.stringify(alarm)); 
		localStorage[alarm.id] = JSON.stringify(alarm);
	}
	
	function selectByKey(id) {
		return JSON.parse(localStorage[id]);
	}
	
	function removeAlarmObject(id) {
		
		console.log(id);
		
		localStorage.removeItem(id);
		
		console.log("Storage Item "+ id +" was Removed");
	}
	function clearAlarmStorage() {
		
		for (var key in localStorage) {
			
			if (key.split("_")[0] === "alarm") {
				removeAlarmObject(key);
			}
	
		}
	}
	function clearStorage() {
		
		localStorage.clear();
	}
	//---------------------------------------------------
	
	//ALARM VIEW-----------------------------------------
	function addAlarmObjectView(id, note, date) {
		
		var $alarmList = $("#alarm-list");
		var alartItemView = '<li class="ui-li-static li-select-all ui-li-active ui-alarm-item">' +
	    	'<div class="ui-alarm-data" id="'+ 'alarm_' + id + '"><p style="margin:0px 0px 5px 0px;">' + note + '</p>' +
	        	'<p class="ui-alarm-date">' +
	        		date +
	            '</p>' +
	        '</div>' +
	        '<div class="ui-alarm-checker">' +
	        	'<input type="checkbox" id="check1" value="'+ id +'" class="ui-checkbox alarm-checkbox">' +
	        '</div>' +
	    '</li>';
		
		$alarmList.append(alartItemView);
	}
	function updateAlarmObjectView(oldId, curId, note, date) {
		
		var $alarmItem = $("#alarm_"+oldId);
		
		//console.log("Old Id: " + $alarmItem.attr("id"));
		
		
		var arrP = $alarmItem.find("p");
		
		$(arrP[0]).text(note);
		$(arrP[1]).text(date);
		
		var arrInput = $alarmItem.next().find("input");
		
		//console.log("Old Value " + $(arrInput).attr("value"));
		
		$(arrInput).attr("value", curId);
		
		$alarmItem.attr("id","alarm_"+curId);
		
		//console.log("New Id: " + $alarmItem.attr("id"));
		//console.log("New Value " + $(arrInput).attr("value"));
		
	}
	function removeAlarmObjectView(id) {
		
		$("#alarm_"+id).parent().remove();
		
		console.log("Item View"+ id +" was Removed");
		
	}
	function removeAll() {
		$("#alarm-list").html("");
	}
	//---------------------------------------------------

	return alarmMain;
	
})().init();