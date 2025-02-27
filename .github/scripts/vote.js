import fs from "fs-extra";
import inquirer from "inquirer";

const RULES_FILE = "rules.json";

const loadRules = async () => {
  if (!(await fs.pathExists(RULES_FILE))) {
    console.error("rules.json file not found!");
    process.exit(1);
  }
  return fs.readJson(RULES_FILE);
};

const saveRules = async (rules) => {
  await fs.writeJson(RULES_FILE, rules, { spaces: 2 });
};

// Voting on Proposals
const voteOnProposal = async () => {
  const rules = await loadRules();

  if (rules.proposals.length === 0) {
    console.log("❌ No active proposals.");
    return;
  }

  console.log("📌 Active Proposals:");
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
    console.log(`✅ Vote recorded: ${vote.toUpperCase()} for ${proposal.key}`);
  }
};

voteOnProposal();
