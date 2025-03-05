import fs from "fs-extra";
import simpleGit from "simple-git";
import inquirer from "inquirer";
import dotenv from "dotenv";

dotenv.config();
const git = simpleGit();
const RULES_FILE = "rules.json";

// Load governance rules
const loadRules = async () => {
  if (!(await fs.pathExists(RULES_FILE))) {
    console.error("rules.json file not found!");
    process.exit(1);
  }
  return fs.readJson(RULES_FILE);
};

// Save governance rules
const saveRules = async (rules) => {
  await fs.writeJson(RULES_FILE, rules, { spaces: 2 });
};

// Cast a vote
const voteOnProposal = async () => {
  const rules = await loadRules();
  const proposals = rules.proposals.filter((p) => p.status === "pending");

  if (proposals.length === 0) {
    console.log("No active proposals.");
    return;
  }

  const { index, vote } = await inquirer.prompt([
    { type: "list", name: "index", message: "Select a proposal to vote on:", choices: proposals.map((p, i) => `${i + 1}. ${p.key}: ${p.value}`) },
    { type: "list", name: "vote", message: "Cast your vote:", choices: ["yes", "no"] }
  ]);

  const selectedProposal = proposals[parseInt(index.split(".")[0]) - 1];
  selectedProposal.votes[vote]++;

  await saveRules(rules);
  await git.add(RULES_FILE);
  await git.commit(`Vote recorded: ${vote.toUpperCase()} for ${selectedProposal.key}`);
  await git.push();

  console.log(`✅ Vote recorded: ${vote.toUpperCase()} for ${selectedProposal.key}`);
};

voteOnProposal();
