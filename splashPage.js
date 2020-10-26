var splashPage = {};
splashPage.loadServers = function()
{
	reloadServers('splashServers', false, {
		onSelect: function(idx) {
			console.log('splashServers clicked idx: ' + idx);
			var server = gServers.item(idx);
			//console.log(server);
			gConx = gPhotoTimeAPI.connect(server);
			gConx.getRepos({
				onSuccess: function(data) {
					//var jData = JSON.parse(data)
					//console.log(jData);
					//gRepos = jData;
					gRepos=data;
					app.location.serverIdx = idx;
					// have data, goto repos
					$.mobile.changePage('repos.html#repos');
				}
			});
		}
	});
	$('#splashServers').listview('refresh');
};