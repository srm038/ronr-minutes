const { parse } = await import("yaml");
const file = process.argv[2];
if (!file) {
  console.error("Usage: bun yml2md.ts <file.minutes.yml>");
  process.exit(1);
}

const raw = await Bun.file(file).text();
const m = parse(raw);

let out = "";

const md = (s: string) => {
  out += s + "\n\n";
};

// Header
md(`# ${m.title}`);
md(
  `**Date:** ${m.date}  |  **Status:** ${m.status}  |  **Type:** ${m.meeting_type}`,
);

// Call to Order & Opening Ceremonies
{
  let block = `Called to order at **${m.calling_to_order.time}** by ${m.calling_to_order.by}.`;
  if (m.opening_ceremonies?.length) {
    block += `\n`;
    for (const c of m.opening_ceremonies) {
      block += `\n${m.opening_ceremonies.length > 1 ? "- " : ""}${c.by} ${c.description}`;
    }
  }
  md(`## Call to Order\n\n${block}`);
}

// Roll Call
if (m.roll_call) {
  md(`## Roll Call`);
  if (m.roll_call.officers_present?.length) {
    md(
      `**Officers Present:** ${m.roll_call.officers_present.map((o: any) => `${o.name} (${o.office})`).join(", ")}`,
    );
  }
  if (m.roll_call.members_present?.length) {
    md(`**Members Present:** ${m.roll_call.members_present.join(", ")}`);
  }
  if (m.roll_call.members_absent?.length) {
    md(`**Members Absent:** ${m.roll_call.members_absent.join(", ")}`);
  }
  if (m.roll_call.guests?.length) {
    md(`**Guests:** ${m.roll_call.guests.join(", ")}`);
  }
  md(`A quorum was ${m.roll_call.quorum ? "" : "not "}present.`);
}

// Minutes Approval
if (m.minutes_approval) {
  md(`## Minutes Approval`);
  const a = m.minutes_approval;
  let line = `Minutes of **${a.of_meeting_date}** were **${a.result}**.`;
  if (a.corrections?.length) {
    line += ` Corrections: ${a.corrections.join(", ")}.`;
  }
  if (a.motion) {
    line += ` Motion by ${a.motion.by}${a.motion.seconded ? ", *seconded*" : ""}.`;
  }
  md(line);
}

// Reports
if (m.reports?.length) {
  md(`## Reports`);
  for (const r of m.reports) {
    let block = `- ${r.by} presented the report on ${r.title}.`;
    if (r.motions?.length) block += `\n\n${renderMotions(r.motions, "    ")}`;
    md(block);
  }
}

// Unfinished Business
if (m.unfinished_business?.length) {
  md(`## Unfinished Business`);
  for (const item of m.unfinished_business) {
    let block = `- **${item.title}**`;
    if (item.description) block += `: ${item.description}`;
    if (item.motions?.length)
      block += `\n\n${renderMotions(item.motions, "    ")}`;
    md(block);
  }
}

// New Business
if (m.new_business?.length) {
  md(`## New Business`);
  for (const item of m.new_business) {
    let block = `- **${item.title}**`;
    if (item.description) block += `: ${item.description}`;
    if (item.motions?.length)
      block += `\n\n${renderMotions(item.motions, "    ")}`;
    md(block);
  }
}

// Announcements
if (m.announcements?.length) {
  md(`## Announcements`);
  for (const a of m.announcements) md(`- ${a}`);
}

// Adjournment & Closing Ceremonies
{
  const a = m.adjournment;
  if (a.motion || m.closing_ceremonies?.length) {
    let block = "";
    if (a.motion) block += renderMotions([a.motion]);
    if (m.closing_ceremonies?.length) {
      if (block) block += `\n`;
      for (const c of m.closing_ceremonies) {
        block += `\n${m.closing_ceremonies.length > 1 ? "- " : ""}${c.by} ${c.description}`;
      }
    }
    md(`## Adjournment\n\n${block}`);
  }
}

// Attestation
if (m.attestation) {
  md(
    `---\n\n**Attested by:** ${m.attestation.secretary}\n\n**Date Approved:** ${m.attestation.date_approved}`,
  );
}

Bun.write(Bun.stdout, out);

function renderMotions(motions: any[], indent = ""): string {
  return motions
    .map((mot) => {
      let header = `**${mot.type || "Motion"}**`;
      header += ` (${mot.by}`;
      if (mot.seconded) header += `, *seconded*`;
      header += ")";

      let text = mot.text;
      if (!text.endsWith(".")) text += ".";

      let line = `${header}: ${text}`;

      if (mot.vote) {
        let method = mot.vote.method?.toLowerCase() || "voice";
        line += ` **${mot.vote.result}** (*${method}*`;
        if (
          mot.vote.yes !== undefined ||
          mot.vote.no !== undefined ||
          mot.vote.abstain !== undefined
        ) {
          line += `, ${mot.vote.yes ?? 0} yes / ${mot.vote.no ?? 0} no / ${mot.vote.abstain ?? 0} abstain`;
        }
        if (mot.vote.members?.length)
          line += `: ${mot.vote.members.map((mem: any) => `${mem.name}: ${mem.vote}`).join(", ")}`;
        line += ")";
      }

      if (mot.disposition) {
        line += ` ${mot.disposition}`;
        if (mot.referred_to) line += ` (referred to ${mot.referred_to})`;
        if (mot.postponed_to) line += ` (postponed to ${mot.postponed_to})`;
        if (mot.corrections?.length) line += `: ${mot.corrections.join(", ")}`;
      }

      if (mot.amendment) {
        line += ` Amendment by ${mot.amendment.by}: ${mot.amendment.text}`;
        if (mot.amendment.disposition)
          line += ` (${mot.amendment.disposition})`;
      }

      if (!line.endsWith(".")) line += ".";
      return indent + line;
    })
    .join("\n");
}
