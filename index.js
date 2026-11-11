const mineflayer = require('mineflayer');
const readline = require('readline');

// Tạo giao diện để nhập thông tin trực tiếp từ Terminal
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function promptUser() {
    rl.question('Nhập IP Server (vd: localhost hoặc tentaikhoan.aternos.me): ', (host) => {
        rl.question('Nhập Port Server (vd: 25565): ', (portInput) => {
            rl.question('Nhập phiên bản (vd: 1.20.4 hoặc gõ "auto" để tự động nhận diện): ', (versionInput) => {
                rl.question('Nhập tên hiển thị của Bot: ', (username) => {
                    rl.close();
                    
                    const port = parseInt(portInput.trim()) || 25565;
                    const version = versionInput.trim().toLowerCase() === 'auto' ? false : versionInput.trim();
                    
                    startBot({
                        host: host.trim(),
                        port: port,
                        version: version,
                        username: username.trim() || 'CustomBot'
                    });
                });
            });
        });
    });
}

function startBot(config) {
    console.log(`\n[*] Đang khởi tạo bot [${config.username}] kết nối tới ${config.host}:${config.port} (Phiên bản: ${config.version || 'Auto'})...`);

    const bot = mineflayer.createBot(config);

    bot.once('spawn', () => {
        console.log(`[+] Bot [${config.username}] đã vào game và spawn thành công!`);
        startAfkLoop(bot);
    });

    bot.on('kicked', (reason) => {
        console.log(`[!] Bot bị đá khỏi server. Lý do:`, reason);
    });

    bot.on('end', (reason) => {
        console.log(`[x] Mất kết nối (Lý do: ${reason}). Đang thử kết nối lại sau 5 giây...`);
        setTimeout(() => startBot(config), 5000);
    });

    bot.on('error', (err) => {
        console.log(`[-] Lỗi kết nối:`, err.message);
    });
}

// Hàm chống AFK giúp bot không bị đá do đứng im quá lâu
function startAfkLoop(bot) {
    const afkInterval = setInterval(() => {
        if (!bot.entity) {
            clearInterval(afkInterval);
            return;
        }

        // Quay đầu ngẫu nhiên để duy trì hoạt động
        const yaw = Math.random() * Math.PI * 2;
        const pitch = (Math.random() * Math.PI) - (Math.PI / 2);
        
        bot.look(yaw, pitch, true, () => {
            if (Math.random() > 0.6) {
                bot.setControlState('jump', true);
                setTimeout(() => bot.setControlState('jump', false), 250);
            }
        });

    }, 30000); // Thực hiện mỗi 30 giây

    bot.once('end', () => {
        clearInterval(afkInterval);
    });
}

// Chạy chương trình hỏi thông tin
promptUser();
