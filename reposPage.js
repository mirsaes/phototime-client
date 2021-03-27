import {appstate } from './appstate.js'
import { gPhotoTimeAPI } from './api/photoTimeApi.js'
import { renderRepos } from './model/repos-list.js'
import { gRepos } from './repoDataSource.js'

var reposPage = {
};

reposPage.loadRepos = function() {
	// either available immediately of after loading from server
	var onGroupItemAvail = function(repo, items, repoIdx)
	{
		repo.items = items;

		appstate.setRepo(repo, repoIdx)
		$.mobile.changePage('repo.html#repo');
	};
	
	renderRepos('reposList', gRepos.getRepos(), {
		onSelect: function(idx)
		{
			//console.log('repos selected idx: ' + idx);
			var repo = gRepos.getRepo(idx);
			if (repo.items) {
				onGroupItemAvail(repo, repo.items, idx);
			} else {
				// must load from server
				var gConx = gPhotoTimeAPI.getConnection();
				gConx.getRepo(repo.id, {
					onSuccess: function(data) {
						var jData = data;
						onGroupItemAvail(repo, jData.items, idx);
					}
				});
			}
			
		}
	});
};

$(document).on('pagebeforeshow',"#repos", function() {
	reposPage.loadRepos();
});

export { reposPage }
