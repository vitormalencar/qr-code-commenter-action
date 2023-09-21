import * as core from '@actions/core'
import * as github from '@actions/github'

export async function run() {
  try {
    const linksInput = core.getInput('links').split(',')
    const messagesInput = core.getInput('messages').split(',')

    if (linksInput.length !== messagesInput.length) {
      throw new Error('Number of links should match the number of messages.')
    }

    const token = core.getInput('github-token', {required: true})

    const octokit = github.getOctokit(token)
    const context = github.context

    const header = '## 📱 QR Codes for Deploy Preview';
    const footer = 'DRI @ua_eng_app';
    let commentBody = `${header}\n\n`

    for (let i = 0; i < linksInput.length; i++) {
      const link = linksInput[i].trim()
      const message = messagesInput[i].trim()

      commentBody += `${message}\n\n![QR Code](https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(
        link
      )})\n${footer}\n\n`
    }
    if (context.payload.pull_request == null) {
      throw new Error('No pull request found.')
    }

    const {data: pullRequest} = await octokit.rest.pulls.get({
      ...context.repo,
      pull_number: context.payload.pull_request.number
    })

    let prBody = pullRequest.body || "";
    if (prBody.includes(header)) {
      prBody = prBody.substring(0, prBody.indexOf(header)) + prBody.substring(prBody.indexOf(footer) + footer.length)
    } 

    prBody += `\n\n${commentBody}`

    // Update PR description
    await octokit.rest.pulls.update({
      ...context.repo,
      pull_number: context.payload.pull_request.number,
      body: prBody
    })

    console.log('QR Codes commented in PR successfully')
  } catch (error: unknown) {
    core.setFailed((error as Error).message)

    console.log('QR Codes commented in PR failed')

    return (error as Error).message
  }
}

run()
