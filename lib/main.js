"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const core_1 = __importDefault(require("@actions/core"));
const github_1 = __importDefault(require("@actions/github"));
const qrcode_1 = __importDefault(require("qrcode"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const linksInput = core_1.default.getInput('links').split(',');
            const messagesInput = core_1.default.getInput('messages').split(',');
            if (linksInput.length !== messagesInput.length) {
                throw new Error('Number of links should match the number of messages.');
            }
            const token = core_1.default.getInput('github-token', { required: true });
            const octokit = github_1.default.getOctokit(token);
            const context = github_1.default.context;
            let commentBody = '## 📱 QR Codes for Deploy Preview\n\n';
            for (let i = 0; i < linksInput.length; i++) {
                const link = linksInput[i].trim();
                const message = messagesInput[i].trim();
                // Generate QR Code
                const qrCodeDataURL = yield qrcode_1.default.toDataURL(link);
                commentBody += `${message}\n\n![QR Code](${qrCodeDataURL})\n\n`;
            }
            if (context.payload.pull_request == null) {
                throw new Error('No pull request found.');
            }
            // Comment in PR
            yield octokit.rest.issues.createComment(Object.assign(Object.assign({}, context.repo), { issue_number: context.payload.pull_request.number, body: commentBody }));
            console.log('QR Codes commented in PR successfully');
        }
        catch (error) {
            core_1.default.setFailed(error.message);
            console.log('QR Codes commented in PR failed');
            return error.message;
        }
    });
}
exports.run = run;
run();
