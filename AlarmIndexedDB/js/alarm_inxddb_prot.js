var AlarmDB = (function(){
	
	function AlarmDB(dbName){
		this.dbName = dbName;
	}
	
	var db;
	
	AlarmDB.prototype = {
		
		init : function(callbackView){
			
			this.createDB(callbackView);

		},
		
		//Создание новой БД
		createDB : function(callbackView){
			
			//console.log("Create clicked");
			var request = window.webkitIndexedDB.open(this.dbName);
			
			var self = this;
			
			request.onsuccess = function(e) {
				
				//console.log("inside onsuccess");
				db = request.result;
				//console.log(db);
				
				if (db) {
					self.selectAll(callbackView);
				}
			
			};
			request.onerror = function(e) {
				console.log("IndexedDB error: " + e.target.errorCode);
			};
			request.onupgradeneeded = function(e) 
			{  
				console.log("inside onupgradeneeded");
		 
				var objectStore = e.currentTarget.result.createObjectStore(
						"alarm", { keyPath: "id", autoIncrement: false });
		 
			};
			
			console.log("AlarmDB is created");
		},
		
		//Удаление БД
		removeDB : function() {
			window.webkitIndexedDB.deleteDatabase(this.dbName);
		},
		
		//Добавление нового Напоминания
		insertRecord : function(recordId, recordNote, recordTime, callback) {
			
			var alarmObj = {
				id: recordId,
				note: recordNote,
				date: recordTime
			}
			
			//console.log(alarmObj);
			//console.log(db);
			
			if (db !== undefined) {
				
				console.log(alarmObj);
				
				var transaction = db.transaction("alarm", "readwrite");
				var objectstore = transaction.objectStore("alarm");
				
				var request = objectstore.add(alarmObj);
				
				request.onerror = function(event) {
					  console.log("Handle errors!");
					};
				request.onsuccess = function(event) {
					  console.log(request.result);
					  
					  callback(alarmObj);
					  
					};
			}
		},
		
		//Извлечение Напоминания по Id
		selectById : function(recordId, callback){
			
			var transaction = db.transaction("alarm", "readonly");
			var objectstore = transaction.objectStore("alarm");
			
			var request = objectstore.get(recordId);
			
			request.onerror = function(event) {
				  console.log("Handle errors!");
				};
			request.onsuccess = function(event) {
				  console.log(request.result);
				  console.log("Alarm with id " + recordId + " was retrieved");
				  
				  callback(request.result.note, new Date(request.result.date));
				  
				};
		},
		selectAll : function(callback) {
			var transaction = db.transaction("alarm", "readonly");
			var objectstore = transaction.objectStore("alarm");
			
			console.log(objectstore);
			
			var cursorRequest = objectstore.openCursor(); //objectstore.getAll();//openCursor();
			
		    cursorRequest.onerror = function(e) {
		        console.log(e);
		    };
		 
		    //cursorRequest.onsuccess = function(event) {    
		    //	console.log(event.target.result);
		    //	callback(event.target.result);
		    //};
		    
		    cursorRequest.onsuccess = function(event) {   
		    	
		    	console.log(event);
		    	
		    	var cursor = event.target.result;
		        if (cursor) {
		        	console.log(cursor);
		        	callback(cursor.value);
		            cursor.continue();
		        }
		    };
		},
		getCount : function(callback) {
			
			var transaction = db.transaction("alarm", "readonly");
			var objectstore = transaction.objectStore("alarm");
			
			var cursorRequest = objectstore.getAll();//openCursor();
			
		    cursorRequest.onerror = function(e) {
		        console.log(e);
		    };
		 
		    cursorRequest.onsuccess = function(event) {    
		    	console.log(event.target.result);
		    	callback(event.target.result.length);
		    };
		},
		//Изменение Напоминания
		updateRecordWithId : function(oldId, recordId, recordNote, recordTime, callback) {
			
			var transaction = db.transaction("alarm", "readwrite");
			var objectstore = transaction.objectStore("alarm");
			
			var request = objectstore.get(oldId);
			
			request.onerror = function(event) {
				  console.log("Handle errors!");
				};
				
			request.onsuccess = function(event) {
				
				var record = event.target.result;
				
				record.id = recordId;
				
				if (recordNote !== undefined) {
					record.note = recordNote;
				}
				if (recordTime !== undefined) {
					record.date = recordTime;
				}
				
				var requestUpdate = objectstore.put(record);
					  
				requestUpdate.onerror = function(event) {
					
				};
					  
				requestUpdate.onsuccess = function(event) {
					console.log("Update " + record);
					callback(oldId, record);
				};
				  
			};
		},
		
		//Изменение Напоминания
		updateRecord : function(recordId, recordNote, recordTime, callback) {
			
			var transaction = db.transaction("alarm", "readwrite");
			var objectstore = transaction.objectStore("alarm");
			
			var request = objectstore.get(recordId);
			
			request.onerror = function(event) {
				  console.log("Handle errors!");
				};
				
			request.onsuccess = function(event) {
				
				var record = event.target.result;
				
				if (recordNote !== undefined) {
					record.note = recordNote;
				}
				if (recordTime !== undefined) {
					record.date = recordTime;
				}
				
				var requestUpdate = objectstore.put(record);
					  
				requestUpdate.onerror = function(event) {
					
				};
					  
				requestUpdate.onsuccess = function(event) {
					  callback(record);
				};
				  
			};
		},
		
		//Удаление Напоминания
		removeRecord : function(recordId) {
			
			var transaction = db.transaction("alarm", "readwrite");
			var objectstore = transaction.objectStore("alarm");
			
			var request = objectstore.delete(recordId);
			
			request.onerror = function(event) {
				  console.log("Handle errors!");
				};
			request.onsuccess = function(event) {
				  console.log(request.result);
				};
		},
		
		//Удаление Напоминаний
		removeRecords : function(recordIds) {
			
		}
		
	}
	
	return AlarmDB;
	
})();