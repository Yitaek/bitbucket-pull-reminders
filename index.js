const Bitbucket = require('bitbucket')
require('dotenv').config()

const bitbucket = new Bitbucket()

bitbucket.authenticate({
  type: 'basic',
  username: process.env.USERNAME,
  password: process.env.PASSWORD
})

// TODO
/*
1. get list of all projects/repos
2. list all PRs via list pull request
3. grab the ids and getPullRequest
4. get a match for reviewers 
5. build out a list
6. send slack bot message
7. package as lambda --> https://medium.com/better-programming/cron-job-patterns-in-aws-126fbf54a276

[pinpoint-us-server#5] MAN-23: Configure Nodemon to listen changes in node_modules/@cox2m/ libs (josevillarreal-cox2m)
21 days stale · 28 days old · Waiting on oscar-soto-cox2m

*/ 
const teamName = 'leverege'
getAllPRs(teamName)

async function getAllPRs(teamName) {
  try {
    const { data } = await bitbucket.repositories.list({ 
      username: teamName,
      pagelen: 10,
      q: '(project.key="LP" OR project.key="JUMP" OR project.key="MAR" OR project.key="SM" OR project.key="VEIC")'
    })

    // TODO - ITERATE IF NEXT TOKEN EXISTS
    const { values } = data
    const slugs = values.map( repo => {
      return repo.slug
    })

    const pullRequests = await getPRs(slugs, bitbucket)
    const reviewers = await getReviewers(pullRequests)

    //console.log() // need to parse slug 
  } catch(err){
    console.log(err)
  } 
}

async function getReviewers(pullrequest) {
  const reviewers = []
  for (let i=0; i < pullrequest.length; i++){
    const ids = pullrequest[i].ids
    const slug = pullrequest[i].slug
    for (let j=0; j <ids.length; j++){
      const { data } = await bitbucket.repositories.getPullRequest({ 
        username: teamName, 
        repo_slug: slug,
        pull_request_id: ids[j]
      })

      const { title, participants, updated_on } = data
      const waitingReview = participants.filter( reviewer => !reviewer.approved) 
      const reviewerName = waitingReview.map( review => review.user.display_name)

      console.log(data)
    }
  }
  // loop thru slug and ids and grab revewer


}

async function getPRs(slugs, bitbucket) {
  const pullRequests = []
  for (let i = 0; i < slugs.length; i++) {
    const { data } = await bitbucket.repositories.listPullRequests({
      repo_slug: slugs[i],
      username: teamName
    })

    if(data.size > 0){
      const slug = slugs[i]
      const ids = data.values.map(pr => { return pr.id })
      const idsBySlug = { 
        slug,
        ids
      }
      pullRequests.push(idsBySlug)
    }
  }

  return pullRequests
}
