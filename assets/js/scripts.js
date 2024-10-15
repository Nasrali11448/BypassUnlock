const linkRegex = /^(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?$/;
const exampleLinks = ['Enter Link'];
const randomLink = exampleLinks[Math.floor(Math.random() * exampleLinks.length)];


const inputLink = document.querySelector('#inputLink');
const inputSubmit = document.querySelector('#inputSubmit');
const bypassLink = document.querySelector('#bypassLink');
const bypassPaste = document.querySelector('#bypassPaste');
const bypassPopup = document.querySelector('#bypassPopup');
const bypassCopy = document.querySelector('#bypassCopy');

inputLink.placeholder = `${randomLink}`;

inputSubmit.addEventListener('click', async function () {
    inputSubmit.disabled = true;
    inputLink.disabled = true;
    inputSubmit.textContent = 'Bypassing...';
    try {
        const response = await apiRequest(inputLink.value);
        if (response.status == 'success') {
            inputLink.value = null;
            if (linkRegex.test(response.result)) {
                bypassLink.value = response.result;
                bypassPaste.innerText = null;
                bypassPaste.hidden = true;
                bypassLink.hidden = false;
            } else {
                bypassPaste.innerText = response.result;
                bypassLink.value = null;
                bypassPaste.hidden = false;
                bypassLink.hidden = true;
            }
            document.body.classList.add('blur');
            bypassPopup.showModal();
        } else {
            alert(response.message);
        }
    } catch (e) {
        alert('API Timeout');
    } finally {
        toggleButtonByInput();
        inputLink.disabled = false;
    }
});

bypassCopy.addEventListener('click', () => {
    navigator.clipboard.writeText(bypassLink.value ? bypassLink.value : bypassPaste.innerText);
    bypassCopy.children[0].hidden = true;
    bypassCopy.innerHTML = bypassCopy.innerHTML.replace('Copy', 'Copied');
    setTimeout(() => {
        bypassCopy.innerHTML = bypassCopy.innerHTML.replace('Copied', 'Copy');
        bypassCopy.children[0].hidden = false;
    }, 1000);
});
inputLink.addEventListener('input', toggleButtonByInput);
toggleButtonByInput();

async function apiRequest(link) {
    try {
        const response = await fetch(`https://api.bypass.vip/bypass?url=${encodeURIComponent(link)}`);
        return response.json();
    } catch (e) {
        throw new Error('API Error');
    }
}

function toggleButtonByInput() {
    const matchesLink = linkRegex.test(inputLink.value);
    inputSubmit.disabled = !matchesLink;
    inputSubmit.textContent = 'Bypass ' + (matchesLink ? '' : '');

    if (matchesLink) {
        inputSubmit.style.backgroundColor = '#118bee';
    } else {
        inputSubmit.style.backgroundColor = '';
    }

    return matchesLink;
}

function closeDialog() {
    document.body.classList.remove('blur');
    bypassPopup.close();
}

document.addEventListener('DOMContentLoaded', function() {
    document.body.classList.add('dark-mode');
});
