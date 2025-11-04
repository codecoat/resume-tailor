const dropZone = document.getElementById('drop-zone');
const resumeInput = document.getElementById('resume-input');
const dropText = document.getElementById('drop-text');
const jobDescInput = document.getElementById('job-desc');
const generateBtn = document.getElementById('generate-btn');
const downloadLink = document.getElementById('download-link');
const themeToggle = document.getElementById('theme-toggle');

// File upload handlers
dropZone.addEventListener('click', () => resumeInput.click());

dropZone.addEventListener('dragover', e => {
  e.preventDefault();
  dropZone.style.backgroundColor = '#e0f0ff';
});

dropZone.addEventListener('dragleave', e => {
  e.preventDefault();
  dropZone.style.backgroundColor = '';
});

dropZone.addEventListener('drop', e => {
  e.preventDefault();
  resumeInput.files = e.dataTransfer.files;
  dropText.innerText = resumeInput.files[0].name;
  dropZone.style.backgroundColor = '';
});

resumeInput.addEventListener('change', () => {
  if (resumeInput.files.length > 0) {
    dropText.innerText = resumeInput.files[0].name;
  }
});

// Dark/Light mode toggle
themeToggle.addEventListener('change', () => {
  document.body.classList.toggle('dark');
  document.body.classList.toggle('light');
});

// Generate Resume
generateBtn.addEventListener('click', async () => {
  if (!resumeInput.files[0] || !jobDescInput.value) {
    alert("Upload resume and enter job description");
    return;
  }

  const formData = new FormData();
  formData.append('resume', resumeInput.files[0]);
  formData.append('jobDesc', jobDescInput.value);

  try {
    const res = await fetch('http://localhost:5000/generate', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) throw new Error('Error generating resume');

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    downloadLink.href = url;
    downloadLink.style.display = 'block';
  } catch (err) {
    alert(err.message);
  }
});
