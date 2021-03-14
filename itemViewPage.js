import { gPhotoTimeAPI } from './api/photoTimeApi.js';
import {appstate } from './appstate.js'
import { app } from './app.js'

var itemViewPage = {};

itemViewPage.updateToPrev = function(adjNav, items) {
	var applocation = appstate.getLocation();
	applocation.item = null;
	adjNav.prevParent.items = items;
	
	var popIdx;
	for (popIdx = 0; popIdx < adjNav.prevPopCount; ++popIdx) {
		applocation.parents.pop();
	}
	
	applocation.parents.push(adjNav.prevParent);
	applocation.item = adjNav.prevParent.items[adjNav.prevParent.items.length-1];
	// turn off loading
	itemViewPage.beforeShow();
};

itemViewPage.updateToNext = function(adjNav, items) {
	var applocation = appstate.getLocation();
	applocation.item = null;
	adjNav.nextParent.items = items;
	
	var popIdx;
	for (popIdx = 0; popIdx < adjNav.nextPopCount; ++popIdx) {
		applocation.parents.pop();
	}
	
	applocation.parents.push(adjNav.nextParent);
	applocation.item = adjNav.nextParent.items[0];
	// turn off loading
	itemViewPage.beforeShow();
};

itemViewPage.onSwipeFunction = function(event, swipeDirection) {
	var applocation = appstate.getLocation();
	var item = applocation.item;

	//console.log('swiped ' + direction);
	//console.log(event);
	var adjSiblings = app.getAdjSiblings(item);

	if (swipeDirection == "left") {
		// swipe left would pull in from right
		if (adjSiblings.next) {
			applocation.item = adjSiblings.next;
			itemViewPage.beforeShow();
			return;
		}
		
		// no more siblings, try to go to parent's sibling's next item
		var adjNav = app.getAdjNav(item);
		if (adjNav.nextParent && adjNav.nextPopCount > 0) {
			//console.log(adjNav);
			
			if (adjNav.next) {
				applocation.item = adjNav.next;
				
				var popIdx;
				for (popIdx = 0; popIdx < adjNav.nextPopCount; ++popIdx) {
					applocation.parents.pop();
				}
				
				applocation.parents.push(adjNav.nextParent);
			} else if (!adjNav.nextParent.items){
				// need to ajax items
				//console.log("TODO: set page loading");
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
			applocation.item = adjSiblings.prev;
			itemViewPage.beforeShow();
			return;
		}
		// no more siblings, try to go to parent's sibling's next item
		var adjNav = app.getAdjNav(item);
		if (adjNav.prevParent && adjNav.prevPopCount > 0) {
			
			if (adjNav.prev) {
				applocation.item = adjNav.prev;
				
				var popIdx;
				for (popIdx = 0; popIdx < adjNav.prevPopCount; ++popIdx) {
					applocation.parents.pop();
				}
				
				applocation.parents.push(adjNav.prevParent);
			} else if (!adjNav.prevParent.items){
				// need to ajax items
				//console.log("TODO: set page loading");
				gConx.getItems(adjNav.prevParent.id, {
					onSuccess: function(data) {
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

itemViewPage.beforeShow = function()
{
	var applocation = appstate.getLocation();
	var item = applocation.item;
	var nodeId = 'image';
	if (!item)
	{
		if (applocation.repoIdx == -1) {
			console.warn("not persisting location, so reload page isn't working")
			$.mobile.changePage('items.html#items');
		}
		console.log('no item, viewing items');
		//applocation.item = applocation.parents.pop();
		//$.mobile.changePage('items.html#items');
		// remove itemView from history
		var imageDiv = $("#" + nodeId);
		imageDiv.html("<div>This folder is empty: " + applocation.parents[applocation.parents.length-1].id + "</div>");
		//app.goBack();
		return;
	} else {
		// go up chain marking each item as selected
		var pidx = applocation.parents.length-1;
		var selItem = item;
		while (pidx >= 0) {
			let parent = applocation.parents[pidx];
			if (!parent)
				break;
			if (!parent.items) {
				// if editing image,
				break;
			}
			parent.selectedItemIdx = app.getItemIdx(parent.items, selItem);
			selItem = parent;
			pidx = pidx - 1;
		}
		
		loadImage(nodeId, item)
	}
	
	// now bind events
	var imageContainer = $('#' + nodeId);
	var onSwipeFunction = function(event, swipeDirection) {
		return itemViewPage.onSwipeFunction(event, swipeDirection);
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

	// unbinding so don't fire event twice
	imageContainer.unbind("swipeleft");
	imageContainer.unbind("swiperight");
	$('.deleteItem').unbind('click');
	$('.rateItem').unbind('click');
	$('.editItem').unbind('click');
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

	$('.editItem').click(function(event) {
		var applocation = appstate.getLocation();
		var item = applocation.item;

		applocation.parents.push(item);
		applocation.item = item;
	
		var photoid = item.id;
		//console.log('edit Item ' + photoid);
		$.mobile.changePage('imageEdit.html');

	});

	$('.rateItem').click(function(event) {
		var applocation = appstate.getLocation();
		var item = applocation.item;
		var photoid = item.id;
		//console.log('rate Item ' + photoid);
		// TODO: show popup of rating.. 5 stars
		var rating = $(this).data('rating');
		var gConx = gPhotoTimeAPI.getConnection();
		gConx.rateItem(photoid, rating, {onSuccess: function() {
			//console.log(`todo toast, rated item ${rating} ${photoid}`);
			if (photoid === applocation.item.id) {
				$('#ratingPopup a.rateItem').removeClass("active-rating");
				$(`#ratingPopup a.rateItem[data-rating="${rating}"]`).addClass("active-rating");
				applocation.item.rating = rating;
				if (applocation.item.metadataLoaded && applocation.item.metadata) {
					applocation.item.metadata.Rating = rating;
					itemViewPage.onMetadataUpdated();
				}
			}
		}});
	});

	$('#ratingPopup').popup({
		afteropen: function(event, ui) {
			var applocation = appstate.getLocation();
			var rating = applocation.item.rating;
			$('#ratingPopup a.rateItem').removeClass("active-rating");
			$(`#ratingPopup a.rateItem[data-rating="${rating}"]`).addClass("active-rating");		
		}
	});

	$('.prevItem').click(function(event) {
		var applocation = appstate.getLocation();
		var item = applocation.item;
		var photoid = item.id;
		//console.log('prev Item ' + photoid);
		onSwipeFunction(event, "right");
	});
	$('.nextItem').click(function(event) {
		var applocation = appstate.getLocation();
		var item = applocation.item;
		var photoid = item.id;
		//console.log('next Item ' + photoid);
		onSwipeFunction(event, "left");
	});
	
	$('.deleteItem').click(function(event) {
		// delete applocation.item
		var applocation = appstate.getLocation();
		var item = applocation.item;
		var photoid = item.id;
		const gConx = gPhotoTimeAPI.getConnection();
		gConx.delItem(photoid, {
			onSuccess: function(data) {
				var adjSiblings = app.getAdjSiblings(item);
				// now remove item from parent
				app.removeItemFromParent(item, adjSiblings.idx);
				if (adjSiblings.next) {
					applocation.item = adjSiblings.next;
					itemViewPage.beforeShow();
				} else if (adjSiblings.prev) {
					applocation.item = adjSiblings.prev;
					itemViewPage.beforeShow();
				} else {
					//console.log('go back!');
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
	var applocation = appstate.getLocation();
	var detailImageRating = $(".detailImageRating")[0];
	detailImageRating.style.visibility="visible";

	var rating = applocation.item.rating;

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
	var applocation = appstate.getLocation();
	if (applocation.item.id !== item.id)
		return;

	if (!applocation.item.metadataLoaded) {
		var gConx = gPhotoTimeAPI.getConnection();
		gConx.loadMetadata(item.id).then((metadata) => {
			if (applocation.item.id === item.id) {
				if (metadata) {
					applocation.item.metadata = metadata;
					applocation.item.metadataLoaded = true;
					applocation.item.rating = metadata.Rating;
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
	//console.log("request metadata (rating) for image");
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
			//use2 = w2;
		} else {
			useh = h1;
			usew = w1;
		}
	}

	img.style.maxHeight=`${useh}px`;
	img.style.height=`${useh}px`;
	img.style.visibility='visible';
}

function loadImage(nodeId, item)
{
	// imageId for image container "image"
	// class for holding img element selector ".detailImage"
	//  

	var imageId = nodeId;
	var imageContainer = $('#' + imageId );
	var gConx = gPhotoTimeAPI.getConnection();
	var thumbUrl = gConx.getThumbUrl(item.thumb)

	var imageElementSelector = "img.detailImage";
	imageContainer.find(imageElementSelector).empty().attr("src", "");
	imageContainer.find(".detailImageLabel div").empty().text(item.label);

	var img = $(`#${imageId} img`)[0];
	img.style.visibility="hidden";
	$('.detailImageRating')[0].style.visibility='hidden';

	setTimeout(function() {
		var detailImageHolder=imageContainer.find(".detailImageHolder");
		var containerSize={"w": detailImageHolder.innerWidth(), "h": detailImageHolder.innerHeight()};

		imageContainer.find(imageElementSelector).empty().attr("src", thumbUrl);
		imageContainer.find(imageElementSelector).unbind("load").load(function() {
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
$(document).on('pagebeforeshow',"#itemView", function() {		
	itemViewPage.beforeShow();
});

export { itemViewPage }
