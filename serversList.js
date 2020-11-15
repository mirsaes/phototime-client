// cbks.onDelete
// cbks.onClick?
function reloadServers(serverNodeId, isEditable, cbks)
{
	console.log(serverNodeId + '-reload servers');
	// load servers
	gServers.loadServers(function() {
		var jServers = $("#" + serverNodeId);
		jServers.empty();
		var tmpl = '<a href="#" class="serverItem" id="serverItem-__id__"><div>ip: __ip__</div><div>port: __port__</div></a>';
		if (isEditable)
		{
			tmpl += '<a href="#settings" class="deleteServer" id="deleteServer-__id__" data-role="button" data-icon="delete">Delete</a>';
		}
		
		var servers = gServers.get()
		//console.log(servers);
		for (var i = 0; i < servers.length; i++)
		{
			var server = servers[i];
			var t = tmpl.replace(/__ip__/g, server.ipAddress).replace(/__port__/g, server.port);
			t = t.replace(/__id__/g, i);
			var liHtml = '<li id="serverlistitem-__id__">' + t + '</li>';
			liHtml = liHtml.replace(/__id__/g, i);
			jServers.append(liHtml);
			//jServers.append('<li id="serverlistitem-' + i + '">'+ t + '</li>');
		}
		$('#' + serverNodeId).listview('refresh');
		$(".serverItem").click(function(event) {
			if (cbks.onSelect)
			{
				var idx;
				idx = this.id.split('-')[1]
				cbks.onSelect(idx);
			}
		});
		$(".deleteServer").click(function(event) {
			if (cbks.onDelete)
			{
				var idx;
				idx = this.id.split('-')[1]
				cbks.onDelete(this, event, idx);
			}
		});		
	});
}