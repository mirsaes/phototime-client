class AppState
{
    app = {}
    constructor() {
        this.app = {};
        var app = this.app;
        app.location = {};
        app.location.serverIdx = -1;
        app.location.repoIdx = -1;
        app.location.parents = [];
        app.location.item;
    }

    setServer(server, idx) {
        this.app.location.serverIdx = idx;
    }
    setRepo(repo, repoIdx)
    {
        this.app.location.repoIdx = repoIdx;
        this.app.location.item = repo;
    }
    getLocation() {
        return this.app.location;
    }
}

var gAppState = new AppState();

export {gAppState as appstate}
