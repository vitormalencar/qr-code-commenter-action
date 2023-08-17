# QR Code Commenter GitHub Action 📱

Generate QR codes from provided links and post them as comments in your pull requests.

<!-- ![Demo Image](path_to_a_demo_image.png) You might want to add a sample image showing a PR comment with QR codes -->

## Features

- Generate QR code images directly in PR comments.
- Support for multiple QR codes in a single comment.
- Customizable messages for each QR code to give context.

## Prerequisites

1. GitHub Token: To post comments in PRs, the action requires a GitHub token.
2. Links: One or more links to generate QR codes for.

## Usage

1. First, set up a workflow (if you haven't already) in `.github/workflows`.

2. Add the action to your workflow:

```yaml
name: QR Code Commenter

on:
pull_request: # or any other event you prefer
  types: [opened, synchronize]

jobs:
commentWithQR:
  runs-on: ubuntu-latest
  steps:
    - name: Checkout code
      uses: actions/checkout@v2

    - name: Comment PR with QR Code
      uses: YOUR_USERNAME/QR-Code-Commenter-Action@v1
      with:
        github-token: ${{ secrets.GITHUB_TOKEN }}
        links: "link1,link2,link3"
        messages: "Message for Link 1, Message for Link 2, Message for Link 3"
```

Replace YOUR_USERNAME with your GitHub username and QR-Code-Commenter-Action with the name of your repository.

## Inputs

| Input          | Description                                                      | Required | Default |
| -------------- | ---------------------------------------------------------------- | -------- | ------- |
| `github_token` | GitHub token to post comments in PRs                             | Yes      | N/A     |
| `links`        | Comma-separated list of links to generate QR codes for           | Yes      | N/A     |
| `messages`     | Comma-separated list of messages to give context to each QR code | No       | N/A     |

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
made with ❤️ by Vitor Alencar
