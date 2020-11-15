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
		if (app.location.repoIdx == -1) {
			console.warn("not persisting location, so reload page isn't working")
			$.mobile.changePage('items.html#items');
		}
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
	var onSwipeFunction = function(event, swipeDirection) {
		//console.log('swiped ' + direction);
		//console.log(event);
		adjSiblings = app.getAdjSiblings(item);

		if (swipeDirection == "left") {
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
		} else if (swipeDirection == "right") {
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
	// apparently goes into crazy hot loop or something if don't unbind..
	// which i observed when forget to unbind nextItem.
	$('.nextItem').unbind('click');
	
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
		// TODO: show popup of rating.. 5 stars
		var rating = $(this).data('rating');
		gConx.rateItem(photoid, rating, {onSuccess: function() {
			console.log(`todo toast, rated item ${rating} ${photoid}`);
			if (photoid === app.location.item.id) {
				$('#ratingPopup a.rateItem').removeClass("active-rating");
				$(`#ratingPopup a.rateItem[data-rating="${rating}"]`).addClass("active-rating");
				app.location.item.rating = rating;
				if (app.location.item.metadataLoaded && app.location.item.metadata) {
					app.location.item.metadata.Rating = rating;
					itemViewPage.onMetadataUpdated();
				}
			}
		}});
	});

	$('#ratingPopup').popup({
		afteropen: function(event, ui) {
			var rating = app.location.item.rating;
			$('#ratingPopup a.rateItem').removeClass("active-rating");
			$(`#ratingPopup a.rateItem[data-rating="${rating}"]`).addClass("active-rating");		
		}
	})

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

itemViewPage.onMetadataUpdated = function()
{
	var detailImageRating = $(".detailImageRating")[0];
	detailImageRating.style.visibility="visible";

	var rating = app.location.item.rating;

	// highlight each 

	$('.detailImageRating .hud-imageRating').removeClass("active-rating");
	$('.detailImageRating .hud-imageRating').each(function(index) {
		if ($(this).data('rating') <= rating) {
			$(this).addClass("active-rating");
		}
	});
}

itemViewPage.loadMetadata = function(imgId, item)
{
	if (app.location.item.id !== item.id)
		return;

	if (!app.location.item.metadataLoaded) {
		gConx.loadMetadata(item.id).then((metadata) => {
			if (app.location.item.id === item.id) {
				if (metadata) {
					app.location.item.metadata = metadata;
					app.location.item.metadataLoaded = true;
					app.location.item.rating = metadata.Rating;
					itemViewPage.onMetadataUpdated();
				}
			}
		}).catch((reason) => {
			console.log('failed');
		});
	} else {
		itemViewPage.onMetadataUpdated();
	}
}

function imageLoaded(imgId, item, containerSize)
{
	// request metadata (for image
	console.log("request metadata (rating) for image");
	itemViewPage.loadMetadata(imgId, item);
	constrainImage(imgId, containerSize);
}

function constrainImage(imgId, containerSize)
{
	var img = $('#' + imgId + ' img')[0];

	var containerIsPortrait = containerSize.h > containerSize.w;
	img.containerWidth=containerSize.w;
	img.containerHeight=containerSize.h;	
	img.origWidth = img.width;
	img.origHeight = img.height;
	var containerRatio = containerSize.w/containerSize.h;
	var imageRatio = img.width/img.height;
	if (!img.style) {
		img.style={};
	}

	// if ratio < 1 -> landscape
	// if ratio > 1 -> portrait

	var h1 = containerSize.h;
	var w1 = imageRatio*h1;

	var w2 = containerSize.w;
	var h2 = w2/imageRatio;

	var useh;
	var usew;
	if (w1 > containerSize.w) {
		useh = h2;
		usew = w2;
	} else if (h2 > containerSize.h) {
		useh = h1;
		usew = w1;
	} else {
		// both fit, pick closest
		var delta1 = containerSize.w - w1;
		var delta2 = containerSize.h - h2;

		if (delta1 > delta2) {
			useh = h2;
			use2 = w2;
		} else {
			useh = h1;
			usew = w1;
		}
	}

	img.style.maxHeight=`${useh}px`;
	img.style.height=`${useh}px`;
	img.style.visibility='visible';
};

function loadImage(nodeId, item)
{
	var imageId = nodeId;
	var imageContainer = $('#' + imageId );
	var thumbUrl = gConx.getThumbUrl(item.thumb)

	imageContainer.find(".detailImage").empty().attr("src", "");
	imageContainer.find(".detailImageLabel div").empty().text(item.label);

	var img = $(`#${imageId} img`)[0];
	img.style.visibility="hidden";
	$('.detailImageRating')[0].style.visibility='hidden';

	setTimeout(function() {
		var detailImageHolder=imageContainer.find(".detailImageHolder");
		var containerSize={"w": detailImageHolder.innerWidth(), "h": detailImageHolder.innerHeight()};

		imageContainer.find(".detailImage").empty().attr("src", thumbUrl);
		imageContainer.find("img.detailImage").unbind("load").load(function() {
			var dd = imageContainer.find(".detailImageHolder");
			imageLoaded(imageId, item, containerSize);
		});
		}, 10);
}
/*
$(window).resize(function(){
	var detailImageHolder = $(".detailImageHolder");
	var containerSize={"w": detailImageHolder.width(), "h": detailImageHolder.height()};
	console.log(containerSize);
});

*/