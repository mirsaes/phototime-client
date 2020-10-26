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
	var req = this.createRequest(this.urlRoot + '/del/item/' + itemId, cbks);
	req();
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