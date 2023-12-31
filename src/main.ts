import core from '@actions/core'
import github from '@actions/github'
import QRCode from 'qrcode'

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

    let commentBody = '## 📱 QR Codes for Deploy Preview\n\n'

    for (let i = 0; i < linksInput.length; i++) {
      const link = linksInput[i].trim()
      const message = messagesInput[i].trim()

      // Generate QR Code
      const qrCodeDataURL = await QRCode.toDataURL(link)

      commentBody += `${message}\n\n![QR Code](${qrCodeDataURL})\n\n`
    }
    if (context.payload.pull_request == null) {
      throw new Error('No pull request found.')
    }
    // Comment in PR
    await octokit.rest.issues.createComment({
      ...context.repo,
      issue_number: context.payload.pull_request.number,
      body: commentBody
    })

    console.log('QR Codes commented in PR successfully')
  } catch (error: unknown) {
    core.setFailed((error as Error).message)

    console.log('QR Codes commented in PR failed')

    return (error as Error).message
  }
}

run()
