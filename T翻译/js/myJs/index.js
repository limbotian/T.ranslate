document.addEventListener('plusready', function() {
	//console.log("所有plus api都应该在此事件发生后调用，否则会出现plus is undefined。"
	plus.key.addEventListener('backbutton', function() {
		confirm("确定要离开我吗?") ? plus.runtime.quit() : "";
	}, false);

	//加载参数
	loadMs();
});

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
						writer.write("{\"night\":false,\"spd\":3,\"allResult\":[]}");
					}, function(e) {
						alert(e.message)
					});
				} else {
					var fileReader = new plus.io.FileReader();
					fileReader.readAsText(file, 'utf-8');
					fileReader.onloadend = function(evt) {
						var init = JSON.parse(evt.target.result);
						app.allResult = init.allResult;
						app.night = init.night;
						app.spd = init.spd;
					}
				}

			});
		});
	}, function(e) {
		alert("Request file system failed: " + e.message);
	});
}

var app = new Vue({
	el: "#app",
	data: {
		parm: {
			"q": "",
			"from": "auto",
			"to": "en",
			"appid": 20190315000277316,
			"salt": "",
			"sign": "",

		},
		spd: 3,
		allResult: [],
		flag: false,
		night: false,
		net: true,
		audioSrc: ""

	},
	methods: {
		play(val, lan) {
			var obj = "<audio id=\"tts_autio_id\" autoplay=\"autoplay\"><source id=\"tts_source_id\" src=\"http://tts.baidu.com/text2audio?lan=" + lan + "&ie=UTF-8&spd=" + this.spd + "&text=" + val + "\" type=\"audio/mpeg\"><embed id=\"tts_embed_id\" height=\"0\" width=\"0\"></audio>";
			$("#audio").empty();
			$("#audio").append(obj);
		},
		change() {
			var from = this.parm.from;
			this.parm.from = this.parm.to;
			this.parm.to = from;
		},
		put() {
			if(this.parm.q == "") {
				alert("内容不能为空");
				return;
			}
			if(!navigator.onLine) {
				alert("请检查网络。");
				this.net = false;
				$("#net").slideDown();
				return;
			} else {
				this.net = true;
				$("#net").slideUp();
			}

			this.flag = true;
			var obj = this.parm;
			obj.salt = RndNum(10);
			obj.sign = md5(obj.appid + obj.q + obj.salt + "PU9I_mPuBSWmPaCSoD5X");

			$.ajax({
				url: "http://api.fanyi.baidu.com/api/trans/vip/translate",
				type: "GET",
				async: false,
				dataType: "jsonp",
				data: obj,
				success: function(data) {
					app.flag = false;
					app.allResult.unshift(data);

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
										init.allResult = app.allResult;
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
				},
				error: function(data) {
					alert("啊偶，出错了!\r请检查网络连接或重启应用。")
				}
			})
		},
		copy() {
			copyText(document.getElementById("val").innerText, function() {
				$("#msg").slideDown("slow", function() {
					$("#msg").slideUp("slow");
				});

			})
		},
		clean() {
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
								init.allResult = [];
								writer.write(JSON.stringify(init));
								app.allResult = []
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
	},
	mounted() {},
	watch: {
		night(obj) {
			if(obj == true) {
				$("#night").text("白天模式");
				this.night = true;
				$("body").css({
					'background-color': '#000000'
				});
				//changeNightOfFile(true);

			} else {
				$("#night").text("夜间模式");
				app.night = false;
				$("body").css({
					'background-color': ''
				});
				//changeNightOfFile(false);
			}
		}
	}
});

function RndNum(n) {
	var rnd = "";
	for(var i = 0; i < n; i++)
		rnd += Math.floor(Math.random() * 10);
	return rnd;
}

function copyText(text, callback) { // text: 要复制的内容， callback: 回调
	var tag = document.createElement('input');
	tag.setAttribute('id', 'cp_hgz_input');
	tag.value = text;
	document.getElementsByTagName('body')[0].appendChild(tag);
	document.getElementById('cp_hgz_input').select();
	document.execCommand('copy');
	document.getElementById('cp_hgz_input').remove();
	if(callback) {
		callback(text)
	}
}