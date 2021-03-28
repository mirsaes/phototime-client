import { gPhotoTimeAPI } from './api/photoTimeApi.js';
import {appstate } from './appstate.js'
import { app } from './app.js'

var itemViewPage = {};

itemViewPage.updateToPrev = function(adjNav, items) {
	var applocation = appstate.getLocation();
	applocation.item = null;
	adjNav.parentsPrevSibling.items = items;
	
	var popIdx;
	for (popIdx = 0; popIdx < adjNav.prevPopCount; ++popIdx) {
		applocation.parents.pop();
	}
	
	applocation.parents.push(adjNav.parentsPrevSibling);
	applocation.item = adjNav.parentsPrevSibling.items[adjNav.parentsPrevSibling.items.length-1];
	// turn off loading
	itemViewPage.beforeShow();
};

itemViewPage.updateToNext = function(adjNav, items) {
	var applocation = appstate.getLocation();
	applocation.item = null;
	adjNav.parentsNextSibling.items = items;
	
	var popIdx;
	for (popIdx = 0; popIdx < adjNav.nextPopCount; ++popIdx) {
		applocation.parents.pop();
	}
	
	applocation.parents.push(adjNav.parentsNextSibling);
	applocation.item = adjNav.parentsNextSibling.items[0];
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
		if (adjNav.parentsNextSibling && adjNav.nextPopCount > 0) {
			//console.log(adjNav);
			
			if (adjNav.next) {
				// set next item (should be file)
				// and update to appropriate "new" parent
				applocation.item = adjNav.next;
				
				var popIdx;
				for (popIdx = 0; popIdx < adjNav.nextPopCount; ++popIdx) {
					applocation.parents.pop();
				}
				// assuming this is a folder
				applocation.parents.push(adjNav.parentsNextSibling);
			} else if (adjNav.parentsNextSibling.type == 'file') {
				// set the item
				applocation.item = adjNav.parentsNextSibling;
				// remove parents until sibling's parent is on stack
				var popIdx;
				for (popIdx = 0; popIdx < adjNav.nextPopCount; ++popIdx) {
					applocation.parents.pop();
				}
				// no need to push the parentsNextSibling, since it is a an item, not a parent
				// turn off loading
				itemViewPage.beforeShow();

			} else if (!adjNav.parentsNextSibling.items){
				// need to ajax items
				//console.log("TODO: set page loading");
				var gConx = gPhotoTimeAPI.getConnection();
				gConx.getItems(adjNav.parentsNextSibling.id, {
					onSuccess: function(data) {
						var jData = data;
						// next could either be in a sibling folder
						// or have to use its parent folder..
						console.log(jData.info.type);
						if (jData.info.type == 'file') {
							console.log('todo: ');

						} else {
							itemViewPage.updateToNext(adjNav, jData.items);
						}
					}
				});
			} else {
				itemViewPage.updateToNext(adjNav, adjNav.parentsNextSibling.items);
			}
		}
	} else if (swipeDirection == "right") {
		// swipe right would pull in from left
		if (adjSiblings.prev) {
			if (adjSiblings.prev.type == 'file') {
				applocation.item = adjSiblings.prev;
				itemViewPage.beforeShow();
				return;
			} else {
				// its a folder..
				console.log(adjSiblings.prev);
				if (adjSiblings.prev.items) {
					// items loaded, so 
					applocation.item = adjSiblings.prev.items[adjSiblings.prev.items.length-1];
					applocation.parents.push(adjSiblings.prev);
					itemViewPage.beforeShow();
					return;
				} else {
					var gConx = gPhotoTimeAPI.getConnection();

					gConx.getItems(adjSiblings.prev.id, {
						onSuccess: function(data) {
							var jData = data;
							if (jData.items && jData.items.length) {
								
								//itemViewPage.updateToPrev(adjNav, jData.items);
							} else {
								// just show it as an item
								applocation.item = adjSiblings.prev;
								itemViewPage.beforeShow();
							}
						}
					});
						
				}
			}
		}
		// no more siblings, try to go to parent's sibling's next item
		var adjNav = app.getAdjNav(item);
		if (adjNav.parentsPrevSibling && adjNav.prevPopCount > 0) {
			
			if (adjNav.prev) {
				if (adjNav.prev.type == 'file') {
					applocation.item = adjNav.prev;
					
					var popIdx;
					for (popIdx = 0; popIdx < adjNav.prevPopCount; ++popIdx) {
						applocation.parents.pop();
					}
					
					applocation.parents.push(adjNav.parentsPrevSibling);
				} else {
					// its a folder, might be empty, etc
					console.log(adjNav.prev);
				}
			} else if (!adjNav.parentsPrevSibling.items){
				// need to ajax items
				//console.log("TODO: set page loading");
				var gConx = gPhotoTimeAPI.getConnection();

				gConx.getItems(adjNav.parentsPrevSibling.id, {
					onSuccess: function(data) {
						var jData = data;
						itemViewPage.updateToPrev(adjNav, jData.items);
					}
				});
			} else {
				itemViewPage.updateToPrev(adjNav, adjNav.parentsPrevSibling.items);
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
	// apparently goes into crazy hot loop or something if don't unbind..
	// which i observed when forget to unbind nextItem.
	var swipeContainer = $('.swipe-area');
	swipeContainer.unbind("swipeleft");
	swipeContainer.on("swipeleft", function(event) {
		onSwipeFunction(event, "left");
	});
	swipeContainer.unbind("swiperight");
	swipeContainer.on("swiperight", function(event) {
		onSwipeFunction(event, "right");
	});


	$('.editItem').unbind('click');
	$('.editItem').click(function(event) {
		var applocation = appstate.getLocation();
		var item = applocation.item;

		applocation.parents.push(item);
		applocation.item = item;
	
		var photoid = item.id;
		$.mobile.changePage('imageEdit.html');
	});


	$('.rateItem').unbind('click');
	$('.rateItem').click(function(event) {
		var applocation = appstate.getLocation();
		var item = applocation.item;
		var photoid = item.id;
		//console.log('rate Item ' + photoid);
		// TODO: show popup of rating.. 5 stars
		var rating = $(this).data('rating');
		var gConx = gPhotoTimeAPI.getConnection();
		gConx.rateItem(photoid, rating, null).then(() => {
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
		}).catch ((reason) => {
			console.log('drat, rating failed');
		});
	});

	$('#new-tag-save').unbind('click');
	$('#new-tag-save').click(function(event) {
		var applocation = appstate.getLocation();
		var item = applocation.item;
		var photoid = item.id;
		var tag = $('#new-tag-text').val();
		//var tag = 'test';
		console.log(`add tag ${tag}- photoid=${photoid}`);

		// make sure tag doesn't already exist..
		if (item.tags && item.tags.indexOf(tag)>=0) {
			return;
		}

		gPhotoTimeAPI.addTag(photoid, tag).then((val) => {
			// done adding tag
			// now update ui and metadata..
			if (applocation.item.id === appstate.getLocation().item.id) {
				var curTags = applocation.item.tags;
				applocation.item.tags.push(tag);

				itemViewPage.onMetadataUpdated();
			}
		}).catch((reason) => {
			console.log('sorry');
		});
	});

	$('#ratingPopup').popup({
		afteropen: function(event, ui) {
			var applocation = appstate.getLocation();
			var rating = applocation.item.rating;
			$('#ratingPopup a.rateItem').removeClass("active-rating");
			$(`#ratingPopup a.rateItem[data-rating="${rating}"]`).addClass("active-rating");		
		}
	});

	$('.prevItem').unbind('click');
	$('.prevItem').click(function(event) {
		var applocation = appstate.getLocation();
		var item = applocation.item;
		var photoid = item.id;
		//console.log('prev Item ' + photoid);
		onSwipeFunction(event, "right");
	});

	$('.nextItem').unbind('click');
	$('.nextItem').click(function(event) {
		var applocation = appstate.getLocation();
		var item = applocation.item;
		var photoid = item.id;
		//console.log('next Item ' + photoid);
		onSwipeFunction(event, "left");
	});
	
	$('.deleteItem').unbind('click');
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

	// update rating
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

	// update tags
	var metaDataHUD = $('.itemViewMetaDataHUD')[0];
	var tagsList = $('#itemViewTagsList');
	var tagsHTMLAy = [];
	for (var i = 0; i < applocation.item.tags.length; ++i ) {
		let liHTML = `
			<li>
				<div style="display:flex;align-items:center">
					<div style="flex:1;">${applocation.item.tags[i]}</div>
					<div data-tag="${applocation.item.tags[i]}" data-tag-idx="${i}" data-rel="tag-del" data-role="button" data-icon="minus" data-iconpos="notext"
					class="tag-delete ui-btn ui-icon-minus ui-btn-icon-notext ui-shadow ui-corner-all"
					></div>
				</div>
			</li>
		`;
		tagsHTMLAy.push(liHTML);
	}

	tagsList.empty();
	tagsList.html(tagsHTMLAy.join("\n"));

	$(metaDataHUD).find('a[data-rel="tag-add"]').click(function(event) {
	});

	$(tagsList).find('div[data-rel="tag-del"]').click(function(event) {
		const tagValue = $(this).data('tag');
		// delete the tag to server
		// on complete, refresh tags and cached item metadata widget
		const applocation = appstate.getLocation();
		gPhotoTimeAPI.deleteTag(applocation.item.id, tagValue).then((res) => {
			// done deleting tag
			// now update ui and metadata..
			if (applocation.item.id === appstate.getLocation().item.id) {
				var curTags = applocation.item.tags;
				for (let tagIdx =0; tagIdx< curTags.length; ++tagIdx) {
					if (curTags[tagIdx] === tagValue) {
						applocation.item.tags.splice(tagIdx, 1);
						break;
					}
				}

				itemViewPage.onMetadataUpdated();
			}
		});
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
					applocation.item.tags = [];
					if (metadata.Keywords) {
						applocation.item.tags = metadata.Keywords.split(",");
						console.log(applocation.item.tags);
					}
					itemViewPage.onMetadataUpdated();
				}
			}
		}).catch(reason => {
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
	img.origWidth = img.naturalWidth;
	img.origHeight = img.naturalHeight;
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
	//img.style.display = 'none';

	setTimeout(() => {
		img.style.display='none';
		var cnv = document.getElementById('detail-image-canvas');
		var ctx = cnv.getContext("2d");
		
		cnv.width = usew;
		cnv.height= useh;

		// destination x, destination y, destination width, destination height
		ctx.drawImage(img, 0, 0, usew, useh);
		cnv.style.display='block';
		panzoom(cnv);
	});

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
	var cnv = document.getElementById('detail-image-canvas');
	cnv.style.display='none';

	delete img.style.display;
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

$(document).on('pagebeforeshow',"#itemView", function() {		
	itemViewPage.beforeShow();
});

export { itemViewPage }
