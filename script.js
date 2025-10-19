function simpleTokenize(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s\-]/g, " ")
    .split(" ")
    .filter(t => t.length > 2 && !["the","and","with","from","that","this","for","you","your","are","have","has","will","can","our","their","they","but","not","use","using","who","which","such"].includes(t));
}

function extractTopKeywords(jobDesc, n=6) {
  const tokens = simpleTokenize(jobDesc);
  const counts = {};
  tokens.forEach(t => counts[t] = (counts[t] || 0) + 1);
  return Object.entries(counts)
    .sort((a,b) => b[1]-a[1])
    .slice(0,n)
    .map(x => x[0]);
}

function tailorResume(resumeText, jobDesc) {
  const lines = resumeText.split("\n").map(l => l.trim()).filter(l => l);
  if(lines.length === 0) return "Paste your resume text here.";
  
  const keywords = extractTopKeywords(jobDesc, 6);
  const header = lines.slice(0,2).join(" ");

  const actionVerbs = ['Led','Managed','Designed','Built','Created','Implemented','Improved','Reduced','Increased','Delivered','Developed','Automated','Optimized','Coordinated'];
  
  const rewritten = lines.slice(2).map((line,i) => {
    let newLine = line;
    if(!new RegExp(`^(${actionVerbs.join("|").toLowerCase()})`).test(line.toLowerCase())) {
      const verb = actionVerbs[i % actionVerbs.length];
      newLine = `${verb} ${line[0].toLowerCase() + line.slice(1)}`;
    }

    const injection = keywords.filter(kw => !line.toLowerCase().includes(kw)).slice(0,2);
    if(injection.length) newLine += ` — focused on ${injection.join(", ")}`;

    if(newLine.length > 200) newLine = newLine.slice(0,197) + "...";
    return `- ${newLine}`;
  });

  return `--- Tailored resume (keywords: ${keywords.join(", ")}) ---\n\n${header}\n\n${rewritten.join("\n")}\n\n--- End ---`;
}

// --- Event listeners ---
document.getElementById("tailorBtn").addEventListener("click", () => {
  const jd = document.getElementById("jobDesc").value;
  const resume = document.getElementById("resumeText").value;
  document.getElementById("result").textContent = tailorResume(resume,jd);
});

document.getElementById("copyBtn").addEventListener("click", () => {
  navigator.clipboard.writeText(document.getElementById("result").textContent)
    .then(()=> alert("Copied to clipboard!"))
    .catch(()=> alert("Copy failed"));
});
