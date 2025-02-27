import fs from "fs-extra";

const RULES_FILE = "rules.json";

const loadRules = async () => fs.readJson(RULES_FILE);
const saveRules = async (rules) => fs.writeJson(RULES_FILE, rules, { spaces: 2 });

const mergeProposals = async () => {
  const rules = await loadRules();
  const participants = rules.participants.length;
  const threshold = Math.ceil(participants / 2);

  rules.proposals = rules.proposals.filter((proposal) => {
    if (proposal.votes.yes >= threshold) {
      rules.rules[proposal.key] = proposal.value;
      console.log(`🔄 Rule merged: ${proposal.key} -> ${proposal.value}`);
      return false;
    }
    return true;
  });

  await saveRules(rules);
};

mergeProposals();
