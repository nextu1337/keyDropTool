/* Requirements/Packages */

const fs = require('fs')
const reader = require("readline-sync");
const axios = require('axios')
const open = require('open');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

/* Config */

let config = require('./config.json')

/* Variables */

let baseURL = "https://key-drop.com/en/"
let users = {};
let FirstTime = false;

/* Functions */

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function cls() {
    process.stdout.write("\u001b[3J\u001b[2J\u001b[1J");console.clear();
}
function saveConfig()
{
    fs.writeFile('./config.json',JSON.stringify(config),(err)=>{if(err)console.error(err)})
}
/* Key-Drop functions */

async function getUserInfo(cookie){
        let response = await axios(`${baseURL}apiData/Init/index`, {
            headers: {
                Cookie: `iziwincok=${cookie}; myprefix_Zalogowany=1; key-lang=EN`
            }
        })
            return response.data?.steamId === undefined ?  false : response.data
}
async function redeemCode(code, cookie){
    let body = JSON.stringify({
      promoCode: code,
      recaptcha: null,
  });
      let response = await axios.post(`${baseURL}Api/activation_code`, body, {
          headers: {
            cookie: `key-lang=EN; iziwincok=${cookie}; myprefix_Zalogowany=1;`,
            origin: "https://key-drop.com",
            referer: "https://key-drop.com/en/panel/profil/free-gold",
            Host: "key-drop.com",
            accept: "*/*",
            'accept-language': `en-US,en;q=0.9,pl-PL;q=0.8,pl;q=0.7`,
            'sec-ch-ua': `"Chromium";v="92", " Not A;Brand";v="99", "Google Chrome";v="92"`,
            'sec-ch-ua-mobile': "?0",
            'sec-fetch-dest': "empty",
            'sec-fetch-mode': 'no-cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36',
            'x-requested-with': 'XMLHttpRequest',
            'Content-Type': 'application/json',
            'Content-Length': body.length
          }
      })
      return response.data
  }

  // TO FIX
 async function joinGiveaway(giveawayCode, cookie)
  {
        let response = await axios(`${baseURL}Giveaway/add`, {
            mode: 'no-cors',
            method: 'POST',
            headers: {
                Cookie: `iziwincok=${cookie}; myprefix_Zalogowany=1; key-lang=EN`,
                "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:92.0) Gecko/20100101 Firefox/92.0",
                "Accept": "*/*",
                "Accept-Language": "pl,en-US;q=0.7,en;q=0.3",
                "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                "X-Requested-With": "XMLHttpRequest",
                "Sec-Fetch-Dest": "empty",
                "Sec-Fetch-Mode": "cors",
                "Sec-Fetch-Site": "same-origin"
            },
            data: "giveaway="+giveawayCode
        })
        while(response.data.length!=0) return response.data;    
    
  }
 async function getGiveaways()
  {
      let response = await axios(`${baseURL}`)
            let rsp = [];
            const dom = new JSDOM(response.data);
            let elements = dom.window.document.getElementsByClassName('giveaway-m')
            let els = Array.from(elements);
            for(let el of els)
            {
                let object = {};
                object["type"] = el.getAttribute("data-type")
                object["id"] = el.getAttribute("data-id")
                object["title"] = el.getAttribute("data-title")
                rsp.push(object);
            }
            return rsp
  }





/* Program Functions */
  async function startUp(){
        cls()
        console.log(`\x1b[31m 
   _  __                 _____                    _______          _ 
  | |/ /                |  __ \\                  |__   __|        | |
  | ' / ___ _   _ ______| |  | |_ __ ___  _ __      | | ___   ___ | |
  |  < / _ \\ | | |______| |  | | '__/ _ \\| '_ \\     | |/ _ \\ / _ \\| |
  | . \\  __/ |_| |      | |__| | | | (_) | |_) |    | | (_) | (_) | |
  |_|\\_\\___|\\__, |      |_____/|_|  \\___/| .__/     |_|\\___/ \\___/|_|
             __/ |                       | |                         
            |___/                        |_|             \x1b[33mmade by nextu\x1b[37m`)
        
        await sleep(500);
        console.log("\x1b[33mLoading Cookies...")
        for(let cookie of config.cookies)
        {
            let info = await getUserInfo(cookie)
            if(!info) {
                console.log(cookie + " seems to be invalid, skipping!");
                continue; 
             }
             console.log("Successfully logged in as "+info.userName+" ("+info.steamId+")");
             users[cookie] = info;
        }
        if (config.cookies.length==0) return firstTime()
        else {
            await sleep(2000);
           return start();
        }
        
        
  }

 async function firstTime() {
    await sleep(500);
    FirstTime = true;
    console.log("\x1b[31m[!] \x1b[33mWoah! It looks like it's your first time here :)")
    console.log("I'm glad you chose to download my software.")
    console.log("Anyways, press spacebar to add your cookies first!\x1b[37m")
    while (true)
     {
        let key = reader.keyIn('',
        {hideEchoBack: true, mask: '', limit: ' '});
        if(key==" ") break;
     }
     return cookieSettings();
  }

  async function start()
  {
        cls()
        console.log("\x1b[36m=========================")
        console.log("1. \x1b[33mCookie \x1b[36mSettings")
        console.log("2. \x1b[31mProgram \x1b[36mSettings")
        console.log("3. Mass join 6h/24h Giveaways")
        console.log("4. Mass redeem code")
        console.log("5. Mass open daily case \x1b[31m[WIP/Requires 2captcha (recaptchav2 credits)]\x1b[36m")
        console.log("6. Useful information")
        console.log("7. Donate me")
        console.log("=========================\x1b[37m")
        let choice = reader.question("Choice: ")
        
        switch(choice){
            case "1":
                cookieSettings()
                break;
            case "2":
                programSettings()
                break;
            case "3":
                joinGiveaways();
                break;
            case "4":
                redeemCodes();
                break;
            case "5":
                openDailyCases();
                break;
            case "6":
                usefulInfo()
                break;
            case "7":
                console.log("If the browser is not opening please visit https://paypal.me/xnextu manually")
                setTimeout(start,5000)
                open("https://paypal.me/xnextu")
                break;
            default:
                start();
                break;
        }
  }




  async function cookieSettings() {
    cls();
    if(FirstTime)
    {
        console.log("\x1b[33mHello there. This message is being shown to you because it's probably your first time here but don't worry, I got you")
        console.log("To get started first thing you need to do is to get your Cookie")
        console.log("I don't really want to explain what Cookies are but in this case they are authentication")
        console.log("To get your authentication Cookie install \"EditThisCookie\" extension on Google Chrome/Mozilla Firefox/Opera and head over to Key-Drop.com")
        console.log("If you're not logged in, log in because it's important. Then Click EditThisCookie icon and search for \"iziwincok\" Cookie. Get it's value and paste it here\x1b[37m")
        let cookie = reader.question("Cookie: ")
        let user = await getUserInfo(cookie);
        if(!user) {
            console.log("\x1b[31mCookie invalid.")
            await sleep(2000)
            return cookieSettings();

        }
            console.log("\x1b[32mGood job "+user.userName+". You're good to go!")
            config.cookies.push(cookie)
            saveConfig();
            users[cookie] = user;
            FirstTime = false;
            await sleep(1000);
            return start();
        
    }


  }
  async function programSettings() {}
  async function joinGiveaways() {
      cls();
      let giveaways= await getGiveaways()
      let options = ['6h '+giveaways[0].title, '24h '+giveaways[1].title];
      let giveawayCode = reader.keyInSelect(options, 'What giveaway to join?');

    Object.entries(users).forEach(async ([key, value]) => {
        let response = await joinGiveaway(giveaways[giveawayCode].id,key)
            if(response.status==1) console.log("Successfully joined 24h giveaway as " + value.userName)
            else console.log("Failed to join 24h giveaway as " + value.userName)
    });
    console.log("\x1b[37mPress spacebar to go back to the menu.")
    while (true)
     {
        let key = reader.keyIn('',
        {hideEchoBack: true, mask: '', limit: ' '});
        if(key==" ") break;
     }
     return start();
  }

  async function redeemCodes() {
    let code = reader.question("Enter the code: ")
    Object.entries(users).forEach(async ([key, value]) => {
        let response = await redeemCode(code,key)
        if(!response) console.log("Failed to redeem code as "+value.userName)
        else console.log("Redeemed code as "+value.userName+" and got "+response?.goldBonus+" gold")
    });
    console.log("\x1b[37mPress spacebar to go back to the menu.")
    while (true)
     {
        let key = reader.keyIn('',
        {hideEchoBack: true, mask: '', limit: ' '});
        if(key==" ") break;
     }
     return start();
  }

  async function openDailyCases() {
      cls()
      console.log("This function doesn't work yet :/")
      setTimeout(start,5000)
  }
 

  async function usefulInfo() {
      cls();
      console.log("\x1b[31m! PLEASE DO NOT SELL THIS PROGRAM !")
      console.log("\x1b[32mThis program was made for free for a reason. I made it while my internet couldn't even load Key-Drop website properly and was made for people who have a similar problem")
      console.log("\x1b[31mHow to keep your cookies alive?")
      console.log("\x1b[32mThis program has a very big issue - Cookies cannot be generated which is rather understandable as Key-Drop uses Steam login so to keep your cookies alive you should avoid logging out of your account through key-drop website directly")
      console.log("\x1b[31mHow to safely log out of your account?");
      console.log("\x1b[32mTo safely log out from your account you should delete 'iziwincok' cookie using an extension like EditThisCookie or just edit that cookie to a random thing and refresh the page");
      console.log("\x1b[31mWhat are the limits?");
      console.log("\x1b[32mThe Cookie limit is 10 so you don't get rate limited too often :)");
      console.log("\x1b[37mTo go back to the menu, press spacebar")
      while (true)
     {
        let key = reader.keyIn('',
        {hideEchoBack: true, mask: '', limit: ' '});
        if(key==" ") break;
     }
     return start();
     
}
  
  
/* Start the magic */
  startUp();