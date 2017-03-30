var AlarmView = (function() {
	
	function AlarmView(){
		
	}
	
	AlarmView.prototype = {
		//Добавление нового Напоминания
		add : function(alarmObj) {
				
			var $alarmList = $("#alarm-list");
			var alartItemView = '<li class="ui-li-static li-select-all ui-li-active ui-alarm-item">' +
		    	'<div class="ui-alarm-data" id="'+ 'alarm_' + alarmObj.id + '">' +
		    		'<p style="margin:0px 0px 5px 0px;">' + alarmObj.note + '</p>' +
		        	'<p class="ui-alarm-date">' +
		        	alarmObj.date +
		            '</p>' +
		        '</div>' +
		        '<div class="ui-alarm-checker">' +
		        	'<input type="checkbox" id="check1" value="'+ alarmObj.id +'" class="ui-checkbox alarm-checkbox">' +
		        '</div>' +
		    '</li>';
			
			$alarmList.append(alartItemView);
			
		},
		//Добавление нескольких Напоминаний
		addList : function(alarmObjs) {
			
			var i = 0, lenAlarms = alarmObjs.length;
			
			for (i; i < lenAlarms; i++) {
				this.add(alarmObjs[i]);
			}
			
		},
		//Изменение Напоминания
		update : function(oldId, alarmObj) {
			
			var $alarmItem = $("#alarm_"+oldId);
			
			var arrP = $alarmItem.find("p");
			
			$(arrP[0]).text(alarmObj.note);
			$(arrP[1]).text(alarmObj.date);
			
			var arrInput = $alarmItem.next().find("input");
			
			//console.log("Old Value " + $(arrInput).attr("value"));
			
			$(arrInput).attr("value", alarmObj.id);
			
			$alarmItem.attr("id","alarm_"+alarmObj.id);
			
		},
		//Удаление Напоминания
		remove : function(alarmId) {
				
			$("#alarm_"+alarmId).parent().remove();
			
			console.log("Item View"+ alarmId +" was Removed");
			
		},
		//Удаление нескольких Напоминаний
		removeList : function(alarmIds) {
			
		}
	}
	
	return AlarmView;
})();