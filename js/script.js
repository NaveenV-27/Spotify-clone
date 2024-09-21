let currSong = new Audio();
let currFolder;
let songs;
function secondsToMS(seconds) {
    const minutes = Math.floor(seconds / 60)
    const remSeconds = Math.floor(seconds % 60)
    const fMinutes = String(minutes).padStart(2, '0')
    const fSeconds = String(remSeconds).padStart(2, '0')
    return `${fMinutes}:${fSeconds}`
}


async function getSongs(folder) {
    currFolder = folder
    let data = await fetch(`/${currFolder}/`)
    let t = await data.text()
    let div = document.createElement("div")
    div.innerHTML = t
    let as = div.getElementsByTagName("a")
    let songs = []
    for (const song of as) {
        if (song.href.endsWith(".mp3")) {
            
            songs.push(song.href)
        }
    }
    return songs
}
async function displaySongs() {
    let slist = document.querySelector(".songlist ul");
    slist.innerHTML = ""
    for (const e of songs) {
        let dets = e.split(`${currFolder}/`)[1].replace(".mp3", "").replaceAll("%20", " ").split("-");
        let song = new Audio(e);
        await new Promise((resolve) => {
            song.addEventListener("loadeddata", () => {
                slist.innerHTML +=
                    `<li class="sdets">
                    <i class="fa-solid fa-music"></i>
                    <div class="sinfo">
                        <p class="track">${dets[0].replaceAll("%24","$")}</p>
                        <p class="artist">${dets[1].replaceAll("%2C", ",").replaceAll("%24","$")}</p>
                    </div>
                    <div class="stime">
                        <p class="duration">${secondsToMS(song.duration)}</p>
                        <i class="fa-solid fa-play"></i>
                    </div>
                </li>`;
                resolve();
            });
        });
    }
    
    let listItems = document.querySelectorAll(".sdets");
    listItems.forEach((item) => {
        item.addEventListener("click", () => {
            console.log(`Playing : ${item.querySelector('.track').textContent} by ${item.querySelector('.artist').textContent}`);
            playSong(songs[Array.from(listItems).indexOf(item)])
        });
    });

}


async function playSong(song, play = true) {
    currSong.src = song
    let dets = currSong.src.split(`${currFolder}/`)[1].replace(".mp3", "").replaceAll("%20", " ").split("-")
    Array.from(document.querySelectorAll(".player .track")).forEach((e) => {
        e.innerHTML = dets[0].replaceAll("%24","$")
    })

    Array.from(document.querySelectorAll(".player .artist")).forEach((e) => {
        e.innerHTML = dets[1].replaceAll("%2C", ",").replaceAll("%24","$")
    })
    seekbar.value = 0

    let pause = document.querySelector(".pause")
    if (play) {
        pause.src = "assets/pause.svg"
        currSong.play()
    } else {
        pause.src = "assets/play.svg"

    }
}
async function displayFolders() {
    let a = await fetch("/songs/")
    let response = await a.text()
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cards-container")
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if(e.href.includes("/songs/")) {
            let folder = e.href.split("/").slice(-1)[0]
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json()
            cardContainer.innerHTML = cardContainer.innerHTML + `<div class="card" data-folder="${folder}">
            <img src="/songs/${folder}/cover.jpg" alt="" class="cimg">
            <img src="assets/play_musicbar.png" alt="" width="35rem" class="play">
            <p class="card-title">${response.title}</p>
            <p class="card-desc">${response.description}</p>
        </div>`
        }
        
    }
    Array.from(document.getElementsByClassName("card")).forEach(e=>{
        e.addEventListener("click", async item=>{
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`)
            await displaySongs(songs)
            if(item.target.src.split("assets/")[1] == "play_musicbar.png") {
                playSong(songs[0])
            } else {
                playSong(songs[0], false)
            }
        })
    })
}

let main = async () => {
    songs = await getSongs("songs/Hindi")
    let num = Math.floor(Math.random() * songs.length)
    await displaySongs(songs)
    await playSong(songs[num], false)
    await displayFolders()
    let pause = document.querySelector(".pause")
    pause.addEventListener("click", () => {
        if (currSong.paused) {
            currSong.play()
            pause.src = "assets/pause.svg"
        } else {
            currSong.pause()
            pause.src = "assets/play.svg"
        }
    })
    volume.value = 100
    seekbar.value = 0

    currSong.addEventListener("loadeddata", () => {
        playback.getElementsByTagName("p")[1].innerHTML = secondsToMS(currSong.duration)
    })

    currSong.addEventListener("timeupdate", () => {  //Triggered when the song is played since the play time is updated
        playback.getElementsByTagName("p")[0].innerHTML = secondsToMS(currSong.currentTime)
        seekbar.value = (currSong.currentTime / currSong.duration * 100)
        if (seekbar.value == 100) {
            playSong(songs[songs.indexOf(currSong.src) + 1])
        }
    })
    seekbar.addEventListener("change",e=>{
        currSong.currentTime = (e.target.value/100)*currSong.duration;
        seekbar.value = e.target.value
    })
    next.addEventListener("click", () => {
        playSong(songs[songs.indexOf(currSong.src) + 1])
    })

    prev.addEventListener("click", () => {
        playSong(songs[songs.indexOf(currSong.src) - 1])
    })


    vol.addEventListener("click", () => {
        if (vol.src.split("assets/")[1] == "mute.svg") {
            vol.src = "assets/highvol.svg"
            currSong.volume = 1
            volume.value = 100
        } else {
            vol.src = "assets/mute.svg"
            currSong.volume = 0
            volume.value = 0
        }
    })

    volume.addEventListener("change", e => {
        console.log("Setting volume to", e.target.value)
        currSong.volume = e.target.value / 100
    })
    menu.addEventListener("click",()=>{
        document.querySelector(".sidebar").style.left = "0vw"
    })
    cross.addEventListener("click",()=>{
        document.querySelector(".sidebar").style.left = "-110vw"
    })
    document.body.addEventListener("keydown", e=>{
        if(e.key == " ") {
            if (currSong.paused) {
                currSong.play()
                pause.src = "assets/pause.svg"
            } else {
                currSong.pause()
                pause.src = "assets/play.svg"
            }
        }
    })
}

main()