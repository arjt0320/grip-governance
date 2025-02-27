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

// Propose a rule change
const proposeRuleChange = async () => {
  const rules = await loadRules();

  const { key, value } = await inquirer.prompt([
    { type: "input", name: "key", message: "Enter rule key (e.g., max_contribution_per_user):" },
    { type: "input", name: "value", message: "Enter new rule value (e.g., 1000 USD):" }
  ]);

  rules.proposals.push({ key, value, votes: { yes: 0, no: 0 } });

  await saveRules(rules);
  await git.add(RULES_FILE);
  await git.commit(`Proposed rule change: ${key} -> ${value}`);
  console.log(`Rule change proposed: ${key} -> ${value}`);
};

// Vote on proposals
const voteOnProposal = async () => {
  const rules = await loadRules();

  if (rules.proposals.length === 0) {
    console.log("No active proposals.");
    return;
  }

  console.log("Active Proposals:");
  rules.proposals.forEach((p, i) => 
    console.log(`${i + 1}. ${p.key}: ${p.value} (Yes: ${p.votes.yes}, No: ${p.votes.no})`)
  );

  const { index, vote } = await inquirer.prompt([
    { type: "input", name: "index", message: "Enter proposal number to vote on:" },
    { type: "list", name: "vote", message: "Cast your vote:", choices: ["yes", "no"] }
  ]);

  const proposal = rules.proposals[index - 1];
  if (proposal) {
    proposal.votes[vote]++;
    await saveRules(rules);
    console.log(`Vote recorded: ${vote.toUpperCase()} for ${proposal.key}`);
  }
};

// Merge approved proposals
const mergeProposals = async () => {
  const rules = await loadRules();
  const participants = rules.participants.length;
  const threshold = Math.ceil(participants / 2);

  rules.proposals = rules.proposals.filter((proposal) => {
    if (proposal.votes.yes >= threshold) {
      rules.rules[proposal.key] = proposal.value;
      console.log(`Rule merged: ${proposal.key} -> ${proposal.value}`);
      return false; // Remove from proposals after merging
    }
    return true; // Keep if not merged yet
  });

  await saveRules(rules);
  await git.add(RULES_FILE);
  await git.commit("Merged approved proposals");
  console.log("Approved proposals merged into governance rules.");
};

// CLI Menu
const main = async () => {
  const { action } = await inquirer.prompt([
    { type: "list", name: "action", message: "Choose an action:", choices: ["Propose Rule Change", "Vote on Proposal", "Merge Approved Rules", "Exit"] }
  ]);

  if (action === "Propose Rule Change") await proposeRuleChange();
  else if (action === "Vote on Proposal") await voteOnProposal();
  else if (action === "Merge Approved Rules") await mergeProposals();
};

main();
