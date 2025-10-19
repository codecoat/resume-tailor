const fileInput = document.getElementById("fileInput");
const rewriteBtn = document.getElementById("rewriteBtn");
const preview = document.getElementById("preview");
const downloadLink = document.getElementById("downloadLink");

let extractedText = "";

// Step 1: Read .docx file
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

// Step 2: Simple rule-based rewriting (you can expand later)
function rewriteText(text) {
    const lines = text.split("\n").map(l => l.trim()).filter(l => l);
    const actionVerbs = ['Led','Managed','Designed','Built','Created','Implemented','Improved','Reduced','Increased','Delivered','Developed','Automated','Optimized','Coordinated'];
    
    const rewritten = lines.map((line,i) => {
        let newLine = line;
        if(!new RegExp(`^(${actionVerbs.join("|").toLowerCase()})`).test(line.toLowerCase())) {
            const verb = actionVerbs[i % actionVerbs.length];
            newLine = `${verb} ${line[0].toLowerCase() + line.slice(1)}`;
        }
        return newLine;
    });
    return rewritten.join("\n");
}

// Step 3: Generate new Word file
rewriteBtn.addEventListener("click", () => {
    if(!extractedText) return alert("Upload a .docx file first!");

    const rewrittenText = rewriteText(extractedText);
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

