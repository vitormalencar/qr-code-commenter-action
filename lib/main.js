"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.run = void 0;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const linksInput = core.getInput('links').split(',');
            const messagesInput = core.getInput('messages').split(',');
            if (linksInput.length !== messagesInput.length) {
                throw new Error('Number of links should match the number of messages.');
            }
            const token = core.getInput('github-token', { required: true });
            const octokit = github.getOctokit(token);
            const context = github.context;
            const header = '## 📱 QR Codes for Deploy Preview';
            const footer = 'DRI @ua_eng_app';
            let commentBody = `${header}\n\n`;
            for (let i = 0; i < linksInput.length; i++) {
                const link = linksInput[i].trim();
                const message = messagesInput[i].trim();
                commentBody += `${message}\n\n![QR Code](https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(link)})\n${footer}\n\n`;
            }
            if (context.payload.pull_request == null) {
                throw new Error('No pull request found.');
            }
            const { data: pullRequest } = yield octokit.rest.pulls.get(Object.assign(Object.assign({}, context.repo), { pull_number: context.payload.pull_request.number }));
            let prBody = pullRequest.body || "";
            if (prBody.includes(header)) {
                prBody = prBody.substring(0, prBody.indexOf(header)) + prBody.substring(prBody.indexOf(footer) + footer.length);
            }
            prBody += `\n\n${commentBody}`;
            // Update PR description
            yield octokit.rest.pulls.update(Object.assign(Object.assign({}, context.repo), { pull_number: context.payload.pull_request.number, body: prBody }));
            console.log('QR Codes commented in PR successfully');
        }
        catch (error) {
            core.setFailed(error.message);
            console.log('QR Codes commented in PR failed');
            return error.message;
        }
    });
}
exports.run = run;
run();
