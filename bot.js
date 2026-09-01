const mineflayer = require('mineflayer');

function createBot() {
    const bot = mineflayer.createBot({
        host: 'OtraCosa.aternos.me', 
        port: 29577,                
        username: 'DangerBot01',    
        version: '1.21.1' // Recomiendo forzar versión fija si la autodetección en Aternos falla o da error de datos
    });

    let afkInterval = null; // Guardamos el temporizador aquí para poder destruirlo al desconectar

    bot.on('login', () => {
        console.log(`[NPC] Conexión establecida con el servidor de Minecraft.`);
    });

    bot.on('spawn', () => {
        console.log(`[NPC] El bot ha aparecido correctamente en el mapa.`);
        // Si tu servidor No-Premium requiere contraseña, descomenta la línea de abajo:
        // setTimeout(() => bot.chat('/login erickJKN'), 4000);

        // Iniciamos la rutina SOLO cuando el bot ya existe en el mapa
        iniciarRutinaAFK(bot);
    });

    function iniciarRutinaAFK(botInstance) {
        // Limpiamos cualquier bucle previo por seguridad
        if (afkInterval) clearInterval(afkInterval);

        afkInterval = setInterval(async () => {
            // Validación estricta de que el bot sigue vivo y conectado
            if (!botInstance || !botInstance.entity) return;

            try {
                // Buscamos el cofre usando el registro del bot ya spawneado
                const chestBlock = botInstance.findBlock({
                    matching: botInstance.registry.blocksByName.chest.id,
                    maxDistance: 5
                });

                if (chestBlock) {
                    console.log('[NPC] Interactuando con el contenedor cercano...');
                    
                    // Abrir el contenedor
                    const chest = await botInstance.openChest(chestBlock);
                    console.log('[NPC] Contenedor abierto.');
                    
                    // Esperar 2 segundos
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    
                    // Cerrar el contenedor de forma segura verificando que siga ahí
                    if (chest) chest.close();
                    console.log('[NPC] Contenedor cerrado.');
                } else {
                    console.log('[NPC] Aviso: No se detectó ningún contenedor válido cerca.');
                }

                // Acción de salto físico anti-inactividad
                await new Promise(resolve => setTimeout(resolve, 1000));
                if (botInstance.entity) {
                    botInstance.setControlState('jump', true);
                    setTimeout(() => {
                        if (botInstance.entity) botInstance.setControlState('jump', false);
                    }, 500);
                    console.log('[NPC] Acción anti-inactividad completada con éxito.');
                }

            } catch (err) {
                console.log(`[NPC] Error en el ciclo de ejecución: ${err.message}`);
            }
        }, 45000); // Cada 45 segundos
    }

    // Sistema de auto-reconexión limpia
    bot.on('end', (reason) => {
        console.log(`[NPC] Conexión finalizada por: ${reason}. Deteniendo rutinas...`);
        
        // CRÍTICO: Destruir el temporizador para que no se duplique al reconectar
        if (afkInterval) {
            clearInterval(afkInterval);
            afkInterval = null;
        }

        console.log(`[NPC] Reintentando conexión en 25 segundos...`);
        setTimeout(createBot, 25000);
    });

    bot.on('error', (err) => {
        console.log(`[NPC] Error de red detectado: ${err.message}`);
        // No llamamos a createBot aquí porque el evento 'end' se disparará justo después automáticamente
    });
}

createBot();
