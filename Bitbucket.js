const BitbucketAPI = require('bitbucket')

class Bitbucket {
  constructor( options ) {
    this.bitbucket = new BitbucketAPI()
    this.bitbucket.authenticate(options.auth)
    this.teamName = options.teamName

    const projectsArr = options.projects.split(',')
    const projectStrings = projectsArr.map( (project) => {
      return `project.key="${project}"`
    })
    this.projects = `(${projectStrings.join(' OR ')})`
  }

  async getAllPRs() {
    try {
      const slugs = await this.getAllRepos(1)
      const pullRequests = await this.getPRs(slugs)
      const reviewers = await this.getReviewers(pullRequests)

      return reviewers
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async getAllRepos(pageNumber) {
    const {data} = await this.bitbucket.repositories.list({
      username: this.teamName,
      pagelen: 100,
      page: pageNumber,
      q: this.projects
    })

    const {values, page, next} = data
    let slugs = []

    if (next) {
      slugs = await this.getAllRepos(page + 1)
    }

    const repoSlugs = values.map( (repo) => {
      return repo.slug
    })

    return slugs.concat(repoSlugs)
  }

  async getPRs(slugs) {
    const pullRequests = []
    for (let i = 0; i < slugs.length; i++) {
      const {data} = await this.bitbucket.repositories.listPullRequests({
        repo_slug: slugs[i],
        username: this.teamName
      })

      if (data.size > 0) {
        const slug = slugs[i]

        const ids = data.values.map((pr) => {
          return pr.id
        })

        const idsBySlug = {
          slug,
          ids
        }

        pullRequests.push(idsBySlug)
      }
    }

    return pullRequests
  }

  async getReviewers(pullrequest) {
    const reviewers = []
    for (let i=0; i < pullrequest.length; i++) {
      const ids = pullrequest[i].ids
      const slug = pullrequest[i].slug

      for (let j=0; j < ids.length; j++) {
        const {data} = await this.bitbucket.repositories.getPullRequest({
          username: this.teamName,
          repo_slug: slug,
          pull_request_id: ids[j]
        })

        reviewers.push(this.mapPR(data));
      }
    }
    // loop thru slug and ids and grab reviewer
    return reviewers
  }

  mapPR(pr) {
    // eslint-disable-next-line max-len
    const waitingReview = pr.participants.filter( (reviewer) => !reviewer.approved)
    // eslint-disable-next-line max-len
    const waitingReviewNames = waitingReview.map( (review) => review.user.display_name)

    return {
      title: pr.title,
      author: pr.author.display_name,
      updatedOn: pr.updated_on,
      createdOn: pr.created_on,
      link: pr.links.html.href,
      waitingReviewNames: waitingReviewNames
    }
  }
}

module.exports = Bitbucket
