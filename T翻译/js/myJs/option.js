var app = new Vue({
	el: "#app",
	data: {
		night:false,
		spd:3
	},
	methods: {
		
	},
	watch: {
		night(obj) {
			if(obj == true) {
				$("#night").text("白天模式");
				this.night = true;
				$("body").css({
					'background-color': '#000000'
				});
				changeNightOfFile(true);

			} else {
				$("#night").text("夜间模式");
				app.night = false;
				$("body").css({
					'background-color': ''
				});
				changeNightOfFile(false);
			}
		}
	},
	mounted() {
		
	}
});

document.addEventListener('plusready', function() {
	//console.log("所有plus api都应该在此事件发生后调用，否则会出现plus is undefined。"
	plus.key.addEventListener('backbutton', function() {
		saveSpdAndBack();
	}, false);
	loadMs();

});

function changeNightOfFile(obj) {
	plus.io.requestFileSystem(plus.io.PRIVATE_DOC, function(fs) {
		// 可通过fs操作PRIVATE_DOC文件系统 
		// ......
		fs.root.getFile('config.json', {
			create: true
		}, function(fileEntry) {
			fileEntry.file(function(file) {

				fileEntry.createWriter(function(writer) {
					writer.onwrite = function(e) {
						//console.log("Write data success!");
					};
					// Write data to the end of file
					//writer.seek(writer.length)

					var fileReader = new plus.io.FileReader();
					fileReader.readAsText(file, 'utf-8');
					fileReader.onloadend = function(evt) {
						var init = JSON.parse(evt.target.result);
						init.night = obj
						writer.write(JSON.stringify(init));
					}
				}, function(e) {
					alert(e.message)
				});
			});
		});
	}, function(e) {
		alert("Request file system failed: " + e.message);
	});
}

function loadMs() {
	plus.io.requestFileSystem(plus.io.PRIVATE_DOC, function(fs) {
		// 可通过fs操作PRIVATE_DOC文件系统 
		// ......
		fs.root.getFile('config.json', {
			create: true
		}, function(fileEntry) {
			fileEntry.file(function(file) {
				if(file.size === 0) {
					fileEntry.createWriter(function(writer) {
						writer.onwrite = function(e) {
							//console.log("Write data success!");
						};
						// Write data to the end of file
						writer.seek(writer.length);
						writer.write("{\"night\":false,\"allResult\":[]}");
					}, function(e) {
						alert(e.message)
					});
				} else {
					var fileReader = new plus.io.FileReader();
					fileReader.readAsText(file, 'utf-8');
					fileReader.onloadend = function(evt) {
						var init = JSON.parse(evt.target.result);
						app.spd = init.spd;
						app.night = init.night;
					}
				}
			});
		});
	}, function(e) {
		alert("Request file system failed: " + e.message);
	});
}


function saveSpdAndBack(){
	plus.io.requestFileSystem(plus.io.PRIVATE_DOC, function(fs) {
		// 可通过fs操作PRIVATE_DOC文件系统 
		// ......
		fs.root.getFile('config.json', {
			create: true
		}, function(fileEntry) {
			fileEntry.file(function(file) {

				fileEntry.createWriter(function(writer) {
					writer.onwrite = function(e) {
						//console.log("Write data success!");
					};
					// Write data to the end of file
					//writer.seek(writer.length)

					var fileReader = new plus.io.FileReader();
					fileReader.readAsText(file, 'utf-8');
					fileReader.onloadend = function(evt) {
						var init = JSON.parse(evt.target.result);
						//console.log(app.spd)
						init.spd = app.spd;
						writer.write(JSON.stringify(init));
						history.back(-1);
					}
				}, function(e) {
					alert(e.message)
				});
			});
		});
	}, function(e) {
		alert("Request file system failed: " + e.message);
	});
}
