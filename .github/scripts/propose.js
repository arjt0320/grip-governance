import fs from "fs-extra";
import inquirer from "inquirer";

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

// Propose a new rule change
const proposeRuleChange = async () => {
  const rules = await loadRules();

  const { key, value } = await inquirer.prompt([
    { type: "input", name: "key", message: "Enter rule key (e.g., max_head_count):" },
    { type: "input", name: "value", message: "Enter new rule value (e.g., 10):" }
  ]);

  rules.proposals.push({ key, value, votes: { yes: 0, no: 0 } });

  await saveRules(rules);
  console.log(`📌 Proposal added: ${key} -> ${value}`);
};

proposeRuleChange();
