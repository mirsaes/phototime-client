var itemsPage = {};

itemsPage.loadItems = function()
{
	var group = app.location.item;
	if (group.type == "file") {
		var group = app.location.parents.pop();
		app.location.item = group;
	}
	var onGroupItemsAvail = function(item, items)
	{
		//console.log('TODO: just pop node when going back?');
		app.location.parents.push(group);
		app.location.item = item;
		item.items = items;
		$.mobile.changePage('items.html#items');
	};
	
	loadGroup('groupItemsList', group, {
		onSelect: function(idx)
		{
			console.log('group item selected idx: ' + idx);
			var item = group.items[idx];
			console.log('item.type='+item.type);
			group.selectedItemIdx = idx;
			if (item.type == "file")
			{
				console.log('TODO: clicked on file, show "full" image page');
				app.location.parents.push(group);
				app.location.item = item;
				$.mobile.changePage('itemView.html#itemView');
			} else {
				// check if already have items
				if (item.items) {
					onGroupItemsAvail(item, item.items);
				} else {
					gConx.getItems(item.id, {
						onSuccess: function(data) {
							var jData = JSON.parse(data);
							onGroupItemsAvail(item, jData.items);
						}
					});
				}
			}
		}
	});

};

function loadGroup(lvid, group, cbks)
{
	$.mobile.loading('show')

	var itemClass = 'item';
	var listView = $('#' + lvid);
	var items = group.items;
	if (items.length == 0) {
		var deleteFolderTmpl = '<a href="#" class="deleteItem" id="deleteItem-" data-role="button" data-icon="delete"\
				data-photoid="__id__">Delete</a>';
		var emptyFolderHtml = '<li ><a href="#"><div>This folder is empty:</div><div>__id__</div></a>' +
			deleteFolderTmpl + "</li>";
		listView.html(emptyFolderHtml.replace(/__id__/g, group.id));
		$('.deleteItem').click(function(event) {
			$.mobile.loading('show');
			var photoid = this.getAttribute('data-photoid');
			gConx.delItem(photoid, {
				onSuccess: function(data) {
					console.log('deleted item: ' + photoid);
					console.log(data);
					var parent = app.location.parents[app.location.parents.length-1];
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
	//console.log(items);
	// 
	var tmpl = '<a href="#" class="__class__' + '" id="' + itemClass + '-__idx__"><div>__label__</div><img src="__thumb__" /></a>';

	var canDelete = true;
	if (canDelete)
	{
		tmpl += '<a href="#" class="deleteItem" id="deleteItem-__idx__" data-role="button" data-icon="delete" data-photoid="__id__">Delete</a>';	
	}
	var i;
	var listItemsHtml = '';
	var selectedIdx = group.selectedItemIdx;
	
	for (i = 0; i < items.length; ++i) {
		var item = items[i];
		var h = tmpl.replace(/__idx__/g, i);
		h = h.replace(/__id__/g, item.id);
		h = h.replace(/__thumb__/g, gConx.getThumbUrl(item.thumb));
		h = h.replace(/__label__/g, item.label);
		if (i == selectedIdx) {
			h = h.replace(/__class__/g, 'selectedItem ' + itemClass);
		} else {
			h = h.replace(/__class__/g, itemClass);
		}
		
		var liHtml = '<li id="list-' + itemClass + '-__idx__">' + h + '</li>';
		liHtml = liHtml.replace(/__idx__/g, i);
		listItemsHtml += liHtml;
		//listView.append(liHtml);
	}
	
	listView.append(listItemsHtml);
	
	$('.' + itemClass).click(function(event) {
		if (cbks.onSelect)
		{
			var idx;
			idx = this.id.split('-')[1]
			cbks.onSelect(idx);
		}
	});
	
	$('.deleteItem').click(function(event) {
		var idx;
		idx = this.id.split('-')[1]
		//console.log('clicked delete for idx:' + idx);
		//console.log(this.getAttribute('data-photoid'));
		var photoid = this.getAttribute('data-photoid');
		
		console.log('TODO: del for photo id - ' + photoid);
		gConx.delItem(photoid, {
			onSuccess: function(data) {
				console.log('ok');
				console.log(data);
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
}