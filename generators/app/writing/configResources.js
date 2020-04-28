"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const validate_1 = require("../validate");
const lodash_1 = require("lodash");
const processFiles_1 = require("../processFiles");
const badges_1 = require("./badges");
exports.configResources = (context) => async () => {
    const validate = validate_1.validatationFactory(context.answers);
    const npmBadge = badges_1.badges(context, validate)("features");
    const testBadges = badges_1.badges(context, validate)("testing");
    const coverageBadges = badges_1.badges(context, validate)("coverage");
    const licenseBadges = badges_1.badges(context, validate)("license");
    const socialBadges = badges_1.badges(context, validate)("social");
    const rootConfigFiles = [
        {
            file: "package.json",
            substitute: {
                appName: lodash_1.kebabCase(context.answers.appName),
                author: `${context.user.git.name()} <${context.user.git.email()}>`,
                repo: `${validate.gitServerURL()}${context.answers.repoUserName}/${context.answers.repo}`,
                keywords: context.answers.serverless
                    ? '["serverless", "typescript"]'
                    : '["typescript"]',
                files: validate.isServerless() ? '["lib"]' : '["lib", "dist"]',
                module: validate.isServerless()
                    ? ""
                    : `"module": "dist/${lodash_1.kebabCase(context.answers.appName)}.es.js",`,
                browser: validate.isServerless()
                    ? ""
                    : `"browser": "dist/${lodash_1.kebabCase(context.answers.appName)}.min.js",`,
                docsScripts: validate.useStaticDocs()
                    ? ',\n"docs:dev": "vuepress dev docs",\n"docs:build": "vuepress build docs"'
                    : ""
            }
        },
        {
            file: "README.md",
            substitute: {
                appName: context.answers.appName,
                repo: context.answers.repo,
                repoOrigin: context.answers.repoOrigin,
                repoOriginHttp: context.answers.repoOriginHttp,
                npmBadge,
                testBadges,
                coverageBadges,
                licenseBadges,
                socialBadges
            }
        },
        {
            file: "wallaby.js",
            condition: validate.useWallaby()
        },
        {
            sourceFrom: "gitignore",
            file: ".gitignore"
        },
        ".editorconfig",
        ".vscode/launch.json",
        ".vscode/settings.json",
        ".vscode/tasks.json",
        "webpack.config.js",
        {
            file: "tsconfig.json",
            condition: !validate.isServerless(),
            sourceFrom: "tsconfig.json"
        },
        {
            file: "tsconfig.json",
            condition: validate.isServerless() && !validate.hasFirebase(),
            sourceFrom: "tsconfig-esm.json"
        },
        {
            file: "tsconfig.json",
            condition: validate.isServerless() && validate.hasFirebase(),
            sourceFrom: "tsconfig-firebase.json"
        },
        {
            sourceFrom: "gitignore",
            file: ".gitignore"
        },
        {
            file: ".travis.yml",
            condition: validate.useTravis(),
            substitute: {
                scripts: validate.useCodecov() ? `  - npm install codecov -g` : "",
                after_success: validate.useCodecov() ? `after_success\n  - codecov` : ""
            }
        },
        {
            file: ".coveralls.yml",
            condition: validate.useCoveralls(),
            substitute: {
                service_name: context.answers.appName,
                repo_token: context.answers.coverallsToken || "PLEASE FILL IN"
            }
        },
        {
            file: ".codecov.yml",
            condition: validate.useCodecov()
        }
    ];
    const notServerless = ["tsconfig-esm.json"];
    const serverlessConfig = [
        {
            file: "serverless.yml",
            substitute: {
                appName: lodash_1.kebabCase(context.answers.appName)
            }
        },
        "serverless-config/env.yml",
        "serverless-config/README.md",
        "serverless-config/config.ts",
        "serverless-config/config-sections/provider.ts",
        "serverless-config/config-sections/custom.ts",
        "serverless-config/config-sections/iam.ts",
        "serverless-config/config-sections/index.ts",
        "serverless-config/config-sections/packaging.ts",
        "serverless-config/config-sections/plugins.ts",
        "serverless-config/config-sections/resources.ts",
        "serverless-config/config-sections/service.ts",
        "serverless-config/functions/index.ts",
        "serverless-config/functions/inline.ts",
        "serverless-config/stepFunctions/index.ts",
        "serverless-config/stepFunctions/example.ts",
        "serverless-config/helpers/*"
    ];
    const config = validate.isServerless()
        ? [...rootConfigFiles, ...serverlessConfig]
        : [...rootConfigFiles, ...notServerless];
    processFiles_1.processFiles(context)("configuration", config);
};
//# sourceMappingURL=configResources.js.map