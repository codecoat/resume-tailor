const fileInput = document.getElementById("fileInput");
const rewriteBtn = document.getElementById("rewriteBtn");
const preview = document.getElementById("preview");
const downloadLink = document.getElementById("downloadLink");
const jobDescInput = document.getElementById("jobDesc");

let extractedText = "";

// Read .docx file
fileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(event) {
        const arrayBuffer = event.target.result;
        mammoth.extractRawText({arrayBuffer})
            .then(result => {
                extractedText = result.value;
                preview.textContent = extractedText;
            })
            .catch(err => alert("Error reading file: " + err));
    };
    reader.readAsArrayBuffer(file);
});

// Rewrite logic with job description keywords
function rewriteText(text, jobDesc) {
    const lines = text.split("\n").map(l => l.trim()).filter(l => l);
    const actionVerbs = ['Led','Managed','Designed','Built','Created','Implemented','Improved','Reduced','Increased','Delivered','Developed','Automated','Optimized','Coordinated'];

    // Extract keywords from job description (simple approach)
    const jobKeywords = jobDesc
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(word => word.length > 3); // skip very short words

    const rewritten = lines.map((line, i) => {
        let newLine = line;

        // Add action verb if missing
        if (!new RegExp(`^(${actionVerbs.join("|").toLowerCase()})`).test(line.toLowerCase())) {
            const verb = actionVerbs[i % actionVerbs.length];
            newLine = `${verb} ${line[0].toLowerCase() + line.slice(1)}`;
        }

        // Include job keywords if found in the line
        jobKeywords.forEach(keyword => {
            if (!newLine.toLowerCase().includes(keyword)) {
                newLine += ` (${keyword})`; // append keyword if not already present
            }
        });

        return newLine;
    });

    return rewritten.join("\n");
}

// Generate new Word file
rewriteBtn.addEventListener("click", () => {
    if(!extractedText) return alert("Upload a .docx file first!");

    const jobDesc = jobDescInput.value || "";
    const rewrittenText = rewriteText(extractedText, jobDesc);
    preview.textContent = rewrittenText;

    const { Document, Packer, Paragraph } = docx;

    const doc = new Document({
        sections: [{
            properties: {},
            children: rewrittenText.split("\n").map(line => new Paragraph(line))
        }]
    });

    Packer.toBlob(doc).then(blob => {
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.download = "Rewritten_Resume.docx";
        downloadLink.style.display = "inline-block";
        downloadLink.textContent = "Download Rewritten Resume";
    });
});
