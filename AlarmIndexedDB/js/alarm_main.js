
(function(){
	
	var alarmMain = {},
		alarmDB,
		alarmTizen,
		alarmView;
	
	alarmMain.init = function(){
		
		//Элементы UI для Alarm--------------------------
		//События
		
		// Page: main-page
		$("#main-page").on("pagecreate", initAlarmPage);
		$("#ui-floatingaction").on("click", "#btn-add-alarm-page", showAddAlarmPage);
		$("#main-footer").on("click", "#btn-del-alarms", removeAlarmItems);
		$("#alarm-list").on("click", ".ui-alarm-data", showModAlarmPage);
		
		// Page: modify-alarm-page
		$("#btn-set-alarm").click(setAlarmItem);
		$("#btn-mod-alarm-add-cancel").click(backToMainAlarmPage);
		
		// Page: alarmActive
		$("#alarmActive").on("pagebeforeshow", showAlarmActivePage);
		$("#btn-alarm-active-back").click(backToMainAlarmPageFromActive);
	}
	
	function initAlarmPage() {
		
		console.log("initAlarmPage");
		
		alarmDB = new AlarmDB("AlarmDB");
		alarmTizen = new AlarmTizen();
		alarmView = new AlarmView();
		
		$("#ui-floatingaction").show();
	
		alarmDB.init(alarmView.add.bind(alarmView));

		//alarmDB.removeDB();
		//alarmTizen.removeAll();
		//console.log(tizen.alarm.getAll())
	}
	
	//Открываем окно для добавления нового напоминания
	function showAddAlarmPage() {
		
		initAlarm();
		tau.changePage("modify-alarm-page", {transition: "pop", reverse: false});
		$("#mod-alarm-header-text").text("Add New Alarm");
	    
	}
	
	//Переменные
	var $timePicker;
	var $datePicker;
	
	//Если undefined, то добавляем новое напоминание; иначе изменяем текущее на новое
	var alarmId = undefined;
	
	//Срабатывает при появлении страницы с Alarm
	function initAlarm() {
		
		console.log("initAlarm");
		
		alarmId = undefined;
		
		var curDate = new Date();
		
		//console.log(curDate);
		
		setAlarmForm("", curDate);
		
	}
	//Устанавливаем значения для поля с текстом и пикеров
	function setAlarmForm(note, date) {
		
		$timePicker = $("#timepicker");
		$datePicker = $("#datepicker");
		
		//Устанавливаем начальное время для picker'а
		var curTime = date.toTimeString().split(":");
		
		$timePicker.val(curTime[0] + ":" + curTime[1]);
		
		$datePicker[0].valueAsDate = date;
		
		//console.log(date);
		
		$("#textarea").val(note);
	}
	//Открываем окно для изменения напоминания
	function showModAlarmPage() {
		
		tau.changePage("modify-alarm-page", {transition: "pop", reverse: false});
		
		var fullAlarmId = this.id;
		
		alarmId = fullAlarmId.split("_")[1];
		
		console.log(alarmId);
		
		$("#mod-alarm-header-text").text("Change Alarm");
		
		var alarmObject = alarmDB.selectById(alarmId, setAlarmForm);
		//selectByKey(fullAlarmId);
		
		//setAlarmForm(alarmObject.note, new Date(alarmObject.date));
		
	}
	//Возвращаемся к главной старанице со списком напоминаний
	function backToMainAlarmPage() {
		
		console.log("backToMainAlarmPage");
		
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
			
			console.log(vTimeAlarm);
			console.log("Alarm ID: " + alarmId);
			var curTime = new Date();
			console.log(curTime);
			if (vTimeAlarm > curTime) {
				
				console.log("Alarm ID: " + alarmId);
				
				if (alarmId === undefined) {
					
					//Добавляем новое напоминание
					var curAlarmId = alarmTizen.add(vTimeAlarm);
					
					//Добавляем в таблицу
					alarmDB.insertRecord(curAlarmId, noteAlarm, vTimeAlarm, alarmView.add);
					
				}
				else {
					
					//Изменяем на новое
					console.log(alarmId);
					
					//alarmTizen.remove(alarmId);
					try {
						tizen.alarm.remove(alarmId);
					}
					catch(e) {
						console.log(e);
					}
					var curAlarmId = alarmTizen.add(vTimeAlarm);
					
					alarmDB.updateRecordWithId(alarmId, curAlarmId, noteAlarm, vTimeAlarm, alarmView.update);
					
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
			
			//removeAlarm(curAlarmId);
			//removeAlarmObject("alarm_" + curAlarmId);
			//removeAlarmObjectView(curAlarmId);
			try {
				alarmTizen.remove(curAlarmId);
			}
			catch(e){
				console.log(e);
			}
			alarmDB.removeRecord(curAlarmId);
			alarmView.remove(curAlarmId);
			console.log(curAlarmId);
			
		});
		
		changeAlarmCheckboxHandler();
		
	}
	
	function showAlarmActivePage(){
		
		//Элемент <audio>
		var audioAlarm = $("#alarm-audio")[0];
		
		//Путь к файлу
		audioAlarm.src="/opt/usr/media/Music/Over the Horizon.mp3";
		
		//Запуск музыки
		audioAlarm.play();
	}
	
	//Возвращение на главную страницу после срабатывания напоминания
	function backToMainAlarmPageFromActive() {
		
		var audioAlarm = $("#alarm-audio")[0];
	
		audioAlarm.pause();
		audioAlarm.currentTime = 0;
		
		tau.changePage("main-page", {transition: "pop", reverse: false});
	}
	
	//Pageindicator---------------------------------
	function initAlarmPageindicator(){
		
		setFooterReminder();
		setFloatActReminder();
		
		$(".alarm-checkbox:checkbox:checked").each(function(){
			$(this).prop("checked", false);
		});
		
		
	}
	function setFooterReminder() {
		
	    var footer = '<div class="row-grid">' +
	    '<div class="col-grid-3" style="text-align:center">' +
	        '<div href="#" class="icon-del icon-disabled" id="btn-del-alarms"></div>' +
	        '<div class="ui-footer-btn-text btn-text-disabled" style="margin-top:-5px;">Remove</div>' +
	    '</div>' +
	    '<div class="col-grid-3" style="text-align:center;">' +
	        '<a href="#" class="icon-home"></a>' +
	        '<div class="ui-footer-btn-text" style="margin-top:-5px;">Home</div>' +
	    '</div>' +
	    '<div class="col-grid-3" style="text-align:center;">' +
	    '</div>' +
	    '</div>';
	    
	    $("#main-footer").html(footer);
	}
	
	//Set Buttons for FloatingAction
	function setFloatActReminder() {
	
		$("#ui-floatingaction").show();
	}
	
	function initFloatActReminder() {
		var btnFloat = '<div style="line-height:57px;"><div id="btn-add-alarm-page" style="vertical-align: middle;" class="icon-add icon-active"></div></div>';
		
		$("#ui-floatingaction").html(btnFloat);
	}
	
	function changeAlarmCheckboxHandler() {
	
		var $alarmCheckbox = $(".alarm-checkbox:checkbox");
		
		console.log("Changed");
		
		if ($alarmCheckbox.filter(':checked').length !== 0) {
			
			if ($("#btn-del-alarms").hasClass("icon-disabled")) {
				
				//console.log("Checked");
				$("#btn-del-alarms").removeClass("icon-disabled");
				$("#btn-del-alarms").next().removeClass("btn-text-disabled");
				
				$("#btn-del-alarms").addClass("icon-active");
	
			}
		}
		else {
			//console.log("Non-checked");
			$("#btn-del-alarms").removeClass("icon-active");
	
			$("#btn-del-alarms").addClass("icon-disabled");
			$("#btn-del-alarms").next().addClass("btn-text-disabled");
		}
	}
	//----------------------------------------------
	return alarmMain;
	
})().init();
