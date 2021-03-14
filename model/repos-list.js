import { gPhotoTimeAPI } from '../api/photoTimeApi.js'
/*
[
	{
		id:
		thumb:
		items:[]
	}
]
*/
function loadRepos(lvid, repos, cbks) {
	$.mobile.loading('show');
	var jRepos = $('#' + lvid);
	var tmpl = '<a href="#" class="repoItem" id="repoItem-__idx__"><div>__label__</div><img src="__thumb__" /></a>';	
	var i;
	var listItemsHtml = '';
	
	for (i = 0; i < repos.length; ++i) {
		let repo = repos[i];
		let h = tmpl.replace(/__idx__/g, i).replace(/__id__/g, repo.id).replace(/__thumb__/g, repo.thumb);
		h = h.replace(/__label__/g, repo.label);
		let liHtml = '<li id="repo-list-item-__idx__">' + h + '</li>';
		liHtml = liHtml.replace(/__idx__/g, i);
		listItemsHtml += liHtml;
		//jRepos.append(liHtml);
	}
	jRepos.append(listItemsHtml);
	
	$(".repoItem").click(function(event) {
		if (cbks.onSelect)
		{
			var idx;
			idx = this.id.split('-')[1]
			cbks.onSelect(idx);
		}
	});
	$('#' + lvid).listview('refresh');
}

function refreshList(lvid)
{
	$('#' + lvid).listview('refresh');
}

function renderRepo(lvid, repo, gConx, cbks) {
	//http://jquery-howto.blogspot.com/2009/02/5-easy-tips-on-how-to-improve-code.html
	//<ul class="overflowAuto" id="repoItemsList" data-role="listview"></ul>
	$.mobile.loading('show');
	var itemClass = 'item';
	
	//var jListParent = $('#' + 'repocontent');
	var jListView = $('#' + lvid);
	
	var items = repo.items;
	var selectedIdx = repo.selectedItemIdx;
	
	var tmpl = '<a href="#" class="' + itemClass + '" id="' + itemClass + '-__idx__"><div>__label__</div><img src="__thumb__" /></a>';	
	var i;
	var listItemsHtml = '';
	var liHtmlAy = [];
	//liHtmlAy.push('<ul class="overflowAuto" id="repoItemsList" data-role="listview" onLoad="refreshList("' + lvid + '">');
	//liHtmlAy.push('<ul class="overflowAuto" id="repoItemsList" data-role="listview">');
	// faster if insert the ul element as well?
	// key, value, compile once.. find each __xxx__
	for (i = 0; i < items.length; ++i) {
		let item = items[i];
		//var h = tmpl.replace(/__idx__/g, i).replace(/__id__/g, item.id).replace(/__thumb__/g, gConx.getThumbUrl(item.thumb)).replace(/__label__/g, item.label);
		//var liHtml = '<li id="list-' + itemClass + '-__idx__">' + h + '</li>';
		//liHtml = liHtml.replace(/__idx__/g, i);
		//var liHtml = '<li id="list-' + itemClass + '-' + i + '>' + tmpl + '</li>';
		liHtmlAy.push('<li id="');
		liHtmlAy.push(itemClass);
		liHtmlAy.push('-');
		liHtmlAy.push(i);
		liHtmlAy.push('">');
		
		// h
		liHtmlAy.push('<a href="#" class="');
		liHtmlAy.push(itemClass);
		if (i == selectedIdx)
		{
			liHtmlAy.push(' selectedItem');
		}
		liHtmlAy.push('" id="');
		liHtmlAy.push(itemClass);
		liHtmlAy.push('-');
		liHtmlAy.push(i);
		liHtmlAy.push('"><div>');
		liHtmlAy.push(item.label);
		liHtmlAy.push('</div><img src="');
		liHtmlAy.push(gConx.getThumbUrl(item.thumb));
		liHtmlAy.push('" /></a>');
		
		liHtmlAy.push('</li>');
		//listItemsHtml += liHtml;
	}
	//liHtmlAy.push('</ul>');
	//jListView.append(listItemsHtml);
	jListView.append(liHtmlAy.join(''));
	//jListParent.html(liHtmlAy.join(''));
	
	$('.' + itemClass).click(function(event) {
		if (cbks.onSelect)
		{
			var idx;
			idx = this.id.split('-')[1]
			cbks.onSelect(idx);
		}
	});
	
	$('#'+lvid).listview('refresh');
}
	
export { loadRepos, renderRepo }