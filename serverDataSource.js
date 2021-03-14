var gServers = (function () {
	var servers = [];
	
	return {
		add: function(server) {
			servers.push(server);
			this.cleanupServers();
		},
		
		removeAt: function(index) {
			servers.splice(index,1);
		},
		size: function() {
			return servers.length;
		},
		item: function(index) {
			if (index < servers.length)
				return servers[index];
			return;
		},
		get: function() {
			return servers;
		},
		cleanupServers: function() {
			var newServers = [];
			for (let idx = 0; idx < servers.length; ++idx) {
				var server = servers[idx];
				if (server.ip == "" || server.port == "")
					continue;
				newServers.push(server);
			}
			servers = newServers;
			this.storeServers();
		},
	
		storeServers: function() {
			localStorage.setItem('servers', JSON.stringify(servers));
		},
		
		loadServers: function(onLoadedFn) {
			if (typeof localStorage == 'undefined')
				console.log('oh no .... localStorage is not defined');
			var s = localStorage.getItem('servers');
			if (s == null)
				servers = [];
			else
				servers = JSON.parse(s);
			
			// cbk for loading servers
			if (typeof onLoadedFn == 'function')
				onLoadedFn();
		}
	};
})();

export  { gServers };