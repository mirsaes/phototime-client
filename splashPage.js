import { reloadServers } from './serversList.js'
import { gServers } from './serverDataSource.js'
import { gPhotoTimeAPI } from './api/photoTimeApi.js'
import { gRepos } from './repoDataSource.js'
import { appstate } from './appstate.js'

var splashPage = {};
splashPage.loadServers = function()
{
	reloadServers('splashServers', false, {
		onSelect: function(idx) {
			//console.log('splashServers clicked idx: ' + idx);
			var server = gServers.item(idx);
			let gConx = gPhotoTimeAPI.connect(server);
			gConx.getRepos({
				onSuccess: function(data) {
					gRepos.setRepos(data);
					appstate.setServer(server, idx)
					//app.location.serverIdx = idx;
					// have data, goto repos
					$.mobile.changePage('repos.html#repos');
				}
			});
		}
	});
	$('#splashServers').listview('refresh');
};

// request 
$(document).on('pagebeforeshow','#splash', function() {
	splashPage.loadServers();
});
export { splashPage }
