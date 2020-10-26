var itemViewPage = {};

itemViewPage.updateToPrev = function(adjNav, items) {
	app.location.item = null;
	adjNav.prevParent.items = items;
	
	var popIdx;
	for (popIdx = 0; popIdx < adjNav.prevPopCount; ++popIdx) {
		app.location.parents.pop();
	}
	
	app.location.parents.push(adjNav.prevParent);
	app.location.item = adjNav.prevParent.items[adjNav.prevParent.items.length-1];
	// turn off loading
	itemViewPage.beforeShow();
};

itemViewPage.updateToNext = function(adjNav, items) {
	app.location.item = null;
	adjNav.nextParent.items = items;
	
	var popIdx;
	for (popIdx = 0; popIdx < adjNav.nextPopCount; ++popIdx) {
		app.location.parents.pop();
	}
	
	app.location.parents.push(adjNav.nextParent);
	app.location.item = adjNav.nextParent.items[0];
	// turn off loading
	itemViewPage.beforeShow();
};

itemViewPage.beforeShow = function()
{
	var item = app.location.item;
	var nodeId = 'image';
	if (!item)
	{
		console.log('no item, viewing items');
		//app.location.item = app.location.parents.pop();
		//$.mobile.changePage('items.html#items');
		// remove itemView from history
		var imageDiv = $("#" + nodeId);
		imageDiv.html("<div>This folder is empty: " + app.location.parents[app.location.parents.length-1].id + "</div>");
		//app.goBack();
		return;
	} else {
		// go up chain marking each item as selected
		var pidx = app.location.parents.length-1;
		var selItem = item;
		while (pidx >= 0) {
			var parent = app.location.parents[pidx];
			if (!parent)
				break;
				
			parent.selectedItemIdx = app.getItemIdx(parent.items, selItem);
			selItem = parent;
			pidx = pidx - 1;
		}
		
		loadImage(nodeId, item)
	}
	
	// now bind events
	var imageContainer = $('#' + nodeId);
	var onSwipeFunction = function(event, direction) {
		//console.log('swiped ' + direction);
		//console.log(event);
		adjSiblings = app.getAdjSiblings(item);

		if (direction == "left") {
			// swipe left would pull in from right
			if (adjSiblings.next) {
				app.location.item = adjSiblings.next;
				itemViewPage.beforeShow();
				return;
			}
			
			// no more siblings, try to go to parent's sibling's next item
			var adjNav = app.getAdjNav(item);
			if (adjNav.nextParent && adjNav.nextPopCount > 0) {
				//console.log(adjNav);
				
				if (adjNav.next) {
					app.location.item = adjNav.next;
					
					var popIdx;
					for (popIdx = 0; popIdx < adjNav.nextPopCount; ++popIdx) {
						app.location.parents.pop();
					}
					
					app.location.parents.push(adjNav.nextParent);
				} else if (!adjNav.nextParent.items){
					// need to ajax items
					console.log("TODO: set page loading");
					gConx.getItems(adjNav.nextParent.id, {
						onSuccess: function(data) {
							var jData = data;
							itemViewPage.updateToNext(adjNav, jData.items);
						}
					});
				} else {
					itemViewPage.updateToNext(adjNav, adjNav.nextParent.items);
				}
			}
		} else if (direction == "right") {
			// swipe right would pull in from left
			if (adjSiblings.prev) {
				app.location.item = adjSiblings.prev;
				itemViewPage.beforeShow();
				return;
			}
			// no more siblings, try to go to parent's sibling's next item
			var adjNav = app.getAdjNav(item);
			if (adjNav.prevParent && adjNav.prevPopCount > 0) {
				//console.log(adjNav);
				
				if (adjNav.prev) {
					app.location.item = adjNav.prev;
					
					var popIdx;
					for (popIdx = 0; popIdx < adjNav.prevPopCount; ++popIdx) {
						app.location.parents.pop();
					}
					
					app.location.parents.push(adjNav.prevParent);
				} else if (!adjNav.prevParent.items){
					// need to ajax items
					console.log("TODO: set page loading");
					gConx.getItems(adjNav.prevParent.id, {
						onSuccess: function(data) {
							//var jData = JSON.parse(data);
							var jData = data;
							itemViewPage.updateToPrev(adjNav, jData.items);
						}
					});
				} else {
					itemViewPage.updateToPrev(adjNav, adjNav.prevParent.items);
				}
			}
		}
	};
	
	$.event.special.swipe.start = function (event) {
		//console.log('swipe start');
		//display popup for indicator where to swipe
		var data = event.originalEvent.touches ?
		event.originalEvent.touches[ 0 ] : event;
		
		//$('#popupBasic').popup( "open", {x:data.pageX-100, y:data.pageY});
		//$('#popupBasic').popup( "open", {x:data.pageX+100, y:data.pageY});
		return {
			time: ( new Date() ).getTime(),
			coords: [ data.pageX, data.pageY ],
			origin: $( event.target )
		};
	}

	// don't remember why unbinding here...
	imageContainer.unbind("swipeleft");
	imageContainer.unbind("swiperight");
	$('.deleteItem').unbind('click');
	$('.rateItem').unbind('click');
	$('.prevItem').unbind('click');
	
	imageContainer.on( "swipeleft", function(event) {
		//console.log('swipeleft');
		onSwipeFunction(event, "left");
	});
	imageContainer.on("swiperight", function(event) {
		//console.log('swiperight');
		onSwipeFunction(event, "right");
	});

	$('.rateItem').click(function(event) {
		var item = app.location.item;
		var photoid = item.id;
		console.log('rate Item ' + photoid);
	});
	$('.prevItem').click(function(event) {
		var item = app.location.item;
		var photoid = item.id;
		console.log('prev Item ' + photoid);
		onSwipeFunction(event, "right");
	});
	$('.nextItem').click(function(event) {
		var item = app.location.item;
		var photoid = item.id;
		console.log('next Item ' + photoid);
		onSwipeFunction(event, "left");
	});
	
	$('.deleteItem').click(function(event) {
		// delete app.location.item
		var item = app.location.item;
		var photoid = item.id;
		
		gConx.delItem(photoid, {
			onSuccess: function(data) {
				adjSiblings = app.getAdjSiblings(item);
				// now remove item from parent
				app.removeItemFromParent(item, adjSiblings.idx);
				if (adjSiblings.next) {
					app.location.item = adjSiblings.next;
					itemViewPage.beforeShow();
				} else if (adjSiblings.prev) {
					app.location.item = adjSiblings.prev;
					itemViewPage.beforeShow();
				} else {
					console.log('go back!');
					app.goBack();
					//history.back();
				}
			},
			onError: function() {
				console.log('an error occurred while deleteing item');
				console.log(item);
			}
		});
	});
};

function constrainImage(imgId)
{
	console.log('image loaded: ' + imgId);
	//console.log(arguments);
	var img = $('#' + imgId + ' img')[0];
	
	/*
	var pageHeight = $('#itemView').height();
	
	console.log('pageHeight=' + pageHeight);
	//var headerHeight = $('div[data-role="header"]').height();
	var headerHeight = $("div:jqmData(role='header')").height();
	//var footerHeight = $('div[data-role="footer"]').height();
	var footerHeight =  $("div:jqmData(role='footer')").height();
	console.log('headerHeight=' + headerHeight);
	console.log('footerHeight=' + footerHeight);
	
	console.log(img);
	console.log('w=' + img.width);
	console.log('h=' + img.height);
	*/
	img.origWidth = img.width;
	img.origHeight = img.height;
	img.origRatioWtoH = img.origWidth/img.origHeight;
	
	if (!img.style)
		img.style={};
		
	img.style.maxWidth = '' + Math.floor(img.origWidth*1.5) + 'px';
	img.style.maxHeight = '' + Math.floor(img.origHeight*1.5) + 'px';

	var newWidth = img.origWidth;
	var newHeight = img.origHeight;
	var ratioWtoH = newWidth/newHeight;
	
	delete img.style.width;
	delete img.style.height;
	var isPortrait = false;
	{
		// check landscape (get landscape size)
		img.style.width = "100%";
		newWidth = img.width;
		newHeight = Math.floor(newWidth/ratioWtoH);
	}
	
	{
		// check portrait
		delete img.style.width;
		img.style.height = "100%";
		
		var portraitHeight = Math.floor(img.height);//-80;
		delete img.style.height;
		
		// take smaller of dimensions
		if (portraitHeight  < newHeight)
		{
			isPortrait = true;
			newHeight = portraitHeight ;
			newWidth = ratioWtoH*newHeight;
		}

	}
	
	if (!isPortrait)
		img.style.width = '' + Math.floor(newWidth) + 'px';
	else
		img.style.height = '' + Math.floor(newHeight) + 'px';
};

function loadImage(nodeId, item)
{
	var imageId = nodeId;
	var imageContainer = $('#' + imageId );
	
	var tmpl = '<div class="hbox flex1"><img style="" class="detailImage" src="__thumb__" onLoad=constrainImage("' + imageId + '"); /></div>';
	tmpl += '<div class="detailImageLabel" style="position:absolute; top:0px; background-color:white; opacity:0.5"><div>__label__</div></div>';
	
	var h = tmpl.replace(/__thumb__/g, gConx.getThumbUrl(item.thumb));
	h = h.replace(/__id__/g, item.id);
	h = h.replace(/__label__/g, item.label);
	
	imageContainer.empty();
	imageContainer.append(h);
}