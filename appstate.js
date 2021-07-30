class AppState
{
    app = {}
    constructor() {
        this.app = {};
        var app = this.app;
        app.location = {};
        app.location.serverIdx = -1;
        app.location.repoIdx = -1;

        // tree?
        app.location.parents = [];
        // item: repo|
        app.location.item;
    }

    setServer(server, idx) {
        this.app.location.serverIdx = idx;
    }

    setRepo(repo, repoIdx)
    {
        this.app.location.repoIdx = repoIdx;
        this.app.location.item = repo;
    }

    getLocation() 
	{
        return this.app.location;
    }

    removeItemFromParentById(itemid)
    {
        var applocation = this.app.location;

        var parent = applocation.parents[applocation.parents.length-1];
        var idx = 0;
        var items = parent.items;
        for (idx = 0; idx < items.length; ++idx) {
            let item = items[idx];
            if (item.id == itemid) {
                parent.items.splice(idx, 1);
                return true;
            }
        }
        
        return false;
    }

	removeItemFromParent(item, idx) 
	{
		var applocation = this.getLocation();
		var parent = applocation.parents[applocation.parents.length-1];
		
		var delItem = parent.items[idx];
		if (delItem.id == item.id) {
			// remove 1
			parent.items.splice(idx, 1);
			return true;
		}
		return false;
	}

	// {prev: item, next: item, idx: itemsIdx}
	getAdjItems(items, item)
	{
		var adjItems = {};
		var idx;
		for (idx = 0; idx < items.length; ++idx)
		{
			let aitem = items[idx];
			if (aitem.id == item.id) {
				if (idx > 0)
					adjItems.prev = items[idx-1];
				if (idx + 1 < items.length)
					adjItems.next = items[idx+1];
				
				adjItems.idx = idx;
				break;
			}
		}
		
		return adjItems;
	}

	// @return {prev: item, next: item, idx: itemsIndex}
	// may be undefined prev, next
	getAdjSiblings(item)
	{
		// find item id in parent
		var applocation = this.getLocation();
		var parent = applocation.parents[applocation.parents.length-1];
		var items = parent.items;
		
		var idx = 0;
		var adjSiblings = {};
		//adjSiblings.prev;
		//adjSiblings.next;
		adjSiblings = this.getAdjItems(items, item);
		
		return adjSiblings;
	}

	/**
	 * get the next or previous item traversing directories if necessary
	 * @param {*} item - the current item, might be null if current location is a folder
	 * @param {*} nextOrPrev -> 'next' | 'prev'
	 * @returns 
	 * 
	 * note: some oddity in usage semantics with location vs item
	 */
	getNav(item, nextOrPrev) {
		var navInfo = {};
		var applocation = this.getLocation();
		
		var adjSiblings = this.getAdjSiblings(item);
		if (adjSiblings[nextOrPrev]) {
			navInfo.popCount = 0;
			navInfo.item = adjSiblings[nextOrPrev];
			return navInfo;
		}

		// if no prev or next go to parent and look at siblings
		// put ancestors in order of parent, grandparent, greatgrandparent
		// start with grandparent
		var ancestors = [];
		for (let ancestorIdx = applocation.parents.length-2; ancestorIdx >=0; ancestorIdx--)
		{
			ancestors.push(applocation.parents[ancestorIdx]);
		}

		// scenarios..
		// last item in folder, folder has item siblings
		// empty folder (item is null) and siblings of parent (folder) are folders
			
		var lastParent = applocation.parents[applocation.parents.length-1];

		for (let ancestorIdx = 0; ancestorIdx < ancestors.length; ++ancestorIdx) {
			let ancestor = ancestors[ancestorIdx];
			var adjItems = this.getAdjItems(ancestor.items, lastParent);
			
			if (adjItems[nextOrPrev]) {
				navInfo.popCount = ancestorIdx+1;
				navInfo.ancestorSibling = adjItems[nextOrPrev];
				break;
			} else {
				lastParent = ancestor;
			}
		}		
		return navInfo;

	}

    // get "next" items, traversing folders as necessary
    // @param item - the current item (same as appLocation?) if null, looking at empty folder
	// {nextPopCount: 1, nextParent, item: the next item}
	// {nextPopCount: 1, parentsNextSibling, item: the next item}
	getNextNav(item)
	{
		return this.getNav(item, 'next');
	}

    // get "prev" items, traversing folders as necessary
    // 
	// {prevPopCount: 1, prevParent, item: thePreviousItem}
	// {prevPopCount: 1, parentsPrevSibling, item: thePreviousItem}
	getPrevNav(item)
	{
		return this.getNav(item, 'prev');
	}

    getParent()
    {
        var applocation = this.getLocation();
        return applocation.parents[applocation.parents.length-1];
    }

	back() 
	{
		var applocation = this.getLocation();

		// pop parent
		if (applocation.parents.length == 0) {
			if (applocation.repoIdx >= 0) {
				applocation.repoIdx=-1;
			} else {
				applocation.serverIdx = -1;
			}
		} else {
			// within repo still
			var group = applocation.parents.pop();
			applocation.item = group;
		}
	}
}

var gAppState = new AppState();

export {gAppState as appstate}
