const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)
const PlAYER_STORAGE_KEY = "MUSIC_PLAYER";
const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')
const volUpBtn = $('.btn-volume-up')
const volDownBtn = $('.btn-volume-down')
const volumeRange = $('.volume-range')
const volumeControl = $('.volume-control')

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRamdom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PlAYER_STORAGE_KEY)) || {},
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PlAYER_STORAGE_KEY, JSON.stringify(this.config));
    },
    songs: [{
        name: 'Words',
        singer: 'Chris Medina',
        path: './Assets/What are words.mp3',
        image: './Assets/words.jpg'
    }, {
        name: 'Careless Whisper',
        singer: 'George Michael',
        path: './Assets/yt1s.com - Careless Whisper  George Michael  Lyrics Kara  Vietsub HD_1080p.mp4',
        image: './Assets/Careless Whisper  George Michael.jpg'
    }, {
        name: 'Cry On My Shoulder',
        singer: 'Super Star',
        path: './Assets/yt1s.com - Cry On My Shoulder  Super Star  Lyrics Kara  Vietsub HD_1080p.mp4',
        image: './Assets/cryonmyshoulder.jpg'
    }, {
        name: 'La La Love On My Mind',
        singer: 'Ann Winsborn',
        path: './Assets/yt1s.com - La La Love On My Mind  Ann Winsborn  Lyrics Kara  Vietsub HD_1080p.mp4',
        image: './Assets/lalalove.jpg'
    }, {
        name: 'La La La',
        singer: 'Sam Smith',
        path: './Assets/yt1s.com - Sam Smith  La La La Live at the Jingle Bell Ball_1080p.mp4',
        image: './Assets/lalala.jpg'
    }, {
        name: 'Sunshine In The Rain',
        singer: 'BWO',
        path: './Assets/yt1s.com - Sunshine In The Rain  BWO  MV Lyrics  Vietsub_1080p.mp4',
        image: './Assets/sunshine in the rain.jpg'
    }, {
        name: 'Stronger',
        singer: 'Inez',
        path: './Assets/yt1s.com - Bản Nhạc Huyền Thoại  Stronger Inez Remix.mp4',
        image: './Assets/Stronger inez.jpg'
    }],
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class = 'song ${index === this.currentIndex ? 'active': ''}' data-index = '${index}'>
                <div class = "thumb"
                    style = "background-image: url('${song.image}');">
                </div>
                <div class = 'body'>
                    <h3 class = 'title'>${song.name}</h3>
                    <p class = 'author'>${song.singer}</p>
                </div>
                <div class = 'option'>
                    <i class = 'fas fa-ellipsis-h'></i>
                </div>
            </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function() {
        const cdWidth = cd.offsetWidth
        const _this = this

        // Xử lý CD quay/dừng
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000, //10s
            iterations: Infinity,
        })
        cdThumbAnimate.pause();

        // Xử lý phóng to thu nhỏ CD
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop
            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xử lý khi click play
        playBtn.onclick = function() {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        // khi song được play
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // khi song bị pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPersent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPersent
            }
        }

        // xử lý khi tua
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        // xử lý khi next
        nextBtn.onclick = function() {
            if (_this.isRamdom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // xử lý khi prev
        prevBtn.onclick = function() {
            if (_this.isRamdom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Random
        randomBtn.onclick = function() {
            _this.isRamdom = !_this.isRamdom
            _this.setConfig('isRandom', _this.isRandom);
            randomBtn.classList.toggle('active', _this.isRamdom)
        }

        // Xử lý khi lặp lại bài hát
        repeatBtn.onclick = function(e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat);
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }

        // Xử lý next khi xong bài
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        //Lắng nghe hành vi click vào playlist
        playlist.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)');

            if (songNode || e.target.closest('.option')) {
                //xử lý khi click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index);
                    _this.loadCurrentSong();
                    _this.render();
                    audio.play();
                }

                //xử lý khi click vào option
                if (e.target.closest('.option')) {
                    alert("Chưa kịp làm! HEHE ^^")
                }
            }
        }

        // Khi giảm âm lượng
        volDownBtn.onclick = function() {
            if (audio.volume < 0.1) {
                alert("Hiện đăng tắt tiếng")
            } else {
                audio.volume -= 0.1;
            }
        }

        // Khi volume up 
        volUpBtn.onclick = function() {
            if (audio.volume >= 1) {
                alert("Đạt mức âm thanh cao nhất của trang web!!\nĐể tăng âm thanh vui lòng tăng âm thanh thiết bị!")
            } else {
                audio.volume = audio.volume + 0.1;
            }
        }
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
        }, 300)
    },
    //Xử lý tăng giảm âm thanh
    changeVolume: function() {
        audio.onvolumechange = function() {
            volumeRange.style.display = "block";
            setTimeout(function() {
                volumeRange.style.display = "none";
            }, 2000)
            volumeControl.value = audio.volume;
        }

        volumeControl.onchange = function() {
            audio.volume = volumeControl.value;
        }
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
        console.log(heading, cdThumb, audio)
    },

    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    nextSong: function() {
        this.currentIndex++
            if (this.currentIndex >= this.songs.length) {
                this.currentIndex = 0
            }
        this.loadCurrentSong()
    },
    prevSong: function() {
        this.currentIndex--
            if (this.currentIndex < 0) {
                this.currentIndex = this.songs.length - 1
            }
        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        }
        while (newIndex === this.currentIndex)
        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    start: function() {
        //gán cấu hình từ config vào ứng dụng
        this.loadConfig();

        // định nghĩa các thuộc tính cho object
        this.defineProperties()

        // Lắng nghe/ xử lý sự kiện (DOM events)
        this.handleEvents()

        // Hiển thị bài hát đầu tiên
        this.loadCurrentSong()

        // Render playlist
        this.render()

        //Xử lý tăng giảm âm thang
        this.changeVolume();

        //hiển thị trạng thái ban đầu của button repeat và random
        repeatBtn.classList.toggle('active', this.isRepeat);
        randomBtn.classList.toggle('active', this.isRandom);
    }
}
app.start()