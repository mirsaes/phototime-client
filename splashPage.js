var splashPage = {};
splashPage.loadServers = function()
{
	reloadServers('splashServers', false, {
		onSelect: function(idx) {
			console.log('splashServers clicked idx: ' + idx);
			var server = gServers.item(idx);
			gConx = gPhotoTimeAPI.connect(server);
			gConx.getRepos({
				onSuccess: function(data) {
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