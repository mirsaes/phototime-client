import { appstate } from './appstate.js'


class PhotoTimeApp
{
	constructor() 
	{

	}

	removeItemFromParentById(itemid)
	{
		var applocation = appstate.getLocation();
		return applocation.removeItemFromParentById(itemid);
	}
	 
	removeItemFromParent(item, idx) {
		var applocation = appstate.getLocation();
		applocation.removeItemFromParent(item, idx);
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
		var applocation = appstate.getLocation();
		return applocation.getAdjItems(items, item);
	}
	
	// @return {prev: item, next: item, idx: itemsIndex}
	// may be undefined prev, next
	getAdjSiblings(item)
	{
		var applocation = appstate.getLocation();
		return applocation.getAdjSiblings();
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
		//console.log(`history.length=${history.length}`);
		this.doBack();
		history.back();
		
		// if reach here, can't go back, so exit
		/*if (typeof xnav !== 'undefined') {
			xnav.exit();
			// window.close();
		}*/
	}
	
	doBack() {
		//var applocation = appstate.getLocation();
		appstate.back();
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
