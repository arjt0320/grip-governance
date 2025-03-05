import fs from "fs-extra";
import simpleGit from "simple-git";
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

// Merge approved proposals
const finalizeProposals = async () => {
  const rules = await loadRules();
  const threshold = Math.ceil(rules.participants.length / 2);

  rules.proposals.forEach((proposal) => {
    if (proposal.status === "pending") {
      if (proposal.votes.yes >= threshold) {
        rules.rules[proposal.key] = proposal.value;
        proposal.status = "approved";
        console.log(`✅ Approved: ${proposal.key} -> ${proposal.value}`);
      } else if (proposal.votes.no >= threshold) {
        proposal.status = "rejected";
        console.log(`❌ Proposal rejected: ${proposal.key}`);
      }
    }
  });

  await saveRules(rules);
  await git.add(RULES_FILE);
  await git.commit("Finalized proposals");
  await git.push();

  console.log("✅ Finalization completed.");
};

finalizeProposals();

