import { gPhotoTimeAPI } from './api/photoTimeApi.js';
import { appstate } from './appstate.js'
import { app } from './app.js'

var itemsPage = {};

/**
 * 
 */
itemsPage.loadItems = function()
{
	var applocation = appstate.getLocation();
	var group = applocation.item;
	if (group.type == "file") {

		group = applocation.parents.pop();
		applocation.item = group;
	}

	var onGroupItemsAvail = function(item, items)
	{
		applocation.parents.push(group);
		applocation.item = item;
		item.items = items;

		// don't change the page, just re-render?
		// but then must handle back within the page..
		itemsPage.loadItems();
	};
	
	renderGroup('groupItemsList', group, {
		onSelect: function(idx)
		{
			console.log('group item selected idx: ' + idx);
			var item = group.items[idx];
			console.log(`item.type=${item.type}. id=${item.id}`);
			group.selectedItemIdx = idx;
			if (item.type == "file")
			{
				applocation.parents.push(group);
				applocation.item = item;
				$.mobile.changePage('itemView.html#itemView');
			} else {
				// check if already have items
				if (item.items) {
					onGroupItemsAvail(item, item.items);
				} else {
					var gConx = gPhotoTimeAPI.getConnection();
					gConx.getItems(item.id, {
						onSuccess: function(data) {
							var jData = data;
							onGroupItemsAvail(item, jData.items);
						}
					});
				}
			}
		}
	});

};

function renderEmptyFolderGroup(lvid, listView, group)
{
	var deleteFolderHtml = 
	`<a href="#" 
		class="deleteItem" 
		id="deleteItem-" 
		data-role="button" 
		data-icon="delete"
		data-photoid="${group.id}">Delete
	</a>`;

	var emptyFolderHtml = 
		`<li >
			<a href="#">
				<div>This folder is empty:</div>
				<div>${group.id}</div>
			</a>
			${deleteFolderHtml}
		</li>`;

	listView.html(emptyFolderHtml);
	$('.deleteItem').click(function(event) {
		$.mobile.loading('show');
		var photoid = this.getAttribute('data-photoid');
		var gConx = gPhotoTimeAPI.getConnection();
		var applocation = appstate.getLocation();
		gConx.delItem(photoid, {
			onSuccess: function(data) {
				//console.log('deleted item: ' + photoid);
				//console.log(data);
				var parent = applocation.parents[applocation.parents.length-1];

				app.removeItemFromParentById(photoid);
				listView.empty();
				$.mobile.loading('hide');
				// go back?
				app.goBack();
				//loadGroup(lvid, parent, cbks);
				// remove item from parent, nav to parent
				/*
				var test = group.items[idx];
				if (test.id == photoid)
				{
					group.items.splice(idx, 1);
					//var item2 = $("#mylist").find("li:contains('item2')");
					//item2.remove();
					//$('#' + lvid).listview('refresh');
					listView.empty();
					loadGroup(lvid, group, cbks);
				}*/
			},
			onError: function() {
				console.log('error');
			}
		});		
	});

	$('#' + lvid).listview('refresh');
	$.mobile.loading('hide');
	return;

}

function renderGroup(lvid, group, cbks)
{
	$.mobile.loading('show')

	var itemClass = 'item';
	var listView = $('#' + lvid);

	var items = group.items;
	if (items.length == 0) {
		renderEmptyFolderGroup(lvid, listView, group);
		return;
	}
	// 
	var tmpl = `<a href="#" style="display:flex" class="__class__" id="${itemClass}-__idx__"> 
					<div class="item-thumb"> 
						<img class="item-thumb" src="__thumb__" /> 
					</div> 
					<div class="item-label">__label__</div> 
				</a>`;

	var canDelete = true;
	if (canDelete)
	{
		tmpl += 
		`<a href="#" 
			class="deleteItem" 
			id="deleteItem-__idx__" 
			data-role="button" 
			data-icon="delete" 
			data-photoid="__id__">
			Delete
		</a>`;
	}
	var i;
	var listItemsHtml = '';
	var selectedIdx = group.selectedItemIdx;
	
	var gConx = gPhotoTimeAPI.getConnection();

	// TODO: need to "page" through these thumbs as loading all these images takes a long time
	// or lazy load more
	// maybe set timeout to load more? would that help
	//var maxLoadItems = Math.min(100, items.length);
	const maxLoadItems = items.length;
	//listItemsHtml = createListItems(0, maxLoadItems, items, tmpl, gConx, itemClass)
	for (i = 0; i < maxLoadItems; ++i) {
		let item = items[i];
		let h = tmpl.replace(/__idx__/g, i);
		h = h.replace(/__id__/g, item.id);
		
		h = h.replace(/__thumb__/g, gConx.getThumbUrl(item.thumb));
		h = h.replace(/__label__/g, item.label);
		if (i == selectedIdx) {
			h = h.replace(/__class__/g, 'selectedItem ' + itemClass);
		} else {
			h = h.replace(/__class__/g, itemClass);
		}
		
		let liHtml = `<li id="list-${itemClass}-${i}">${h}</li>`;
		listItemsHtml += liHtml;
	}
	/*
	if (maxLoadItems < items.length) {
		setTimeout(() => {
			// load more..?
			let listView = $(`#${lvid}`);
			
		}, 100);
	}
	*/

	listView.html(listItemsHtml);
	
	$('.' + itemClass).unbind('click');
	$('.' + itemClass).click(function(event) {
		if (cbks.onSelect)
		{
			var idx;
			idx = this.id.split('-')[1]
			cbks.onSelect(idx);
		}
	});

	$('a[data-rel="custom-back"]').unbind('click');
	$('a[data-rel="custom-back"]').click(function(event) {
		event.preventDefault();
		$.mobile.loading('show');
		var applocation = appstate.getLocation();
		if (applocation.item.type=='folder' && applocation.parents.length > 0) {
			// if have parents and parent is a folder
			// than just change state and refresh
			// otherwise issue go back
			if (applocation.parents[applocation.parents.length-1].type == 'folder') {
				app.doBack();
				itemsPage.loadItems();
			} else {
				app.goBack();
			}
		}
		$.mobile.loading('hide');
		return false;
	});

	$('.deleteItem').unbind('click');
	$('.deleteItem').click(function(event) {
		$.mobile.loading('show');
		var idx;
		idx = this.id.split('-')[1]
		//console.log('clicked delete for idx:' + idx);
		//console.log(this.getAttribute('data-photoid'));
		var photoid = this.getAttribute('data-photoid');
		
		//console.log('TODO: del for photo id - ' + photoid);
		//let gConx = gPhotoTimeAPI.getConnection();
		gConx.delItem(photoid, {
			onSuccess: function(data) {
				$.mobile.loading('hide');
				//console.log('ok');
				//console.log(data);
				var test = group.items[idx];
				if (test.id == photoid)
				{
					group.items.splice(idx, 1);
					//var item2 = $("#mylist").find("li:contains('item2')");
					//item2.remove();
					//$('#' + lvid).listview('refresh');
					listView.empty();
					loadGroup(lvid, group, cbks);
				}
			},
			onError: function() {
				console.log('error');
			}
		});
	});

	$('#' + lvid).listview('refresh');
	$.mobile.loading('hide');
}

class Poller
{
	constructor(method, periodMillis) {
		this.method = method;
		this.periodMillis = periodMillis?periodMillis:30000;

		this.boundFn = function() {
			this.onTime();
		}.bind(this);

		setTimeout(this.boundFn, periodMillis);
	}


	onTime() {
		this.method(this);
		setTimeout(this.boundFn, this.periodMillis);
	}
	getPeriodMillis() {
		return this.periodMillis;
	}
	setPeriodMillis(newPeriodMillis) {
		this.periodMillis = newPeriodMillis;
	}
}

function statusCheck(poller) {
	// call server to check thumb status
	var gConx = gPhotoTimeAPI.getConnection();
	if (!gConx) {
		return;
	}

	gConx.checkStatus().then((data) => {
		if (data.activeThumbTasks.length) {
			$('#items-page-status-text').html("thumb status: working on it, thumbs remaining: " + data.activeThumbTasks.length);
			poller.setPeriodMillis(3000);
		} else {
			$('#items-page-status-text').html("thumb status: all done");
			// slow down check
			const periodMillis = poller.getPeriodMillis();
			if (periodMillis < 30000) {
				poller.setPeriodMillis(periodMillis+5000);
			}
			
		}
	}, (reason) => {
		console.warn('failed to check server status');
	}).catch( (reason) => {
		console.log(reason);
	});
}

var gPoller = new Poller(statusCheck, 5000);

$(document).on('pagebeforeshow',"#items", function() {
	itemsPage.loadItems();
});


export { itemsPage }