const Canvas = require("canvas")
const Discord = require("discord.js")
const background = __dirname + "/rankCardBackground.png"

const dim = {
    height: 675,
    width: 1200,
    margin: 50
}

const av = {
    size: 256,
    x: 480,
    y: 170
}

const generateRankImage = async (userFull, messages, xp, rankRequirements) => {
    const { rankNames, rankXPRequirements } = rankRequirements;

    let currentRankIndex = -1;
    for (let i = 0; i < rankXPRequirements.length; i++) {
        if (xp < rankXPRequirements[i]) {
            currentRankIndex = i - 1;
            break;
        }
    }

    // If the user's XP exceeds the requirements for all ranks, set the current rank to the last rank
    if (currentRankIndex === -1) {
        currentRankIndex = rankXPRequirements.length - 1;
    }


    let currentRankName = currentRankIndex >= 0 ? rankNames[currentRankIndex] : "N/A";

    let currentRankXP = currentRankIndex >= 0 ? rankXPRequirements[currentRankIndex] : 0;
    let nextRankXP = currentRankIndex < rankXPRequirements.length - 1 ? rankXPRequirements[currentRankIndex + 1] : currentRankXP;

    //let username = "test"//member.user.username
    //let avatarURL = "https://htmlcolorcodes.com/assets/images/html-color-codes-color-tutorials.jpg"
    //let avatarURL = member.user?.displayAvatarURL({extension: "png", dynamic: false, size: av.size})
    //if (!avatarURL) {
    //    return;
    // }
    //console.log(xp)

    const canvas = Canvas.createCanvas(1000, 333)
    const ctx = canvas.getContext("2d");
    const backGND = await Canvas.loadImage(background);
    ctx.fillStyle = "rgba(0,0,0,0.8)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(backGND, 0, 0, canvas.width, canvas.height);


    ctx.beginPath();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#A3A3A3"
    ctx.globalAlpha = 0.2;
    ctx.fillStyle = "#000000"
    ctx.fillRect(180, 216, 775, 65);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeRect(180, 216, 775, 65);
    ctx.stroke();
    ctx.fillStyle = "#ADD8E6";
    ctx.globalAlpha = 0.6;
    ctx.fillRect(200, 216, ((xp - currentRankXP) / (nextRankXP - currentRankXP)) * 775, 65); // XP progress within current rank
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.font = '30px sans-serif';
    ctx.textAlign = "center";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(`${xp} / ${nextRankXP} XP`, 600, 260); //current xp then xp to next rank

    ctx.font = '35px sans-serif';
    ctx.textAlign = "left";
    //console.log(userFull)
    ctx.fillText(userFull.nickname, 325, 125);

    ctx.font = '40px sans-serif';
    ctx.fillText("Rank: ", 325, 170);
    ctx.fillText(currentRankName, 450, 170); //users current level

    ctx.font = '40px sans-serif';
    ctx.fillText("Messages: ", 625, 170);
    ctx.fillText(messages, 850, 170); //users current rank

    ctx.arc(170, 160, 120, 0, Math.PI * 2, true);
    ctx.lineWidth = 6;
    ctx.strokeStyle = "WHITE"
    ctx.stroke();
    ctx.closePath();
    ctx.clip();
    const avatar = await Canvas.loadImage(userFull.user.displayAvatarURL({ extension: "jpg" }));
    ctx.drawImage(avatar, 40, 40, 250, 250);

    const attachment = new Discord.AttachmentBuilder(canvas.toBuffer(), "rankCard.png")
    return attachment
}
module.exports = generateRankImage