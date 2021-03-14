class PhotoTimeConnection
{

	constructor(server, createRequest) {
		this.server = server;
		this.createRequest = createRequest;
		this.urlRoot = 'http://' + this.server.ip + ':' + this.server.port
	
	}

	getRepo(repoId, cbks) {
		// old skool
		var req = this.createRequest(this.urlRoot + '/repo/' + repoId, cbks);
		req();
	}
	
	getServerUrl()
	{
		return this.urlRoot;
	}

	getThumbUrl(thumb)
	{
		var thumbUrl = this.getServerUrl() + thumb
		return thumbUrl.replace(/\\/g, "/");
	}
	
	// cbks.onSuccess, onError
	getRepos(cbks) {
		var req = this.createRequest(this.urlRoot + '/repos', cbks);
		req();
		//getRepos();
	}
	
	getItems(itemId, cbks) {
		var req = this.createRequest(this.urlRoot + '/item/' + itemId, cbks);
		req();
	}
	
	delItem(itemId, cbks) {
	
		var url = `${this.urlRoot}/item/${itemId}`;
		$.ajax({
			type: "DELETE",
			url: url,
		}).done(function(data, textStatus, jqXHR){
			console.log('delete ajax success');
			if (cbks.onSuccess)
				cbks.onSuccess(data);
		}).fail(function(jqXHR, textStatus, errorThrown){
			console.log('ajax FAILED');
			if (cbks.onError)
				cbks.onError(jqXHR);
		});
	}
	
	async loadMetadata(itemId, cbks) {
		var url = `${this.urlRoot}/metadata/${itemId}`;
		return $.ajax({
			type:"GET",
			url: url,
			contentType: "application/json; charset=utf-8"
		}).done(function(data, textStatus, jqXHR){
			Promise.resolve(data);
		}).fail(function(jqXHR, textStatus, errorThrown) {
			//console.warn("failed" + textStatus + " " + errorThrown);
			console.warn("failed to load metadata");
			Promise.reject("failure");
		});
	}
	
	rateItem(itemId, rating, cbks) {
		//var url = `${this.urlRoot}/item/${itemId}?rating=${rating}`;
		var url = `${this.urlRoot}/item/${itemId}`;
		/*
		$.post(
			url,
			JSON.stringify({'rating':rating})
			, function(data, status, jqXHR) {
				console.log(status);
	
			}		
		);
		*/
		$.ajax({
			type: "POST",
			url: url,
			data: JSON.stringify({"rating":rating})
			, dataType: 'json'
			, contentType: "application/json; charset=utf-8"
		}).done(function(data, textStatus, jqXHR){
			console.log('ajax success');
			if (cbks.onSuccess)
				cbks.onSuccess(data);
		}).fail(function(jqXHR, textStatus, errorThrown){
			console.log('ajax FAILED');
			if (cbks.onError)
				cbks.onError(jqXHR);
		}).always(function() {
			console.log('finished rating');
		});
	}

	async cropImage(itemId, cropParams)
	{
		var url = `${this.urlRoot}/imageedit/crop/${itemId}`;
		return $.ajax({
			type:"PUT",
			url: url,
			data: JSON.stringify(cropParams),
			dataType: 'json', 
			contentType: "application/json; charset=utf-8"
		}).done(function(data, textStatus, jqXHR){
			Promise.resolve(data);
		}).fail(function(jqXHR, textStatus, errorThrown) {
			console.warn(`failed to crop image: ${itemId}`);
			Promise.reject("failure");
		});		
	}
}

var gPhotoTimeAPI = (function() {
	var createRequest = function(url, cbks) {
		var getRepos = function() {
			var ajax = $.ajax({
				//url: 'http://' + server.ipAddress + ':' + server.port + '/' + 'repos'
				url: url,
				//dataType: 'json',
				type: 'GET',
				//contentType: '*/*; charset=UTF-8'				
			});
			
			ajax.done(function(data, textStatus, jqXHR){
				if (cbks.onSuccess)
					cbks.onSuccess(data);
			});
			
			ajax.fail(function(jqXHR, textStatus, errorThrown){
				console.log('ajax FAILED');
				if (cbks.onError)
					cbks.onError(jqXHR);
			});
		};
		
		return getRepos;
	};

	var activeConnection = null;

	return {
		connect: function(server) {
			activeConnection = new PhotoTimeConnection(server, createRequest);
			return activeConnection;
		},
		getConnection: function() {
			return activeConnection
		}
	};
})();

export { gPhotoTimeAPI }