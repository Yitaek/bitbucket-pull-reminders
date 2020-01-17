const Bitbucket = require('bitbucket')
const { IncomingWebhook } = require('@slack/webhook')
const parseISO = require('date-fns/parseISO')
const differenceInDays = require('date-fns/differenceInDays')
const config = require('./Config')

const bitbucket = new Bitbucket()
const teamName = process.env.TEAMNAME

bitbucket.authenticate(config.bitbucket)

exports.sendPullRequestReminders = async (event, context) => {
  await getAllPRs(teamName)
};

async function getAllPRs(teamName) {
  try {
    const slugs = await getAllRepos(1)

    const pullRequests = await getPRs(slugs, bitbucket)
    const reviewers = await getReviewers(pullRequests)

    await sendToSlack(reviewers)
    
  } catch(err){
    console.log(err)
  } 
}

async function getAllRepos(pageNumber){
  const { data } = await bitbucket.repositories.list({ 
    username: teamName,
    pagelen: 100,
    page: pageNumber,
    q: '(project.key="LP" OR project.key="JUMP" OR project.key="MAR" OR project.key="VEIC" OR project.key="SM")' // TODO - make this configurable ... 
  })

  const { values, size, page, next } = data
  let slugs = []
  
  if(next){
    slugs = await getAllRepos(page + 1)
  }

  const repoSlugs = values.map( repo => {
    return repo.slug
  })

  return slugs.concat(repoSlugs)
}

async function sendToSlack(message){

  const DATE_TODAY = Date.now()

  const blocks = message.map( pr => {
    const reviewers = pr.reviewerName.join(', ')
    const prTime = parseISO(pr.updated_on)
    const timeDiff = differenceInDays(DATE_TODAY, prTime)
    const link = pr.link
    const slackMsg = {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": `<${link}|${pr.title}> - ${timeDiff} days old - Waiting on ${reviewers}`
      }
    }

    return slackMsg
  })

  const url = process.env.SLACK_WEBHOOK_URL
  const webhook = new IncomingWebhook(url)

  await webhook.send({
    text: "Pull request reminders", 
    blocks
  })

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

      const { title, participants, updated_on, links } = data
      const waitingReview = participants.filter( reviewer => !reviewer.approved) 
      const reviewerName = waitingReview.map( review => review.user.display_name)
      const link = links.html.href

      reviewers.push({
        title,
        updated_on,
        reviewerName,
        link
      })
    }
  }
  // loop thru slug and ids and grab revewer
  return reviewers
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
