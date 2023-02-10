#!/usr/bin/env node

const yargs = require("yargs");
const argv = yargs
	.option("projectName", {
		alias: "n",
		describe: "The name of the project",
		type: "string",
	})
	.option("port", {
		alias: "p",
		describe: "The port number",
		type: "number",
	})
	.help().argv;

const projectName = argv.projectName || process.argv[2] || 'my-app';
const port = argv.port || process.argv[3] || 3000;

console.log(`Project name: ${projectName}`);
console.log(`Port: ${port}`);

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
// Validate project name
const validateProjectName = name => {
	if (!name.match(/^[a-z0-9][a-z0-9-_.]*$/)) {
		throw new Error(
			"Project name can only contain lowercase letters, numbers, dots, and dashes, and can't start with a dash."
		);
	}
};
// Validate project name
validateProjectName(projectName);
const currentPath = process.cwd();
const projectPath = path.join(currentPath, projectName);
// Check if project already exists
if (fs.existsSync(projectPath)) {
	throw new Error(`Project ${projectName} already exists.`);
}
// Create project path
fs.mkdirSync(projectPath);
// Copy template to project path
const copyTemplate = (sourceDir, targetDir) => {
	fs.readdirSync(sourceDir).forEach(file => {
		const sourceFile = path.join(sourceDir, file);
		const targetFile = path.join(targetDir, file);
		if (fs.lstatSync(sourceFile).isDirectory()) {
			fs.mkdirSync(targetFile);
			copyTemplate(sourceFile, targetFile);
		} else {
			fs.copyFileSync(sourceFile, targetFile);
		}
	});
};
// Path to template
const templatePath = path.join(__dirname, "template");
// Copy template to project path
copyTemplate(templatePath, projectPath);
// Replace template with project name in package.json
const packageJsonPath = path.join(projectPath, "package.json");
let packageJsonContent = fs.readFileSync(packageJsonPath, "utf8");
packageJsonContent = packageJsonContent.replace(/template/, projectName);
fs.writeFileSync(packageJsonPath, packageJsonContent, "utf8");

// Replace template with project name in App.js
const appPath = path.join(projectPath, "src/App.js");
let appContent = fs.readFileSync(appPath, "utf8");
appContent = appContent.replace(/#projectName#/, projectName);
fs.writeFileSync(appPath, appContent, "utf8");

// Rename gitignore to .gitignore
const gitignore = path.join(projectPath, "gitignore");
const newGitignore = path.join(projectPath, ".gitignore");
fs.renameSync(gitignore, newGitignore);

// Create .env file
const envPath = path.join(projectPath, ".env");
fs.writeFileSync(envPath, `PORT = ${port}`, "utf8");
// cd projectPath
execSync(`cd ${projectName}`, { cwd: currentPath, stdio: "inherit" });
// Initialize git
execSync("git init", { cwd: projectPath, stdio: "inherit" });
execSync("git add -A", { cwd: projectPath, stdio: "inherit" });
execSync(`git commit -m"initialization"`, { cwd: projectPath, stdio: "inherit" });
// Install dependencies
execSync("npm install", { cwd: projectPath, stdio: "inherit" });
// Start project
execSync("npm start", { cwd: projectPath, stdio: "inherit" });

