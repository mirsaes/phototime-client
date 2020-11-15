var repoPage = {
};

repoPage.loadRepo = function() {
	var repo = gRepos[app.location.repoIdx];
	
	var onGroupItemAvail = function(item, items)
	{
		app.location.parents.push(repo);
		app.location.item = item;
		//app.location.parents = [];//?
		item.items = items;
		$.mobile.changePage('items.html#items');
	};
	
	loadRepo('repoItemsList', repo, {
		onSelect: function(idx)
		{
			console.log('repo item selected idx: ' + idx);
			repo.selectedItemIdx = idx;
			var item = repo.items[idx];
			
			if (item.type == "file")
			{
				app.location.parents.push(repo);
				app.location.item = item;
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