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
        const linkValue = inputLink.value;
        if (linkValue.includes("gateway.platoboost.com")) {
            await deltaBypass(linkValue);
        } else {
            const response = await apiRequest(linkValue);
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
                showError(response.message);
            }
        }
    } catch (e) {
        showError('API Timeout');
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

async function deltaBypass(link) {
    const urlParams = new URLSearchParams(new URL(link).search);
    const id = urlParams.get("id");
    const tk = urlParams.get("tk");

    const keyDataPromise = fetch(`https://api-gateway.platoboost.com/v1/authenticators/8/${id}`).then(res => res.json());

    if (tk) {
        await sleep(3000);
        try {
            const response = await fetch(`https://api-gateway.platoboost.com/v1/sessions/auth/8/${id}/${tk}`, {
                method: "PUT"
            }).then(res => res.json());

            if (response.redirect) {
                window.location.assign(response.redirect);
            }
            return;
        } catch (err) {
            showError("Auth Error");
        }
    }

    const keyData = await keyDataPromise;

    if (keyData.key) {
        navigator.clipboard.writeText(keyData.key).then(() => {
            bypassLink.value = keyData.key;
            bypassPaste.innerText = null;
            bypassPaste.hidden = true;
            bypassLink.hidden = false;
        }).catch(err => {
            showError("Failed to copy key");
        });
        return;
    }

    try {
        const captcha = keyData.captcha ? await getTurnstileResponse() : "";
        const sessionData = await fetch(`https://api-gateway.platoboost.com/v1/sessions/auth/8/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ captcha, type: captcha ? "Turnstile" : "" })
        }).then(res => res.json());

        await sleep(3000);

        const redirectUrl = decodeURIComponent(sessionData.redirect);
        const redirectParam = new URL(redirectUrl).searchParams.get("r");
        const decodedUrl = atob(redirectParam);

        window.location.assign(decodedUrl);
    } catch (err) {
        showError("Captcha Error");
    }
}

async function getTurnstileResponse() {
    let response = "";
    while (!response) {
        try {
            response = turnstile.getResponse();
        } catch (e) {}
        await sleep(5);
    }
    return response;
}

function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.textContent = message;
    errorDiv.style.position = 'fixed';
    errorDiv.style.top = '20px';
    errorDiv.style.right = '20px';
    errorDiv.style.padding = '15px';
    errorDiv.style.backgroundColor = 'red';
    errorDiv.style.color = 'white';
    errorDiv.style.borderRadius = '5px';
    errorDiv.style.zIndex = '9999';
    errorDiv.style.opacity = '0';
    document.body.appendChild(errorDiv);

    setTimeout(() => {
        errorDiv.style.opacity = '1';
    }, 10);

    setTimeout(() => {
        errorDiv.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(errorDiv);
        }, 500);
    }, 3000);
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
