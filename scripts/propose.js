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

// Create new proposal
const proposeRuleChange = async () => {
  const rules = await loadRules();

  const { key, value } = await inquirer.prompt([
    { type: "input", name: "key", message: "Enter rule key (e.g., max_head_count):" },
    { type: "input", name: "value", message: "Enter new rule value (e.g., 5):" }
  ]);

  const newProposal = { key, value, status: "pending", votes: { yes: 0, no: 0 } };
  rules.proposals.push(newProposal);
  await saveRules(rules);

  const branchName = `proposal-${key}`;
  await git.checkoutLocalBranch(branchName);
  await git.add(RULES_FILE);
  await git.commit(`Proposed rule: ${key} -> ${value}`);
  await git.push("origin", branchName);

  console.log(`✅ Proposal created: ${branchName}.`);
  console.log("Now raise a Pull Request in GitHub for voting.");
};

proposeRuleChange();
