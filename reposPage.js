var reposPage = {
};

reposPage.loadRepos = function() {
	var onGroupItemAvail = function(repo, items, repoIdx)
	{
		repo.items = items;
		app.location.repoIdx = repoIdx;
		app.location.item = repo;
		$.mobile.changePage('repo.html#repo');
	};
	
	loadRepos('reposList', gRepos, {
		onSelect: function(idx)
		{
			console.log('repos selected idx: ' + idx);
			var repo = gRepos[idx];
			if (repo.items) {
				onGroupItemAvail(repo, repo.items, idx);
			} else {
				gConx.getRepo(repo.id, {
					onSuccess: function(data) {
						var jData = data;
						onGroupItemAvail(repo, jData.items, idx);
					}
				});
			}
			
		}
	});
}