function PhotoTimeConnection(server, createRequest)
{
	this.server = server;
	this.createRequest = createRequest;
	this.urlRoot = 'http://' + this.server.ipAddress + ':' + this.server.port
}

PhotoTimeConnection.prototype.getRepo = function(repoId, cbks) {
	// old skool
	var req = this.createRequest(this.urlRoot + '/repo/' + repoId, cbks);
	req();
};

PhotoTimeConnection.prototype.getServerUrl = function()
{
	return this.urlRoot;
};
PhotoTimeConnection.prototype.getThumbUrl = function(thumb)
{
	var thumbUrl = this.getServerUrl() + thumb
	return thumbUrl.replace(/\\/g, "/");
}

// cbks.onSuccess, onError
PhotoTimeConnection.prototype.getRepos = function(cbks) {
	var req = this.createRequest(this.urlRoot + '/repos', cbks);
	req();
	//getRepos();
};

PhotoTimeConnection.prototype.getItems = function(itemId, cbks) {
	var req = this.createRequest(this.urlRoot + '/item/' + itemId, cbks);
	req();
};

PhotoTimeConnection.prototype.delItem = function(itemId, cbks) {

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
};

PhotoTimeConnection.prototype.loadMetadata = async function(itemId, cbks) {
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
};

PhotoTimeConnection.prototype.rateItem = function(itemId, rating, cbks) {
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
};

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
				console.log('ajax success');
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

	return {
		connect: function(server) {
			return new PhotoTimeConnection(server, createRequest);
		}
	};
})();