// don't know why I put this in the model folder
// perhaps there was a different intention in the past
// at some point will want to move the cheese
/*
[
	{
		id:
		thumb:
		items:[]
	}
]
*/
function renderRepos(lvid, repos, cbks) {
	$.mobile.loading('show');
	var jRepos = $('#' + lvid);
	var i;
	var listItemsHtml = '';
	
	for (i = 0; i < repos.length; ++i) {

		let repo = repos[i];
		let liHtml = `
			<li id="repo-list-item-${i}">
				<a href="#" style="display:flex" class="repoItem" id="repoItem-${i}"> 
					<div class="item-thumb"> 
						<img class="item-thumb" src="${repo.thumb}" /> 
					</div> 
					<div class="item-label">${repo.label}</div> 
				</a>
			</li>`;

		listItemsHtml += liHtml;
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
	
	var jListView = $('#' + lvid);
	
	var items = repo.items;
	var selectedIdx = repo.selectedItemIdx;
	
	var i;
	var liHtmlAy = [];
	// faster if insert the ul element as well?
	// key, value, compile once.. find each __xxx__
	for (i = 0; i < items.length; ++i) {
		let item = items[i];
		let selectedClass = (i== selectedIdx?"selectedItem":"");
		let itemThumbUrl = gConx.getThumbUrl(item.thumb);


		let liHtml = `
			<li id=${itemClass}-${i}>
				<a href="#" style="display: flex" class="${itemClass} ${selectedClass}" id="${itemClass}-${i}">
					<div class="item-thumb">
						<img class="item-thumb" src="${itemThumbUrl}"/>
					</div>
					<div class="item-label">${item.label}</div>
				</a>
			</li>
		`;
		liHtmlAy.push(liHtml);
	}
	jListView.html(liHtmlAy.join(''));
	
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
	
export { renderRepos, renderRepo }
