var app = {};
app.location = {};
app.location.serverIdx = -1;
app.location.repoIdx = -1;
app.location.parents = [];
app.location.item;

app.removeItemFromParentById = function(itemid)
{
	var parent = app.location.parents[app.location.parents.length-1]
	var idx = 0;
	var items = parent.items;
	for (idx = 0; idx < items.length; ++idx) {
		var item = items[idx];
		if (item.id == itemid) {
			parent.items.splice(idx, 1);
			return true;
		}
	}
	
	return false;
};
 
app.removeItemFromParent = function(item, idx) {
	var parent = app.location.parents[app.location.parents.length-1]
	
	var delItem = parent.items[idx];
	if (delItem.id == item.id) {
		// remove 1
		parent.items.splice(idx, 1);
		return true;
	}
	return false;
};

// {nextPopCount: 1, nextParent, next: item, prevPopCount: 0, prevParent: null, prev: item}
app.getAdjNav = function(item)
{
	var ret = {};
	
	var adj = app.getAdjSiblings(item);
	var parent = app.location.parents[app.location.parents.length-1];
	var grandParent = app.location.parents[app.location.parents.length-2]
	
	if (adj.next)
	{
		ret.nextPopCount = 0;
		ret.next = adj.next;
	} else {
		console.log('next parent.length=' + app.location.parents.length);
		// find parents siblings .. this could go beyond one folder depth..?
		var adjItems = app.getAdjItems(grandParent.items, parent);
		
		if (adjItems.next) {
			ret.nextPopCount = 1;
			ret.nextParent = adjItems.next;
			//ret.next = adjItems.next.items[0];
		}
	}
	
	if (adj.prev) {
		ret.prevPopCount = 0;
		ret.prev = adj.prev;
	} else {
		console.log('prev parent.length=' + app.location.parents.length);
		var adjItems = app.getAdjItems(grandParent.items, parent);
		
		if (adjItems.prev) {
			ret.prevPopCount = 1;
			ret.prevParent = adjItems.prev;
			//ret.prev = adjItems.prev.items[adjItems.prev.items.length-1]
		}
	}
	return ret;
};
app.getItemIdx = function(items, item)
{
	var idx;
	for (idx = 0; idx < items.length; ++idx)
	{
		var aitem = items[idx];
		if (aitem.id == item.id) {
			return idx;
		}
	}
	
	return;
};
// {prev: item, next: item, idx: itemsIdx}
app.getAdjItems = function(items, item)
{
	var adjItems = {};
	var idx;
	for (idx = 0; idx < items.length; ++idx)
	{
		var aitem = items[idx];
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
app.getAdjSiblings = function(item)
{
	// find item id in parent
	var parent = app.location.parents[app.location.parents.length-1]
	var items = parent.items;
	
	var idx = 0;
	var adjSiblings = {};
	//adjSiblings.prev;
	//adjSiblings.next;
	adjSiblings = app.getAdjItems(items, item);
	
	return adjSiblings;
}

app.connectBack = function()
{
/*
	$().delegate("a[data-rel=back]", "click", function(evt) {
		console.log('parents: ', app.location.parents.length)
			
		var group = app.location.parents.pop()
		app.location.item = group		
	});
	return;
http://api.jquery.com/live/
	
*/
	$(document).on("click", "a[data-rel=back]", function(){
		app.doBack();
	});
	return;
	
	$("[data-rel=back]").click(function(){
		app.doBack();
	});
	
}
app.goBack = function() {
	if (history.length == 0) {
		if (typeof xnav !== 'undefined')
		{
			xnav.exit();
		}
	}
	console.log("history.length=" + history.length);
	app.doBack();
	history.back();
	
	// if reach here, can't go back, so exit
	/*if (typeof xnav !== 'undefined') {
		xnav.exit();
		// window.close();
	}*/
};
app.doBack = function() {
	// pop parent
	var group = app.location.parents.pop()
	app.location.item = group
};
