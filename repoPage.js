import { gRepos } from './repoDataSource.js'
import { appstate } from './appstate.js'
import { gPhotoTimeAPI} from './api/photoTimeApi.js'
import { renderRepo } from './model/repos-list.js'

var repoPage = {
};

repoPage.loadRepo = function() {
	var repo = gRepos.getRepo(appstate.getLocation().repoIdx);
	
	var onGroupItemAvail = function(item, items)
	{
		var applocation = appstate.getLocation();
		applocation.parents.push(repo);
		applocation.item = item;
		//app.location.parents = [];//?
		item.items = items;
		$.mobile.changePage('items.html#items');
	};
	
	var gConx = gPhotoTimeAPI.getConnection();
	
	renderRepo('repoItemsList', repo, gConx, {
		onSelect: function(idx)
		{
			var applocation = appstate.getLocation();
			
			repo.selectedItemIdx = idx;
			var item = repo.items[idx];

			console.log(`repo item selected. idx=${idx}. type=${item.type}. id=${item.id}`);
			if (item.type == "file")
			{
				applocation.parents.push(repo);
				applocation.item = item;
				$.mobile.changePage('itemView.html#itemView');
			} else {
				if (item.items) {
					onGroupItemAvail(item, item.items);
				} else {
					gConx.getItems(item.id, {
						onSuccess: function(data) {
							var jData = data;
							onGroupItemAvail(item, jData.items);
						}
					});
				}
			}
		}
	});
}

$(document).on('pagebeforeshow', "#repo", function() {
	repoPage.loadRepo();
});

export { repoPage }
