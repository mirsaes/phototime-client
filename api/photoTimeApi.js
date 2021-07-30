class PhotoTimeConnection
{

	constructor(server, createRequest) {
		this.server = server;
		this.createRequest = createRequest;
		this.urlRoot = 'http://' + this.server.ip + ':' + this.server.port
	
	}

	getRepo(repoId, cbks) 
	{
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
		try {
			const result = await $.ajax({
				type:"GET",
				url: url,
				contentType: "application/json; charset=utf-8"
			});
			return result;
		} catch (error) {
			console.log('error');
			throw error;
		}
	}

	async addTag(itemId, tagValue)
	{
		var url = `${this.urlRoot}/metadata/${itemId}`;
		try {
			const result = await $.ajax({
				type:"POST",
				url: url,
				data: JSON.stringify({"tags":[tagValue]}),
				dataType: 'json',
				contentType: "application/json; charset=utf-8"
			});
			return result;
		} catch (error) {
			throw error;
		}
	}
	
	async deleteTag(itemId, tagValue)
	{
		var url = `${this.urlRoot}/metadata/${itemId}`;
		try {
			return await $.ajax({
				type:"DELETE",
				url: url,
				data: JSON.stringify({"tags":[tagValue]}),
				dataType: 'json',
				contentType: "application/json; charset=utf-8"
			});
		} catch (error) {
			throw error;
		}
	}

	async rateItem(itemId, rating, cbks) {
		//var url = `${this.urlRoot}/item/${itemId}?rating=${rating}`;
		var url = `${this.urlRoot}/item/${itemId}`;
		try {
			return await $.ajax({
				type: "POST",
				url: url,
				data: JSON.stringify({"rating":rating})
				, dataType: 'json'
				, contentType: "application/json; charset=utf-8"
			});
	
		} catch (error) {
			throw error;
		}
	}

	async cropImage(itemId, cropParams)
	{
		var url = `${this.urlRoot}/imageedit/crop/${itemId}`;
		return await $.ajax({
			type:"PUT",
			url: url,
			data: JSON.stringify(cropParams),
			dataType: 'json', 
			contentType: "application/json; charset=utf-8"
		});		
	}

	async checkStatus()
	{
		var url = `${this.urlRoot}/status/thumbs`;

		return await $.ajax({
			type:"GET",
			url: url,
		});
	}
}

class PhototimeAPI 
{
	activeConnection = null;

	createRequest(url, cbks) 
	{
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
	}
	
	
	connect(server)
	{
		this.activeConnection = new PhotoTimeConnection(server, this.createRequest);
		return this.activeConnection;
	}

	getConnection() 
	{
		return this.activeConnection;
	}

	async deleteTag(itemId, tagValue)
	{
		return this.activeConnection.deleteTag(itemId, tagValue);
	}

	async addTag(itemId, tagValue) 
	{
		return this.activeConnection.addTag(itemId, tagValue);
	}

}

var gPhotoTimeAPI = new PhototimeAPI();

export { gPhotoTimeAPI }
