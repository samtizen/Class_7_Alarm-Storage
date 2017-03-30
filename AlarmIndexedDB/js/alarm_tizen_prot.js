var AlarmTizen = (function() {
	
	function AlarmTizen(){
	}
	
	AlarmTizen.prototype = {
		//Добавление нового Напоминания
		add : function(date) {
			
			var myAlarm = new tizen.AlarmAbsolute(date);
			var appControl = new tizen.ApplicationControl("http://tizen.org/appcontrol/operation/startMyAlarm", null, null, null, null);
			
			tizen.alarm.add(myAlarm, tizen.application.getAppInfo().id, appControl);
			
			return myAlarm.id;
		},
		//Удаление Напоминания
		remove : function(id) {
			
			tizen.alarm.remove(id);
			console.log("Alarm " + id + " was removed");
			
			console.log(tizen.alarm.getAll());
		},
		//Удаление всех Напоминаний
		removeAll : function() {
			
			var alarms = tizen.alarm.getAll(), 
			i = 0, 
			l = tizen.alarm.getAll().length;
			
			for(i; i < l; i++) {
				removeAlarm(alarms[i].id);
			}
		}
		
			
	}
	
	return AlarmTizen;
})();