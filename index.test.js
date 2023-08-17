const core = require("@actions/core");
const github = require("@actions/github");
const QRCode = require("qrcode");
const run = require("./index");

jest.mock("@actions/core");
jest.mock("@actions/github");
jest.mock("qrcode");

describe("QR Code Commenter Action", () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it("should fail if the number of links doesn’t match the number of messages", async () => {
    core.getInput
      .mockReturnValueOnce("link1,link2")
      .mockReturnValueOnce("message1");

    const result = await run();

    expect(result).toBe("Number of links should match the number of messages.");
    expect(core.setFailed).toHaveBeenCalledWith(
      "Number of links should match the number of messages."
    );
  });

  it("should generate QR codes and comment in PR", async () => {
    core.getInput
      .mockReturnValueOnce("link1,link2")
      .mockReturnValueOnce("message1,message2")
      .mockReturnValueOnce("test_token");

    QRCode.toDataURL.mockResolvedValue("data:image/png;base64,...");

    // Mock the methods we're using from github directly.
    github.context = {
      repo: { owner: "test", repo: "testRepo" },
      payload: {
        pull_request: {
          number: 1,
        },
      },
    };

    // Mock the octokit object and its methods
    const mockOctokit = {
      issues: {
        createComment: jest.fn(),
      },
    };
    github.getOctokit = jest.fn().mockReturnValue(mockOctokit);

    await run();

    expect(mockOctokit.issues.createComment).toHaveBeenCalled();
  });
});
