import { _decorator, Component, Node, AudioClip, AudioSource, resources } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
    public static instance: AudioManager;
    _audioSource: AudioSource
    clipMap: Map<string,AudioClip>
    // 创建音效单例模式，以便后面调用
    static getInstance(): AudioManager {
        if(this.instance == null){
            this.instance = new AudioManager();
        }
        return this.instance

    }
    constractor(){

    }
    start() {
        // 初始化单例实例对象
        AudioManager.instance = this
        this._audioSource = this.node.getComponent(AudioSource)

    }

    update(deltaTime: number) {
        
    }
    // 播放音效
    playOneShot(sound: AudioClip | string, volume: number = 1.0) {
        if (sound instanceof AudioClip) {
            this._audioSource.playOneShot(sound, volume);
        }
        else {
            resources.load(sound,AudioClip,(err, clip: AudioClip) => {
                if (err) {
                    console.log(err);
                }
                else {
                    this._audioSource.playOneShot(clip, volume);
                }
            });
        }
    }
}


