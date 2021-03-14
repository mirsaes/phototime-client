import { appstate } from './appstate.js'


class PhotoTimeApp
{
	constructor() 
	{

	}

	removeItemFromParentById(itemid)
	{
		var applocation = appstate.getLocation();
		var parent = applocation.parents[applocation.parents.length-1]
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
	 
	removeItemFromParent(item, idx) {
		var applocation = appstate.getLocation();
		var parent = applocation.parents[applocation.parents.length-1]
		
		var delItem = parent.items[idx];
		if (delItem.id == item.id) {
			// remove 1
			parent.items.splice(idx, 1);
			return true;
		}
		return false;
	}
	
	// {nextPopCount: 1, nextParent, next: item, prevPopCount: 0, prevParent: null, prev: item}
	getAdjNav(item)
	{
		var ret = {};
		var applocation = appstate.getLocation();
		
		var adj = this.getAdjSiblings(item);
		var parent = applocation.parents[applocation.parents.length-1];
		var grandParent = applocation.parents[applocation.parents.length-2]
		
		if (adj.next)
		{
			ret.nextPopCount = 0;
			ret.next = adj.next;
		} else {
			console.log('next parent.length=' + applocation.parents.length);
			// find parents siblings .. this could go beyond one folder depth..?
			var adjItems = this.getAdjItems(grandParent.items, parent);
			
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
			console.log('prev parent.length=' + applocation.parents.length);
			var adjItems = this.getAdjItems(grandParent.items, parent);
			
			if (adjItems.prev) {
				ret.prevPopCount = 1;
				ret.prevParent = adjItems.prev;
				//ret.prev = adjItems.prev.items[adjItems.prev.items.length-1]
			}
		}
		return ret;
	}

	getItemIdx(items, item)
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
		var applocation = appstate.getLocation();
		var parent = applocation.parents[applocation.parents.length-1]
		var items = parent.items;
		
		var idx = 0;
		var adjSiblings = {};
		//adjSiblings.prev;
		//adjSiblings.next;
		adjSiblings = this.getAdjItems(items, item);
		
		return adjSiblings;
	}
	
	connectBack()
	{
		var me = this;
		$(document).on("click", "a[data-rel=back]", function(){
			me.doBack();
		}).bind(this);

		return;		
	}
	
	goBack() {
		if (history.length == 0) {
			if (typeof xnav !== 'undefined')
			{
				xnav.exit();
			}
		}
		console.log("history.length=" + history.length);
		this.doBack();
		history.back();
		
		// if reach here, can't go back, so exit
		/*if (typeof xnav !== 'undefined') {
			xnav.exit();
			// window.close();
		}*/
	}
	
	doBack() {
		// pop parent
		var applocation = appstate.getLocation();
		var group = applocation.parents.pop()
		applocation.item = group
	}
}

$(document).bind("mobileinit", function(){
	$.mobile.defaultPageTransition="none"
});	

$(window).bind("beforeunload", function() {
	console.log("TODO: last minute persist..?");
});

var gApp = new PhotoTimeApp();

(function( $ ) {
	// On document ready
	$(function() {
		//reloadServers('splashServers');
		gApp.connectBack();
	});
})( jQuery);

export { gApp as app }