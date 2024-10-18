const linkRegex = /^(?:https?):\/\/(\w+:?\w*)?(\S+)(:\d+)?(\/|\/([\w#!:.?+=&%!\-\/]))?$/;


const inputLink = document.querySelector('#inputLink');
const inputSubmit = document.querySelector('#inputSubmit');
const bypassLink = document.querySelector('#bypassLink');
const bypassPaste = document.querySelector('#bypassPaste');
const bypassPopup = document.querySelector('#bypassPopup');
const bypassCopy = document.querySelector('#bypassCopy');

inputLink.placeholder = `Enter Link`;

inputSubmit.addEventListener('click', async function () {
    inputSubmit.disabled = true;
    inputLink.disabled = true;
    inputSubmit.textContent = 'Bypassing...';

    try {
        const linkValue = inputLink.value;
        if (linkValue.includes("gateway.platoboost.com")) {
            await deltaBypass(linkValue);
        } else if (linkValue.includes("flux.li")) {
            await fluxusBypass(linkValue);
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
        Toggle();
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

inputLink.addEventListener('input', Toggle);
Toggle();

async function apiRequest(link) {
    try {
        const response = await fetch(`https://api.bypass.vip/bypass?url=${encodeURIComponent(link)}`);
        return response.json();
    } catch (e) {
        throw new Error('API Error');
    }
}

function Toggle() {
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




async function handleCaptchaVerification() {
    return true;
}

async function deltaBypass(link) {
    const urlParams = new URLSearchParams(new URL(link).search);
    const id = urlParams.get("id");
    const tk = urlParams.get("tk");

    const keyDataPromise = fetch(`https://api-gateway.platoboost.com/v1/authenticators/8/${id}`).then(res => res.json());

    if (tk) {
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
        const captcha = keyData.captcha ? await handleCaptchaVerification() : "";

        const sessionData = await fetch(`https://api-gateway.platoboost.com/v1/sessions/auth/8/${id}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ captcha, type: captcha ? "Turnstile" : "" })
        }).then(res => res.json());

        const redirectUrl = decodeURIComponent(sessionData.redirect);
        const redirectParam = new URL(redirectUrl).searchParams.get("r");
        const decodedUrl = atob(redirectParam);

        window.location.assign(decodedUrl);
    } catch (err) {
        showError("Captcha Error");
    }
}

async function fluxusBypass(link) {
    const fluxusApiUrl = `https://fluxus-bypass-orcin.vercel.app/api/fluxus?link=${encodeURIComponent(link)}`;

    try {
        const response = await fetch(fluxusApiUrl);
        if (!response.ok) {
            throw new Error('Fetch Error');
        }

        const data = await response.json();
        const key = data.key;

        if (key) {
            await navigator.clipboard.writeText(key);

            const div = document.createElement('div');
            div.className = 'gui';
            div.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#000;color:#fff;padding:20px;z-index:9999;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;';
            div.innerHTML = `
                <p><strong>${key}</strong></p>
                <button id="copyKey" style="margin-top: 20px;padding: 10px 20px;background:#555;color:#fff;border:none;border-radius:5px;cursor:pointer;">Copy</button>
            `;
            document.body.appendChild(div);

            document.getElementById('copyKey').onclick = function() {
                navigator.clipboard.writeText(key).then(() => {
                    closeFluxUI();
                }).catch(err => {
                    console.error('Clipboard Error: ', err);
                });
            };
        } else {
            showError('Key Error');
        }
    } catch (error) {
        showError('API Error');
    }
}

function closeFluxUI() {
    const guiElement = document.querySelector('.gui');
    if (guiElement) {
        document.body.removeChild(guiElement);
    }
}
