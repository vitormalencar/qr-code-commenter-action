import * as core from '@actions/core'
import * as github from '@actions/github'
import QRCode from 'qrcode'
import {run} from '../src/main'

jest.mock('@actions/core')
jest.mock('@actions/github')
jest.mock('qrcode')

const mockedCore = core as jest.Mocked<typeof core>
const mockedGithub = github as jest.Mocked<typeof github>

describe('QR Code Commenter Action', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should fail if the number of links doesn’t match the number of messages', async () => {
    mockedCore.getInput
      .mockReturnValueOnce('link1,link2')
      .mockReturnValueOnce('message1')

    const result = await run()

    expect(result).toBe('Number of links should match the number of messages.')
    expect(mockedCore.setFailed).toHaveBeenCalledWith(
      'Number of links should match the number of messages.'
    )
  })

  it('should generate QR codes and comment in PR', async () => {
    mockedCore.getInput
      .mockReturnValueOnce('link1,link2')
      .mockReturnValueOnce('message1,message2')
      .mockReturnValueOnce('test_token')

    QRCode.toDataURL = jest.fn().mockResolvedValue('data:image/png;base64,...')

    mockedGithub.context = {
      repo: {owner: 'test', repo: 'testRepo'},
      payload: {
        pull_request: {
          number: 1
        }
      }
    }

    // Mock the octokit object and its methods
    const mockOctokit = {
      rest: {
        issues: {
          createComment: jest.fn()
        }
      }
    }
    mockedGithub.getOctokit = jest.fn().mockReturnValue(mockOctokit)

    await run()

    expect(mockOctokit.rest.issues.createComment).toHaveBeenCalled()
  })

  it('should fail if there is no pull request found', async () => {
    mockedCore.getInput
      .mockReturnValueOnce('link1')
      .mockReturnValueOnce('message1')
      .mockReturnValueOnce('test_token')

    QRCode.toDataURL = jest.fn().mockResolvedValue('data:image/png;base64,...')

    mockedGithub.context = {
      repo: {owner: 'test', repo: 'testRepo'},
      payload: {} // Empty payload to mimic missing pull_request
    }

    const result = await run()

    expect(result).toBe('No pull request found.')
    expect(mockedCore.setFailed).toHaveBeenCalledWith('No pull request found.')
  })
})
