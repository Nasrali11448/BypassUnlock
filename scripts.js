document.getElementById('bypassButton').addEventListener('click', function() {
  const apiUrl = 'https://bypassunlockapi-eqyp.onrender.com/bypass';
  const linkToBypass = document.getElementById('urlInput').value.trim();
  const resultContainer = document.getElementById('resultContainer');
  const resultText = document.getElementById('resultText');
  const copyButton = document.getElementById('copyButton');
  const openButton = document.getElementById('openButton');

  if (linkToBypass === '') {
    alert('Please enter a URL to bypass.');
    return;
  }

  resultContainer.classList.remove('hidden');
  resultText.innerHTML = 'Bypassing...';

  axios.get(apiUrl, { params: { link: linkToBypass } })
    .then(response => {
      const data = response.data;

      if (data.bypassed) {
        resultText.innerHTML = data.bypassed; // Display the bypassed link
        copyButton.classList.remove('hidden');
        openButton.classList.remove('hidden');
      } else {
        resultText.innerHTML = '<p class="text-red-500">Bypass failed.</p>';
      }
    })
    .catch(error => {
      console.error('Error:', error);
      resultText.innerHTML = '<p class="text-red-500">Bypass failed.</p>';
    });
});
