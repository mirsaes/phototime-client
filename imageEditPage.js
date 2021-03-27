import { gPhotoTimeAPI } from './api/photoTimeApi.js';
import {appstate } from './appstate.js'
import { app } from './app.js'

var imageEditPage = {};
imageEditPage.cropInfo = {};
imageEditPage.cropInfo.aspectWidth="16";
imageEditPage.cropInfo.aspectHeight="9";

const defaultAspectWidth=16;
const defaultAspectHeight=9;

function constrainImage(imageElementSelector, containerSize)
{
	var img = $(imageElementSelector)[0];

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

function imageLoaded(imageElementSelector, item, containerSize)
{
    constrainImage(imageElementSelector, containerSize);
    var image = $(imageElementSelector)[0];
    
    imageEditPage.cropper = new Cropper(image, {
        aspectRatio: defaultAspectWidth/defaultAspectHeight,
        dragMode: 'move',
        crop(event) {
            /*
            console.log(`crop event: 
            x=${event.detail.x},y=${event.detail.y}
            , WxH=${event.detail.width}x=${event.detail.height}
            , rotate=${event.detail.rotate}
            , scale=${event.detail.scaleX}x${event.detail.scaleY}
            `);
            */
            imageEditPage.lastCropEventDetail = event.detail;
        }
    });
    
}

function loadImage(item)
{
	var gConx = gPhotoTimeAPI.getConnection();
	var thumbUrl = gConx.getThumbUrl(item.thumb)

    var imageContainerSelector = '#imageEditContainer';
    var imageElementSelector = '#imageEdit';

    var imageContainer = $(imageContainerSelector);
    imageContainer.find(imageElementSelector).empty().attr("src", "");
    var imageElem = $(imageElementSelector)[0];
	imageElem.style.visibility="hidden";

    setTimeout(function() {
        var imageHolderSelector="#imageEditHolder";
		var detailImageHolder=imageContainer.find(imageHolderSelector);
		var containerSize={"w": detailImageHolder.innerWidth(), "h": detailImageHolder.innerHeight()};

		imageContainer.find(imageElementSelector).empty().attr("src", thumbUrl);
		imageContainer.find(imageElementSelector).unbind("load").load(function() {
			//var dd = imageContainer.find(".detailImageHolder");
			imageLoaded(imageElementSelector, item, containerSize);
		});
	    }, 10);
}

//imageEdit
imageEditPage.beforeShow = function()
{
	var applocation = appstate.getLocation();
	var item = applocation.item;
	if (!item)
    {
        console.log('huh?');
    }


    const image = document.getElementById('imageEdit');
    var gConx = gPhotoTimeAPI.getConnection();
	var thumbUrl = gConx.getThumbUrl(item.thumb);

    loadImage(item);

    $('[data-rel="cropMode"]').on('click', function(event) {
        imageEditPage.cropper.setDragMode('crop');
    });

    $('[data-rel="panMode"]').on('click', function(event) {
        imageEditPage.cropper.setDragMode('move');
    });

	$('.aspectRatioOption').click(function(event) {
		var aspectRatio = $(this).data('aspect');

        if (aspectRatio =='free') {
            imageEditPage.cropper.setAspectRatio(0);
        } else {
            var aspectWidth = aspectRatio.split('x')[0];
            var aspectHeight = aspectRatio.split('x')[1];
            imageEditPage.cropInfo.aspectWidth = aspectWidth;
            imageEditPage.cropInfo.aspectHeight = aspectHeight;

            var aspectRatioNumber = parseInt(''+aspectWidth)/parseInt(''+aspectHeight);
            //console.log(`aspect ratio=${aspectWidth}x${aspectHeight}`);
            //console.log(`aspect ratio=${aspectRatioNumber}`);
            imageEditPage.cropper.setAspectRatio(aspectRatioNumber);
        }
    });

    $('[data-rel="crop"').click(function(event) {
        $.mobile.loading('show');

        var photoTimeConnection = gPhotoTimeAPI.getConnection();
		var applocation = appstate.getLocation();
		var itemId = applocation.item.id;

        var cropParams = {
            'detail': imageEditPage.lastCropEventDetail
            , 'aspectWidth': imageEditPage.cropInfo.aspectWidth
            , 'aspectHeight': imageEditPage.cropInfo.aspectHeight
        };
        photoTimeConnection.cropImage(itemId, cropParams).then((result)=> {
            $.mobile.loading('hide');
            // navigate back (and force reload?)
            app.goBack();
        }, (reason) => {
            $.mobile.loading('hide');
        });
    });

    $('#aspectRatioPopup').popup({
		//afteropen: function(event, ui) {
        //    console.log('opened');
		//	var applocation = appstate.getLocation();
		//	var rating = applocation.item.rating;
			//$('#ratingPopup a.rateItem').removeClass("active-rating");
			//$(`#ratingPopup a.rateItem[data-rating="${rating}"]`).addClass("active-rating");		
		//}
	});

}

export { imageEditPage }

$(document).on('pagebeforeshow', "#imageEditPage", function() {
	imageEditPage.beforeShow();
});
