class RepoDataSource {
    repos = [];

    constructor() {
        console.log('constructing repos');
    }

    setRepos(reposAy) {
        this.repos=reposAy;
    }
    getRepo(repoIdx) {
        return this.repos[repoIdx];
    }
    getRepos() {
        return this.repos;
    }
}

var gRepoDataSource = new RepoDataSource();

export  { gRepoDataSource as gRepos }
