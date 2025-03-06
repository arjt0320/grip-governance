// import fs from "fs-extra";
// import simpleGit from "simple-git";
// import dotenv from "dotenv";

// dotenv.config();
// const git = simpleGit();
// const RULES_FILE = "rules.json";

// // Load governance rules
// const loadRules = async () => {
//   if (!(await fs.pathExists(RULES_FILE))) {
//     console.error("rules.json file not found!");
//     process.exit(1);
//   }
//   return fs.readJson(RULES_FILE);
// };

// // Save governance rules
// const saveRules = async (rules) => {
//   await fs.writeJson(RULES_FILE, rules, { spaces: 2 });
// };

// // Merge approved proposals
// const finalizeProposals = async () => {
//   const rules = await loadRules();
//   const threshold = Math.ceil(rules.participants.length / 2);

//   rules.proposals.forEach((proposal) => {
//     if (proposal.status === "pending") {
//       if (proposal.votes.yes >= threshold) {
//         rules.rules[proposal.key] = proposal.value;
//         proposal.status = "approved";
//         console.log(`✅ Approved: ${proposal.key} -> ${proposal.value}`);
//       } else if (proposal.votes.no >= threshold) {
//         proposal.status = "rejected";
//         console.log(`❌ Proposal rejected: ${proposal.key}`);
//       }
//     }
//   });

//   await saveRules(rules);
//   await git.add(RULES_FILE);
//   await git.commit("Finalized proposals");
//   await git.push();

//   console.log("✅ Finalization completed.");
// };

// finalizeProposals();



import fs from 'fs';

const RULES_FILE = 'rules.json';

function mergeApprovedProposals() {
    // Read the rules.json file
    const data = fs.readFileSync(RULES_FILE, 'utf8');
    const rules = JSON.parse(data);

    // Filter approved proposals (where YES votes > NO votes)
    const approvedProposals = rules.proposals.filter(proposal => proposal.votes.yes > proposal.votes.no);

    if (approvedProposals.length === 0) {
        console.log("🚀 No proposals approved for merging.");
        return;
    }

    // Move approved proposals to the 'rules' section
    approvedProposals.forEach(proposal => {
        console.log(`✅ Applying approved proposal: ${proposal.key} = ${proposal.value}`);
        rules.rules[proposal.key] = proposal.value;
    });

    // Remove merged proposals from the proposals array
    rules.proposals = rules.proposals.filter(proposal => proposal.votes.yes <= proposal.votes.no);

    // Save updated rules.json
    fs.writeFileSync(RULES_FILE, JSON.stringify(rules, null, 2), 'utf8');
    console.log("✅ rules.json updated successfully!");

    // Commit the changes automatically (optional)
    try {
        require('child_process').execSync('git add rules.json && git commit -m "Merged approved proposals" && git push origin main');
        console.log("✅ Changes pushed to GitHub.");
    } catch (error) {
        console.error("⚠️ Error pushing changes to GitHub. Please push manually.");
    }
}

// Run the function
mergeApprovedProposals();
