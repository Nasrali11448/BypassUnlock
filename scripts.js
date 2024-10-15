document.getElementById('bypassButton').addEventListener('click', function() {
  const apiUrl = 'https://bypassunlockapi-eqyp.onrender.com/bypass';
  const linkToBypass = document.getElementById('urlInput').value.trim();
  const resultContainer = document.getElementById('resultContainer');
  const resultText = document.getElementById('resultText');
  const copyButton = document.getElementById('copyButton');
  const openButton = document.getElementById('openButton');
  const adContainer = document.getElementById('adContainer');
  const bannerAd = document.getElementById('bannerAd');
  const closeAdButton = document.getElementById('closeAdButton');

  const showAd = Math.floor(Math.random() * 10) === 1;

  if (showAd) {
    adContainer.classList.remove('hidden');
    adContainer.classList.add('fade-in');

    bannerAd.addEventListener('click', function() {
      window.open('https://billing.litebyte.co/aff.php?aff=10', '_blank');
    });

    closeAdButton.addEventListener('click', function() {
      adContainer.classList.add('hidden');
    });
  }

  if (linkToBypass === '') {
    alert('Please enter a URL to bypass.');
    return;
  }

  resultContainer.classList.remove('hidden');
  resultContainer.classList.add('fade-in');

  resultText.innerHTML = `
    <div class="flex justify-center items-center">
      <div class="spinner-border animate-spin inline-block w-6 h-6 border-4 border-t-transparent border-white rounded-full"></div>
      <span class="ml-4 text-lg font-semibold text-zinc-300">Bypassing...</span>
    </div>
  `;

  const minDisplayTime = 2000; 
  const startTime = Date.now();

  copyButton.classList.add('hidden');
  openButton.classList.add('hidden');
  copyButton.disabled = true;
  openButton.disabled = true;

  const newCopyButton = copyButton.cloneNode(true);
  const newOpenButton = openButton.cloneNode(true);
  
  copyButton.replaceWith(newCopyButton);
  openButton.replaceWith(newOpenButton);

  axios.get(apiUrl, { params: { link: linkToBypass } })
    .then(response => {
      const data = response.data;

      const elapsedTime = Date.now() - startTime;
      const timeToDisplay = Math.max(minDisplayTime - elapsedTime, 0);

      setTimeout(() => {
        if (data.bypassed) {
          const bypassedLink = data.bypassed;
          resultText.innerHTML = bypassedLink;
          newCopyButton.classList.remove('hidden');
          newOpenButton.classList.remove('hidden');
          newCopyButton.disabled = false;
          newOpenButton.disabled = false;

          newCopyButton.addEventListener('click', function() {
            const tempInput = document.createElement('input');
            tempInput.value = bypassedLink;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            alert('URL copied to clipboard!');
          });

          newOpenButton.addEventListener('click', function() {
            window.open(bypassedLink, '_blank'); 
          });
        } else {
          resultText.innerHTML = '<p class="text-red-500">Bypass failed.</p>';
        }
      }, timeToDisplay);
    })
    .catch(error => {
      console.error('Error fetching data:', error);

      const elapsedTime = Date.now() - startTime;
      const timeToDisplay = Math.max(minDisplayTime - elapsedTime, 0);

      setTimeout(() => {
        resultText.innerHTML = '<p class="text-red-500">Bypass failed.</p>';
        newCopyButton.classList.add('hidden');
        newOpenButton.classList.add('hidden');
        newCopyButton.disabled = true;
        newOpenButton.disabled = true;
      }, timeToDisplay);
    });
});






document.addEventListener('contextmenu', function(e) {
  e.preventDefault();
});

document.addEventListener('keydown', function(e) {
  if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
      e.preventDefault();
      e.stopPropagation();
  }
});

document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && (e.key === 'U' || (e.shiftKey && e.key === 'U'))) {
      e.preventDefault();
      e.stopPropagation();
  }
});

document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      e.stopPropagation();
  }
});

document.addEventListener('keydown', function(e) {
  if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      e.stopPropagation();
      console.log('Ctrl+U is disabled');
  }
});

(function() {
  const mobileDevices = [
      'Android', 'webOS', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 'Windows Phone'
  ];

  function isMobile() {
      return mobileDevices.some(device => navigator.userAgent.includes(device));
  }

  function getRandomWebsite() {
      return 'https://discord.com/invite/bypassunlock';
  }

})();
